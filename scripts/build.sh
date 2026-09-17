#!/usr/bin/env bash
# Build one deliverable. Usage: scripts/build.sh W H TAG   (e.g. 1080 1350 4x5  |  1080 1080 1x1)
set -euo pipefail
cd "$(dirname "$0")/.."
W=$1; H=$2; TAG=$3
WORK=work/$TAG; mkdir -p "$WORK"
CLIPS=(clips/shot1.mp4 clips/shot2.mp4 clips/shot3.mp4 clips/shot4.mp4)

# 1. mean luma per raw clip, so the grade can pull the four toward one level (half strength, subtle)
YAVG=()
for i in 0 1 2 3; do
  YAVG[$i]=$(ffmpeg -v error -i "${CLIPS[$i]}" -vf "format=yuv420p,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - 2>/dev/null \
    | awk -F= '/YAVG/{s+=$2;n++} END{printf "%.2f", s/n}')
done
TARGET=$(echo "${YAVG[@]}" | awk '{s=0; for(i=1;i<=NF;i++) s+=$i; printf "%.2f", s/NF}')
echo "luma YAVG: ${YAVG[*]}  target: $TARGET"

# 2. conform: cover-crop to WxH, 30 fps, shared cool industrial grade, exactly 8.000 s (240 frames)
for i in 0 1 2 3; do
  n=$((i+1))
  b=$(awk -v t="$TARGET" -v y="${YAVG[$i]}" 'BEGIN{printf "%.4f", (t-y)/255*0.5}')
  ffmpeg -v error -y -i "${CLIPS[$i]}" \
    -vf "scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,fps=30,eq=saturation=0.90:contrast=1.04:brightness=$b,colorbalance=rs=-0.03:bs=0.035:rm=-0.02:bm=0.025,tpad=stop_mode=clone:stop_duration=1,format=yuv420p" \
    -an -t 8 -c:v libx264 -preset fast -crf 14 "$WORK/c$n.mp4"
  echo "c$n brightness=$b frames=$(ffprobe -v error -select_streams v -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$WORK/c$n.mp4")"
done

# 3. end card, rendered locally, 8.8 s (absorbs the 4 x 0.2 s crossfade overlap so the total is exactly 40.0 s)
python3 scripts/render_endcard.py "$W" "$H" "$WORK/endcard" 8.8
ffmpeg -v error -y -framerate 30 -i "$WORK/endcard/f_%04d.png" -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p "$WORK/c5.mp4"

# 4. stitch with 6-frame (0.2 s) crossfades
ffmpeg -v error -y -i "$WORK/c1.mp4" -i "$WORK/c2.mp4" -i "$WORK/c3.mp4" -i "$WORK/c4.mp4" -i "$WORK/c5.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.2:offset=7.8[a];[a][2:v]xfade=transition=fade:duration=0.2:offset=15.6[b];[b][3:v]xfade=transition=fade:duration=0.2:offset=23.4[c];[c][4:v]xfade=transition=fade:duration=0.2:offset=31.2,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset fast -crf 14 "$WORK/stitched.mp4"

# 5. burn captions, strip metadata, set title/artist, final encode
python3 scripts/render_captions.py "$W" "$H" "$WORK/cap" captions.srt
ffmpeg -v error -y -i "$WORK/stitched.mp4" -framerate 30 -i "$WORK/cap/f_%04d.png" \
  -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[v]" -map "[v]" \
  -map_metadata -1 -map_metadata:s:v -1 -metadata title="Lupton Associates" -metadata artist="Joe Guadagnino" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.1 -pix_fmt yuv420p -r 30 -movflags +faststart \
  -fflags +bitexact -flags +bitexact -t 40 "final_$TAG.mp4"
ffprobe -v error -show_entries format=duration:format_tags=title,artist,encoder:stream=width,height,r_frame_rate,codec_name,nb_frames -of default=nw=1 "final_$TAG.mp4"
