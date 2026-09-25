import bpy, math, random, bmesh
from mathutils import Vector, Matrix

random.seed(1969)
scene = bpy.context.scene
prefs = bpy.context.preferences.edit

scene.render.engine = 'BLENDER_EEVEE'
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 360
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.eevee.taa_render_samples = 8

world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.004, 0.009, 0.015, 1)


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
M_CHAIN = mat("Chain_Steel_Dark", (0.32, 0.33, 0.35, 1), metallic=1.0, rough=0.35)
M_WEAK = mat("Chain_Weak_Link", (0.32, 0.33, 0.35, 1), metallic=1.0, rough=0.35, emit=(1.0, 0.08, 0.02, 1), emit_strength=0.0)
M_SAGECHAIN = mat("Chain_Sage", srgb("7FA597"), metallic=0.8, rough=0.25, emit=srgb("9EC7B8"), emit_strength=0.6)
M_SHEET = mat("Steel_SheetMetal", (0.6, 0.62, 0.65, 1), metallic=1.0, rough=0.33)
M_SLOT = mat("Slot_Dark", (0.01, 0.012, 0.015, 1), rough=0.6)
M_WAVE = mat("Shockwave_Sage", (0.1, 0.2, 0.18, 1), rough=0.5, emit=srgb("9EC7B8"), emit_strength=0.0)
M_DUST = mat("Dust_Glow", (0.5, 0.6, 0.6, 1), emit=srgb("B9D6CC"), emit_strength=1.2)


def link(obj, coll):
    coll.objects.link(obj)
    return obj


def new_coll(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c


def move_to(o, coll, parent=None, m=None):
    for c in list(o.users_collection):
        c.objects.unlink(o)
    coll.objects.link(o)
    if parent is not None:
        o.parent = parent
    if m is not None:
        o.data.materials.append(m)
    return o


def empty(name, coll, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.4
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


def key_input(sock, frame, val):
    sock.default_value = val
    sock.keyframe_insert("default_value", frame=frame)

# ---------------- chain link mesh (shared) ----------------
PITCH = 0.72
bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.065, major_segments=40, minor_segments=12,
                                 rotation=(math.radians(90), 0, 0))
t0 = bpy.context.active_object
LINK_MESH = t0.data
LINK_MESH.name = "Chain_Link_Mesh"
LINK_MESH.transform(Matrix.Diagonal((1, 1, 1.55, 1)))
bpy.data.objects.remove(t0)

# half-link meshes for the snap
def half_mesh(name, keep_left):
    me = LINK_MESH.copy()
    me.name = name
    bm = bmesh.new(); bm.from_mesh(me)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, 0), plane_no=(1, 0, 0),
                           clear_outer=not keep_left, clear_inner=keep_left)
    bm.to_mesh(me); bm.free()
    return me

HALF_L = half_mesh("Weak_Link_Half_L", True)
HALF_R = half_mesh("Weak_Link_Half_R", False)

# ---------------- camera ----------------
C_CAM = new_coll("Camera_Rig")
cam_data = bpy.data.cameras.new("DeliveryCamera")
cam_data.lens = 35
cam_data.sensor_fit = 'VERTICAL'
cam_data.sensor_height = 36
cam = link(bpy.data.objects.new("DeliveryCamera", cam_data), C_CAM)
scene.camera = cam
interp('BEZIER')
key(cam, 1, loc=(0.25, -9.4, 2.4), rot=(math.radians(90), 0, math.radians(1.5)))
key(cam, 96, loc=(0.1, -10.2, 2.0), rot=(math.radians(90), 0, math.radians(0.5)))
shake = [(0.14, 0.1), (-0.12, -0.07), (0.08, 0.05), (-0.04, -0.03)]
for i, (dx, dz) in enumerate(shake):
    key(cam, 101 + i * 2, loc=(dx, -10.6, 1.6 + dz))
