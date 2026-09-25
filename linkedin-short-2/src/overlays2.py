"""Render the text/graphics overlay for the LinkedIn short as a transparent PNG sequence."""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(HERE, "fonts")
OUT = os.path.join(HERE, "overlay")
os.makedirs(OUT, exist_ok=True)

W, H, FPS, N = 1080, 1920, 24, 360


def font(pkg, name, size):
    return ImageFont.truetype(os.path.join(F, pkg, "package", "files", name), size)


HEAD = lambda s: font("fontsource-barlow-condensed-5.3.0", "barlow-condensed-latin-700-normal.woff", s)
MONO = lambda s: font("fontsource-ibm-plex-mono-5.3.0", "ibm-plex-mono-latin-500-normal.woff", s)
WORD = lambda s: font("fontsource-montserrat-5.3.0", "montserrat-latin-800-normal.woff", s)
WORD_SUB = lambda s: font("fontsource-montserrat-5.3.0", "montserrat-latin-500-normal.woff", s)

CREAM = (247, 244, 236)
SAGE = (158, 199, 184)
SAGE_DARK = (90, 116, 112)
RED = (235, 70, 55)
NAVY = (7, 25, 42)


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def envelope(t, t0, t1, fin=0.3, fout=0.25):
    """alpha 0..1 and slide offset for a card visible from t0 to t1 (seconds)."""
    if t < t0 or t > t1:
        return 0.0, 0
    a_in = ease((t - t0) / fin)
    a_out = ease((t1 - t) / fout)
    a = min(a_in, a_out)
    return a, int((1 - a_in) * 40)


def text_w(d, s, f, spacing=0):
    return d.textlength(s, font=f) + spacing * max(0, len(s) - 1)


def draw_text(d, xy, s, f, fill, alpha, spacing=0, anchor_center=False):
    x, y = xy
    if anchor_center:
        x = (W - text_w(d, s, f, spacing)) / 2
    col = fill + (int(255 * alpha),)
    if spacing == 0:
        d.text((x, y), s, font=f, fill=col)
        return
    for ch in s:
        d.text((x, y), ch, font=f, fill=col)
        x += d.textlength(ch, font=f) + spacing


def scrim(img, top, alpha):
    """Vertical navy gradient behind text; top=True covers the upper band."""
    band = Image.new("RGBA", (W, 760), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for y in range(760):
        k = (1 - y / 760) if top else (y / 760)
        bd.line([(0, y), (W, y)], fill=NAVY + (int(215 * (k ** 1.4) * alpha),))
    img.alpha_composite(band, (0, 0 if top else H - 760))


def chip_row(d, y, labels, alpha, slide):
    f = MONO(30)
    pad_x, gap, h = 18, 14, 58
    widths = [text_w(d, l, f) + pad_x * 2 for l in labels]
    total = sum(widths) + gap * (len(labels) - 1)
    x = (W - total) / 2
    for l, w in zip(labels, widths):
        d.rounded_rectangle([x, y + slide, x + w, y + h + slide], radius=6,
                            fill=(15, 35, 50, int(230 * alpha)), outline=SAGE + (int(200 * alpha),), width=2)
        d.text((x + pad_x, y + 11 + slide), l, font=f, fill=CREAM + (int(255 * alpha),))
        x += w + gap


def frame(i):
    t = i / FPS
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # ---- Beat A: the problem (top of frame) ----
    a1, s1 = envelope(t, 0.25, 1.95)
    a2, s2 = envelope(t, 2.05, 4.1)
    a3, s3 = envelope(t, 4.18, 4.72, fin=0.06, fout=0.12)
    if max(a1, a2, a3) > 0:
        scrim(img, True, max(a1, a2, a3))
    d = ImageDraw.Draw(img)
    if a1 > 0:
        draw_text(d, (0, 150 + s1), "SINGLE SOURCE", MONO(40), RED, a1, spacing=4, anchor_center=True)
        draw_text(d, (0, 205 + s1), "ONE SUPPLIER.", HEAD(132), CREAM, a1, anchor_center=True)
    if a2 > 0:
        draw_text(d, (0, 150 + s2), "NO BACKUP", MONO(40), RED, a2, spacing=4, anchor_center=True)
        draw_text(d, (0, 205 + s2), "ONE WEAK LINK.", HEAD(132), CREAM, a2, anchor_center=True)
    if a3 > 0:
        draw_text(d, (0, 190), "LINE DOWN.", HEAD(170), RED, a3, anchor_center=True)

    # ---- Beat C: what we do (bottom of frame) ----
    a4, s4 = envelope(t, 5.4, 8.3)
    a5, s5 = envelope(t, 8.45, 11.4)
    if max(a4, a5) > 0:
        scrim(img, False, max(a4, a5))
    d = ImageDraw.Draw(img)
    if a4 > 0:
        draw_text(d, (0, 1500 + s4), "A SECOND SOURCE", HEAD(104), CREAM, a4, anchor_center=True)
        draw_text(d, (0, 1600 + s4), "BEFORE YOU NEED ONE.", HEAD(104), SAGE, a4, anchor_center=True)
        chip_row(d, 1742, ["DOMESTIC", "OFFSHORE", "SAME DRAWING"], a4, s4)
    if a5 > 0:
        draw_text(d, (0, 1500 + s5), "WE QUOTE IT.", HEAD(104), CREAM, a5, anchor_center=True)
        draw_text(d, (0, 1600 + s5), "WE BUILD IT.", HEAD(104), SAGE, a5, anchor_center=True)
        draw_text(d, (0, 1738 + s5), "SHEET METAL · STAMPING · MACHINING", MONO(31), CREAM, a5, anchor_center=True)
        draw_text(d, (0, 1784 + s5), "MOLDING · PCBAs · CABLE ASSEMBLIES", MONO(31), CREAM, a5, anchor_center=True)

    # ---- Beat D: end card ----
    a6, s6 = envelope(t, 11.7, 15.5, fin=0.45)
    if a6 > 0:
        scrim(img, False, a6)
        d = ImageDraw.Draw(img)
        draw_text(d, (0, 1400 + s6), "No single point of failure on your parts.", HEAD(58), CREAM, a6, anchor_center=True)
        d.rectangle([W / 2 - 60, 1484 + s6, W / 2 + 60, 1489 + s6], fill=SAGE + (int(255 * a6),))
        draw_text(d, (0, 1510 + s6), "LUPTON", WORD(118), CREAM, a6, spacing=2, anchor_center=True)
        draw_text(d, (0, 1646 + s6), "ASSOCIATES", WORD_SUB(40), CREAM, a6, spacing=14, anchor_center=True)
        a7, s7 = envelope(t, 12.4, 15.5, fin=0.4)
        if a7 > 0:
            draw_text(d, (0, 1738 + s7), "SERVICING THE WORKING WORLD SINCE 1969", MONO(26), SAGE, a7, spacing=2, anchor_center=True)
            draw_text(d, (0, 1782 + s7), "luptons.com", MONO(36), CREAM, a7, anchor_center=True)
    return img


if __name__ == "__main__":
    frames = range(N) if len(sys.argv) < 2 else [int(x) for x in sys.argv[1:]]
    for i in frames:
        frame(i).save(os.path.join(OUT, f"ov_{i:04d}.png"), compress_level=1)
