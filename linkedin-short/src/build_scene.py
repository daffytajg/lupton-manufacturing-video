import bpy, math, random, bmesh
from mathutils import Vector

random.seed(1969)
scene = bpy.context.scene
prefs = bpy.context.preferences.edit

# ---------------- scene setup ----------------
scene.render.engine = 'BLENDER_EEVEE'
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 450
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.resolution_percentage = 100
scene.render.use_motion_blur = True
scene.eevee.taa_render_samples = 24

world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.004, 0.009, 0.015, 1)
bg.inputs["Strength"].default_value = 1.0


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1,)


def mat(name, color, metallic=0.0, rough=0.5, emit=None, emit_strength=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = color
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    if coat:
        p.inputs["Coat Weight"].default_value = coat
    if emit:
        p.inputs["Emission Color"].default_value = emit
        p.inputs["Emission Strength"].default_value = emit_strength
    return m


M_SAGE = mat("Lupton_Sage", srgb("5A7470"), metallic=0.15, rough=0.32, coat=0.4)
M_NAVY = mat("Lupton_Navy_Recess", srgb("0F1D28"), rough=0.55)
M_STEEL = mat("Steel_Machined", (0.62, 0.64, 0.66, 1), metallic=1.0, rough=0.22)
M_SHEET = mat("Steel_SheetMetal", (0.55, 0.57, 0.6, 1), metallic=1.0, rough=0.38)
M_PLASTIC = mat("Plastic_Molded_Charcoal", (0.025, 0.028, 0.03, 1), rough=0.45)
M_PCB = mat("PCB_Green", (0.01, 0.12, 0.04, 1), rough=0.35, coat=0.6)
M_CHIP = mat("Chip_Black", (0.01, 0.01, 0.012, 1), rough=0.3)
M_GOLD = mat("Gold_Pads", (1.0, 0.72, 0.32, 1), metallic=1.0, rough=0.2)
M_CABLE = mat("Cable_Jacket_Orange", (0.85, 0.22, 0.02, 1), rough=0.5)
M_CLOCKFACE = mat("Clock_Face", srgb("101C26"), rough=0.4)
M_CLOCKRIM = mat("Clock_Rim_Red", (0.4, 0.01, 0.01, 1), rough=0.3, emit=(1.0, 0.04, 0.02, 1), emit_strength=4.0)
M_HAND = mat("Clock_Hands", (0.9, 0.88, 0.82, 1), rough=0.3, emit=(1, 0.95, 0.85, 1), emit_strength=2.0)
M_WAVE = mat("Shockwave_Sage", (0.1, 0.2, 0.18, 1), rough=0.5, emit=srgb("9EC7B8"), emit_strength=0.0)
M_DUST = mat("Dust_Glow", (0.5, 0.6, 0.6, 1), emit=srgb("B9D6CC"), emit_strength=3.0)

# paper with red RFQ header band + grey text lines (procedural)
M_PAPER = bpy.data.materials.new("RFQ_Paper")
M_PAPER.use_nodes = True
nt = M_PAPER.node_tree
N = nt.nodes
L = nt.links
pb = N["Principled BSDF"]
pb.inputs["Roughness"].default_value = 0.6
tc = N.new("ShaderNodeTexCoord")
sep = N.new("ShaderNodeSeparateXYZ")
L.new(tc.outputs["UV"], sep.inputs[0])


def math_node(op, a, b=None):
    n = N.new("ShaderNodeMath")
    n.operation = op
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            L.new(v, n.inputs[i])
    return n.outputs[0]


X, Y = sep.outputs[0], sep.outputs[1]
header = math_node('GREATER_THAN', Y, 0.8)
fr = math_node('FRACT', math_node('MULTIPLY', Y, 18.0))
lines = math_node('LESS_THAN', fr, 0.32)
lines = math_node('MULTIPLY', lines, math_node('GREATER_THAN', X, 0.12))
lines = math_node('MULTIPLY', lines, math_node('LESS_THAN', X, 0.85))
lines = math_node('MULTIPLY', lines, math_node('LESS_THAN', Y, 0.72))
lines = math_node('MULTIPLY', lines, math_node('GREATER_THAN', Y, 0.1))
mix1 = N.new("ShaderNodeMix"); mix1.data_type = 'RGBA'
mix1.inputs[6].default_value = (0.92, 0.91, 0.88, 1)
mix1.inputs[7].default_value = (0.35, 0.36, 0.38, 1)
L.new(lines, mix1.inputs[0])
mix2 = N.new("ShaderNodeMix"); mix2.data_type = 'RGBA'
L.new(mix1.outputs[2], mix2.inputs[6])
mix2.inputs[7].default_value = (0.75, 0.02, 0.02, 1)
L.new(header, mix2.inputs[0])
L.new(mix2.outputs[2], pb.inputs["Base Color"])


def link(obj, coll=None):
    (coll or scene.collection).objects.link(obj)
    return obj


def new_coll(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c


def mesh_obj(name, verts, faces, material, coll):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    me.update()
    o = bpy.data.objects.new(name, me)
    o.data.materials.append(material)
    return link(o, coll)


def prism(name, pts2d, depth, y0, material, coll, scale=1.0, cx=0.0, cz=0.0):
    """Extrude a 2D polygon (x,z) along +Y from y0 to y0+depth."""
    n = len(pts2d)
    verts = [(cx + x * scale, y0, cz + z * scale) for x, z in pts2d] + \
            [(cx + x * scale, y0 + depth, cz + z * scale) for x, z in pts2d]
    faces = [list(range(n))[::-1], list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append([i, j, j + n, i + n])
    o = mesh_obj(name, verts, faces, material, coll)
    return o


def empty(name, coll, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.5
    e.location = loc
    return link(e, coll)


def key(obj, frame, loc=None, rot=None, scl=None):
    if loc is not None:
        obj.location = loc
        obj.keyframe_insert("location", frame=frame)
    if rot is not None:
        obj.rotation_euler = rot
        obj.keyframe_insert("rotation_euler", frame=frame)
    if scl is not None:
        obj.scale = scl if hasattr(scl, "__len__") else (scl, scl, scl)
        obj.keyframe_insert("scale", frame=frame)


def interp(kind):
    prefs.keyframe_new_interpolation_type = kind

# ---------------- camera ----------------
C_CAM = new_coll("Camera_Rig")
cam_data = bpy.data.cameras.new("DeliveryCamera")
cam_data.lens = 35
cam_data.sensor_fit = 'VERTICAL'
cam_data.sensor_height = 36
cam = link(bpy.data.objects.new("DeliveryCamera", cam_data), C_CAM)
scene.camera = cam
cam.rotation_euler = (math.radians(90), 0, 0)
interp('BEZIER')
key(cam, 1, loc=(0, -11.5, 0.2))
key(cam, 128, loc=(0, -10.8, 0.3))
# impact shake
shake = [(0.12, 0.08), (-0.1, -0.06), (0.07, 0.05), (-0.05, -0.03), (0.02, 0.01)]
for i, (dx, dz) in enumerate(shake):
    key(cam, 149 + i * 2, loc=(dx, -10.4, 0.3 + dz))
key(cam, 160, loc=(0, -10.4, 0.3))
key(cam, 340, loc=(0.3, -9.6, 0.2))
key(cam, 400, loc=(0, -10.6, 0.0))
key(cam, 450, loc=(0, -10.3, 0.0))

# ---------------- lights ----------------
C_LIGHT = new_coll("Lighting")


def light(name, kind, loc, energy, color, size=None, rot=None):
    d = bpy.data.lights.new(name, kind)
    d.energy = energy
    d.color = color
    if size and kind == 'AREA':
        d.size = size
    o = link(bpy.data.objects.new(name, d), C_LIGHT)
    o.location = loc
    if rot:
        o.rotation_euler = rot
    else:
        direction = Vector((0, 0, 0.6)) - Vector(loc)
        o.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    return o


light("Key_Warm", 'AREA', (-4.5, -6.5, 5.5), 2200, (1.0, 0.93, 0.85), size=5)
light("Rim_Sage", 'AREA', (4.0, 4.5, 3.0), 1800, (0.6, 0.95, 0.8), size=4)
light("Rim_Blue", 'AREA', (-4.0, 4.0, -2.0), 1200, (0.45, 0.6, 1.0), size=4)
light("Fill_Front", 'POINT', (0.5, -7, -2.5), 350, (0.85, 0.9, 1.0))
alarm = light("Alarm_Red", 'POINT', (0, 1.0, 1.2), 0, (1.0, 0.1, 0.05))
interp('CONSTANT')
for f in range(1, 150, 8):
    alarm.data.energy = 900 if (f // 8) % 2 == 0 else 250
    alarm.data.keyframe_insert("energy", frame=f)
alarm.data.energy = 0
alarm.data.keyframe_insert("energy", frame=150)
interp('BEZIER')

# ---------------- clock (chaos beat) ----------------
C_CLOCK = new_coll("Clock_LeadTime")
clock = empty("Clock_Root", C_CLOCK, (0, 3.0, 1.0))
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=2.3, depth=0.12, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
face = bpy.context.active_object; face.name = "Clock_Face"; face.data.materials.append(M_CLOCKFACE)
bpy.ops.mesh.primitive_torus_add(major_radius=2.35, minor_radius=0.09, major_segments=96, minor_segments=16, location=(0, -0.06, 0), rotation=(math.radians(90), 0, 0))
rim = bpy.context.active_object; rim.name = "Clock_Rim"; rim.data.materials.append(M_CLOCKRIM)
ticks = []
tick_mesh = None
for i in range(12):
    a = i * math.tau / 12
    bpy.ops.mesh.primitive_cube_add(size=1, location=(math.sin(a) * 2.0, -0.08, math.cos(a) * 2.0), rotation=(0, a, 0))
    t = bpy.context.active_object
    t.name = f"Clock_Tick_{i:02d}"
    t.scale = (0.05, 0.03, 0.28 if i % 3 == 0 else 0.15)
    if tick_mesh is None:
        tick_mesh = t.data
        t.data.materials.append(M_HAND)
    else:
        old = t.data; t.data = tick_mesh; bpy.data.meshes.remove(old)
    ticks.append(t)
hand_min = empty("Clock_MinuteHand_Pivot", C_CLOCK)
hand_hr = empty("Clock_HourHand_Pivot", C_CLOCK)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.14, 0.8))
hm = bpy.context.active_object; hm.name = "Clock_MinuteHand"; hm.scale = (0.07, 0.03, 1.7); hm.data.materials.append(M_HAND)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.18, 0.55))
hh = bpy.context.active_object; hh.name = "Clock_HourHand"; hh.scale = (0.1, 0.03, 1.1); hh.data.materials.append(M_CLOCKRIM)
for o in [face, rim] + ticks + [hm, hh]:
    for c in o.users_collection:
        c.objects.unlink(o)
    C_CLOCK.objects.link(o)
for o in [face, rim, hand_min, hand_hr] + ticks:
    o.parent = clock
hm.parent = hand_min
hh.parent = hand_hr
interp('LINEAR')
key(hand_min, 1, rot=(0, 0, 0)); key(hand_min, 146, rot=(0, math.tau * 9, 0))
key(hand_hr, 1, rot=(0, 0, 0)); key(hand_hr, 146, rot=(0, math.tau * 1.4, 0))
interp('BEZIER')
key(clock, 1, loc=(0, 3.0, 1.0), rot=(0, 0, 0), scl=1.0)
key(clock, 120, loc=(0, 2.6, 1.0), rot=(0, 0, math.radians(-8)), scl=1.05)
key(clock, 148, loc=(0, 6.0, 1.5), rot=(math.radians(40), 0, math.radians(25)), scl=0.6)
key(clock, 152, scl=0.0)

# ---------------- RFQ sheet storm ----------------
C_RFQ = new_coll("RFQ_Storm")
bpy.ops.mesh.primitive_plane_add(size=1)
sheet0 = bpy.context.active_object
sheet_mesh = sheet0.data
sheet_mesh.name = "RFQ_Sheet_Mesh"
sheet_mesh.transform(__import__('mathutils').Matrix.Diagonal((0.42, 0.594, 1, 1)))
sheet_mesh.materials.append(M_PAPER)
bpy.data.objects.remove(sheet0)
interp('LINEAR')
for i in range(56):
    o = link(bpy.data.objects.new(f"RFQ_Sheet_{i:02d}", sheet_mesh), C_RFQ)
    r = random.uniform(1.4, 3.2)
    a0 = random.uniform(0, math.tau)
    w = random.uniform(0.045, 0.1) * random.choice((1, 1, 1, -1))
    z0 = random.uniform(-4.6, 4.8)
    bob = random.uniform(0.2, 0.6)
    tr = [random.uniform(-0.12, 0.12) for _ in range(3)]
    r0 = [random.uniform(0, math.tau) for _ in range(3)]
    for f in list(range(1, 148, 4)) + [148]:
        a = a0 + w * f
        pos = (r * math.cos(a), r * math.sin(a) * 0.7 + 1.0, z0 + bob * math.sin(f * 0.05 + a0))
        key(o, f, loc=pos, rot=tuple(r0[k] + tr[k] * f for k in range(3)), scl=1.0)
    # blast outward on impact
    a = a0 + w * 148
    out = Vector((math.cos(a), 0.3, (z0 - 0.8) / 4)).normalized() * random.uniform(9, 13)
    key(o, 160, loc=(out.x, out.y - 1.5, out.z), rot=tuple(r0[k] + tr[k] * 148 + 3 for k in range(3)))
    key(o, 161, scl=0.0)
interp('BEZIER')

# ---------------- Lupton LA tile (3D logo) ----------------
C_LOGO = new_coll("Lupton_Logo")
logo = empty("Lupton_Logo_Root", C_LOGO, (0, 0, 9))
TILE = 2.5
T_DEPTH = 0.36
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
tile = bpy.context.active_object
tile.name = "Lupton_Tile"
tile.scale = (TILE, T_DEPTH, TILE)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
tile.data.materials.append(M_SAGE)
tile.data.materials.append(M_NAVY)
for c in tile.users_collection:
    c.objects.unlink(tile)
C_LOGO.objects.link(tile)
tile.parent = logo

# monogram traced from the brand mark: pixel coords in a 193px tile (x 55..248, y 40..230)
def px(x, y):
    return ((x - 55) / 193.0 - 0.5, 0.5 - (y - 40) / 190.0)

L_pts = [px(*p) for p in [(108, 87), (129, 87), (105, 167), (194, 167), (201, 186), (79, 186)]]
A_pts = [px(*p) for p in [(150, 87), (173, 87), (223, 186), (203, 186), (196, 167), (123, 167)]]
counter_pts = [px(*p) for p in [(163, 113), (184, 150), (145, 150)]]
C_CUT = new_coll("Logo_Cutters")
C_CUT.hide_render = True
C_CUT.hide_viewport = True
front = -T_DEPTH / 2
cut_L = prism("Cutter_L", L_pts, 0.3, front - 0.1, M_NAVY, C_CUT, scale=TILE)
cut_A = prism("Cutter_A", A_pts, 0.3, front - 0.1, M_NAVY, C_CUT, scale=TILE)
counter = prism("Lupton_Monogram_Counter", counter_pts, 0.26, front, M_SAGE, C_LOGO, scale=TILE)
counter.parent = logo
for cutter in (cut_L, cut_A):
    mod = tile.modifiers.new(f"Engrave_{cutter.name}", 'BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.solver = 'EXACT'
    mod.material_mode = 'TRANSFER'
    mod.object = cutter
    cutter.parent = logo
bev = tile.modifiers.new("Edge_Bevel", 'BEVEL')
bev.width = 0.05
bev.segments = 4
bev.limit_method = 'ANGLE'

# drop + spin + impact squash
key(logo, 1, loc=(0, 0, 11), rot=(0, 0, -math.tau), scl=1.0)
key(logo, 126, loc=(0, 0, 9.5), rot=(0, 0, -math.tau))
interp('LINEAR')
key(logo, 128, loc=(0, 0, 8.5), rot=(0, 0, -math.tau))
key(logo, 147, loc=(0, 0, 0.55), rot=(math.radians(8), 0, 0))
interp('BEZIER')
key(logo, 147, scl=(1.12, 1, 0.84))
key(logo, 151, loc=(0, 0, 0.95), rot=(math.radians(-4), 0, 0), scl=(0.95, 1, 1.07))
key(logo, 156, loc=(0, 0, 0.8), rot=(0, 0, 0), scl=1.0)
key(logo, 250, rot=(math.radians(-6), 0, math.radians(18)))
key(logo, 345, loc=(0, 0, 0.8), rot=(math.radians(4), 0, math.radians(-14)), scl=1.0)
key(logo, 395, loc=(0, 0, 1.55), rot=(0, 0, math.tau), scl=0.92)
key(logo, 450, loc=(0, 0, 1.6), rot=(0, 0, math.tau + math.radians(6)), scl=0.92)

# shockwave ring
bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.03, major_segments=128, minor_segments=8, location=(0, 0.2, 0.8), rotation=(math.radians(90), 0, 0))
wave = bpy.context.active_object
wave.name = "Impact_Shockwave"
wave.data.materials.append(M_WAVE)
for c in wave.users_collection:
    c.objects.unlink(wave)
C_LOGO.objects.link(wave)
key(wave, 146, scl=0.0)
key(wave, 147, scl=0.6)
key(wave, 165, scl=(7, 7, 7))
key(wave, 166, scl=0.0)
es = M_WAVE.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
es.default_value = 0; es.keyframe_insert("default_value", frame=146)
es.default_value = 30; es.keyframe_insert("default_value", frame=147)
es.default_value = 0; es.keyframe_insert("default_value", frame=165)

# ---------------- parts ----------------
C_PARTS = new_coll("Parts_Showcase")


def add_to(o, coll, parent, mat_=None):
    for c in o.users_collection:
        c.objects.unlink(o)
    coll.objects.link(o)
    o.parent = parent
    if mat_:
        o.data.materials.append(mat_)
    return o


def cube(name, parent, loc, dims, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    add_to(o, C_PARTS, parent, m)
    if bevel:
        b = o.modifiers.new("Bevel", 'BEVEL'); b.width = bevel; b.segments = 3
    return o


def cyl(name, parent, loc, r, depth, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    add_to(o, C_PARTS, parent, m)
    return o


parts = []
# 1 sheet metal bracket
p = empty("Part_SheetMetal_Bracket", C_PARTS); parts.append(p)
base = cube("Bracket_Base", p, (0, 0, -0.18), (0.85, 0.5, 0.045), M_SHEET, bevel=0.012)
cube("Bracket_Flange", p, (-0.405, 0, 0.05), (0.045, 0.5, 0.5), M_SHEET, bevel=0.012)
for j, xx in enumerate((0.05, 0.28)):
    h = cyl(f"Bracket_HoleCutter_{j}", p, (xx, 0, -0.18), 0.07, 0.2, M_SHEET)
    h.hide_render = True; h.hide_viewport = True
    m = base.modifiers.new(f"Hole_{j}", 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.solver = 'EXACT'; m.object = h
    base.modifiers.move(len(base.modifiers) - 1, 0)
# 2 machined turned shaft
p = empty("Part_CNC_Turned_Shaft", C_PARTS); parts.append(p)
cyl("Shaft_Body", p, (0, 0, 0), 0.13, 0.8, M_STEEL, rot=(0, math.radians(90), 0))
cyl("Shaft_Flange", p, (-0.18, 0, 0), 0.24, 0.1, M_STEEL, rot=(0, math.radians(90), 0))
cyl("Shaft_Step", p, (0.3, 0, 0), 0.09, 0.4, M_STEEL, rot=(0, math.radians(90), 0))
bpy.ops.mesh.primitive_torus_add(major_radius=0.13, minor_radius=0.02, location=(0.05, 0, 0), rotation=(0, math.radians(90), 0))
add_to(bpy.context.active_object, C_PARTS, p, M_GOLD).name = "Shaft_Oring"
# 3 molded housing
p = empty("Part_Molded_Housing", C_PARTS); parts.append(p)
hb = cube("Housing_Shell", p, (0, 0, 0), (0.7, 0.45, 0.3), M_PLASTIC, bevel=0.08)
hb.modifiers["Bevel"].segments = 5
cyl("Housing_Boss", p, (0.18, 0, 0.19), 0.08, 0.1, M_PLASTIC)
cube("Housing_Lens", p, (-0.12, -0.226, 0.02), (0.26, 0.01, 0.12), M_WAVE)
# 4 PCBA
p = empty("Part_PCB_Assembly", C_PARTS); parts.append(p)
cube("PCB_Board", p, (0, 0, 0), (0.8, 0.03, 0.52), M_PCB, bevel=0.006)
cube("PCB_Chip_Main", p, (0.05, -0.04, 0.05), (0.22, 0.05, 0.22), M_CHIP, bevel=0.01)
cube("PCB_Chip_B", p, (-0.25, -0.03, -0.12), (0.12, 0.035, 0.08), M_CHIP)
cube("PCB_Connector", p, (0.33, -0.05, -0.15), (0.1, 0.08, 0.18), M_PLASTIC)
for j in range(6):
    cube(f"PCB_Pad_{j}", p, (-0.33 + j * 0.05, -0.02, 0.2), (0.025, 0.01, 0.07), M_GOLD)
for j in range(3):
    cyl(f"PCB_Cap_{j}", p, (-0.12 + j * 0.1, -0.06, -0.17), 0.03, 0.09, M_STEEL, rot=(math.radians(90), 0, 0), verts=16)
# 5 cable assembly
p = empty("Part_Cable_Assembly", C_PARTS); parts.append(p)
cd = bpy.data.curves.new("Cable_Curve", 'CURVE')
cd.dimensions = '3D'
cd.bevel_depth = 0.035
cd.bevel_resolution = 4
sp = cd.splines.new('BEZIER')
pts = [(-0.4, 0, -0.2), (-0.1, 0.1, 0.25), (0.15, -0.1, -0.2), (0.4, 0, 0.2)]
sp.bezier_points.add(len(pts) - 1)
for bp, co in zip(sp.bezier_points, pts):
    bp.co = co
    bp.handle_left_type = bp.handle_right_type = 'AUTO'
cable = bpy.data.objects.new("Cable_Harness", cd)
cd.materials.append(M_CABLE)
C_PARTS.objects.link(cable); cable.parent = p
cube("Cable_Connector_A", p, (-0.43, 0, -0.24), (0.12, 0.12, 0.14), M_PLASTIC, bevel=0.015)
cube("Cable_Connector_B", p, (0.43, 0, 0.24), (0.12, 0.12, 0.14), M_PLASTIC, bevel=0.015)

LOGO_C = Vector((0, 0, 0.8))
row_x = [-2.1, -1.05, 0.0, 1.05, 2.1]
starts = [(-7, -3, 4), (7, -2, 5), (-7, -2, -5), (7, -3, -4), (0, -4, -8)]
for i, p in enumerate(parts):
    phi = i * math.tau / 5 + 0.4
    f_in0, f_in1 = 150 + i * 9, 178 + i * 9

    def orbit(f):
        a = phi + 0.022 * (f - 150)
        return (LOGO_C.x + 2.25 * math.cos(a), LOGO_C.y + 1.4 * math.sin(a), LOGO_C.z + 1.9 * math.sin(a + 1.2) * 0.75 - 0.1)

    spin = Vector((random.uniform(0.02, 0.04), random.uniform(0.01, 0.03), random.uniform(0.02, 0.04)))
    key(p, 1, loc=starts[i], scl=0.0, rot=(0, 0, 0))
    key(p, f_in0, loc=starts[i], scl=0.0)
    key(p, f_in0 + 1, scl=1.0)
    key(p, f_in1, loc=orbit(f_in1), rot=tuple(spin * (f_in1 - 150)))
    interp('LINEAR')
    for f in range(f_in1 + 6, 345, 6):
        key(p, f, loc=orbit(f), rot=tuple(spin * (f - 150)))
    interp('BEZIER')
    key(p, 345, loc=orbit(345), rot=tuple(spin * 195), scl=1.0)
    final_rot = [(math.radians(15), 0, math.radians(-25)), (math.radians(10), 0, math.radians(20)),
                 (math.radians(10), 0, math.radians(-20)), (math.radians(8), 0, math.radians(-15)),
                 (0, 0, math.radians(10))][i]
    key(p, 392 + i * 3, loc=(row_x[i], -0.4, -1.75), rot=final_rot, scl=0.78)
    key(p, 450, loc=(row_x[i], -0.4, -1.7 + (0.04 if i % 2 else -0.04)), rot=(final_rot[0], 0, final_rot[2] + 0.2), scl=0.78)

# ---------------- dust ----------------
C_DUST = new_coll("Ambient_Dust")
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.018)
d0 = bpy.context.active_object
dust_mesh = d0.data
dust_mesh.materials.append(M_DUST)
bpy.data.objects.remove(d0)
interp('LINEAR')
for i in range(90):
    o = link(bpy.data.objects.new(f"Dust_{i:02d}", dust_mesh), C_DUST)
    x, y, z = random.uniform(-3.5, 3.5), random.uniform(-3, 5), random.uniform(-6, 6)
    s = random.uniform(0.6, 1.8)
    key(o, 1, loc=(x, y, z), scl=s)
    key(o, 450, loc=(x + random.uniform(-0.5, 0.5), y, z + random.uniform(0.8, 2.0)))
interp('BEZIER')

scene.frame_set(1)
result = {"objects": len(scene.objects), "parts": [p.name for p in parts]}
