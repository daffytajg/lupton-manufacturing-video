"""Light-theme text + callout overlay for LinkedIn short #2 (studio conveyor), as a transparent PNG sequence."""
import json
import math
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(HERE, "fonts")
OUT = os.path.join(HERE, "overlay")
os.makedirs(OUT, exist_ok=True)

W, H, FPS, N = 1080, 1920, 24, 360
ANC = json.load(open(os.path.join(HERE, "anchors.json")))
EV = ANC["F"]


def font(pkg, name, size):
    return ImageFont.truetype(os.path.join(F, pkg, "package", "files", name), size)


BARLOW = "fontsource-barlow-condensed-5.3.0"
PLEX = "fontsource-ibm-plex-mono-5.3.0"
MONT = "fontsource-montserrat-5.3.0"
HEAD = lambda s: font(BARLOW, "barlow-condensed-latin-700-normal.woff", s)
HEAD6 = lambda s: font(BARLOW, "barlow-condensed-latin-600-normal.woff", s)
MONO = lambda s: font(PLEX, "ibm-plex-mono-latin-500-normal.woff", s)
MONO6 = lambda s: font(PLEX, "ibm-plex-mono-latin-600-normal.woff", s)
WORD = lambda s: font(MONT, "montserrat-latin-800-normal.woff", s)
WORD_SUB = lambda s: font(MONT, "montserrat-latin-500-normal.woff", s)

NAVY = (18, 37, 54)
GREEN = (78, 112, 96)
GREEN_LIT = (57, 180, 96)
RED = (200, 58, 42)
AMBER = (212, 138, 18)
INK = (82, 96, 106)
CREAM = (248, 245, 238)
X0 = 72


