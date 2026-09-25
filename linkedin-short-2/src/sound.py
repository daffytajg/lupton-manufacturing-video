"""Procedural sound bed for LinkedIn short #2 (studio conveyor), synced to the Blender event frames."""
import json
import os
import subprocess
import wave
import numpy as np
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ANC = json.load(open(os.path.join(HERE, "anchors.json")))
EV = ANC["F"]
SR = 48000
DUR = 15.0
n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(1969)
mix = np.zeros((n, 2))


def sec(frame):
    return (frame - 1) / 24.0


def add(sig, start, gain=1.0, pan=0.0):
    i = int(round(start * SR))
    if i >= n:
        return
    j = min(n, i + len(sig))
    s = sig[: j - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    mix[i:j, 0] += s * lg
    mix[i:j, 1] += s * rg


def band(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lowp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="low", fs=SR, output="sos"), x)


def seg(length):
    return np.arange(int(length * SR)) / SR


# ---------------- belt speed envelope (matches the scene) ----------------
def belt_speed(f):
    if f < EV["F_EMPTY"]:
        return 1.0
    if f < EV["F_EMPTY"] + 12:
        return (EV["F_EMPTY"] + 12 - f) / 12
    if f < 186:
        return 0.0
    if f < 196:
        return (f - 186) / 10
    return 1.0


fr = np.arange(1, 362)
spd = np.interp(t * 24 + 1, fr, [belt_speed(f) for f in fr])

# conveyor motor hum: pitch and level follow belt speed
f0 = 52 + 10 * spd
ph = np.cumsum(2 * np.pi * f0 / SR)
hum = (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * 0.5
roll = band(rng.standard_normal(n), 90, 420) * 0.9
belt = (hum + roll) * (spd ** 1.3) * 0.055
mix[:, 0] += belt
mix[:, 1] += belt * 0.9

# ---------------- part landings: short metal clack ----------------
k = seg(0.16)
def clack(bright=1.0):
    noise = band(rng.standard_normal(len(k)), 1800, 5200) * np.exp(-k / 0.012)
    ring = (np.sin(2 * np.pi * 3150 * bright * k) * 0.5 + np.sin(2 * np.pi * 4720 * bright * k) * 0.3) * np.exp(-k / 0.05)
    thunk = np.sin(2 * np.pi * 170 * k) * np.exp(-k / 0.025)
    return noise * 0.7 + ring * 0.35 + thunk * 0.6


for f in ANC["landings_A"]:
    if f >= 1:
        add(clack(rng.uniform(0.95, 1.05)), sec(f), 0.16 * rng.uniform(0.8, 1.1), pan=-0.35)
for f in ANC["landings_B"]:
    add(clack(rng.uniform(1.0, 1.08)), sec(f), 0.17 * rng.uniform(0.85, 1.1), pan=0.35)

# ---------------- the jam: grinding rattle + stuck clunk ----------------
jl = 1.3
kj = seg(jl)
am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 23 * kj + 2 * np.sin(2 * np.pi * 3 * kj)))
grind = band(rng.standard_normal(len(kj)), 700, 2600) * am
grind *= np.minimum(1, kj / 0.03) * np.exp(-kj / 0.7)
add(grind, sec(EV["F_JAM"]), 0.22, pan=-0.4)
kc = seg(0.4)
clunk = (np.sin(2 * np.pi * (95 + 60 * np.exp(-kc / 0.03)) * kc) * np.exp(-kc / 0.12)
         + band(rng.standard_normal(len(kc)), 400, 1800) * np.exp(-kc / 0.03) * 0.6)
add(clunk, sec(EV["F_JAM"] + 7), 0.4, pan=-0.4)

# beacon warning pips while the supplier is jammed (until the line alarm takes over)
kp = seg(0.09)
pip = np.sin(2 * np.pi * 1320 * kp) * np.minimum(1, kp / 0.004) * np.exp(-kp / 0.04)
for f in range(EV["F_JAM"], EV["F_EMPTY"], 10):
    add(pip, sec(f), 0.07, pan=-0.3)

# starved: two amber chirps
for f in (EV["F_WARN"], EV["F_WARN"] + 6):
    kk = seg(0.12)
    add(np.sin(2 * np.pi * (880 + 600 * kk / 0.12) * kk) * np.exp(-kk / 0.06), sec(f), 0.09)

# ---------------- line down alarm, synced to the red lamp ----------------
al = seg(0.25)
for idx, f in enumerate(range(EV["F_EMPTY"], EV["F_GREEN"], 12)):
    tone = 740 if idx % 2 == 0 else 587
    sq = np.sign(np.sin(2 * np.pi * tone * al)) * 0.6 + np.sin(2 * np.pi * tone * al) * 0.4
    sq = lowp(sq, 2400) * np.minimum(1, al / 0.01) * np.minimum(1, (0.25 - al) / 0.03)
    g = 0.085 if f < EV["F_LAND"] else 0.05 * max(0.2, 1 - (f - EV["F_LAND"]) / 70)
    add(sq, sec(f), g)

