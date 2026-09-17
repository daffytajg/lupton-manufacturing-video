"""Score for "Under One Roof". 120 BPM (0.5 s/beat, 2 s/bar), 40.0 s.

Structure follows the cut, not the other way round:
  0.0   cold open  — straight in on the pulse, no intro
  1.0   hook       — pad lands
  4.4 / 6.2 / 8.6 / 11.4   the four process beats; hats open up across them
  14.4  the problem — minor, thinner, the arp drops to half energy
  21.3  riser
  22.8  the turn   — big hit, bright chord, everything back
  25.6  payoff     — arp up an octave
  31.6  send
  34.4  end card   — resolve, then fade from 38.2
"""
import numpy as np, wave, sys

SR = 48000
DUR = 40.0
N = int(SR * DUR)
BEAT = 0.5
out = np.zeros(N)
rng = np.random.default_rng(23)


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


TURN = 22.8
PAYOFF = 25.6
ENDC = 34.4

# ---- sub pulse on every beat ----
for k in range(int(DUR / BEAT)):
    at = k * BEAT
    if at >= 38.6:
        break
    n = int(0.34 * SR); tt = np.arange(n) / SR
    f = 58 - 26 * np.minimum(tt * 8, 1)
    sig = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7.5)
    sig[:int(0.004 * SR)] += np.linspace(0.7, 0, int(0.004 * SR))
    # thinner through the problem section, hard again from the turn
    if 14.4 <= at < TURN:
        lvl = 0.34 if k % 2 == 0 else 0.22
    else:
        lvl = 0.62 if (at >= TURN or k % 2 == 0) else 0.4
    add(sig, at, lvl)

# ---- 16th hats, opening up toward the turn ----
for k in range(int(DUR / 0.25)):
    at = k * 0.25
    if at >= 38.0:
        break
    n = int(0.045 * SR)
    noise = np.diff(rng.standard_normal(n), prepend=0)
    sig = noise * np.exp(-np.arange(n) / SR * 105)
    ramp = 0.3 + 0.7 * min(at / TURN, 1.0)
    if 14.4 <= at < 21.3:
        ramp *= 0.55
    add(sig, at, (0.05 if k % 4 == 0 else 0.028) * ramp)

# ---- arpeggio: A minor pentatonic, 8ths ----
ARP = [220.0, 261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63]
for k in range(int((37.5 - 1.0) / 0.25)):
    at = 1.0 + k * 0.25
    f0 = ARP[k % len(ARP)]
    if at >= PAYOFF:
        f0 *= 2
    n = int(0.4 * SR); tt = np.arange(n) / SR
    sig = np.zeros(n)
    for h, amp in ((1, 1.0), (2, 0.35), (3, 0.16)):
        sig += np.sin(2 * np.pi * f0 * h * tt) * amp
    sig = lp(sig, 2600) * np.exp(-tt * 6.5)
    lvl = 0.075 + 0.055 * min(max((at - 1.0) / 13.0, 0), 1.0)
    if 14.4 <= at < TURN:
        lvl *= 0.45
    add(sig, at, lvl)


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

pad(Am, 0.0, 4.4, lvl=0.18, attack=0.06)      # cold open + hook
pad(F, 4.4, 4.2)                               # cut / formed
pad(C, 8.6, 5.8)                               # welded / finished
pad(Am, 14.4, 8.4, lvl=0.17)                   # the problem: darker, thinner
pad(C, TURN, 2.8, lvl=0.3, attack=0.05)        # the turn: bright, instant
pad(G, PAYOFF, 6.0, lvl=0.26, attack=0.3)      # payoff
pad([130.81, 164.81, 196.0, 261.63, 329.63], ENDC, 5.6, lvl=0.28, attack=0.4)

# ---- riser into the turn ----
n = int(1.5 * SR); tt = np.arange(n) / SR
sw = lp(rng.standard_normal(n), 500) * np.linspace(0, 1, n) ** 2.3
add(sw, 21.3, 0.38)
tone = np.sin(2 * np.pi * (220 + 700 * (tt / 1.5) ** 2) * tt) * np.linspace(0, 1, n) ** 3
add(lp(tone, 3000), 21.3, 0.12)

# ---- the hit on the turn ----
n = int(2.6 * SR); tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (70 - 42 * np.minimum(tt * 2.2, 1)) * tt) * np.exp(-tt * 2.6)
crack = np.diff(rng.standard_normal(n), prepend=0) * np.exp(-tt * 26)
shim = (np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt * 7) * 0.2
        + np.sin(2 * np.pi * 1976 * tt) * np.exp(-tt * 9) * 0.11)
add(boom * 0.95 + crack * 0.3 + shim, TURN, 0.8)

# ---- resolve under the end card ----
n = int(1.6 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * (56 - 12 * tt) * tt) * np.exp(-tt * 4.2), ENDC, 0.5)

fade = np.ones(N); nf = int(1.8 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 1.4
out *= fade
out = np.tanh(out * 1.5) * 0.86
print('peak', float(np.abs(out).max()))
pcm = (out * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1], DUR, 's')