for i, (dx, dz) in enumerate(shake):
    key(cam, 113 + i * 2, loc=(dx * 0.8, -11.0, 1.3 + dz))
key(cam, 124, loc=(0, -11.0, 1.3), rot=(math.radians(90), 0, 0))
key(cam, 270, loc=(-0.3, -9.9, 1.4), rot=(math.radians(90), 0, math.radians(-2)))
key(cam, 330, loc=(0, -11.6, 1.0), rot=(math.radians(90), 0, 0))
key(cam, 360, loc=(0, -11.4, 1.0))

# ---------------- lights ----------------
C_LIGHT = new_coll("Lighting")


def light(name, kind, loc, energy, color, size=None, target=(0, 0, 1.5)):
    d = bpy.data.lights.new(name, kind)
    d.energy = energy
    d.color = color
    if size and kind == 'AREA':
        d.size = size
    o = link(bpy.data.objects.new(name, d), C_LIGHT)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o


light("Key_Warm", 'AREA', (-4.5, -6.5, 6.0), 2200, (1.0, 0.93, 0.85), size=5)
light("Rim_Sage", 'AREA', (4.0, 4.5, 4.0), 1800, (0.6, 0.95, 0.8), size=4)
light("Rim_Blue", 'AREA', (-4.0, 4.0, -1.0), 1200, (0.45, 0.6, 1.0), size=4)
light("Fill_Front", 'POINT', (0.5, -7, -1.5), 300, (0.85, 0.9, 1.0))
alarm = light("Alarm_Red", 'POINT', (1.2, -1.2, 3.4), 0, (1.0, 0.1, 0.05))
flash = light("Snap_Flash", 'POINT', (0, -0.6, 3.4), 0, (1.0, 0.55, 0.3))
interp('CONSTANT')
for f in range(1, 101, 6):
    alarm.data.energy = (500 if (f // 6) % 2 == 0 else 150) * min(1.0, f / 60 + 0.2)
    alarm.data.keyframe_insert("energy", frame=f)
alarm.data.energy = 0
alarm.data.keyframe_insert("energy", frame=101)
interp('BEZIER')
flash.data.energy = 0; flash.data.keyframe_insert("energy", frame=100)
flash.data.energy = 6000; flash.data.keyframe_insert("energy", frame=101)
flash.data.energy = 0; flash.data.keyframe_insert("energy", frame=110)

# ---------------- hanging part (sheet metal enclosure) ----------------
C_PART = new_coll("Part_Enclosure")
PART_Z0 = 0.4
part = empty("Part_SheetMetal_Enclosure", C_PART, (0, 0, PART_Z0))


def cube(name, parent, coll, loc, dims, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    move_to(o, coll, parent, m)
    if bevel:
        b = o.modifiers.new("Bevel", 'BEVEL'); b.width = bevel; b.segments = 3
    return o


cube("Enclosure_Top", part, C_PART, (0, 0, 0.3), (1.3, 0.7, 0.05), M_SHEET, 0.015)
cube("Enclosure_Leg_L", part, C_PART, (-0.625, 0, -0.1), (0.05, 0.7, 0.85), M_SHEET, 0.015)
cube("Enclosure_Leg_R", part, C_PART, (0.625, 0, -0.1), (0.05, 0.7, 0.85), M_SHEET, 0.015)
cube("Enclosure_Flange_L", part, C_PART, (-0.73, 0, -0.5), (0.22, 0.7, 0.05), M_SHEET, 0.012)
cube("Enclosure_Flange_R", part, C_PART, (0.73, 0, -0.5), (0.22, 0.7, 0.05), M_SHEET, 0.012)
for j in range(4):
    cube(f"Enclosure_Vent_{j}", part, C_PART, (-0.651, -0.2 + j * 0.13, -0.05), (0.01, 0.06, 0.45), M_SLOT)
    cube(f"Enclosure_VentR_{j}", part, C_PART, (0.651, -0.2 + j * 0.13, -0.05), (0.01, 0.06, 0.45), M_SLOT)
bpy.ops.mesh.primitive_torus_add(major_radius=0.14, minor_radius=0.04, location=(0, 0, 0.47), rotation=(math.radians(90), 0, 0))
move_to(bpy.context.active_object, C_PART, part, M_CHAIN).name = "Enclosure_Eye"
EYE_OFFSET = 0.6  # eye top above part origin

# ---------------- red chain (single source) ----------------
C_RED = new_coll("Chain_SingleSource")
upper = empty("Chain_Upper", C_RED)
lower = empty("Chain_Lower", C_RED)
z = PART_Z0 + EYE_OFFSET + PITCH / 2 - 0.12
WEAK = 3
weak_z = None
for k in range(10):
    lz = z + k * PITCH
    rotz = math.radians(90) if k % 2 == 0 else 0.0
    if k == WEAK:
        weak_z = lz
        o = bpy.data.objects.new("Weak_Link", LINK_MESH.copy())
        o.data.materials.clear(); o.data.materials.append(M_WEAK)
        link(o, C_RED)
        o.location = (0, 0, lz); o.rotation_euler = (0, 0, rotz)
        weak = o
        continue
    o = link(bpy.data.objects.new(f"Chain_Link_{k:02d}", LINK_MESH), C_RED)
    o.location = (0, 0, lz)
    o.rotation_euler = (0, 0, rotz)
    o.parent = upper if k > WEAK else lower
    if not o.data.materials:
        o.data.materials.append(M_CHAIN)

# tension shake then snap
interp('LINEAR')
for f in range(70, 101, 2):
    j = 0.02 + 0.03 * (f - 70) / 30
    for e in (upper, lower, part):
        base = (0, 0, PART_Z0) if e is part else (0, 0, 0)
        key(e, f, loc=(base[0] + random.uniform(-j, j), 0, base[2] + random.uniform(-j * 0.5, j * 0.5)))
interp('BEZIER')
key(upper, 1, loc=(0, 0, 0)); key(lower, 1, loc=(0, 0, 0)); key(part, 1, loc=(0, 0, PART_Z0), rot=(0, 0, 0))
key(upper, 69, loc=(0, 0, 0)); key(lower, 69, loc=(0, 0, 0)); key(part, 69, loc=(0, 0, PART_Z0))
key(upper, 100, loc=(0, 0, 0))
key(upper, 106, loc=(0, 0, 1.2))
interp('LINEAR')
key(upper, 116, loc=(0, 0, 9.0))
interp('BEZIER')
key(lower, 100, loc=(0, 0, 0), rot=(0, 0, 0))
interp('LINEAR')
key(lower, 128, loc=(-0.6, 0, -11.0), rot=(0.6, 1.4, 0.3))
interp('BEZIER')

# weak link glow + swap to halves
es = M_WEAK.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
key_input(es, 1, 0.0)
key_input(es, 30, 1.5)
key_input(es, 70, 6.0)
interp('CONSTANT')
for f in range(72, 100, 3):
    key_input(es, f, 14.0 if (f // 3) % 2 == 0 else 5.0)
interp('BEZIER')
key_input(es, 100, 30.0)
key(weak, 100, scl=1.0)
interp('CONSTANT'); key(weak, 101, scl=0.0); interp('BEZIER')
halves = []
for nm, me, side in (("Weak_Half_L", HALF_L, -1), ("Weak_Half_R", HALF_R, 1)):
    me.materials.clear(); me.materials.append(M_WEAK)
    h = link(bpy.data.objects.new(nm, me), C_RED)
    rz = weak.rotation_euler.z
    interp('CONSTANT')
    key(h, 1, loc=(0, 0, weak_z), rot=(0, 0, rz), scl=0.0)
    key(h, 101, scl=1.0)
    interp('BEZIER')
    key(h, 101, loc=(0, 0, weak_z), rot=(0, 0, rz))
    interp('LINEAR')
    key(h, 124, loc=(side * 4.5, -1.5, weak_z + (1.5 if side < 0 else -2.5)), rot=(side * 3.0, 2.0, rz + side * 4.0))
    interp('BEZIER')
    halves.append(h)

# ---------------- part fall + catch ----------------
key(part, 100, loc=(0, 0, PART_Z0), rot=(0, 0, 0))
key(part, 121, loc=(0.05, 0, -0.85), rot=(0, math.radians(-6), 0))
key(part, 127, loc=(0, 0, -0.45), rot=(0, math.radians(3), 0))
key(part, 134, loc=(0, 0, -0.62), rot=(0, math.radians(-2), 0))
key(part, 142, loc=(0, 0, -0.58), rot=(0, 0, 0))
interp('LINEAR')
for f in range(150, 361, 30):
    key(part, f, rot=(0, math.radians(1.5 * (1 if (f // 30) % 2 else -1)), math.radians(4 * math.sin(f / 40))))
interp('BEZIER')
PART_REST = -0.6
EYE_REST = PART_REST + EYE_OFFSET - 0.12

# ---------------- Lupton tile ----------------
C_LOGO = new_coll("Lupton_Logo")
TILE, T_DEPTH, TILE_Z = 2.3, 0.34, 4.55
logo = empty("Lupton_Logo_Root", C_LOGO, (0, 0, 12))
bpy.ops.mesh.primitive_cube_add(size=1)
tile = bpy.context.active_object
tile.name = "Lupton_Tile"
tile.scale = (TILE, T_DEPTH, TILE)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
tile.data.materials.append(M_SAGE)
tile.data.materials.append(M_NAVY)
move_to(tile, C_LOGO, logo)


def px(x, y):
    return ((x - 55) / 193.0 - 0.5, 0.5 - (y - 40) / 190.0)


def prism(name, pts2d, depth, y0, material, coll, scale):
    n = len(pts2d)
    verts = [(x * scale, y0, zz * scale) for x, zz in pts2d] + [(x * scale, y0 + depth, zz * scale) for x, zz in pts2d]
    faces = [list(range(n))[::-1], list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append([i, j, j + n, i + n])
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    o.data.materials.append(material)
    return link(o, coll)


L_pts = [px(*p) for p in [(108, 87), (129, 87), (105, 167), (194, 167), (201, 186), (79, 186)]]
A_pts = [px(*p) for p in [(150, 87), (173, 87), (223, 186), (203, 186), (196, 167), (123, 167)]]
counter_pts = [px(*p) for p in [(163, 113), (184, 150), (145, 150)]]
C_CUT = new_coll("Logo_Cutters")
C_CUT.hide_render = True
front = -T_DEPTH / 2
for nm, pts in (("Cutter_L", L_pts), ("Cutter_A", A_pts)):
    c = prism(nm, pts, 0.3, front - 0.1, M_NAVY, C_CUT, TILE)
    c.parent = logo
    c.hide_render = True
    c.display_type = 'WIRE'
    mod = tile.modifiers.new(f"Engrave_{nm}", 'BOOLEAN')
    mod.operation = 'DIFFERENCE'; mod.solver = 'EXACT'; mod.material_mode = 'TRANSFER'; mod.object = c
cnt = prism("Lupton_Monogram_Counter", counter_pts, 0.25, front, M_SAGE, C_LOGO, TILE)
cnt.parent = logo
bev = tile.modifiers.new("Edge_Bevel", 'BEVEL'); bev.width = 0.05; bev.segments = 4; bev.limit_method = 'ANGLE'

key(logo, 1, loc=(0, 0, 12), rot=(0, 0, 0), scl=1.0)
key(logo, 101, loc=(0, 0, 12), rot=(0, 0, -math.tau))
interp('LINEAR')
key(logo, 111, loc=(0, 0, TILE_Z - 0.2), rot=(math.radians(6), 0, 0))
interp('BEZIER')
key(logo, 111, scl=(1.1, 1, 0.86))
key(logo, 115, loc=(0, 0, TILE_Z + 0.15), rot=(math.radians(-3), 0, 0), scl=(0.96, 1, 1.05))
key(logo, 120, loc=(0, 0, TILE_Z), rot=(0, 0, 0), scl=1.0)
key(logo, 360, loc=(0, 0, TILE_Z + 0.08))

bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.014, major_segments=128, minor_segments=6,
                                 location=(0, 0.2, TILE_Z), rotation=(math.radians(90), 0, 0))
wave = move_to(bpy.context.active_object, C_LOGO, None, M_WAVE)
wave.name = "Impact_Shockwave"
key(wave, 110, scl=0.0); key(wave, 111, scl=0.6); key(wave, 128, scl=(7, 7, 7)); key(wave, 129, scl=0.0)
ws = M_WAVE.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
key_input(ws, 110, 0.0); key_input(ws, 111, 14.0); key_input(ws, 128, 0.0)

# ---------------- rescue chains (sage) ----------------
C_SAGE = new_coll("Chains_Redundant")
anchors = [(-0.8, TILE_Z - TILE / 2 + 0.05), (0.0, TILE_Z - TILE / 2 + 0.05), (0.8, TILE_Z - TILE / 2 + 0.05)]
eye_tgt = [(-0.1, EYE_REST + 0.05), (0.0, EYE_REST + 0.05), (0.1, EYE_REST + 0.05)]
for ci, ((ax, az), (ex, ez)) in enumerate(zip(anchors, eye_tgt)):
    d = Vector((ex - ax, 0, ez - az))
    length = d.length
    n = max(2, round(length / PITCH))
    ang = math.atan2(-d.x, -d.z)  # tilt about y so the link axis follows the chain
    for k in range(n):
        t = (k + 0.5) / n
        pos = Vector((ax, 0, az)) + d * t
        o = bpy.data.objects.new(f"Sage_Chain_{ci}_{k:02d}", bpy.data.meshes.get("Sage_Link_Mesh") or LINK_MESH.copy())
        if o.data.name != "Sage_Link_Mesh":
            o.data.name = "Sage_Link_Mesh"
            o.data.materials.clear(); o.data.materials.append(M_SAGECHAIN)
        link(o, C_SAGE)
        o.rotation_mode = 'ZYX'  # twist about the link axis first, then tilt
        rot = (0, ang, math.radians(90) if k % 2 == 0 else 0.0)
        f0 = 112 + ci * 2 + k * 2
        key(o, 1, loc=pos, rot=rot, scl=0.0)
        key(o, f0, scl=0.0)
        key(o, f0 + 3, scl=1.18)
        key(o, f0 + 6, scl=1.0)
        # follow the part bounce slightly on the lowest links
        if k >= n - 2:
            key(o, 121, loc=pos - Vector((0, 0, 0.25 if k == n - 1 else 0.1)))
            key(o, 127, loc=pos + Vector((0, 0, 0.12 if k == n - 1 else 0.05)))
            key(o, 136, loc=pos)

# ---------------- dust ----------------
C_DUST = new_coll("Ambient_Dust")
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.01)
d0 = bpy.context.active_object
dust_mesh = d0.data
dust_mesh.materials.append(M_DUST)
bpy.data.objects.remove(d0)
interp('LINEAR')
for i in range(50):
    o = link(bpy.data.objects.new(f"Dust_{i:02d}", dust_mesh), C_DUST)
    x, y, zz = random.uniform(-3.5, 3.5), random.uniform(-3, 5), random.uniform(-5, 7)
    key(o, 1, loc=(x, y, zz), scl=random.uniform(0.6, 1.8))
    key(o, 360, loc=(x + random.uniform(-0.4, 0.4), y, zz + random.uniform(0.6, 1.6)))
interp('BEZIER')

scene.frame_set(1)
result = {"objects": len(scene.objects), "weak_z": weak_z, "eye_rest": EYE_REST}