def clamp(x):
    return max(0.0, min(1.0, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_back(x):
    x = clamp(x)
    c1 = 1.70158
    return 1 + (c1 + 1) * (x - 1) ** 3 + c1 * (x - 1) ** 2


def text_w(s, f, track=0):
    d = ImageDraw.Draw(Image.new("L", (1, 1)))
    return d.textlength(s, font=f) + track * max(0, len(s) - 1)


def text_layer(s, f, color, track=0):
    asc, desc = f.getmetrics()
    lead = 0
    if s.startswith("●"):
        s = s.lstrip("● ")
        lead = int(asc * 0.9)
    w = int(text_w(s, f, track)) + 8 + lead
    img = Image.new("RGBA", (w, asc + desc + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 2
    if lead:
        r = int(asc * 0.24)
        cy = 2 + int(asc * 0.62)
        d.ellipse([x, cy - r, x + 2 * r, cy + r], fill=color + (255,))
        x += lead
    for ch in (s if track else [s]):
        d.text((x, 2), ch, font=f, fill=color + (255,))
        if track:
            x += d.textlength(ch, font=f) + track
    return img


def fade(img, a):
    if a >= 0.999:
        return img
    r, g, b, al = img.split()
    al = al.point(lambda v: int(v * a))
    return Image.merge("RGBA", (r, g, b, al))


def reveal_line(frame, t, s, f, color, x, y, t_in, t_out, idx=0, track=0, center=False, clip=None):
    """Line rises out of a mask at its own baseline, then lifts and fades on exit."""
    if t < t_in + idx * 0.07 or t > t_out + 0.3:
        return
    lay = text_layer(s, f, color, track)
    if center:
        x = (W - lay.width) // 2
    if lay.width > W - x - 40 and not center:
        lay = lay.resize((int(W - x - 40), int(lay.height * (W - x - 40) / lay.width)), Image.LANCZOS)
    lh = lay.height
    p = ease_out((t - t_in - idx * 0.07) / 0.45)
    q = clamp((t - t_out) / 0.25)
    dy = int((1 - p) * lh * 0.95 - q * 26)
    a = min(1.0, p * 2.5) * (1 - q)
    if a <= 0:
        return
    vis = lh - dy if dy > 0 else lay.height
    if vis <= 0:
        return
    lay = lay.crop((0, 0, lay.width, min(lay.height, vis)))
    frame.alpha_composite(fade(lay, a), (int(x), int(y + dy)))


def env(t, t_in, t_out, fin=0.3, fout=0.25):
    if t < t_in or t > t_out + fout:
        return 0.0
    return min(ease_out((t - t_in) / fin), 1 - clamp((t - t_out) / fout))


def anchor(frame_no, key):
    cols = ANC["cols"]
    rows = ANC["rows"]
    i = cols.index(key + "x")
    j = cols.index(key + "y")
    if frame_no <= rows[0][0]:
        r0 = r1 = rows[0]; k = 0.0
    elif frame_no >= rows[-1][0]:
        r0 = r1 = rows[-1]; k = 0.0
    else:
        for a, b in zip(rows, rows[1:]):
            if a[0] <= frame_no <= b[0]:
                r0, r1 = a, b
                k = (frame_no - a[0]) / (b[0] - a[0])
                break
    u = r0[i] + (r1[i] - r0[i]) * k
    v = r0[j] + (r1[j] - r0[j]) * k
    return u * W, (1 - v) * H


def pill(frame, cx, cy, label, fg, bg, a, scale=1.0, dot=None, border=None):
    if a <= 0:
        return
    f = MONO6(int(26 * scale))
    tw = text_w(label, f, 2)
    pad = int(20 * scale)
    dot_w = int(22 * scale) if dot else 0
    w = int(tw + pad * 2 + dot_w)
    h = int(48 * scale)
    lay = Image.new("RGBA", (w + 8, h + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.rounded_rectangle([2, 2, w + 2, h + 2], radius=h // 2, fill=bg + (235,), outline=(border + (255,)) if border else None, width=2)
    x = 2 + pad
    if dot:
        r = int(7 * scale)
        d.ellipse([x, 2 + h // 2 - r, x + 2 * r, 2 + h // 2 + r], fill=dot + (255,))
        x += dot_w
    asc, desc = f.getmetrics()
    ty = 2 + (h - asc - desc) // 2 + 1
    for ch in label:
        d.text((x, ty), ch, font=f, fill=fg + (255,))
        x += d.textlength(ch, font=f) + 2
    frame.alpha_composite(fade(lay, a), (int(cx - lay.width / 2), int(cy - lay.height / 2)))


def callout(frame, t, fno, key, label, fg, bg, t_in, t_out, lift=118, dot=None, pulse=None):
    a = env(t, t_in, t_out, 0.18, 0.25)
    if a <= 0:
        return
    ax, ay = anchor(fno, key)
    s = 0.75 + 0.25 * ease_back((t - t_in) / 0.32)
    d = ImageDraw.Draw(frame)
    top = ay - lift + 26
    d.line([(ax, ay - 8), (ax, top)], fill=fg + (int(200 * a),), width=3)
    d.ellipse([ax - 7, ay - 15, ax + 7, ay - 1], fill=fg + (int(255 * a),))
    pill(frame, ax, ay - lift, label, CREAM, fg, a, scale=s, dot=dot)
    if pulse is not None:
        k = ((t - t_in) * 1.6) % 1.0
        r = 20 + 60 * k
        px_, py_ = anchor(fno, pulse)
        d.ellipse([px_ - r, py_ - r, px_ + r, py_ + r], outline=fg + (int(220 * (1 - k) * a),), width=4)


def hud(frame, t, fno):
    a = env(t, 0.2, 11.45, 0.35, 0.3)
    if a <= 0:
        return
    if fno < EV["F_WARN"]:
        state, col = "RUNNING", GREEN_LIT
    elif fno < EV["F_EMPTY"]:
        state, col = "STARVED", AMBER
    elif fno < EV["F_GREEN"]:
        state, col = "LINE DOWN", RED
    else:
        state, col = "RUNNING", GREEN_LIT
    blink = state != "RUNNING" and int(t * 4) % 2 == 1
    label = "YOUR LINE  ·  " + state
    f = MONO6(27)
    tw = text_w(label, f, 2)
    w, h = int(tw + 40 + 26), 54
    lay = Image.new("RGBA", (w + 6, h + 6), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.rounded_rectangle([2, 2, w + 2, h + 2], radius=h // 2, fill=(255, 255, 255, 170), outline=NAVY + (40,), width=2)
    dc = (col if not blink else tuple(int(c * 0.35 + 255 * 0.65) for c in col))
    d.ellipse([22, h // 2 - 6, 36, h // 2 + 8], fill=dc + (255,))
    x = 48
    asc, desc = f.getmetrics()
    ty = 2 + (h - asc - desc) // 2 + 1
    for i, ch in enumerate(label):
        c = col if i >= len("YOUR LINE  ·  ") and state != "RUNNING" else NAVY
        d.text((x, ty), ch, font=f, fill=c + (255,))
        x += d.textlength(ch, font=f) + 2
    frame.alpha_composite(fade(lay, a), (X0 - 4, 150))
    # small brand bug, top right
    bug = text_layer("LUPTON", WORD(30), NAVY, track=3)
    frame.alpha_composite(fade(bug, a * 0.9), (W - X0 - bug.width + 6, 160))


def frame(i):
    t = i / FPS
    fno = i + 1
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hud(img, t, fno)

    Y = 262
    # beat 1: the setup
    reveal_line(img, t, "SINGLE-SOURCED PART", MONO6(30), INK, X0, Y, 0.35, 3.35, 0, track=4)
    reveal_line(img, t, "ONE SUPPLIER.", HEAD(150), NAVY, X0 - 4, Y + 44, 0.35, 3.35, 1, clip=150)
    reveal_line(img, t, "Running fine. For now.", MONO(38), INK, X0, Y + 214, 0.35, 3.35, 3)

    # beat 2: the jam
    reveal_line(img, t, "●  SUPPLIER JAMMED", MONO6(30), RED, X0, Y, 3.72, 5.95, 0, track=4)
    reveal_line(img, t, "PARTS STOP", HEAD(150), NAVY, X0 - 4, Y + 44, 3.72, 5.95, 1, clip=150)
    reveal_line(img, t, "COMING.", HEAD(150), NAVY, X0 - 4, Y + 186, 3.72, 5.95, 2, clip=150)

    # beat 3: line down (hard hit, tiny shake)
    if 6.33 <= t <= 7.55:
        sh = int(10 * math.sin(t * 90) * (1 - clamp((t - 6.33) / 0.3)))
        reveal_line(img, t, "LINE", HEAD(184), RED, X0 - 6 + sh, Y + 4, 6.33, 7.28, 0)
        reveal_line(img, t, "DOWN.", HEAD(184), RED, X0 - 6 + sh, Y + 170, 6.33, 7.28, 1)

    # beat 4: the second source arrives
    reveal_line(img, t, "●  SECOND SOURCE ONLINE", MONO6(30), GREEN, X0, Y, 7.42, 9.55, 0, track=4)
    reveal_line(img, t, "A SECOND SOURCE", HEAD(128), NAVY, X0 - 4, Y + 44, 7.42, 9.55, 1, clip=128)
    reveal_line(img, t, "BEFORE YOU NEED ONE.", HEAD(128), GREEN, X0 - 4, Y + 166, 7.42, 9.55, 2, clip=128)
    reveal_line(img, t, "Send us the drawing.", MONO(38), INK, X0, Y + 314, 7.42, 9.55, 4)

    # beat 5: what we do
    reveal_line(img, t, "WE QUOTE IT.", HEAD(150), NAVY, X0 - 4, Y - 6, 9.72, 11.5, 0, clip=150)
    reveal_line(img, t, "WE BUILD IT.", HEAD(150), GREEN, X0 - 4, Y + 136, 9.72, 11.5, 1, clip=150)
    reveal_line(img, t, "SHEET METAL · MACHINING · MOLDING", MONO6(28), INK, X0, Y + 300, 9.72, 11.5, 3, track=1)
    reveal_line(img, t, "PCBAs · CABLE ASSEMBLIES", MONO6(28), INK, X0, Y + 344, 9.72, 11.5, 4, track=1)

    # beat 6: end card
    reveal_line(img, t, "Keep the line running.", HEAD6(76), NAVY, 0, 190, 11.7, 99, 0, center=True)
    a5 = env(t, 11.85, 99, 0.4)
    if a5 > 0:
        d = ImageDraw.Draw(img)
        d.rectangle([W / 2 - 56, 300, W / 2 + 56, 305], fill=GREEN + (int(255 * a5),))
    reveal_line(img, t, "LUPTON", WORD(124), NAVY, 0, 332, 11.9, 99, 0, track=3, center=True)
    reveal_line(img, t, "ASSOCIATES", WORD_SUB(40), NAVY, 0, 480, 12.0, 99, 0, track=14, center=True)
    reveal_line(img, t, "SERVICING THE WORKING WORLD SINCE 1969", MONO6(25), GREEN, 0, 552, 12.35, 99, 0, track=2, center=True)
    reveal_line(img, t, "luptons.com", MONO(38), NAVY, 0, 596, 12.5, 99, 0, center=True)

    # in-scene callouts
    callout(img, t, fno, "a", "SUPPLIER A", INK, INK, 0.7, 3.62)
    callout(img, t, fno, "a", "JAMMED", RED, RED, 3.68, 7.3, pulse="j")
    if fno >= EV["F_LAND"]:
        callout(img, t, fno, "b", "LUPTON", GREEN, GREEN, 7.45, 11.5)
    return img


if __name__ == "__main__":
    frames = range(N) if len(sys.argv) < 2 else [int(x) for x in sys.argv[1:]]
    for i in frames:
        frame(i).save(os.path.join(OUT, f"ov_{i:04d}.png"), compress_level=1)
