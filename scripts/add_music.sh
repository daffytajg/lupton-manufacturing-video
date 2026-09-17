#!/usr/bin/env bash
# Mux a music bed under the silent finals. Usage: scripts/add_music.sh music.(mp3|wav)
# Video is stream-copied (no re-encode). Audio: trimmed to 40.000 s, loudness-normalised to a bed level,
# 0.5 s fade in, 1.5 s fade out, AAC 48 kHz stereo. Container metadata kept to title + artist only.
set -euo pipefail
cd "$(dirname "$0")/.."
MUSIC=$1
mkdir -p work/audio
# 1. two-pass loudnorm to an under-caption bed level (-16 LUFS integrated, -1.5 dBTP)
STATS=$(ffmpeg -v info -i "$MUSIC" -t 40 -af "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
II=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['input_i'])")
ITP=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['input_tp'])")
ILRA=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['input_lra'])")
ITH=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['input_thresh'])")
ffmpeg -v error -y -i "$MUSIC" -t 40 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=9:measured_I=$II:measured_TP=$ITP:measured_LRA=$ILRA:measured_thresh=$ITH:linear=true:print_format=summary,afade=t=in:st=0:d=0.5,afade=t=out:st=38.5:d=1.5,aresample=48000,apad=whole_dur=40" \
  -ac 2 -ar 48000 -c:a aac -b:a 160k work/audio/bed.m4a
echo "bed: $(ffprobe -v error -show_entries format=duration -of csv=p=0 work/audio/bed.m4a) s"
# 2. mux under each final; keep the silent versions alongside
for TAG in 4x5 1x1; do
  [ -f "final_${TAG}_silent.mp4" ] || cp "final_$TAG.mp4" "final_${TAG}_silent.mp4"
  ffmpeg -v error -y -i "final_${TAG}_silent.mp4" -i work/audio/bed.m4a \
    -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest \
    -map_metadata -1 -map_metadata:s:v -1 -map_metadata:s:a -1 \
    -metadata title="Lupton Associates" -metadata artist="Joe Guadagnino" \
    -movflags +faststart -fflags +bitexact "final_$TAG.mp4"
  echo "final_$TAG.mp4: $(ffprobe -v error -show_entries format=duration:format_tags=title,artist:stream=codec_type,codec_name -of csv=p=0 "final_$TAG.mp4" | tr '\n' ' ')"
done
