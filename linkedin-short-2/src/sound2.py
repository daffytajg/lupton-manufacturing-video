"""Procedural sound bed for the 15 s short: ticking tension -> riser -> impact -> warm resolve."""
import os
import wave
import numpy as np

SR = 48000
DUR = 15.0
n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(1969)
mix = np.zeros((n, 2))
IMPACT = 111 / 24


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    j = min(n, i + len(sig))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:j, 0] += sig[: j - i] * gain * l * 1.414
    mix[i:j, 1] += sig[: j - i] * gain * r * 1.414


def env(length, a, d):
    k = np.arange(int(length * SR)) / SR
    return np.minimum(1, k / max(a, 1e-4)) * np.exp(-k / d)


def lowpass(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


SNAP = 100 / 24
IMPACT = 111 / 24

# --- metal strain: low detuned groan swelling toward the snap ---
seg = t < SNAP
groan = np.zeros(n)
for det, amp in ((0.99, 1.0), (1.013, 0.8), (2.02, 0.3)):
    f = 48 * det * (1 + 0.25 * (t / SNAP) ** 2)
    ph = np.cumsum(2 * np.pi * f / SR)
    groan += amp * np.sign(np.sin(ph)) * 0.4 + amp * np.sin(ph)
groan = lowpass(groan * np.clip(t / 2.0, 0, 1) ** 1.5 * seg * 0.05, 0.08)
mix[:, 0] += groan
mix[:, 1] += groan

# --- alarm beeps (two-tone), speeding up ---
bl_ = 0.09
kbp = np.arange(int(bl_ * SR)) / SR
beep_env = np.minimum(1, kbp / 0.005) * np.minimum(1, (bl_ - kbp) / 0.01)
tt, k = 0.4, 0
while tt < SNAP - 0.15:
    fr = 1320 if k % 2 == 0 else 990
    add(np.sin(2 * np.pi * fr * kbp) * beep_env, tt, 0.07, pan=0.3 if k % 2 == 0 else -0.3)
    tt += 0.5 * (1 - 0.6 * tt / SNAP)
    k += 1

# --- snap: bright metallic crack + ring ---
sl = 1.2
ks = np.arange(int(sl * SR)) / SR
crack = rng.standard_normal(len(ks)) * np.exp(-ks / 0.02)
ring = sum(np.sin(2 * np.pi * fr * ks) * a for fr, a in ((2350, 0.5), (3710, 0.3), (5120, 0.2))) * np.exp(-ks / 0.35)
add(crack * 0.9 + ring * 0.35, SNAP, 1.0)

# --- impact: sub boom as the tile lands ---
bl = 2.2
kb = np.arange(int(bl * SR)) / SR
boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-kb / 0.08)) * kb) * np.exp(-kb / 0.6)
thud = lowpass(rng.standard_normal(len(kb)) * np.exp(-kb / 0.05), 0.25)
add(boom * 0.9 + thud * 0.4, IMPACT, 1.0)

# --- chain links locking in (metal clinks) ---
cl_ = 0.25
kc_ = np.arange(int(cl_ * SR)) / SR
for i in range(15):
    ft = (112 + (i % 3) * 2 + (i // 3) * 2 + 3) / 24
    fr = rng.uniform(2600, 4200)
    clink = (np.sin(2 * np.pi * fr * kc_) + 0.5 * np.sin(2 * np.pi * fr * 1.51 * kc_)) * np.exp(-kc_ / 0.05)
    add(clink, ft, 0.11, pan=(-0.5, 0.0, 0.5)[i % 3])

# --- warm resolve pad (C major add9), slow swell ---
pad = np.zeros(n)
notes = [130.81, 196.0, 261.63, 329.63, 392.0, 587.33]
for fr in notes:
    for det in (0.997, 1.003):
        pad += np.sin(2 * np.pi * fr * det * t + rng.uniform(0, 6.28))
start = IMPACT + 0.3
swell = np.clip((t - start) / 1.8, 0, 1) * np.clip((DUR - t) / 1.2, 0, 1)
pad *= swell * 0.05
pad = lowpass(pad, 0.12)
mix[:, 0] += pad
mix[:, 1] += pad

# --- soft pulse (8th notes at 100 bpm) after impact ---
beat = 60 / 100 / 2
pl = 0.18
kp = np.arange(int(pl * SR)) / SR
pulse = np.sin(2 * np.pi * 65.41 * kp) * np.exp(-kp / 0.07) * np.minimum(1, kp / 0.004)
tt = start + 0.6
while tt < DUR - 1.4:
    add(pulse, tt, 0.18)
    tt += beat

# --- end-card chime ---
cl = 2.5
kc = np.arange(int(cl * SR)) / SR
chime = sum(np.sin(2 * np.pi * fr * kc) * a for fr, a in ((1046.5, 0.5), (1568.0, 0.3), (2093.0, 0.15))) * np.exp(-kc / 0.8)
add(chime, 11.75, 0.12, pan=0.1)

# master: soft clip and normalize to -1 dBFS
mix = np.tanh(mix * 1.2)
mix /= np.max(np.abs(mix)) / 0.89
mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
mix[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "soundbed.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("wrote", out)
