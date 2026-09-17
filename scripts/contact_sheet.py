"""One frame per beat from the finished video. Usage: contact_sheet.py final.mp4 out.png"""
import os, subprocess, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_lib import *

src, out = sys.argv[1], sys.argv[2]
beats = [(4.0, "1  HOOK  0-8 S"), (11.8, "2  PROCESS  8-16 S"), (19.6, "3  QUOTE PATH  16-24 S"),
         (27.4, "4  PARTS  24-32 S"), (35.6, "5  END CARD  32-40 S")]
tw, th, m = 432, 540, 24
sheet = Image.new("RGB", (5 * tw + 6 * m, th + 2 * m + 56), NAVY)
d = ImageDraw.Draw(sheet)
f = font("Medium", 20)
for k, (t, label) in enumerate(beats):
    tmp = "work/cs_%d.png" % k
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", src, "-frames:v", "1", tmp], check=True)
    im = Image.open(tmp).convert("RGB")
    im.thumbnail((tw, th))
    x = m + k * (tw + m)
    sheet.paste(im, (x + (tw - im.width) // 2, m))
    draw_text(d, x, m + th + 16, label, f, WHITE, 2.0)
sheet.save(out)
print("wrote", out, sheet.size)
