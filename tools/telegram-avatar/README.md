# Telegram video avatar

Animated version of the project logo, built as vector art so it can be re-rendered
at any size. Not part of the Unity build — delete the folder if you don't want it.

## Output

| File | Format | Use |
| --- | --- | --- |
| `out/telegram-avatar-640.mp4` | 640×640, H.264 High, yuv420p, 30 fps, 4.00 s | Telegram video avatar |
| `out/telegram-avatar-512.gif` | 512×512, 25 fps, 4.00 s, infinite loop | chats, README, anywhere GIF works |
| `out/telegram-avatar-poster.png` | 640×640 | static fallback / cover frame |

Telegram caps profile videos at 10 s and crops them to a circle; every element
stays inside the inscribed circle of the 1280×1280 frame, so nothing is clipped.

## The loop

Four seconds, seamless (frame *n* equals frame 0, so there is no hitch on repeat):

| Time | Beat |
| --- | --- |
| 0.00–1.04 s | rest; the dot blinks once like a terminal cursor |
| 1.04–1.32 s | wind-up — the arrow retracts into the block, which squashes |
| 1.32–2.00 s | fire — the arrow accelerates out of frame |
| 2.00–2.24 s | empty barrel; the mark reads as a plain **Я** |
| 2.24–3.28 s | reload — a new arrow slides out from behind the block |
| 3.28–3.76 s | elastic settle back to the resting logo |

The whole mark also breathes ±0.9 % over the loop and takes a recoil kick on the shot.

## How it works

- `scene.html` — the logo rebuilt as inline SVG plus a deterministic `window.setT(t)`
  that positions everything for a normalized loop time `t ∈ [0,1)`. No CSS animation
  and no `requestAnimationFrame`, so a frame is reproducible from its timestamp alone.
- `render.mjs` — drives headless Chromium, calling `setT(i/n)` and screenshotting each
  frame at 1280×1280. Uses `i/n` rather than `i/(n-1)` so frame *n* lands back on frame 0.
- `build.sh` — renders at 8× the target frame rate and averages each group of 8
  sub-frames **in linear light** (`zscale` to linear, `tmix`, back again). Averaging in
  sRGB would drag the blur toward a muddy olive against the dark teal background.
  The seam is handled by wrapping the last 7 sub-frames to the front of the sequence,
  so frame 0's blur trails correctly out of the end of the loop.

## Re-rendering

```bash
npm i ffmpeg-static playwright-core
./build.sh
```

Override `CHROME=` if your Chromium lives somewhere other than `/opt/pw-browsers/chromium`.
Edit the `K` keyframe table in `scene.html` to retime the beats; edit the geometry in
the SVG to change the mark.
