"""Cut the Guad Squad logo mark out of its white background.

Writes assets/logo_color.png (original colors) and assets/logo_reverse.png
(navy strokes turned white, for dark backgrounds).
"""
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
src = Image.open(os.path.join(HERE, "brand", "guad-squad-logo-source.png")).convert("RGB")
a = np.asarray(src).astype(np.float64) / 255.0
a = a[:468]  # drop the partial wordmark along the bottom edge

# un-blend from white: alpha = how far the darkest channel is from white
alpha = np.clip((1.0 - a.min(axis=2)) / 0.92, 0, 1)
alpha[alpha < 0.04] = 0
safe = np.maximum(alpha, 1e-4)[..., None]
col = np.clip(1.0 - (1.0 - a) / safe, 0, 1)

# navy vs teal/blue: navy has low green and blue
navy = (col[..., 1] < 0.3) & (col[..., 2] < 0.45)

ys, xs = np.nonzero(alpha > 0.05)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
pad = 6


def save(rgb, name):
    rgba = np.dstack([rgb, alpha])[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    img = Image.fromarray((rgba * 255).round().astype(np.uint8), "RGBA")
    # upscale for crisp texturing
    img = img.resize((img.width * 3, img.height * 3), Image.LANCZOS)
    img.save(os.path.join(HERE, "assets", name))
    print(name, img.size)


save(col, "logo_color.png")
rev = col.copy()
rev[navy] = 1.0
save(rev, "logo_reverse.png")
