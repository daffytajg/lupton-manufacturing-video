"""Mix voiceover + sound effects + music into one 40 s stereo track and mux it under the finals.
Usage: mix_audio.py AUDIO_DIR [music_file]   (music_file defaults to AUDIO_DIR/music_a.mp3; pass 'none' for no music)
Expects in AUDIO_DIR: vo1..vo5.mp3, sfx_paper, sfx_tap, sfx_press, sfx_laser, sfx_cnc, sfx_mold, sfx_office, sfx_phone, sfx_shop, sfx_whoosh (.mp3)
"""
import os, sys, subprocess, json, shutil
import numpy as np

SR, DUR = 48000, 40.0
N = int(SR * DUR)
AUD = sys.argv[1]
MUSIC = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AUD, "music_a.mp3")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def load(path, atempo=1.0):
    af = ["-af", "atempo=%.4f" % atempo] if abs(atempo - 1.0) > 0.001 else []
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path] + af + ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def db(x):
    return 10 ** (x / 20)


def rms_db(a):
    m = a.mean(axis=1)
    # RMS over the louder half of 50 ms blocks, so silence at the ends does not drag the number down
    w = int(0.05 * SR)
    blocks = m[: len(m) // w * w].reshape(-1, w)
    r = np.sqrt((blocks ** 2).mean(axis=1))
    r = np.sort(r)[len(r) // 2:]
    return 20 * np.log10(max(r.mean(), 1e-9))


def fade(a, fin=0.0, fout=0.0):
    n = len(a)
    if fin > 0:
        k = min(n, int(fin * SR)); a[:k] *= np.linspace(0, 1, k)[:, None]
    if fout > 0:
        k = min(n, int(fout * SR)); a[n - k:] *= np.linspace(1, 0, k)[:, None]
    return a


def trim_silence(a, thresh_db=-50):
    m = np.abs(a).max(axis=1)
    idx = np.where(m > db(thresh_db))[0]
    if len(idx) == 0:
        return a
    s, e = max(0, idx[0] - int(0.02 * SR)), min(len(a), idx[-1] + int(0.15 * SR))
    return a[s:e]


def loop_to(a, seconds, xf=1.0):
    need = int(seconds * SR)
    if len(a) >= need:
        return a[:need].copy()
    out = a.copy()
    k = int(xf * SR)
    while len(out) < need:
        head = a[:k] * np.linspace(0, 1, k)[:, None]
        out[-k:] = out[-k:] * np.linspace(1, 0, k)[:, None] + head
        out = np.concatenate([out, a[k:]])
    return out[:need]


def place(mix, a, t, gain_db=0.0, fin=0.0, fout=0.0, max_len=None):
    a = a.copy()
    if max_len:
        a = a[: int(max_len * SR)]
    a = fade(a, fin, fout) * db(gain_db)
    s = int(t * SR); e = min(N, s + len(a))
    if s < N:
        mix[s:e] += a[: e - s]
    return (t, t + len(a) / SR)


def env_100hz(a):
    m = a.mean(axis=1)
    w = SR // 100
    blocks = m[: len(m) // w * w].reshape(-1, w)
    return np.sqrt((blocks ** 2).mean(axis=1))


def smooth_env(env, attack=0.03, release=0.40):
    out = np.zeros_like(env); g = 0.0
    ka, kr = np.exp(-1 / (attack * 100)), np.exp(-1 / (release * 100))
    for i, v in enumerate(env):
        g = v + (g - v) * (ka if v > g else kr)
        out[i] = g
    return out


def to_full(env100):
    x = np.arange(len(env100)) / 100.0
    return np.interp(np.arange(N) / SR, x, env100, right=env100[-1])


mix_vo = np.zeros((N, 2), np.float32)
mix_fx = np.zeros((N, 2), np.float32)
mix_mu = np.zeros((N, 2), np.float32)

# --- voiceover: each line trimmed and levelled to -18 dBFS block RMS, placed 0.3 s after its beat starts
VO_T = [0.3, 8.1, 15.9, 23.5, 32.4]
VO_MAX = [7.2, 7.2, 7.2, 7.6, 7.0]   # each line must end before the next beat's line starts
VO_PREFIX = os.environ.get("VO_PREFIX", "vo")
vo_spans = []
for i, (t, mx) in enumerate(zip(VO_T, VO_MAX), 1):
    path = os.path.join(AUD, "%s%d.mp3" % (VO_PREFIX, i))
    a = trim_silence(load(path))
    if len(a) / SR > mx:
        stretch = min(1.10, (len(a) / SR) / mx)
        a = trim_silence(load(path, atempo=stretch))
        print("vo%d: time-stretched x%.3f to fit" % (i, stretch))
    a *= db(-18 - rms_db(a))
    span = place(mix_vo, a, t, 0.0, 0.01, 0.05)
    if vo_spans and span[0] < vo_spans[-1][1]:
        print("WARNING vo%d starts before vo%d ends" % (i, i - 1))
    vo_spans.append(span)
    print("vo%d: %.2f-%.2f s (%.2f s)" % (i, span[0], span[1], span[1] - span[0]))

# --- sound effects: each clip is normalised to a designed block-RMS level (dBFS) before placement,
#     because the generated files arrive at wildly different native levels
def S(name, target_db):
    a = load(os.path.join(AUD, name + ".mp3"))
    return a * db(target_db - rms_db(a))

place(mix_fx, S("sfx_paper", -30), 1.8, 0, 0.3, 0.8, 6.0)
place(mix_fx, S("sfx_tap", -22), 7.15, 0, 0.0, 0.1, 1.0)
place(mix_fx, S("sfx_press", -20), 8.0, 0, 0.02, 0.15, 1.5)
place(mix_fx, S("sfx_laser", -23), 9.55, 0, 0.05, 0.15, 1.96)
place(mix_fx, S("sfx_cnc", -22), 11.51, 0, 0.05, 0.15, 2.42)
place(mix_fx, S("sfx_mold", -20), 13.93, 0, 0.05, 0.4, 2.0)
place(mix_fx, S("sfx_office", -38), 15.5, 0, 0.4, 0.5, 8.2)
place(mix_fx, S("sfx_phone", -24), 20.85, 0, 0.0, 0.2, 1.5)
place(mix_fx, S("sfx_whoosh", -24), 31.05, 0, 0.0, 0.3, 2.0)
# shop ambience bed: looped to 33 s at -36 dBFS, 7 dB quieter during the office beat, gone by the end card
shop = loop_to(S("sfx_shop", -36), 33.0)
g = np.ones(len(shop), np.float32)
tt = np.arange(len(shop)) / SR
g[(tt > 15.6) & (tt < 23.4)] = db(-7)
g = np.convolve(g, np.ones(SR // 2) / (SR // 2), mode="same")  # 0.5 s smoothing of level steps
shop *= g[:, None]
place(mix_fx, shop, 0.0, 0.0, 0.5, 1.5)

# --- music: base level, ducked a further 8 dB under the voice, out by the end
if MUSIC.lower() != "none":
    mu = loop_to(load(MUSIC), DUR)
    mu *= db(-24 - rms_db(mu) - 0)  # bed sits ~6 dB under the VO before ducking
    env = smooth_env(env_100hz(mix_vo))
    duck = 1.0 - (1.0 - db(-8)) * np.clip(env / db(-30), 0, 1)
    mu *= to_full(duck)[:, None]
    place(mix_mu, mu, 0.0, 0.0, 1.0, 2.0)

mix = mix_vo + mix_fx + mix_mu
peak = np.abs(mix).max()
if peak > 0.95:
    mix *= 0.95 / peak
print("pre-normalise peak: %.3f" % peak)
os.makedirs("work/audio", exist_ok=True)
raw = mix.astype(np.float32).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-",
                "-c:a", "pcm_s24le", "work/audio/mix_raw.wav"], input=raw, check=True)

# --- two-pass loudness to -16 LUFS / -1.5 dBTP, then AAC
stats = subprocess.run(["ffmpeg", "-v", "info", "-i", "work/audio/mix_raw.wav", "-af",
                        "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
j = json.loads(stats[stats.rindex("{"):stats.rindex("}") + 1])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "work/audio/mix_raw.wav", "-af",
                "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:linear=true"
                % (j["input_i"], j["input_tp"], j["input_lra"], j["input_thresh"]),
                "-ar", str(SR), "-ac", "2", "-c:a", "aac", "-b:a", "192k", "work/audio/mix.m4a"], check=True)

# --- mux under both finals (video copied), keep silent masters
for tag in ("4x5", "1x1"):
    silent = "final_%s_silent.mp4" % tag
    if not os.path.exists(silent):
        shutil.copyfile("final_%s.mp4" % tag, silent)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", "work/audio/mix.m4a",
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "copy", "-shortest",
                    "-map_metadata", "-1", "-map_metadata:s:v", "-1", "-map_metadata:s:a", "-1",
                    "-metadata", "title=Lupton Associates", "-metadata", "artist=Joe Guadagnino",
                    "-movflags", "+faststart", "-fflags", "+bitexact", "final_%s.mp4" % tag], check=True)
    print("muxed final_%s.mp4" % tag)
