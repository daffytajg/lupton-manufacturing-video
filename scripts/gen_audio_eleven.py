"""Generate voiceover, sound effects and music beds through the ElevenLabs REST API.
Reads the key from work/.eleven_key (git-ignored). Writes into work/audio/. Never prints the key."""
import os, json, subprocess, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
KEY = open("work/.eleven_key").read().strip()
BASE = "https://api.elevenlabs.io/v1"
OUT = "work/audio"
os.makedirs(OUT, exist_ok=True)


def api(method, path, body=None, out=None, params=None):
    url = BASE + path + (("?" + urllib.parse.urlencode(params)) if params else "")
    cmd = ["curl", "-sS", "-X", method, "-H", "xi-api-key: " + KEY, "-w", "\n%{http_code}"]
    if body is not None:
        cmd += ["-H", "content-type: application/json", "-d", json.dumps(body)]
    if out:
        cmd += ["-o", out]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    code = r.stdout.strip().rsplit("\n", 1)[-1]
    if out:
        ok = code == "200"
        if not ok:
            try:
                print("   ERROR", code, open(out).read()[:300])
            except Exception:
                print("   ERROR", code)
            if os.path.exists(out):
                os.remove(out)
        return ok, None
    body_txt = r.stdout.strip().rsplit("\n", 1)[0]
    try:
        return code == "200", json.loads(body_txt)
    except Exception:
        return code == "200", body_txt


def dur(path):
    try:
        return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                    capture_output=True, text=True).stdout.strip())
    except Exception:
        return -1


LINES = [
    "Send us the drawing. We'll tell you what it costs to make.",
    "Stamping, fabrication, machining, molding and electronics. We do all of it.",
    "We quote it, and we make it. No reseller layer.",
    "Brackets. Housings. Chassis. Bus bars. Harnesses. Made here and in low cost regions, since 1969.",
    "Send us your drawings. Or book time with our team.",
]
BRIAN = "nPczCjzI2devNBz1zQrb"

# --- 1. try to add the library "leadership narrator" voice to this account (Creator tier allows it)
vino_id = None
ok, res = api("GET", "/shared-voices", params={"search": "Vino Warm Leadership Narrator", "gender": "male", "page_size": 10})
if ok and isinstance(res, dict):
    for v in res.get("voices", []):
        if v.get("voice_id") == "0eoTRDoAaymfOXt2wp08":
            ok2, added = api("POST", "/voices/add/%s/%s" % (v["public_owner_id"], v["voice_id"]), body={"new_name": "Vino Leadership Narrator"})
            if ok2 and isinstance(added, dict) and added.get("voice_id"):
                vino_id = added["voice_id"]
            else:
                # may already be in the account under the same id
                ok3, mine = api("GET", "/voices/" + v["voice_id"])
                if ok3:
                    vino_id = v["voice_id"]
            break
print("library voice:", "added as " + vino_id if vino_id else "not available, Brian only")

# --- 2. voiceover lines
def tts(voice_id, prefix):
    for i, text in enumerate(LINES, 1):
        out = os.path.join(OUT, "%s%d.mp3" % (prefix, i))
        ok, _ = api("POST", "/text-to-speech/%s" % voice_id, params={"output_format": "mp3_44100_128"}, out=out,
                    body={"text": text, "model_id": "eleven_multilingual_v2",
                          "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True}})
        print("  %s%d: %s %.2fs" % (prefix, i, "ok" if ok else "FAILED", dur(out) if ok else 0))

if vino_id:
    print("voiceover, library voice ->", "vo*.mp3"); tts(vino_id, "vo")
    print("voiceover, Brian (alternate) ->", "alt_brian_vo*.mp3"); tts(BRIAN, "alt_brian_vo")
else:
    print("voiceover, Brian ->", "vo*.mp3"); tts(BRIAN, "vo")

# --- 3. sound effects
SFX = [
    ("sfx_paper", "A large sheet of thick drafting paper unrolling and sliding slowly across a brushed steel workbench, soft paper rustle and a faint slide, quiet workshop room, no voices", 6, 0.5, False),
    ("sfx_tap", "A single soft fingertip tap on a sheet of paper lying on a metal table, close and dry, one tap only", 1, 0.6, False),
    ("sfx_press", "Mechanical stamping press, one stroke: a heavy metal clunk as the die hits a steel strip, then the ram lifting with a soft hydraulic sigh, inside a factory", 2.5, 0.5, False),
    ("sfx_laser", "Fiber laser cutting sheet steel: a sharp continuous hiss with fine crackling sparks and a servo motor moving the head, industrial, close", 2.5, 0.5, False),
    ("sfx_cnc", "CNC milling machine cutting aluminum: steady high spindle whine, end mill cutting chatter, coolant spraying, small chips scattering, inside the machine enclosure", 3, 0.5, False),
    ("sfx_mold", "Injection molding machine opening: low hydraulic hum, two steel mold halves separating with a metallic clack, ejector pins clicking, a small plastic part dropping", 2.5, 0.5, False),
    ("sfx_office", "Quiet small office room tone inside a factory: a soft air handler, a distant machine hum through a window, very subtle and steady, no voices", 9, 0.4, True),
    ("sfx_phone", "Smartphone new-message notification: a short soft vibration buzz against a wooden desk followed by one gentle chime", 1.5, 0.6, False),
    ("sfx_shop", "Clean modern machine shop ambience: soft ventilation hum, one distant machine running, faint occasional metallic ticks, steady and calm, no voices, no music", 22, 0.4, True),
    ("sfx_whoosh", "A soft, low, airy whoosh resolving into a warm gentle sub-bass thump, cinematic and subtle, clean tail", 2, 0.5, False),
]
print("sound effects")
for name, text, secs, infl, loop in SFX:
    out = os.path.join(OUT, name + ".mp3")
    ok, _ = api("POST", "/sound-generation", params={"output_format": "mp3_44100_128"}, out=out,
                body={"text": text, "duration_seconds": secs, "prompt_influence": infl, "loop": loop, "model_id": "eleven_text_to_sound_v2"})
    print("  %s: %s %.2fs" % (name, "ok" if ok else "FAILED", dur(out) if ok else 0))

# --- 4. music beds (two options)
MUSIC = [
    ("music_a", "Warm, understated instrumental: softly plucked clean electric guitar, a round bass, brushed drums with a light shaker at a relaxed 84 BPM, organic and human, steady and confident, no build, no drop, ends on a warm sustained chord."),
    ("music_b", "Minimal modern instrumental: soft felt piano chords, low warm strings, a gentle muted pulse at 80 BPM, calm and grounded, mostly space, no drum fills, no build, ends on a held chord."),
]
print("music")
for name, prompt in MUSIC:
    out = os.path.join(OUT, name + ".mp3")
    ok, _ = api("POST", "/music", params={"output_format": "mp3_44100_128"}, out=out,
                body={"prompt": prompt, "music_length_ms": 40000, "force_instrumental": True})
    print("  %s: %s %.2fs" % (name, "ok" if ok else "FAILED", dur(out) if ok else 0))

ok, sub = api("GET", "/user/subscription")
if ok and isinstance(sub, dict):
    print("credits used this cycle: %s of %s" % (sub.get("character_count"), sub.get("character_limit")))
