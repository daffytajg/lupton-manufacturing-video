"""Driving score for "BUILT". 120 BPM (0.5 s/beat, 2 s/bar), 33.0 s.
Cut points 0, 4, 7, 10, 13, 19.5, 23, 27.5 all land on the beat grid.
Energy plan: pulse from 0, arp enters at 4, builds through the process beats,
riser 17.5-19.5, BIG HIT on the slam at 19.5, hero pad 23, resolve 27.5, fade out.
"""
import numpy as np, wave, sys

SR = 48000
DUR = 33.0
N = int(SR * DUR)
BEAT = 0.5
out = np.zeros(N)
rng = np.random.default_rng(11)


def add(sig, at, lvl=1.0):
    s = int(at * SR)
    n = min(len(sig), N - s)
    if n > 0:
        out[s:s + n] += sig[:n] * lvl


def lp(x, fc):
    rc = 1 / (2 * np.pi * fc); dt = 1 / SR; a = dt / (rc + dt)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y


def adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    hold = max(0, n - a - d - r)
    e = np.concatenate([
        np.linspace(0, 1, a), np.linspace(1, s, d),
        np.full(hold, s), np.linspace(s, 0, r)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


# ---- kick-ish sub pulse on every beat, harder from the slam onward ----
for k in range(int(DUR / BEAT)):
    at = k * BEAT
    if at >= 32.0:
        break
    n = int(0.34 * SR); tt = np.arange(n) / SR
    f = 58 - 26 * np.minimum(tt * 8, 1)          # pitch drop
    sig = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7.5)
    sig[:int(0.004 * SR)] += np.linspace(0.7, 0, int(0.004 * SR))
    strong = (at >= 19.5) or (k % 2 == 0)
    add(sig, at, 0.62 if strong else 0.4)

# ---- driving 16th hats, quiet, opening up as the film builds ----
for k in range(int(DUR / 0.25)):
    at = k * 0.25
    if at >= 31.5:
        break
    n = int(0.045 * SR)
    noise = np.diff(rng.standard_normal(n), prepend=0)
    sig = noise * np.exp(-np.arange(n) / SR * 105)
    ramp = 0.35 + 0.65 * min(at / 19.5, 1.0)
    add(sig, at, (0.05 if k % 4 == 0 else 0.028) * ramp)

# ---- arpeggio: the engine. A minor pentatonic, 8ths, enters at 4 s ----
ARP = [220.0, 261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63]
for k in range(int((31.0 - 4.0) / 0.25)):
    at = 4.0 + k * 0.25
    f0 = ARP[k % len(ARP)]
    # lift an octave for the hero section
    if at >= 23.0:
        f0 *= 2
    n = int(0.4 * SR); tt = np.arange(n) / SR
    sig = np.zeros(n)
    for h, amp in ((1, 1.0), (2, 0.35), (3, 0.16)):
        sig += np.sin(2 * np.pi * f0 * h * tt) * amp
    sig = lp(sig, 2600) * np.exp(-tt * 6.5)
    lvl = 0.075 + 0.06 * min(max((at - 4.0) / 15.0, 0), 1.0)
    if 19.5 <= at < 23.0:
        lvl *= 0.45                                 # duck under the slam
    add(sig, at, lvl)

# ---- pads: chord per 3-4 s, following the cut points ----
def pad(freqs, at, length, lvl=0.2, attack=0.5):
    n = int((length + 0.9) * SR); tt = np.arange(n) / SR
    sig = np.zeros(n)
    for f0 in freqs:
        for det in (-0.4, 0.4):
            for h in range(1, 6):
                sig += np.sin(2 * np.pi * (f0 + det) * h * tt) / h * (0.5 if h > 1 else 1.0)
    sig /= (len(freqs) * 2 * 2.3)
    add(lp(sig, 900) * adsr(n, attack, 0.4, 0.8, 0.8), at, lvl)


Am = [110.0, 130.81, 164.81, 220.0]
F = [87.31, 110.0, 130.81, 174.61]
C = [130.81, 164.81, 196.0, 261.63]
G = [98.0, 123.47, 146.83, 196.0]
pad(Am, 0.0, 4.0)
pad(F, 4.0, 3.0)
pad(C, 7.0, 3.0)
pad(G, 10.0, 3.0)
pad(Am, 13.0, 6.5, lvl=0.17)                       # the problem: darker, thinner
pad(C, 19.5, 3.5, lvl=0.28, attack=0.05)           # the turn: bright, instant
pad(G, 23.0, 4.5, lvl=0.26, attack=0.3)            # hero
pad([130.81, 164.81, 196.0, 261.63, 329.63], 27.5, 5.0, lvl=0.28, attack=0.4)

# ---- riser into the slam ----
n = int(2.0 * SR); tt = np.arange(n) / SR
sw = lp(rng.standard_normal(n), 500) * np.linspace(0, 1, n) ** 2.3
add(sw, 17.85, 0.4)
tone = np.sin(2 * np.pi * (220 + 700 * (tt / 2.0) ** 2) * tt) * np.linspace(0, 1, n) ** 3
add(lp(tone, 3000), 17.85, 0.13)

# ---- THE HIT: parts slam together at 19.5 ----
n = int(2.6 * SR); tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (70 - 42 * np.minimum(tt * 2.2, 1)) * tt) * np.exp(-tt * 2.6)
crack = np.diff(rng.standard_normal(n), prepend=0) * np.exp(-tt * 26)
shim = (np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt * 7) * 0.2
        + np.sin(2 * np.pi * 1976 * tt) * np.exp(-tt * 9) * 0.11)
add(boom * 0.95 + crack * 0.3 + shim, 19.85, 0.85)

# small reverse-swell just before it
n = int(0.5 * SR)
add(lp(rng.standard_normal(n), 900) * np.linspace(0, 1, n) ** 2, 19.35, 0.22)

# ---- resolve hit under the end card ----
n = int(1.6 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * (56 - 12 * tt) * tt) * np.exp(-tt * 4.2), 27.5, 0.5)

fade = np.ones(N); nf = int(1.8 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.4
out *= fade
out = np.tanh(out * 1.5) * 0.86
print('peak', float(np.abs(out).max()))
pcm = (out * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1], DUR, 's')
