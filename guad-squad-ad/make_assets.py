"""Generate 2D UI textures (phone screens, chat bubbles, cards) for the Guad Squad ad."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(OUT, exist_ok=True)
SS = 2  # supersample factor

MONT = "/usr/share/fonts/truetype/montserrat/Montserrat-{}.ttf"
INTER = "/usr/share/fonts/opentype/inter/Inter-{}.otf"
DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

NAVY = (11, 27, 51)  # Guad Squad navy
MINT = (18, 191, 160)  # Guad Squad teal
OCEAN = (10, 134, 176)
RED = (255, 59, 78)
WHITE = (255, 255, 255)
GRAY = (150, 160, 182)


def font(path, size):
    return ImageFont.truetype(path, int(size * SS))


def canvas(w, h, color=(0, 0, 0, 0)):
    return Image.new("RGBA", (w * SS, h * SS), color)


def save(img, name):
    w, h = img.size
    img.resize((w // SS, h // SS), Image.LANCZOS).save(os.path.join(OUT, name))


def s(v):
    return int(v * SS)


def text_c(d, cx, y, txt, f, fill, spacing=0):
    if spacing:
        widths = [d.textlength(ch, font=f) for ch in txt]
        total = sum(widths) + s(spacing) * (len(txt) - 1)
        x = s(cx) - total / 2
        for ch, w in zip(txt, widths):
            d.text((x, s(y)), ch, font=f, fill=fill)
            x += w + s(spacing)
        return
    w = d.textlength(txt, font=f)
    d.text((s(cx) - w / 2, s(y)), txt, font=f, fill=fill)


def tr_rrect(img, box, radius, fill):
    """Alpha-composite a translucent rounded rectangle (ImageDraw would overwrite alpha)."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(box, radius=radius, fill=fill)
    img.alpha_composite(layer)
    return ImageDraw.Draw(img)


def vgrad(w, h, top, bottom):
    g = Image.new("RGBA", (w * SS, h * SS))
    d = ImageDraw.Draw(g)
    for yy in range(h * SS):
        t = yy / (h * SS - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,)
        d.line([(0, yy), (w * SS, yy)], fill=c)
    return g


def glow(img, cx, cy, r, color, alpha=140):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([s(cx - r), s(cy - r), s(cx + r), s(cy + r)], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(s(r * 0.45)))
    return Image.alpha_composite(img, layer)


# ---------------------------------------------------------------- phone screens
SW, SH = 900, 1935
CORNER = 110


def screen_base(top, bottom):
    img = vgrad(SW, SH, top, bottom)
    return img


def status_bar(d, t="2:47"):
    f = font(INTER.format("SemiBold"), 40)
    d.text((s(80), s(52)), t, font=f, fill=WHITE)
    # dynamic island
    d.rounded_rectangle([s(330), s(40), s(570), s(108)], radius=s(34), fill=(0, 0, 0))
    # signal + battery
    for i in range(4):
        h = 12 + i * 7
        d.rounded_rectangle([s(640 + i * 16), s(88 - h), s(650 + i * 16), s(88)], radius=s(2), fill=WHITE)
    d.rounded_rectangle([s(725), s(58), s(800), s(90)], radius=s(8), outline=WHITE, width=s(3))
    d.rounded_rectangle([s(731), s(64), s(785), s(84)], radius=s(4), fill=WHITE)


def finish_screen(img, name):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], radius=s(CORNER), fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 255))
    out.paste(img, (0, 0), mask)
    save(out, name)


