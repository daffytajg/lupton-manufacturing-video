#!/usr/bin/env bash
# Encode rendered frames to MP4 with clean metadata.
# Usage: ./encode.sh <framesDir> <out.mp4> [ffmpeg-binary]
set -euo pipefail

FRAMES="${1:?frames dir}"
OUT="${2:?output mp4}"
FF="${3:-ffmpeg}"

# -map_metadata -1        drop everything inherited
# -fflags/-flags bitexact suppress muxer + encoder identification (Lavf tag, x264 SEI)
# use_metadata_tags       allow custom keys (company) in the mov metadata atom
"$FF" -y -framerate 30 -i "$FRAMES/f_%04d.png" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -map_metadata -1 \
  -fflags +bitexact -flags:v +bitexact \
  -movflags +faststart+use_metadata_tags \
  -metadata artist="Joe Guadagnino" \
  -metadata author="Joe Guadagnino" \
  -metadata company="Lupton Associates" \
  -metadata publisher="Lupton Associates" \
  -metadata copyright="Lupton Associates" \
  "$OUT"
