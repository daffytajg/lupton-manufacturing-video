"""Shared Pillow helpers for the Lupton video renders."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "assets", "fonts")
LOGO_PATH = os.path.join(ROOT, "assets", "logo-full-dark.png")
NAVY = (0x12, 0x25, 0x36)
GREEN = (0x61, 0x83, 0x72)
WHITE = (255, 255, 255)
FPS = 30

_fonts = {}


def font(weight, size):
    key = (weight, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(os.path.join(FONT_DIR, "Inter-%s.ttf" % weight), size)
    return _fonts[key]


def line_height(fnt):
    asc, desc = fnt.getmetrics()
    return asc + desc


def text_width(fnt, s, tracking=0.0):
    if not s:
        return 0.0
    if tracking == 0:
        return fnt.getlength(s)
    return sum(fnt.getlength(ch) for ch in s) + tracking * (len(s) - 1)


def draw_text(draw, x, y, s, fnt, fill, tracking=0.0):
    if tracking == 0:
        draw.text((x, y), s, font=fnt, fill=fill)
        return
    for ch in s:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += fnt.getlength(ch) + tracking


def wrap(s, fnt, maxw, tracking=0.0):
    lines = []
    for para in s.split("\n"):
        cur = ""
        for w in para.split(" "):
            t = (cur + " " + w).strip()
            if not cur or text_width(fnt, t, tracking) <= maxw:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def with_alpha(img, a):
    if a >= 1:
        return img
    r, g, b, al = img.split()
    al = al.point(lambda v: int(v * a))
    return Image.merge("RGBA", (r, g, b, al))


def logo_light(width):
    """Logo for a navy field: green mark kept, its cut-out letters filled white, navy wordmark inverted to white."""
    im = Image.open(LOGO_PATH).convert("RGBA")
    a = np.array(im)
    green = (a[:, :, 3] > 0)
    for c in range(3):
        green &= np.abs(a[:, :, c].astype(int) - GREEN[c]) < 30
    ys, xs = np.where(green)
    y0, y1, x0, x1 = ys.min() + 2, ys.max() - 1, xs.min() + 2, xs.max() - 1
    sq = a[y0:y1, x0:x1].astype(np.float32)
    al = sq[:, :, 3:4] / 255.0
    sq[:, :, :3] = sq[:, :, :3] * al + 255.0 * (1 - al)
    sq[:, :, 3] = 255
    a[y0:y1, x0:x1] = sq.astype(np.uint8)
    navy = (a[:, :, 3] > 0) & (a[:, :, 0] < 70) & (a[:, :, 1] < 90) & (a[:, :, 2] < 110)
    a[navy, 0:3] = 255
    im = Image.fromarray(a)
    h = round(im.height * width / im.width)
    return im.resize((width, h), Image.LANCZOS)


def wrap_balanced(s, fnt, maxw, tracking=0.0):
    """Greedy wrap, but a two-line paragraph gets the most even split that fits."""
    out = []
    for para in s.split("\n"):
        greedy = wrap(para, fnt, maxw, tracking)
        if len(greedy) != 2:
            out.extend(greedy)
            continue
        words = para.split(" ")
        best = None
        for k in range(1, len(words)):
            a, b = " ".join(words[:k]), " ".join(words[k:])
            wa, wb = text_width(fnt, a, tracking), text_width(fnt, b, tracking)
            if wa <= maxw and wb <= maxw and (best is None or abs(wa - wb) < best[0]):
                best = (abs(wa - wb), [a, b])
        out.extend(best[1] if best else greedy)
    return out