def handset(d, cx, cy, size, fill, rot=0):
    """Modern phone-handset icon drawn as a thick quarter arc with rounded ends."""
    n = s(size * 1.6)
    g = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    c = n / 2
    R = n * 0.34
    w = n * 0.15
    ox, oy = c + n * 0.12, c - n * 0.12
    gd.arc([ox - R, oy - R, ox + R, oy + R], 95, 175, fill=fill, width=int(w))
    import math
    for ang in (88, 182):
        a = math.radians(ang)
        ex, ey = ox + (R - w / 2) * math.cos(a), oy + (R - w / 2) * math.sin(a)
        # end caps: rounded rectangles oriented along the tangent
        cap = Image.new("RGBA", (n, n), (0, 0, 0, 0))
        cd = ImageDraw.Draw(cap)
        L, T = n * 0.27, n * 0.2
        cd.rounded_rectangle([c - T / 2, c - L / 2, c + T / 2, c + L / 2], radius=int(T * 0.45), fill=fill)
        cap = cap.rotate(-(ang), resample=Image.BICUBIC, center=(c, c))
        g.alpha_composite(cap, (int(ex - c + (w * 0.15) * math.cos(a)), int(ey - c + (w * 0.15) * math.sin(a))))
    if rot:
        g = g.rotate(rot, resample=Image.BICUBIC)
    return g, (s(cx) - g.size[0] // 2, s(cy) - g.size[1] // 2)


def screen_incoming():
    img = screen_base((22, 32, 70), (6, 8, 20))
    img = glow(img, 450, 760, 330, (60, 110, 255), 120)
    d = ImageDraw.Draw(img)
    status_bar(d)
    text_c(d, 450, 250, "Incoming call", font(INTER.format("Medium"), 44), GRAY)
    text_c(d, 450, 320, "Potential Buyer", font(INTER.format("Bold"), 78), WHITE)
    text_c(d, 450, 430, "(716) 555-0142", font(INTER.format("Medium"), 46), (205, 212, 230))
    # listing pill
    pf = font(INTER.format("SemiBold"), 36)
    label = "re: 42 Maple Ln listing"
    w = d.textlength(label, font=pf) / SS
    d = tr_rrect(img, [s(450 - w / 2 - 34), s(515), s(450 + w / 2 + 34), s(585)], s(35), (255, 255, 255, 40))
    text_c(d, 450, 528, label, pf, WHITE)
    # avatar
    d.ellipse([s(300), s(680), s(600), s(980)], fill=(40, 58, 110))
    d.ellipse([s(300), s(680), s(600), s(980)], outline=(120, 160, 255), width=s(5))
    # simple house icon
    d.polygon([(s(450), s(745)), (s(535), s(830)), (s(365), s(830))], fill=WHITE)
    d.rectangle([s(385), s(828), s(515), s(915)], fill=WHITE)
    d.rectangle([s(432), s(860), s(468), s(915)], fill=(40, 58, 110))
    # buttons
    for cx, col, lab, rot in ((230, RED, "Decline", -135), (670, (52, 199, 89), "Accept", 0)):
        d.ellipse([s(cx - 95), s(1560), s(cx + 95), s(1750)], fill=col)
        g, pos = handset(d, cx, 1655, 110, WHITE, rot)
        img.alpha_composite(g, pos)
        d = ImageDraw.Draw(img)
        text_c(d, cx, 1775, lab, font(INTER.format("Medium"), 38), WHITE)
    text_c(d, 450, 1200, "Remind Me        Message", font(INTER.format("Medium"), 36), GRAY)
    finish_screen(img, "screen_incoming.png")


def notif(img, y, title, sub, accent, t="now"):
    d = ImageDraw.Draw(img)
    d = tr_rrect(img, [s(50), s(y), s(850), s(y + 190)], s(44), (255, 255, 255, 38))
    d.rounded_rectangle([s(85), s(y + 45), s(185), s(y + 145)], radius=s(26), fill=accent)
    g, pos = handset(d, 135, y + 95, 62, WHITE, -135)
    img.alpha_composite(g, pos)
    d = ImageDraw.Draw(img)
    d.text((s(215), s(y + 40)), title, font=font(INTER.format("Bold"), 46), fill=WHITE)
    d.text((s(215), s(y + 105)), sub, font=font(INTER.format("Medium"), 36), fill=(215, 220, 232))
    d.text((s(760), s(y + 45)), t, font=font(INTER.format("Medium"), 32), fill=GRAY)


def screen_missed():
    img = screen_base((40, 8, 18), (8, 4, 10))
    img = glow(img, 450, 1500, 420, RED, 110)
    d = ImageDraw.Draw(img)
    status_bar(d, "2:48")
    text_c(d, 450, 190, "Tuesday, 2:48 PM", font(INTER.format("Medium"), 42), (230, 200, 205))
    text_c(d, 450, 240, "2:48", font(INTER.format("SemiBold"), 250), WHITE)
    notif(img, 700, "Missed Call", "Potential Buyer · 42 Maple Ln", RED)
    notif(img, 915, "Missed Call (2)", "(716) 555-0142", RED, "1m")
    d = ImageDraw.Draw(img)
    text_c(d, 450, 1180, "No voicemail left", font(INTER.format("SemiBold"), 40), (255, 150, 160))
    finish_screen(img, "screen_missed.png")


def waveform(d, cx, cy, width, n, hmax, color):
    import math
    step = width / n
    for i in range(n):
        x = cx - width / 2 + i * step + step / 2
        h = hmax * (0.25 + 0.75 * abs(math.sin(i * 0.9) * math.cos(i * 0.37)))
        d.rounded_rectangle([s(x - step * 0.28), s(cy - h / 2), s(x + step * 0.28), s(cy + h / 2)], radius=s(step * 0.28), fill=color)


def screen_ai():
    img = screen_base((6, 34, 38), (4, 8, 18))
    img = glow(img, 450, 820, 360, OCEAN, 90)
    img = glow(img, 450, 820, 240, MINT, 70)
    d = ImageDraw.Draw(img)
    status_bar(d, "2:47")
    logo = Image.open(os.path.join(OUT, "logo_reverse.png")).convert("RGBA")
    lh = s(92)
    logo = logo.resize((int(logo.width * lh / logo.height), lh), Image.LANCZOS)
    img.alpha_composite(logo, (s(450) - logo.width // 2, s(118)))
    d = ImageDraw.Draw(img)
    text_c(d, 450, 222, "GUAD SQUAD", font(MONT.format("ExtraBold"), 40), MINT, spacing=8)
    text_c(d, 450, 275, "Agent Assistant", font(INTER.format("Bold"), 76), WHITE)
    # live pill
    d = tr_rrect(img, [s(290), s(390), s(610), s(460)], s(35), (255, 255, 255, 30))
    d.ellipse([s(320), s(410), s(350), s(440)], fill=RED)
    d.text((s(368), s(402)), "LIVE  00:14", font=font(INTER.format("SemiBold"), 38), fill=WHITE)
    # orb
    d.ellipse([s(250), s(620), s(650), s(1020)], fill=(10, 60, 55))
    d.ellipse([s(250), s(620), s(650), s(1020)], outline=MINT, width=s(6))
    waveform(d, 450, 820, 280, 11, 200, MINT)
    text_c(d, 450, 1080, "On call with Potential Buyer", font(INTER.format("Medium"), 40), (200, 225, 220))
    # transcript lines
    tf = font(INTER.format("Medium"), 36)
    lines = [("Caller", "Is 42 Maple still available?"), ("Assistant", "It is! 3 bed, 2 bath…")]
    y = 1240
    for who, line in lines:
        col = GRAY if who == "Caller" else MINT
        d.text((s(90), s(y)), who.upper(), font=font(INTER.format("Bold"), 28), fill=col)
        d.text((s(90), s(y + 40)), line, font=tf, fill=WHITE)
        y += 150
    d = tr_rrect(img, [s(90), s(1600), s(810), s(1700)], s(50), (34, 230, 164, 40))
    text_c(d, 450, 1625, "Answering • Qualifying • Booking", font(INTER.format("SemiBold"), 36), MINT)
    finish_screen(img, "screen_ai.png")


def check_circle(img, cx, cy, r, fill, mark=NAVY):
    d = ImageDraw.Draw(img)
    d.ellipse([s(cx - r), s(cy - r), s(cx + r), s(cy + r)], fill=fill)
    w = s(r * 0.2)
    pts = [(s(cx - r * 0.45), s(cy + r * 0.02)), (s(cx - r * 0.12), s(cy + r * 0.35)), (s(cx + r * 0.48), s(cy - r * 0.3))]
    d.line(pts, fill=mark, width=w, joint="curve")
    for p in (pts[0], pts[2]):
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=mark)


def screen_booked():
    img = screen_base((6, 40, 34), (4, 10, 16))
    img = glow(img, 450, 560, 330, MINT, 120)
    d = ImageDraw.Draw(img)
    status_bar(d, "2:49")
    check_circle(img, 450, 560, 170, MINT)
    d = ImageDraw.Draw(img)
    text_c(d, 450, 800, "Showing Booked", font(INTER.format("Bold"), 80), WHITE)
    text_c(d, 450, 905, "by your Agent Assistant", font(INTER.format("Medium"), 40), (190, 225, 215))
    d = tr_rrect(img, [s(70), s(1010), s(830), s(1520)], s(48), (255, 255, 255, 30))
    rows = [("WHEN", "Sat · 10:00 AM"), ("WHERE", "42 Maple Ln"), ("BUYER", "Sarah M. · Pre-approved")]
    y = 1055
    for k, v in rows:
        d.text((s(120), s(y)), k, font=font(INTER.format("Bold"), 30), fill=MINT)
        d.text((s(120), s(y + 42)), v, font=font(INTER.format("SemiBold"), 50), fill=WHITE)
        y += 150
    text_c(d, 450, 1620, "Added to your calendar", font(INTER.format("SemiBold"), 40), MINT)
    finish_screen(img, "screen_booked.png")


# ---------------------------------------------------------------- floating UI
def bubble(name, who, msg_lines, fill, fg, label_col, tail="left", w=1200):
    pad = 60
    lf = font(INTER.format("Bold"), 40)
    mf = font(INTER.format("SemiBold"), 70)
    h = pad + 50 + len(msg_lines) * 88 + pad - 10
    img = canvas(w + 40, h + 60)
    sh = canvas(w + 40, h + 60)
    ImageDraw.Draw(sh).rounded_rectangle([s(20), s(26), s(w + 20), s(h + 26)], radius=s(64), fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(s(12)))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([s(20), s(10), s(w + 20), s(h + 10)], radius=s(64), fill=fill)
    tx = 60 if tail == "left" else w - 20
    d.polygon([(s(tx), s(h - 20)), (s(tx + (-30 if tail == "left" else 30)), s(h + 40)), (s(tx + (60 if tail == "left" else -60)), s(h))], fill=fill)
    d.text((s(20 + pad), s(10 + pad - 12)), who, font=lf, fill=label_col)
    y = 10 + pad + 50
    for line in msg_lines:
        d.text((s(20 + pad), s(y)), line, font=mf, fill=fg)
        y += 88
    save(img, name)


def card_booked():
    w, h = 1300, 560
    img = canvas(w + 60, h + 80)
    sh = canvas(w + 60, h + 80)
    ImageDraw.Draw(sh).rounded_rectangle([s(30), s(46), s(w + 30), s(h + 46)], radius=s(70), fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(s(16)))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([s(30), s(20), s(w + 30), s(h + 20)], radius=s(70), fill=(255, 255, 255))
    d.rounded_rectangle([s(30), s(20), s(w + 30), s(h + 20)], radius=s(70), outline=MINT, width=s(10))
    check_circle(img, 230, 290, 125, MINT)
    d = ImageDraw.Draw(img)
    d.text((s(400), s(95)), "SHOWING BOOKED", font=font(MONT.format("ExtraBold"), 80), fill=NAVY)
    d.text((s(400), s(205)), "Sat · 10:00 AM", font=font(INTER.format("Bold"), 76), fill=(8, 150, 132))
    d.text((s(400), s(305)), "42 Maple Ln · Sarah M.", font=font(INTER.format("SemiBold"), 56), fill=(60, 70, 90))
    d.text((s(400), s(395)), "Synced to your calendar + CRM", font=font(INTER.format("Medium"), 44), fill=(120, 130, 150))
    save(img, "card_booked.png")


def chip(name, label, fill=MINT, fg=NAVY):
    f = font(MONT.format("ExtraBold"), 56)
    tmp = ImageDraw.Draw(canvas(10, 10))
    tw = tmp.textlength(label, font=f) / SS
    w, h = int(tw + 200), 120
    img = canvas(w, h)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s(w) - 1, s(h) - 1], radius=s(60), fill=fill)
    check_circle(img, 66, 60, 38, fg, fill)
    d = ImageDraw.Draw(img)
    d.text((s(120), s(24)), label, font=f, fill=fg)
    save(img, name)


if __name__ == "__main__":
    screen_incoming()
    screen_missed()
    screen_ai()
    screen_booked()
    bubble("bubble_caller1.png", "CALLER", ["Hi! Is 42 Maple", "still available?"], (238, 241, 247), NAVY, (110, 120, 140), "left")
    bubble("bubble_ai.png", "AGENT ASSISTANT", ["It is! 3 bed, 2 bath.", "Want a tour this week?"], MINT, NAVY, (8, 70, 64), "right")
    bubble("bubble_caller2.png", "CALLER", ["Saturday morning?"], (238, 241, 247), NAVY, (110, 120, 140), "left", w=900)
    card_booked()
    chip("chip_answers.png", "ANSWERS EVERY CALL")
    chip("chip_questions.png", "HANDLES QUESTIONS")
    chip("chip_books.png", "BOOKS THE SHOWING")
    print("ok")
