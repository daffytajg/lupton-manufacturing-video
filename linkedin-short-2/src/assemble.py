"""Slice rendered frame grids into frames, then composite overlays and encode the final short."""
import glob
import os
import re
import subprocess
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GRIDS = os.path.join(HERE, "grids")
FRAMES = os.path.join(HERE, "frames3d")
os.makedirs(FRAMES, exist_ok=True)
W, H, COLS, ROWS = 720, 1280, 4, 3


def slice_grids():
    have = set()
    for g in sorted(glob.glob(os.path.join(GRIDS, "grid_*.jpg"))):
        a, b = map(int, re.findall(r"grid_(\d+)_(\d+)", g)[0])
        im = Image.open(g)
        for k, fr in enumerate(range(a, b + 1)):
            r, c = divmod(k, COLS)
            out = os.path.join(FRAMES, f"f_{fr:04d}.png")
            if not os.path.exists(out):
                im.crop((c * W, r * H, (c + 1) * W, (r + 1) * H)).save(out, compress_level=1)
            have.add(fr)
    return have


def encode(out_path, n=360):
    audio = n == 360
    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-framerate", "24", "-start_number", "1", "-i", os.path.join(FRAMES, "f_%04d.png"),
        "-framerate", "24", "-start_number", "0", "-i", os.path.join(HERE, "overlay", "ov_%04d.png"),
    ]
    if audio:
        cmd += ["-i", os.path.join(HERE, "soundbed.wav")]
    cmd += [
        "-filter_complex",
        "[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.6[bg];[bg][1:v]overlay=0:0:format=auto,format=yuv420p[v]",
        "-map", "[v]", "-frames:v", str(n),
        "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-r", "24",
    ]
    if audio:
        cmd += ["-map", "2:a", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    cmd += ["-movflags", "+faststart", out_path]
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    have = slice_grids()
    missing = [f for f in range(1, 361) if f not in have]
    print("frames:", len(have), "missing:", missing[:10], "..." if len(missing) > 10 else "")
    if len(sys.argv) > 1 and not missing:
        encode(sys.argv[1])
        print("wrote", sys.argv[1])