# ---------------- Lupton hopper drops in ----------------
dl = sec(EV["F_LAND"]) - sec(EV["F_DROP"])
kd = seg(dl)
sweep = np.linspace(300, 3200, len(kd))
wn = rng.standard_normal(len(kd))
whoosh = np.zeros_like(wn)
for s0 in range(0, len(kd), 2400):
    s1 = min(len(kd), s0 + 2400)
    fc = float(sweep[(s0 + s1) // 2])
    whoosh[s0:s1] = band(wn[s0:s1], fc * 0.6, min(fc * 1.6, 20000))
whoosh *= (kd / dl) ** 2
add(whoosh, sec(EV["F_DROP"]), 0.2, pan=0.3)
kb = seg(2.0)
boom = np.sin(2 * np.pi * (40 + 70 * np.exp(-kb / 0.06)) * kb) * np.exp(-kb / 0.5)
body = band(rng.standard_normal(len(kb)), 120, 900) * np.exp(-kb / 0.07)
clang = (np.sin(2 * np.pi * 612 * kb) + 0.6 * np.sin(2 * np.pi * 1377 * kb)) * np.exp(-kb / 0.22)
add(boom * 0.95 + body * 0.5 + clang * 0.12, sec(EV["F_LAND"]), 0.42, pan=0.2)
# chute swings down and seats
kc2 = seg(0.35)
seat = band(rng.standard_normal(len(kc2)), 500, 3000) * np.exp(-kc2 / 0.04) + np.sin(2 * np.pi * 240 * kc2) * np.exp(-kc2 / 0.08)
add(seat, sec(EV["F_LAND"] + 8), 0.35, pan=0.25)
add(seat, sec(EV["F_LAND"] + 13), 0.15, pan=0.25)

# ---------------- music ----------------
BPM = 100
beat = 60 / BPM
t_stop = sec(EV["F_EMPTY"])          # music drops out when the line goes down
t_back = sec(EV["F_LAND"])           # and returns when the Lupton hopper lands


def pluck(freq, length=0.5, bright=1.0):
    kk = seg(length)
    s = sum(np.sin(2 * np.pi * freq * h * kk) * (0.6 ** (h - 1)) * np.exp(-kk * (4 + 3 * h * bright)) for h in range(1, 5))
    return s * np.minimum(1, kk / 0.003)


def kick():
    kk = seg(0.3)
    return np.sin(2 * np.pi * (48 + 90 * np.exp(-kk / 0.03)) * kk) * np.exp(-kk / 0.12)


NOTE = {"C3": 130.81, "E3": 164.81, "G3": 196.0, "A3": 220.0, "C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.0, "A4": 440.0, "C5": 523.25}
riff = ["C4", "E4", "G4", "E4", "A3", "C4", "E4", "C4"]
# section 1: light, curious pulse; bends flat after the jam
tt, i = 0.12, 0
while tt < t_stop - 0.05:
    detune = 1.0 if tt < sec(EV["F_JAM"]) else 1.0 - 0.03 * (tt - sec(EV["F_JAM"])) / (t_stop - sec(EV["F_JAM"]))
    add(pluck(NOTE[riff[i % 8]] * detune, 0.45), tt, 0.085, pan=0.15 if i % 2 else -0.15)
    if i % 2 == 0:
        add(kick(), tt, 0.16 if tt < sec(EV["F_JAM"]) else 0.1)
    tt += beat / 2
    i += 1

# section 2: fuller return with a warm pad
pad = np.zeros(n)
for fq in (130.81, 196.0, 261.63, 329.63, 392.0, 587.33):
    for det in (0.997, 1.003):
        pad += np.sin(2 * np.pi * fq * det * t + rng.uniform(0, 6.28))
pad = lowp(pad, 1800)
swell = np.clip((t - t_back) / 1.6, 0, 1) * np.clip((DUR - t) / 1.4, 0, 1)
pad *= swell * 0.032
mix[:, 0] += pad
mix[:, 1] += pad
riff2 = ["C4", "G4", "E4", "G4", "A4", "G4", "E4", "D4"]
tt, i = t_back + beat, 0
while tt < DUR - 1.2:
    add(pluck(NOTE[riff2[i % 8]], 0.5, 0.8), tt, 0.08, pan=0.2 if i % 2 else -0.2)
    if i % 2 == 0:
        add(kick(), tt, 0.15)
    tt += beat / 2
    i += 1

# chimes: line back to green, then end card
def chime(notes, length=2.4):
    kk = seg(length)
    return sum(np.sin(2 * np.pi * f * kk) * a for f, a in notes) * np.exp(-kk / 0.7) * np.minimum(1, kk / 0.004)


add(chime([(1046.5, 0.5), (1318.5, 0.35), (1568.0, 0.25)]), sec(EV["F_GREEN"]), 0.09, pan=-0.1)
add(chime([(784.0, 0.4), (1046.5, 0.45), (1568.0, 0.2), (2093.0, 0.12)], 3.0), 11.72, 0.1, pan=0.1)

# ---------------- master ----------------
mix = np.tanh(mix * 1.25)
mix /= np.max(np.abs(mix)) / 0.89
fi = int(0.02 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.5 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
out = os.path.join(HERE, "soundbed.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
# normalize to social-video loudness (about -14 LUFS integrated)
tmp = out.replace(".wav", "_norm.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", str(SR), tmp], check=True)
os.replace(tmp, out)
print("wrote", out)
