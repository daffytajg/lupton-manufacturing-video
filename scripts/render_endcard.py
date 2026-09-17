"""Render the end card as a PNG sequence. Usage: render_endcard.py W H OUTDIR [seconds]"""
import os, sys, shutil
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_lib import *

W, H, OUT = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
DUR = float(sys.argv[4]) if len(sys.argv) > 4 else 8.8
N = int(round(DUR * FPS))
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)

# navy field with a very subtle lift toward the upper centre
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.42) / (H * 0.75)) ** 2)
lift = np.clip(1 - r, 0, 1) ** 1.5 * 14
arr = np.zeros((H, W, 3), np.float32) + np.array(NAVY, np.float32)
arr += lift[..., None]
bg = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")

logo = logo_light(round(W * (0.44 if H > W else 0.38)))
f1, f2, f3 = font("SemiBold", 56), font("Medium", 34), font("Regular", 44)
T1, T2, T3 = "Send us your drawings.", "WWW.LUPTONS.COM   ·   585-393-4999", "Book time with our team."
GAP_LR, RULE_W, RULE_H, GAP_RT, GAP_T = 44, 220, 3, 40, 18
total = logo.height + GAP_LR + RULE_H + GAP_RT + line_height(f1) + GAP_T + line_height(f2) + GAP_T + line_height(f3)
top = (H - total) // 2
rule_y = top + logo.height + GAP_LR
text_y0 = rule_y + RULE_H + GAP_RT
LINES = [(T1, f1, WHITE, 0.0, 10), (T2, f2, GREEN, 4.0, 18), (T3, f3, WHITE, 0.0, 26)]

prev_key, prev_path = None, None
for i in range(N):
    p_rule = ease((i - 6) / 12)
    alphas = tuple(round(ease((i - s) / 12), 3) for (_, _, _, _, s) in LINES)
    key = (round(p_rule, 3), alphas)
    path = os.path.join(OUT, "f_%04d.png" % i)
    if key == prev_key:
        try:
            os.link(prev_path, path)
        except OSError:
            shutil.copyfile(prev_path, path)
        continue
    im = bg.copy()
    im.alpha_composite(logo, ((W - logo.width) // 2, top))
    d = ImageDraw.Draw(im)
    if p_rule > 0:
        rw = RULE_W * p_rule
        d.rectangle([W / 2 - rw / 2, rule_y, W / 2 + rw / 2, rule_y + RULE_H], fill=GREEN)
    y = text_y0
    for (txt, fnt, col, tr, _), a in zip(LINES, alphas):
        if a > 0:
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            dl = ImageDraw.Draw(layer)
            tw = text_width(fnt, txt, tr)
            draw_text(dl, (W - tw) / 2, y + (1 - a) * 10, txt, fnt, col + (255,), tr)
            im.alpha_composite(with_alpha(layer, a))
        y += line_height(fnt) + GAP_T
    im.convert("RGB").save(path, compress_level=1)
    prev_key, prev_path = key, path
print("endcard frames:", N, "size", W, H)
