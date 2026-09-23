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
IMPACT = 4.9


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


# --- clock ticks, accelerating ---
tick_len = 0.04
kt = np.arange(int(tick_len * SR)) / SR
tick = (np.sin(2 * np.pi * 2400 * kt) * 0.6 + rng.standard_normal(len(kt)) * 0.4) * np.exp(-kt / 0.006)
tock = (np.sin(2 * np.pi * 1700 * kt) * 0.6 + rng.standard_normal(len(kt)) * 0.4) * np.exp(-kt / 0.006)
tt, k = 0.15, 0
while tt < IMPACT - 0.25:
    interval = 0.5 * (1 - 0.8 * tt / IMPACT)
    add(tick if k % 2 == 0 else tock, tt, 0.22, pan=0.25 if k % 2 == 0 else -0.25)
    tt += interval
    k += 1

# --- tension drone (rising detuned saws, low) ---
seg = t < IMPACT
f = 55 * (1 + 0.12 * (t / IMPACT))
drone = np.zeros(n)
for det in (0.995, 1.0, 1.006):
    ph = np.cumsum(2 * np.pi * f * det / SR)
    drone += np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
drone *= np.clip(t / 1.5, 0, 1) * seg * 0.05
mix[:, 0] += drone
mix[:, 1] += drone

# --- riser into impact (filtered noise sweep) ---
rl = 1.4
rn = rng.standard_normal(int(rl * SR))
sweep = np.linspace(0.01, 0.15, len(rn))
riser = np.empty_like(rn)
acc = 0.0
for i, v in enumerate(rn):
    acc += sweep[i] * (v - acc)
    riser[i] = acc
riser *= np.linspace(0, 1, len(rn)) ** 3 * 0.35
add(riser, IMPACT - rl, 1.0)

# --- impact: sub boom + crack ---
bl = 2.2
kb = np.arange(int(bl * SR)) / SR
boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-kb / 0.08)) * kb) * np.exp(-kb / 0.6)
crack = rng.standard_normal(len(kb)) * np.exp(-kb / 0.05)
crack = lowpass(crack, 0.25)
add(boom * 0.9 + crack * 0.5, IMPACT, 1.0)

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
