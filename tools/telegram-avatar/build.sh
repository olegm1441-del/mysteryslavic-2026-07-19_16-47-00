#!/usr/bin/env bash
# Renders the animated logo to an MP4 (Telegram video avatar) and a looping GIF.
#
#   npm i ffmpeg-static playwright-core
#   ./build.sh
#
# Motion blur is real, not faked: every output frame is the linear-light average
# of 8 sub-frames, so fast moves smear instead of strobing.
set -euo pipefail
cd "$(dirname "$0")"

FF=${FF:-$(node -p "require('ffmpeg-static')")}
CHROME=${CHROME:-/opt/pw-browsers/chromium}
SUB=8                       # sub-frames averaged per output frame
DUR=4                       # loop length in seconds
OUT=out
mkdir -p "$OUT"

# $1 = output fps, $2 = working dir prefix -> leaves blurred frames in <prefix>_blurred/
blur_pass() {
  local fps=$1 pre=$2 sup=$((SUB * $1)) n
  n=$((sup * DUR))
  CHROME="$CHROME" node render.mjs "${pre}_sub" "$sup"

  # Wrap the last SUB-1 sub-frames to the front so frame 0 blurs across the loop seam.
  rm -rf "${pre}_in" "${pre}_blurred"; mkdir -p "${pre}_in" "${pre}_blurred"
  python3 - "$pre" "$n" "$SUB" <<'PY'
import os, sys
pre, n, sub = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
src = os.path.abspath(f"{pre}_sub"); dst = os.path.abspath(f"{pre}_in")
order = [f"{i:04d}.png" for i in range(n - sub + 1, n)] + [f"{i:04d}.png" for i in range(n)]
for k, name in enumerate(order):
    os.symlink(os.path.join(src, name), os.path.join(dst, f"{k:04d}.png"))
PY

  local k=$((SUB - 1))
  "$FF" -y -hide_banner -loglevel error -framerate "$sup" -i "${pre}_in/%04d.png" \
    -vf "format=gbrpf32le,zscale=transferin=iec61966-2-1:transfer=linear,tmix=frames=$SUB,\
zscale=transferin=linear:transfer=iec61966-2-1,format=rgb24,\
select='gte(n\,$k)*not(mod(n-$k\,$SUB))',setpts=N/TB" \
    -vsync 0 "${pre}_blurred/%04d.png"
}

echo "==> 30 fps pass (MP4)"
blur_pass 30 mp4
"$FF" -y -hide_banner -loglevel error -framerate 30 -i mp4_blurred/%04d.png \
  -vf "scale=640:640:flags=lanczos,format=yuv420p" \
  -c:v libx264 -profile:v high -level 4.0 -preset veryslow -crf 18 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -x264-params "keyint=30:min-keyint=15:scenecut=0" -movflags +faststart -an -r 30 \
  "$OUT/telegram-avatar-640.mp4"
"$FF" -y -hide_banner -loglevel error -i mp4_blurred/0001.png \
  -vf scale=640:640:flags=lanczos "$OUT/telegram-avatar-poster.png"

echo "==> 25 fps pass (GIF: 25 fps == exactly 4 centiseconds per frame)"
blur_pass 25 gif
"$FF" -y -hide_banner -loglevel error -framerate 25 -i gif_blurred/%04d.png \
  -vf "scale=512:512:flags=lanczos,palettegen=max_colors=192:stats_mode=full" -frames:v 1 palette.png
"$FF" -y -hide_banner -loglevel error -framerate 25 -i gif_blurred/%04d.png -i palette.png \
  -lavfi "[0:v]scale=512:512:flags=lanczos[s];[s][1:v]paletteuse=dither=none" \
  -loop 0 -r 25 "$OUT/telegram-avatar-512.gif"

rm -rf mp4_sub mp4_in mp4_blurred gif_sub gif_in gif_blurred palette.png
ls -la "$OUT"
