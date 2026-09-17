"""Render burned-in caption overlay frames (RGBA PNG sequence) and captions.srt.
Usage: render_captions.py W H OUTDIR [srt_path]"""
import os, sys, shutil
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_lib import *

W, H, OUT = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
SRT = sys.argv[4] if len(sys.argv) > 4 else None
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)

TOTAL = 40.0
N = int(round(TOTAL * FPS))
FADE = 6 / FPS
SIDE = 96
MAXW = W - 2 * SIDE
TOP = round(H * 0.66) if H > W else round(H * 0.62)
PAD_X, PAD_Y, GAP = 30, 22, 16
BAR_OPACITY = float(os.environ.get("BAR_OPACITY", "0.08"))
STYLES = {
    "hook":     dict(weight="SemiBold", size=52, tracking=6.0),
    "label":    dict(weight="SemiBold", size=40, tracking=5.0),
    "sentence": dict(weight="Medium",   size=46, tracking=0.0),
    "strong":   dict(weight="SemiBold", size=46, tracking=0.0),
}
# (style, on-screen text, appear time, srt text or None)
BEATS = [
    dict(start=0.0, end=7.9, entries=[
        ("hook", "SEND US THE DRAWING.", 0.0, None),
        ("sentence", "We'll tell you what it costs to make.", 3.6, None)]),
    dict(start=7.9, end=15.7, entries=[
        ("label", "STAMPING · FABRICATION\nMACHINING · MOLDING\nELECTRONICS", 7.9,
         "STAMPING · FABRICATION · MACHINING · MOLDING · ELECTRONICS")]),
    dict(start=15.7, end=23.5, entries=[
        ("sentence", "Quoted directly by the shop that makes it.", 15.7, None),
        ("strong", "No reseller layer.", 19.6, None)]),
    dict(start=23.5, end=31.3, entries=[
        ("sentence", "Brackets. Housings. Chassis. Bus bars. Harnesses.", 23.5, None),
        ("strong", "Made here and in low cost regions since 1969.", 27.4, None)]),
]
ENDCARD = (31.3, 40.0, "Send us your drawings.\nwww.luptons.com · 585-393-4999\nBook time with our team.")

for beat in BEATS:
    y = TOP + PAD_Y
    maxw = 0
    laid = []
    for style, text, appear, _ in beat["entries"]:
        st = STYLES[style]
        fnt = font(st["weight"], st["size"])
        lines = wrap_balanced(text, fnt, MAXW, st["tracking"])
        lh = line_height(fnt)
        for ln in lines:
            maxw = max(maxw, text_width(fnt, ln, st["tracking"]))
        laid.append(dict(fnt=fnt, tracking=st["tracking"], lines=lines, lh=lh, y=y, h=lh * len(lines), appear=appear))
        y += lh * len(lines) + GAP
    beat["laid"] = laid
    beat["bar_w"] = maxw + 2 * PAD_X
    beat["bottom"] = y - GAP + PAD_Y
    assert beat["bottom"] <= H - 48, ("caption block overflows", beat["start"], beat["bottom"], H)


def frame_state(t):
    for bi, beat in enumerate(BEATS):
        if beat["start"] <= t < beat["end"]:
            fin = 1.0 if beat["start"] == 0 else ease((t - beat["start"]) / FADE)
            fout = ease((beat["end"] - t) / FADE)
            block_a = min(fin, fout)
            alphas = []
            for e in beat["laid"]:
                a = 1.0 if e["appear"] <= beat["start"] else ease((t - e["appear"]) / FADE)
                alphas.append(round(a * block_a, 3))
            return (bi, tuple(alphas))
    return None


def render(state):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if state is None:
        return im
    bi, alphas = state
    beat = BEATS[bi]
    block_a = alphas[0]
    if block_a <= 0:
        return im
    prev = TOP + PAD_Y
    bar_bottom = prev
    for e, a in zip(beat["laid"], alphas):
        if a <= 0:
            break
        target = e["y"] + e["h"] + PAD_Y
        bar_bottom = prev + (target - prev) * (a / block_a)
        prev = target
    bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x0 = (W - beat["bar_w"]) / 2
    ImageDraw.Draw(bar).rounded_rectangle([x0, TOP, x0 + beat["bar_w"], bar_bottom], radius=10,
                                          fill=NAVY + (round(255 * BAR_OPACITY * block_a),))
    im.alpha_composite(bar)
    for e, a in zip(beat["laid"], alphas):
        if a <= 0:
            continue
        ls = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(ls)
        lt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dt = ImageDraw.Draw(lt)
        y = e["y"]
        for ln in e["lines"]:
            x = (W - text_width(e["fnt"], ln, e["tracking"])) / 2
            draw_text(ds, x, y + 3, ln, e["fnt"], (0, 0, 0, 170), e["tracking"])
            draw_text(dt, x, y, ln, e["fnt"], WHITE + (255,), e["tracking"])
            y += e["lh"]
        ls = ls.filter(ImageFilter.GaussianBlur(5))
        im.alpha_composite(with_alpha(Image.alpha_composite(ls, lt), a))
    return im


prev_state, prev_path, unique = "init", None, 0
for i in range(N):
    st = frame_state(i / FPS)
    path = os.path.join(OUT, "f_%04d.png" % i)
    if st == prev_state and prev_path:
        try:
            os.link(prev_path, path)
        except OSError:
            shutil.copyfile(prev_path, path)
    else:
        render(st).save(path, compress_level=1)
        unique += 1
    prev_state, prev_path = st, path
print("caption frames:", N, "unique:", unique, "size", W, H)


def srt_time(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return "%02d:%02d:%02d,%03d" % (h, m, sec, ms)


if SRT:
    cues = []
    for beat in BEATS:
        times = sorted(set([e[2] for e in beat["entries"]] + [beat["end"]]))
        for k in range(len(times) - 1):
            a, b = times[k], times[k + 1]
            vis = [(e[3] or e[1]).replace("\n", " ") for e in beat["entries"] if e[2] <= a]
            cues.append((a, b, "\n".join(vis)))
    cues.append(ENDCARD)
    with open(SRT, "w") as f:
        for n, (a, b, txt) in enumerate(cues, 1):
            f.write("%d\n%s --> %s\n%s\n\n" % (n, srt_time(a), srt_time(b), txt))
    print("wrote", SRT, len(cues), "cues")
