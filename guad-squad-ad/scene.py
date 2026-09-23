"""Guad Squad — 15s vertical ad. Builds the full animated scene in Blender (EEVEE).

Run:  xvfb-run -a blender -b -P scene.py -- [--frames A-B] [--out DIR] [--preview]
Timings (frames @30fps) are locked to the voiceover word timestamps.
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
FPS = 30
N_FRAMES = 450

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT_DIR = os.path.join(HERE, "frames")
FRAME_RANGE = (0, N_FRAMES - 1)
PREVIEW = "--preview" in argv
if "--out" in argv:
    OUT_DIR = argv[argv.index("--out") + 1]
if "--frames" in argv:
    a, b = argv[argv.index("--frames") + 1].split("-")
    FRAME_RANGE = (int(a), int(b))
SAVE_BLEND = argv[argv.index("--save") + 1] if "--save" in argv else None

MONT = "/usr/share/fonts/truetype/montserrat/Montserrat-{}.ttf"
INTER = "/usr/share/fonts/opentype/inter/Inter-{}.otf"


def lin(hexstr, a=1.0):
    h = hexstr.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, a)


NAVY = lin("#070C1C")
MINT = lin("#22E6A4")
RED = lin("#FF3B4E")
BLUE = lin("#3D7BFF")
WHITE = lin("#FFFFFF")
SOFT = lin("#B9C6E4")

# ------------------------------------------------------------------ reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = FPS
scene.frame_start, scene.frame_end = FRAME_RANGE
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.resolution_percentage = 50 if PREVIEW else 100
scene.render.engine = "BLENDER_EEVEE"
ee = scene.eevee
ee.taa_render_samples = 8 if PREVIEW else 16
ee.use_bloom = True
ee.bloom_threshold = 0.85
ee.bloom_intensity = 0.06
ee.bloom_radius = 5.0
ee.use_soft_shadows = True
ee.use_gtao = True
ee.gtao_distance = 0.4
ee.use_ssr = False
ee.use_motion_blur = not PREVIEW
ee.motion_blur_shutter = 0.45
ee.bokeh_max_size = 60
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.render.filepath = os.path.join(OUT_DIR, "f_")

world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = lin("#060A18")
world.node_tree.nodes["Background"].inputs[1].default_value = 0.6

# ------------------------------------------------------------------ helpers
FONTS = {}


def load_font(path):
    if path not in FONTS:
        FONTS[path] = bpy.data.fonts.load(path, check_existing=True)
    return FONTS[path]


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def key(obj, path, frame, value, interp=None):
    setattr(obj, path, value) if not isinstance(value, (tuple, list)) else getattr(obj, path).__setitem__(slice(None), value)
    obj.keyframe_insert(data_path=path, frame=frame)
    if interp:
        set_interp(obj, path, frame, interp)


def set_interp(idblock, path, frame, interp, easing=None):
    ad = idblock.animation_data
    if not ad or not ad.action:
        return
    for fc in ad.action.fcurves:
        if fc.data_path == path:
            for kp in fc.keyframe_points:
                if abs(kp.co.x - frame) < 0.01:
                    kp.interpolation = interp
                    if easing:
                        kp.easing = easing


def nkey(socket, frame, value):
    socket.default_value = value
    socket.keyframe_insert("default_value", frame=frame)


def emission_mat(name, color, strength=1.0, blend=False):
    """Emission + transparency mix. Exposes node 'OPAC' value for fades."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs[0].default_value = color
    em.inputs[1].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    op = nt.nodes.new("ShaderNodeValue")
    op.name = "OPAC"
    op.outputs[0].default_value = 1.0
    nt.links.new(op.outputs[0], mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    m.blend_method = "BLEND" if blend else "OPAQUE"
    m.shadow_method = "NONE"
    m.show_transparent_back = False
    return m


def image_mat(name, path, strength=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path, check_existing=True)
    tex.interpolation = "Cubic"
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs[1].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    op = nt.nodes.new("ShaderNodeValue")
    op.name = "OPAC"
    op.outputs[0].default_value = 1.0
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(tex.outputs["Color"], em.inputs[0])
    nt.links.new(tex.outputs["Alpha"], mul.inputs[0])
    nt.links.new(op.outputs[0], mul.inputs[1])
    nt.links.new(mul.outputs[0], mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    m.blend_method = "BLEND"
    m.shadow_method = "NONE"
    m.show_transparent_back = False
    return m, tex.image


def make_text(name, body, fontpath, size, color, x, y, z=0.0, parent=None, strength=1.0,
              extrude=0.06, spacing=1.0, maxw=None):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = load_font(fontpath)
    cu.size = size
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.extrude = extrude * size
    cu.bevel_depth = 0.012 * size
    cu.bevel_resolution = 2
    cu.space_character = spacing
    ob = link(bpy.data.objects.new(name, cu))
    ob.data.materials.append(emission_mat(name + "_m", color, strength))
    if parent:
        ob.parent = parent
    ob.location = (x, y, z)
    if maxw:
        bpy.context.view_layer.update()
        w = ob.dimensions.x
        if w > maxw:
            cu.size = size * maxw / w
    return ob


def image_plane(name, path, width, x, y, z=0.0, parent=None, strength=1.0):
    m, img = image_mat(name + "_m", path, strength)
    w, h = img.size
    mesh = bpy.data.meshes.new(name)
    hw, hh = width / 2, width * h / w / 2
    mesh.from_pydata([(-hw, -hh, 0), (hw, -hh, 0), (hw, hh, 0), (-hw, hh, 0)], [], [(0, 1, 2, 3)])
    uv = mesh.uv_layers.new()
    for i, (u, v) in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv.data[i].uv = (u, v)
    ob = link(bpy.data.objects.new(name, mesh))
    ob.data.materials.append(m)
    if parent:
        ob.parent = parent
    ob.location = (x, y, z)
    return ob


def hidden(ob, until):
    """Keep object at zero scale up to `until`."""
    key(ob, "scale", 0, (0, 0, 0))
    key(ob, "scale", until, (0, 0, 0))


MAX_W = 3.72  # never let an overshoot push past the frame edge (frame width 4.05)


def pop_in(ob, f, s=1.0, over=1.14, dur=7, rise=0.0):
    bpy.context.view_layer.update()
    w = ob.dimensions.x
    if w > 0:
        over = max(1.0, min(over, MAX_W / (w * s)))
    key(ob, "scale", 0, (0, 0, 0))
    key(ob, "scale", f, (0.0, 0.0, 0.0))
    key(ob, "scale", f + dur * 0.55, (s * over,) * 3)
    key(ob, "scale", f + dur, (s,) * 3)
    if rise:
        loc = Vector(ob.location)
        key(ob, "location", f, (loc.x, loc.y - rise, loc.z))
        key(ob, "location", f + dur, tuple(loc))


def pop_out(ob, f, s=1.0, dur=5):
    key(ob, "scale", f, (s,) * 3)
    key(ob, "scale", f + dur * 0.35, (s * 1.06,) * 3)
    key(ob, "scale", f + dur, (0, 0, 0))


def rounded_rect_mesh(name, w, h, r, segs=14):
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in ((-w / 2, 0, -h / 2), (w / 2, 0, -h / 2), (w / 2, 0, h / 2), (-w / 2, 0, h / 2))]
    bm.faces.new(vs)
    bmesh.ops.bevel(bm, geom=vs, offset=r, segments=segs, affect="VERTICES", profile=0.5)
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for lp in f.loops:
            co = lp.vert.co
            lp[uv].uv = ((co.x + w / 2) / w, (co.z + h / 2) / h)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return me


# ------------------------------------------------------------------ camera + HUD
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 50
cam_data.sensor_fit = "VERTICAL"
cam_data.sensor_height = 36
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 0.3
cam = link(bpy.data.objects.new("Cam", cam_data))
scene.camera = cam
cam.rotation_euler = (math.radians(90), 0, 0)
key(cam, "location", 0, (0, -10.4, 0.05))
key(cam, "location", 148, (0, -9.7, 0.0))
key(cam, "location", 152, (0.03, -9.55, 0.02))
key(cam, "location", 156, (-0.02, -9.8, -0.01))
key(cam, "location", 330, (0, -9.9, 0.08))
key(cam, "location", 449, (0, -10.2, 0.0))
nkey_d = cam_data.dof
nkey_d.focus_distance = 10.6
nkey_d.keyframe_insert("focus_distance", frame=0)
nkey_d.keyframe_insert("focus_distance", frame=178)
nkey_d.focus_distance = 10.0
nkey_d.keyframe_insert("focus_distance", frame=196)

HUD_D = 10.0
hud = link(bpy.data.objects.new("HUD", None))
hud.parent = cam
hud.location = (0, 0, -HUD_D)
# HUD frame: x in [-2.02, 2.02], y in [-3.6, 3.6]
SAFE_W = 3.45

# ------------------------------------------------------------------ lights
def area(name, loc, rot, size, energy, color=WHITE):
    ld = bpy.data.lights.new(name, "AREA")
    ld.size = size
    ld.energy = energy
    ld.color = color[:3]
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    return ob


key_l = area("Key", (-4, -5, 5), (50, 0, -40), 5, 900)
fill_l = area("Fill", (5, -6, -1), (95, 0, 40), 6, 250, SOFT)
rimL = area("RimL", (-3.2, 3.5, 1.5), (-70, 0, -140), 2.5, 1400, BLUE)
rimR = area("RimR", (3.2, 3.5, -0.5), (-70, 0, 140), 2.5, 1400, BLUE)

MOOD = [(0, BLUE), (100, BLUE), (106, RED), (150, RED), (160, MINT)]
for L in (rimL, rimR):
    for f, c in MOOD:
        L.data.color = c[:3]
        L.data.keyframe_insert("color", frame=f)

# ------------------------------------------------------------------ background
bg_mat = bpy.data.materials.new("BG")
bg_mat.use_nodes = True
nt = bg_mat.node_tree
nt.nodes.clear()
o = nt.nodes.new("ShaderNodeOutputMaterial")
em = nt.nodes.new("ShaderNodeEmission")
tc = nt.nodes.new("ShaderNodeTexCoord")
mp = nt.nodes.new("ShaderNodeMapping")
mp.inputs["Location"].default_value = (0, 0.12, 0)
mp.inputs["Scale"].default_value = (1.7, 1.0, 1)
gr = nt.nodes.new("ShaderNodeTexGradient")
gr.gradient_type = "SPHERICAL"
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = lin("#03050D")
ramp.color_ramp.elements[1].position = 0.9
mood_mix = nt.nodes.new("ShaderNodeMixRGB")
mood_mix.blend_type = "MULTIPLY"
mood_mix.inputs[0].default_value = 1.0
nt.links.new(tc.outputs["Object"], mp.inputs[0])
nt.links.new(mp.outputs[0], gr.inputs[0])
nt.links.new(gr.outputs[0], ramp.inputs[0])
nt.links.new(ramp.outputs[0], mood_mix.inputs[1])
nt.links.new(mood_mix.outputs[0], em.inputs[0])
nt.links.new(em.outputs[0], o.inputs[0])
BG_MOOD = [(0, lin("#1B2E6B")), (100, lin("#1B2E6B")), (106, lin("#5A0F1C")), (150, lin("#5A0F1C")),
           (160, lin("#0B4A3C")), (330, lin("#0B4A3C")), (345, lin("#0E3B44"))]
elem = ramp.color_ramp.elements[1]
for f, c in BG_MOOD:
    elem.color = c
    bg_mat.node_tree.keyframe_insert(f'nodes["{ramp.name}"].color_ramp.elements[1].color', frame=f)
bpy.ops.mesh.primitive_plane_add(size=1)
bg = bpy.context.active_object
bg.name = "Backdrop"
bg.scale = (40, 40, 1)
bg.location = (0, 30, 0)
bg.rotation_euler = (math.radians(90), 0, 0)
bg.data.materials.append(bg_mat)

# bokeh particles
random.seed(7)
pmat = bpy.data.materials.new("Particle")
pmat.use_nodes = True
pn = pmat.node_tree
pn.nodes.clear()
po = pn.nodes.new("ShaderNodeOutputMaterial")
pe = pn.nodes.new("ShaderNodeEmission")
oi = pn.nodes.new("ShaderNodeObjectInfo")
mr = pn.nodes.new("ShaderNodeMapRange")
mr.inputs["To Min"].default_value = 0.25
mr.inputs["To Max"].default_value = 1.5
pn.links.new(oi.outputs["Random"], mr.inputs["Value"])
pn.links.new(mr.outputs[0], pe.inputs[1])
pn.links.new(pe.outputs[0], po.inputs[0])
for f, c in [(0, BLUE), (100, BLUE), (106, RED), (150, RED), (160, MINT)]:
    pe.inputs[0].default_value = c
    pe.inputs[0].keyframe_insert("default_value", frame=f)
proto = bpy.data.meshes.new("pt")
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
bm.to_mesh(proto)
bm.free()
for i in range(46):
    ob = link(bpy.data.objects.new(f"pt{i}", proto))
    if i == 0:
        ob.data.materials.append(pmat)
    d = random.uniform(14, 30)
    x = random.uniform(-0.55, 0.55) * d * 0.55
    z = random.uniform(-0.6, 0.6) * d * 0.72
    r = random.uniform(0.03, 0.09) * (d / 12)
    ob.scale = (r, r, r)
    drift = random.uniform(0.6, 1.8)
    key(ob, "location", 0, (x, d - 10, z - drift / 2))
    key(ob, "location", 449, (x + random.uniform(-0.3, 0.3), d - 10, z + drift / 2))
    for fc in ob.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"

# ------------------------------------------------------------------ phone
PW, PH, PD = 1.62, 3.36, 0.15
SW, SH = 1.50, 1.50 * 1935 / 900
rig = link(bpy.data.objects.new("PhoneRig", None))
body = link(bpy.data.objects.new("PhoneBody", rounded_rect_mesh("body", PW, PH, 0.25)))
body.parent = rig
sol = body.modifiers.new("sol", "SOLIDIFY")
sol.thickness = PD
sol.offset = 0
bev = body.modifiers.new("bev", "BEVEL")
bev.width = 0.035
bev.segments = 5
bev.limit_method = "ANGLE"
for p in body.data.polygons:
    p.use_smooth = True
bmat = bpy.data.materials.new("Titanium")
bmat.use_nodes = True
bsdf = bmat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = lin("#1C2230")
bsdf.inputs["Metallic"].default_value = 0.9
bsdf.inputs["Roughness"].default_value = 0.28
body.data.materials.append(bmat)

screen = link(bpy.data.objects.new("Screen", rounded_rect_mesh("screen", SW, SH, 0.18)))
screen.parent = body
screen.location = (0, -PD / 2 - 0.004, 0)
smat = bpy.data.materials.new("ScreenMat")
smat.use_nodes = True
snt = smat.node_tree
snt.nodes.clear()
so = snt.nodes.new("ShaderNodeOutputMaterial")
sp = snt.nodes.new("ShaderNodeBsdfPrincipled")
sp.inputs["Base Color"].default_value = (0, 0, 0, 1)
sp.inputs["Roughness"].default_value = 0.06
sp.inputs["Emission Strength"].default_value = 1.0
snt.links.new(sp.outputs[0], so.inputs[0])
texs = []
for nm in ("screen_incoming", "screen_missed", "screen_ai", "screen_booked"):
    t = snt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(os.path.join(ASSETS, nm + ".png"), check_existing=True)
    t.interpolation = "Cubic"
    texs.append(t)
prev = texs[0].outputs["Color"]
mixes = []
for t in texs[1:]:
    mx = snt.nodes.new("ShaderNodeMixRGB")
    mx.inputs[0].default_value = 0
    snt.links.new(prev, mx.inputs[1])
    snt.links.new(t.outputs["Color"], mx.inputs[2])
    prev = mx.outputs[0]
    mixes.append(mx)
bright = snt.nodes.new("ShaderNodeMixRGB")  # flash on state change
bright.blend_type = "ADD"
bright.inputs[0].default_value = 0.0
bright.inputs[2].default_value = (1, 1, 1, 1)
snt.links.new(prev, bright.inputs[1])
snt.links.new(bright.outputs[0], sp.inputs["Emission Color"])
screen.data.materials.append(smat)


def screen_switch(idx, f, dur=3):
    nkey(mixes[idx].inputs[0], f, 0.0)
    nkey(mixes[idx].inputs[0], f + dur, 1.0)
    nkey(bright.inputs[0], f - 1, 0.0)
    nkey(bright.inputs[0], f + 1, 0.35)
    nkey(bright.inputs[0], f + dur + 3, 0.0)


nkey(bright.inputs[0], 0, 0.0)
screen_switch(0, 99)   # -> missed
screen_switch(1, 163)  # -> AI (while back faces camera)
screen_switch(2, 288)  # -> booked

# emblem on the back
back = image_plane("BackLogo", os.path.join(ASSETS, "emblem.png"), 0.62, 0, 0, parent=body)
back.location = (0, PD / 2 + 0.004, 0.55)
back.rotation_euler = (math.radians(-90), 0, math.radians(180))
# camera bump
bump = link(bpy.data.objects.new("Bump", rounded_rect_mesh("bump", 0.62, 0.62, 0.16)))
bump.parent = body
bump.location = (0.38, PD / 2 + 0.02, 1.2)
bump.modifiers.new("s", "SOLIDIFY").thickness = 0.04
bump.data.materials.append(bmat)

# phone choreography (rig)
R = math.radians
rig_keys = [
    # frame, loc, rot(deg)
    (0,   (0.05, 0.8, -0.5), (6, 0, -16)),
    (60,  (0.0, 0.8, -0.45), (5, 0, -10)),
    (99,  (0.0, 0.8, -0.42), (5, 0, -6)),
    (112, (0.0, 0.9, -0.62), (14, 0, 3)),
    (148, (0.0, 0.95, -0.66), (16, 0, 5)),
    (176, (0.0, 0.8, -0.35), (6, 0, 365)),
    (182, (0.0, 0.8, -0.35), (6, 0, 361)),
    (205, (0.35, 1.6, -0.25), (7, 0, 352)),
    (330, (0.3, 1.7, -0.2), (5, 0, 348)),
    (346, (0.3, 2.2, -7.5), (40, 0, 330)),
]
for f, loc, rot in rig_keys:
    key(rig, "location", f, loc)
    key(rig, "rotation_euler", f, tuple(R(a) for a in rot))

# vibration bursts while ringing
for start in (0, 24, 48, 72):
    for i in range(0, 16):
        f = start + i
        a = (1 if i % 2 == 0 else -1) * (2.2 if i < 14 else 0)
        key(body, "rotation_euler", f, (0, R(a), 0))
        key(body, "location", f, (0.012 * a / 2.2 if i < 14 else 0, 0, 0))
key(body, "rotation_euler", 92, (0, 0, 0))
key(body, "location", 92, (0, 0, 0))

# ring pulses behind the phone
for k in range(3):
    ring_me = rounded_rect_mesh(f"ringm{k}", PW + 0.1, PH + 0.1, 0.3)
    ring = link(bpy.data.objects.new(f"Ring{k}", ring_me))
    ring.parent = rig
    ring.location = (0, 0.12, 0)
    wf = ring.modifiers.new("wf", "WIREFRAME")
    wf.thickness = 0.028
    rm = emission_mat(f"ring{k}_m", lin("#9DB8FF"), 2.0, blend=True)
    ring.data.materials.append(rm)
    op = rm.node_tree.nodes["OPAC"].outputs[0]
    nkey(op, 0, 0.0)
    for cyc in range(4):
        f0 = cyc * 24 + k * 7
        nkey(op, f0, 0.0)
        nkey(op, f0 + 1, 0.85)
        nkey(op, f0 + 20, 0.0)
        key(ring, "scale", f0, (1, 1, 1))
        key(ring, "scale", f0 + 20, (1.45, 1, 1.28))
    nkey(op, 100, 0.0)

# ------------------------------------------------------------------ HUD typography
BLACK = MONT.format("Black")
XB = MONT.format("ExtraBold")
SB = MONT.format("SemiBold")

# Beat 1 — incoming call (VO 0.15s "A buyer is calling about your listing")
t1a = make_text("t1a", "A BUYER IS CALLING", XB, 0.36, WHITE, 0, 2.85, parent=hud, maxw=SAFE_W)
t1b = make_text("t1b", "about your listing", SB, 0.30, SOFT, 0, 2.38, parent=hud, maxw=SAFE_W)
pop_in(t1a, 2)
pop_in(t1b, 22)
pop_out(t1a, 56)
pop_out(t1b, 58)

# Beat 2 — "and you're stuck at a showing"
t2a = make_text("t2a", "...AND YOU'RE", SB, 0.30, SOFT, 0, 2.85, parent=hud, maxw=SAFE_W)
t2b = make_text("t2b", "AT A SHOWING", BLACK, 0.44, WHITE, 0, 2.35, parent=hud, maxw=SAFE_W)
pop_in(t2a, 60)
pop_in(t2b, 70)
pop_out(t2a, 98)
pop_out(t2b, 99)

# Beat 3 — "Missed call. Missed commission."
t3a = make_text("t3a", "MISSED CALL.", BLACK, 0.52, RED, 0, 2.85, parent=hud, strength=1.6, maxw=SAFE_W)
t3b = make_text("t3b", "MISSED COMMISSION.", BLACK, 0.40, WHITE, 0, 2.3, parent=hud, maxw=SAFE_W)
pop_in(t3a, 103, over=1.22)
pop_in(t3b, 121, over=1.22)
# strike-through bar on "commission"
strike = link(bpy.data.objects.new("strike", rounded_rect_mesh("strk", 1.0, 0.07, 0.03)))
strike.data.materials.append(emission_mat("strike_m", RED, 1.8))
strike.parent = hud
strike.rotation_euler = (R(90), 0, R(-3))
strike.location = (0, 2.3, 0.08)
bpy.context.view_layer.update()
sw = t3b.dimensions.x + 0.2
key(strike, "scale", 0, (0, 1, 1))
key(strike, "scale", 132, (0, 1, 1))
key(strike, "scale", 138, (sw, 1, 1))
key(strike, "scale", 146, (sw, 1, 1))
key(strike, "scale", 150, (0, 1, 1))
pop_out(t3a, 145)
pop_out(t3b, 146)

# Beat 4 — "Not anymore."
t4a = make_text("t4a", "NOT", BLACK, 1.05, WHITE, 0, 0.75, z=0.3, parent=hud, strength=1.3, maxw=SAFE_W)
t4b = make_text("t4b", "ANYMORE.", BLACK, 0.9, MINT, 0, -0.35, z=0.3, parent=hud, strength=1.5, maxw=SAFE_W)
pop_in(t4a, 150, over=1.3, dur=6)
pop_in(t4b, 156, over=1.3, dur=6)
key(t4a, "location", 150, (0, 0.75, 0.3))
key(t4a, "location", 176, (0, 0.85, 0.3))
pop_out(t4a, 175)
pop_out(t4b, 176)

# Beat 5 — Agent Assistant at work
t5a = make_text("t5a", "GUAD SQUAD", XB, 0.22, MINT, 0, 3.12, parent=hud, strength=1.4, spacing=1.35)
t5b = make_text("t5b", "AGENT ASSISTANT", BLACK, 0.40, WHITE, 0, 2.68, parent=hud, maxw=SAFE_W)
pop_in(t5a, 181)
pop_in(t5b, 185)
pop_out(t5a, 331)
pop_out(t5b, 332)

chips = []
for nm, fin, fout in (("chip_answers", 217, 252), ("chip_questions", 254, 286), ("chip_books", 288, 330)):
    c = image_plane(nm, os.path.join(ASSETS, nm + ".png"), 2.9, 0, 2.12, z=0.02, parent=hud)
    img_w = c.data.materials[0].node_tree.nodes["Image Texture"].image.size[0]
    c.scale = (1, 1, 1)
    # keep the same text scale across chips: width proportional to pixel width
    sc = img_w / 888
    for v in c.data.vertices:
        v.co.x *= sc
        v.co.y *= sc
    pop_in(c, fin, rise=0.1)
    pop_out(c, fout, dur=4)
    chips.append(c)

b1 = image_plane("bub1", os.path.join(ASSETS, "bubble_caller1.png"), 3.0, -0.3, 1.2, z=0.05, parent=hud)
b2 = image_plane("bub2", os.path.join(ASSETS, "bubble_ai.png"), 3.0, 0.3, 0.12, z=0.10, parent=hud)
b3 = image_plane("bub3", os.path.join(ASSETS, "bubble_caller2.png"), 2.3, -0.55, -0.9, z=0.15, parent=hud)
pop_in(b1, 219, rise=0.25, dur=8)
pop_in(b2, 240, rise=0.25, dur=8)
pop_in(b3, 262, rise=0.25, dur=8)
pop_out(b1, 284, dur=5)
pop_out(b2, 285, dur=5)
pop_out(b3, 286, dur=5)

card = image_plane("card", os.path.join(ASSETS, "card_booked.png"), 3.85, 0, 0.15, z=0.25, parent=hud)
pop_in(card, 289, over=1.18, dur=8)
key(card, "rotation_euler", 289, (0, R(-25), R(4)))
key(card, "rotation_euler", 299, (0, 0, R(-2)))
key(card, "rotation_euler", 330, (0, R(4), R(-1)))
pop_out(card, 331, dur=5)

t5c = make_text("t5c", "AUTOMATICALLY.", BLACK, 0.46, MINT, 0, -1.55, parent=hud, strength=1.6, maxw=SAFE_W)
pop_in(t5c, 314, over=1.2)
pop_out(t5c, 333)

# Beat 6 — end card: "Hear it live: (585) 667-8982"
emb = image_plane("emb", os.path.join(ASSETS, "emblem.png"), 1.05, 0, 2.2, parent=hud, strength=1.1)
pop_in(emb, 337, over=1.2, dur=8)
key(emb, "rotation_euler", 337, (0, 0, R(-30)))
key(emb, "rotation_euler", 345, (0, 0, 0))
g1 = make_text("g1", "GUAD", BLACK, 0.66, WHITE, -0.93, 1.1, parent=hud)
g2 = make_text("g2", "SQUAD", BLACK, 0.66, MINT, 0.0, 1.1, parent=hud, strength=1.4)
bpy.context.view_layer.update()
gap = 0.14
wtot = g1.dimensions.x + g2.dimensions.x + gap
g1.location.x = -wtot / 2 + g1.dimensions.x / 2
g2.location.x = wtot / 2 - g2.dimensions.x / 2
if wtot > SAFE_W:
    s_ = SAFE_W / wtot
    for g in (g1, g2):
        g.data.size *= s_
        g.location.x *= s_
pop_in(g1, 340, over=1.2)
pop_in(g2, 343, over=1.2)
g3 = make_text("g3", "AI AGENT ASSISTANT FOR REALTORS", SB, 0.155, SOFT, 0, 0.63, parent=hud, spacing=1.15, maxw=SAFE_W)
pop_in(g3, 347)

h1 = make_text("h1", "HEAR IT LIVE — CALL THE DEMO", XB, 0.2, MINT, 0, -0.13, parent=hud, strength=1.4, spacing=1.1, maxw=SAFE_W)
pop_in(h1, 342)

# number: three groups revealed as spoken
parts = ["(585)", "667-", "8982"]
nums = [make_text(f"n{i}", p, BLACK, 0.56, WHITE, 0, -0.77, parent=hud, strength=1.25) for i, p in enumerate(parts)]
bpy.context.view_layer.update()
gap = 0.16
widths = [n.dimensions.x for n in nums]
total = widths[0] + gap + widths[1] + 0.02 + widths[2]
scale_n = min(1.0, (SAFE_W + 0.1) / total)
for n in nums:
    n.data.size *= scale_n
widths = [w * scale_n for w in widths]
total *= scale_n
x = -total / 2
for n, w, g in zip(nums, widths, (gap * scale_n, 0.02 * scale_n, 0)):
    n.location.x = x + w / 2
    x += w + g
for n, f in zip(nums, (360, 370, 392)):
    pop_in(n, f, over=1.25, rise=0.12)
# pulse on the full number
for n in nums:
    key(n, "scale", 418, (1, 1, 1))
    key(n, "scale", 423, (1.07, 1.07, 1.07))
    key(n, "scale", 430, (1, 1, 1))

bar = link(bpy.data.objects.new("bar", rounded_rect_mesh("barm", 1.0, 0.075, 0.035)))
bar.data.materials.append(emission_mat("bar_m", MINT, 1.8))
bar.parent = hud
bar.rotation_euler = (R(90), 0, 0)
bar.location = (0, -1.28, 0)
key(bar, "scale", 0, (0, 1, 1))
key(bar, "scale", 398, (0, 1, 1))
key(bar, "scale", 408, (total + 0.1, 1, 1))

tag = make_text("tag", "Never miss a lead again.", SB, 0.27, WHITE, 0, -1.85, parent=hud, maxw=SAFE_W)
pop_in(tag, 404)

# emblem glow ring pulse on the end card
for k in range(2):
    rr = link(bpy.data.objects.new(f"embring{k}", rounded_rect_mesh(f"err{k}", 1.08, 1.08, 0.27)))
    rr.parent = hud
    rr.rotation_euler = (R(90), 0, 0)
    rr.location = (0, 2.2, -0.02)
    wf = rr.modifiers.new("wf", "WIREFRAME")
    wf.thickness = 0.02
    m = emission_mat(f"embring{k}_m", MINT, 2.0, blend=True)
    rr.data.materials.append(m)
    op = m.node_tree.nodes["OPAC"].outputs[0]
    nkey(op, 0, 0.0)
    for cyc in range(4):
        f0 = 350 + cyc * 26 + k * 13
        if f0 + 22 > 449:
            break
        nkey(op, f0, 0.0)
        nkey(op, f0 + 1, 0.8)
        nkey(op, f0 + 22, 0.0)
        key(rr, "scale", f0, (1, 1, 1))
        key(rr, "scale", f0 + 22, (1.6, 1, 1.6))

# ------------------------------------------------------------------ render
os.makedirs(OUT_DIR, exist_ok=True)
if SAVE_BLEND:
    bpy.ops.wm.save_as_mainfile(filepath=SAVE_BLEND)
if "--stills" in argv:
    for f in [int(v) for v in argv[argv.index("--stills") + 1].split(",")]:
        scene.frame_set(f)
        scene.render.filepath = os.path.join(OUT_DIR, f"still_{f:03d}.png")
        bpy.ops.render.render(write_still=True)
elif "--no-render" not in argv:
    bpy.ops.render.render(animation=True)
