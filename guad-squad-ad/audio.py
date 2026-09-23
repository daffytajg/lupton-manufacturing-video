"""Synthesize music + SFX for the Guad Squad ad and mix with the voiceover.

Usage: python3 audio.py VO_WAV OUT_WAV
All cue times are in frames @30fps to match scene.py.
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(3)


def f2s(frame):
    return frame / 30.0


def t_arr(sec):
    return np.arange(int(sec * SR)) / SR


def place(buf, sig, at_sec, gain=1.0):
    i = int(at_sec * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def env_adsr(n, a=0.005, d=0.1, s=0.0, r=0.05, sus_len=0.0):
    a_n, d_n, r_n, s_n = int(a * SR), int(d * SR), int(r * SR), int(sus_len * SR)
    e = np.concatenate([
        np.linspace(0, 1, max(a_n, 1)),
        np.linspace(1, s, max(d_n, 1)),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    out = np.zeros(n)
    out[: min(n, len(e))] = e[:n]
    return out


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def onepole_hp(x, cutoff):
    return x - lowpass(x, cutoff)


# ------------------------------------------------------------------ instruments
def marimba(freq, dur=0.45):
    t = t_arr(dur)
    e = np.exp(-t * 9)
    return (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 30)) * e * env_adsr(len(t), 0.002, dur, 1, 0.01)


def kick():
    t = t_arr(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) + 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 180)


def clap():
    t = t_arr(0.25)
    n = rng.standard_normal(len(t))
    n = onepole_hp(n, 900)
    e = np.exp(-t * 22)
    for off in (0.0, 0.011, 0.022):
        e += np.where(t > off, np.exp(-(t - off) * 120), 0) * 0.5
    return n * e * 0.5


def hat(open_=False):
    t = t_arr(0.18 if open_ else 0.05)
    n = onepole_hp(rng.standard_normal(len(t)), 6000)
    return n * np.exp(-t * (18 if open_ else 90)) * 0.35


def bass(freq, dur):
    t = t_arr(dur)
    saw = 2 * ((freq * t) % 1) - 1
    sub = np.sin(2 * np.pi * freq * t)
    x = lowpass(0.5 * saw + 0.8 * sub, 420)
    return x * env_adsr(len(t), 0.005, 0.08, 0.75, 0.06, dur - 0.15)


def pluck_chord(notes, dur=0.4):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for m in notes:
        f = midi(m)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            out += (2 * ((ff * t) % 1) - 1)
    out = lowpass(out / (len(notes) * 2), 2400)
    return out * np.exp(-t * 7)


def pad(notes, dur, bright=900):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for m in notes:
        f = midi(m)
        for det in (-0.08, 0.0, 0.08):
            ff = f * 2 ** (det / 12)
            out += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6)) + 0.25 * np.sin(2 * np.pi * 2 * ff * t)
    out = lowpass(out / (len(notes) * 3), bright)
    return out * env_adsr(len(t), 0.4, 0.2, 0.9, 0.5, dur - 1.1)


def riser(dur):
    t = t_arr(dur)
    n = rng.standard_normal(len(t))
    # sweep via mixing progressively brighter highpassed noise
    lo = lowpass(n, 1200)
    bright = n - lo
    mix = lo * (1 - t / dur) * 0.4 + bright * (t / dur)
    tone_f = 200 * 2 ** (t / dur * 2.5)
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.25
    return (mix * 0.5 + tone) * (t / dur) ** 2


def whoosh(dur=0.45, up=True):
    t = t_arr(dur)
    n = rng.standard_normal(len(t))
    e = np.sin(np.pi * t / dur) ** 2
    x = lowpass(n, 2500) if up else lowpass(n, 1500)
    return x * e * 0.8


def impact():
    t = t_arr(1.6)
    f = 32 + 80 * np.exp(-t * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    crack = rng.standard_normal(len(t)) * np.exp(-t * 35) * 0.6
    return boom + lowpass(crack, 4000)


def pop(freq):
    t = t_arr(0.12)
    f = freq * (1 + 0.8 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)


def chime(notes, step=0.06):
    out = np.zeros(int(1.6 * SR))
    for i, m in enumerate(notes):
        t = t_arr(1.2)
        f = midi(m)
        s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t)) * np.exp(-t * 4)
        place(out, s * 0.5, i * step)
    return out


def buzz(dur):
    t = t_arr(dur)
    x = np.sign(np.sin(2 * np.pi * 165 * t)) * 0.5 + np.sin(2 * np.pi * 82 * t)
    x = lowpass(x, 600)
    return x * env_adsr(len(t), 0.01, 0.02, 1, 0.03, dur - 0.06) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t))


def bandpass_phone(x):
    return lowpass(onepole_hp(x, 450), 3800)


# ------------------------------------------------------------------ arrangement
L = np.zeros(N)  # mono music bus (stereo width added later)
S = np.zeros(N)  # sfx bus

# Intro: ringing (frames 0-95). Vibrate bursts + a phone-speaker ringtone motif.
ring_notes = [76, 83, 81, 76, 79, 83]
for cyc in range(4):
    start = f2s(cyc * 24)
    place(S, buzz(0.47), start, 0.18)
    ring = np.zeros(int(0.8 * SR))
    for i, m in enumerate(ring_notes):
        place(ring, marimba(midi(m), 0.3), i * 0.1)
    place(S, bandpass_phone(ring), start, 0.26)

# tension pad under the problem
place(L, pad([45, 52, 57, 60], 5.2, 700), 0.0, 0.45)
# missed call: descending "call ended" tones + low thud
place(S, marimba(midi(72), 0.3) * 0.8, f2s(99))
place(S, marimba(midi(65), 0.5) * 0.8, f2s(99) + 0.16)
place(S, impact()[: int(0.6 * SR)] * 0.22, f2s(103))
place(S, impact()[: int(0.6 * SR)] * 0.16, f2s(121))
# riser into the drop
place(S, riser(1.25), f2s(150) - 1.25, 0.5)

# DROP at frame 150 — "Not anymore."
DROP = f2s(150)
place(S, impact(), DROP, 0.8)
place(S, whoosh(0.9), DROP + 0.05, 0.5)  # phone spin

BPM = 120
beat = 60 / BPM
prog = [(57, [69, 72, 76]), (53, [65, 69, 72, 76]), (48, [67, 72, 76]), (55, [67, 71, 74])]  # Am F C G
bar_len = 4 * beat
t0 = DROP + beat  # groove starts one beat after the hit
end_t = 14.45
n_beats = int((end_t - t0) / beat)
for b in range(n_beats):
    tb = t0 + b * beat
    place(L, kick(), tb, 0.9)
    if b % 2 == 1:
        place(L, clap(), tb, 0.55)
    place(L, hat(), tb + beat / 2, 0.5)
    place(L, hat(), tb, 0.25)
    if b % 4 == 3:
        place(L, hat(True), tb + beat / 2, 0.35)
    root, chord = prog[(b // 4) % 4]
    place(L, bass(midi(root - 12), beat * 0.9), tb, 0.45)
    if b % 2 == 0:
        place(L, pluck_chord(chord, 0.35), tb + beat * 0.5, 0.35)
        place(L, pluck_chord(chord, 0.35), tb + beat * 1.25, 0.25)
# end chord
place(L, pad([57, 64, 69, 72, 76], 1.6, 1500), 13.4, 0.35)
place(L, kick(), end_t, 0.9)
place(L, impact() * 0.4, end_t, 1.0)

# UI cues
for f, fr in ((217, 880), (254, 988), (288, 1175)):
    place(S, whoosh(0.22), f2s(f) - 0.05, 0.25)
for f, fr in ((219, 1320), (240, 1760), (262, 1320)):
    place(S, pop(fr), f2s(f), 0.35)
place(S, chime([72, 76, 79, 84, 88]), f2s(289), 0.55)
place(S, pop(660) * 0.8, f2s(314), 0.4)
place(S, whoosh(0.5), f2s(330), 0.5)
place(S, impact() * 0.35, f2s(337), 0.8)
place(S, chime([79, 84, 88, 91], 0.05), f2s(338), 0.35)
for f in (360, 370, 392):
    place(S, pop(1560), f2s(f), 0.3)

# ------------------------------------------------------------------ mix
def read_wav(path):
    with wave.open(path) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(1)
    assert sr == SR, sr
    return x


vo_path, out_path = sys.argv[1], sys.argv[2]
vo = np.zeros(N)
place(vo, read_wav(vo_path), 0.15)

# sidechain: duck music under the voice
env = np.abs(vo)
win = int(0.03 * SR)
env = np.convolve(env, np.ones(win) / win, mode="same")
smooth = lowpass(env, 6.0)
duck = 1.0 - np.clip(smooth / (smooth.max() + 1e-9) * 3.0, 0, 1) * 0.7

music = L * duck * 0.28
sfx = S * (0.3 + 0.3 * duck)

# stereo: music slightly widened with a short haas delay on plucks/pads
d = int(0.012 * SR)
music_r = np.concatenate([np.zeros(d), music[:-d]])
left = vo + music + sfx
right = vo + 0.85 * music + 0.15 * music_r + sfx
stereo = np.stack([left, right], 1)
# gentle fade-out on the last 0.35s
fade = int(0.35 * SR)
stereo[-fade:] *= np.linspace(1, 0, fade)[:, None]
stereo /= np.abs(stereo).max() / 0.95
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print("wrote", out_path)
