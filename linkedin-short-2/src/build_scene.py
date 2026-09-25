"""Blender 5.2 scene for LinkedIn short 2: studio conveyor, supplier jam, Lupton second source drops in.

Run through the Higgsfield 3D Jutsu MCP (scene_builder_3d_run_python). Returns event frames and
screen-space anchors that overlays.py and sound.py read from anchors.json.
"""
import bpy, math, random, bmesh
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view
from bpy_extras import anim_utils

random.seed(11)
scene = bpy.context.scene
prefs = bpy.context.preferences.edit

# ---------------- wipe previous build ----------------
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for blk in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.actions):
    for d in list(blk):
        blk.remove(d)

# ---------------- render + world ----------------
scene.render.engine = 'BLENDER_EEVEE'
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 360
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.use_motion_blur = False
scene.eevee.taa_render_samples = 5
scene.eevee.shadow_ray_count = 1
scene.eevee.shadow_step_count = 6
scene.eevee.use_fast_gi = True
try:
    scene.view_settings.view_transform = 'Khronos PBR Neutral'
except Exception:
    pass

world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.74, 0.71, 0.66, 1)
bg.inputs["Strength"].default_value = 0.75


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


M_FLOOR = mat("Studio_Floor", srgb("E9E3D8"), rough=0.85)
M_LINE = mat("Floor_Line_Sage", srgb("7E9C8C"), rough=0.7)
M_NAVY = mat("Lupton_Navy", srgb("122536"), rough=0.4, coat=0.3)
M_GREEN = mat("Lupton_Green", srgb("618372"), rough=0.36, coat=0.4)
M_GRAY = mat("Supplier_Gray", srgb("A3ABB1"), rough=0.55)
M_GRAYDK = mat("Supplier_Gray_Dark", srgb("5F686F"), rough=0.5)
M_GRAPHITE = mat("Graphite", srgb("2B3136"), rough=0.45)
M_CAB = mat("Cabinet_Light", srgb("CDD1D3"), rough=0.5)
M_STEEL = mat("Steel", (0.78, 0.79, 0.81, 1), metallic=1.0, rough=0.26)
M_PART = mat("Part_Steel", (0.86, 0.87, 0.89, 1), metallic=1.0, rough=0.22)
M_PILE = mat("Hopper_Interior", srgb("3A4046"), rough=0.7)
M_CREAM = mat("Panel_Cream", srgb("F4F0E8"), rough=0.5)
M_BLACK = mat("Tunnel_Black", (0.004, 0.005, 0.006, 1), rough=0.9)
M_WOOD = mat("Pallet_Wood", srgb("D6BE94"), rough=0.8)
M_KRAFT = mat("Carton_Kraft", srgb("C29868"), rough=0.75)
M_TAPE = mat("Carton_Tape", srgb("E6D6B8"), rough=0.5)
M_HMI = mat("HMI_Glass", srgb("0E1418"), rough=0.15)
M_LENS_G = mat("Lens_Green", srgb("0F2616"), rough=0.5, emit=srgb("39D46A"), emit_strength=0.0)
M_LENS_A = mat("Lens_Amber", srgb("2E1E04"), rough=0.5, emit=srgb("FFB020"), emit_strength=0.0)
M_LENS_R = mat("Lens_Red", srgb("2A0806"), rough=0.5, emit=srgb("FF3B2A"), emit_strength=0.0)
M_BEACON = mat("Beacon_Red", srgb("2A0806"), rough=0.5, emit=srgb("FF3B2A"), emit_strength=0.0)
M_HMI_S = mat("HMI_Status", srgb("06090B"), rough=0.3, emit=srgb("39D46A"), emit_strength=0.0)

# belt rubber with moving cross stripes
M_BELT = bpy.data.materials.new("Belt_Rubber")
M_BELT.use_nodes = True
nt = M_BELT.node_tree
N, L = nt.nodes, nt.links
pb = N["Principled BSDF"]
pb.inputs["Roughness"].default_value = 0.7
tc = N.new("ShaderNodeTexCoord")
sep = N.new("ShaderNodeSeparateXYZ")
L.new(tc.outputs["Object"], sep.inputs[0])
belt_off = N.new("ShaderNodeValue")
belt_off.name = "Belt_Offset"


def mnode(op, a, b=None):
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


stripe = mnode('LESS_THAN', mnode('FRACT', mnode('DIVIDE', mnode('SUBTRACT', sep.outputs[1], belt_off.outputs[0]), 0.3)), 0.12)
mix = N.new("ShaderNodeMix"); mix.data_type = 'RGBA'
mix.inputs[6].default_value = srgb("262B2F")
mix.inputs[7].default_value = srgb("4A5157")
L.new(stripe, mix.inputs[0])
L.new(mix.outputs[2], pb.inputs["Base Color"])


def new_coll(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c


def link(o, coll):
    coll.objects.link(o)
    return o


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
    e.empty_display_size = 0.3
    e.location = loc
    return link(e, coll)


def box(name, coll, loc, dims, m, parent=None, bevel=0.0, segs=3, rz=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.rotation_euler = (0, 0, rz)
    move_to(o, coll, parent, m)
    if bevel:
        b = o.modifiers.new("Bevel", 'BEVEL'); b.width = bevel; b.segments = segs; b.limit_method = 'ANGLE'
    return o


def cyl(name, coll, loc, r, depth, m, parent=None, rot=(0, 0, 0), verts=40, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    move_to(o, coll, parent, m)
    if bevel:
        b = o.modifiers.new("Bevel", 'BEVEL'); b.width = bevel; b.segments = 2; b.limit_method = 'ANGLE'
    return o


CUR = ['BEZIER']


def interp(kind):
    CUR[0] = kind
    prefs.keyframe_new_interpolation_type = kind


def fcurves_of(idb):
    ad = idb.animation_data
    if not ad or not ad.action:
        return []
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    return list(cb.fcurves) if cb else []


def fix_interp(idb, path_end, f):
    for fc in fcurves_of(idb):
        if fc.data_path.endswith(path_end):
            for kp in fc.keyframe_points:
                if abs(kp.co.x - f) < 0.01:
                    kp.interpolation = CUR[0]


def key(o, f, loc=None, rot=None, scl=None):
    if loc is not None:
        o.location = loc; o.keyframe_insert("location", frame=f); fix_interp(o, "location", f)
    if rot is not None:
        o.rotation_euler = rot; o.keyframe_insert("rotation_euler", frame=f); fix_interp(o, "rotation_euler", f)
    if scl is not None:
        o.scale = scl if hasattr(scl, "__len__") else (scl, scl, scl); o.keyframe_insert("scale", frame=f); fix_interp(o, "scale", f)


def key_emit(m, f, v, sock="Emission Strength"):
    s = m.node_tree.nodes["Principled BSDF"].inputs[sock]
    s.default_value = v
    s.keyframe_insert("default_value", frame=f)
    fix_interp(m.node_tree, "default_value", f)


# ---------------- studio + floor markings ----------------
C_STUDIO = new_coll("Studio")
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
move_to(bpy.context.active_object, C_STUDIO, None, M_FLOOR).name = "Studio_Floor"
ZX, ZY0, ZY1, LW = 3.2, -3.7, 5.4, 0.07
for side in (-1, 1):
    box("Floor_Line_Side", C_STUDIO, (side * ZX, (ZY0 + ZY1) / 2, 0.002), (LW, ZY1 - ZY0 + LW, 0.004), M_LINE)
box("Floor_Line_Front", C_STUDIO, (0, ZY0, 0.002), (2 * ZX + LW, LW, 0.004), M_LINE)
box("Floor_Line_Back", C_STUDIO, (0, ZY1, 0.002), (2 * ZX + LW, LW, 0.004), M_LINE)

C_LIGHT = new_coll("Lighting")
sun_d = bpy.data.lights.new("Key_Sun", 'SUN')
sun_d.energy = 3.6
sun_d.angle = math.radians(0.6)
sun_d.color = (1.0, 0.965, 0.92)
sun = link(bpy.data.objects.new("Key_Sun", sun_d), C_LIGHT)
sun.rotation_euler = (math.radians(45), 0, math.radians(-53))
fill_d = bpy.data.lights.new("Fill_Sun", 'SUN')
fill_d.energy = 1.0
fill_d.color = (0.88, 0.93, 1.0)
fill_d.use_shadow = False
fill = link(bpy.data.objects.new("Fill_Sun", fill_d), C_LIGHT)
fill.rotation_euler = (math.radians(60), 0, math.radians(40))

# ---------------- conveyor ----------------
C_CONV = new_coll("Conveyor")
BELT_Y0, BELT_Y1 = -2.7, 3.0
BL = BELT_Y1 - BELT_Y0
YC = (BELT_Y0 + BELT_Y1) / 2
BELT_TOP = 0.92
box("Conveyor_Frame", C_CONV, (0, YC, 0.75), (1.0, BL, 0.3), M_NAVY, bevel=0.03)
box("Conveyor_Belt", C_CONV, (0, YC, 0.91), (0.84, BL - 0.02, 0.02), M_BELT)
for side in (-1, 1):
    box(f"Conveyor_Rail_{'L' if side < 0 else 'R'}", C_CONV, (side * 0.47, YC, 0.955), (0.035, BL, 0.07), M_STEEL, bevel=0.01)
cyl("Conveyor_Roller_Front", C_CONV, (0, BELT_Y0, 0.76), 0.16, 1.04, M_STEEL, rot=(0, math.radians(90), 0))
for lx in (-0.4, 0.4):
    for ly in (BELT_Y0 + 0.35, YC, BELT_Y1 - 0.35):
        box("Conveyor_Leg", C_CONV, (lx, ly, 0.3), (0.08, 0.08, 0.6), M_NAVY, bevel=0.01)
box("Conveyor_Motor", C_CONV, (0.68, BELT_Y0 + 0.5, 0.64), (0.3, 0.38, 0.3), M_GRAPHITE, bevel=0.035)
cyl("Conveyor_Motor_Cap", C_CONV, (0.84, BELT_Y0 + 0.5, 0.64), 0.11, 0.05, M_STEEL, rot=(0, math.radians(90), 0), bevel=0.01)

# ---------------- assembly cell (the buyer's line) ----------------
C_CELL = new_coll("Assembly_Cell")
FACE_Y = 3.0
box("Cell_Body", C_CELL, (0, FACE_Y + 0.7, 1.0), (1.8, 1.4, 2.0), M_NAVY, bevel=0.05, segs=4)
box("Cell_Panel", C_CELL, (0, FACE_Y - 0.01, 1.66), (1.34, 0.02, 0.5), M_CREAM, bevel=0.01)
box("Cell_Tunnel", C_CELL, (0, FACE_Y - 0.01, 1.13), (0.96, 0.02, 0.46), M_BLACK)
box("Cell_Tunnel_Frame_Top", C_CELL, (0, FACE_Y - 0.02, 1.38), (1.04, 0.03, 0.04), M_STEEL, bevel=0.008)
for side in (-1, 1):
    box("Cell_Tunnel_Frame_Side", C_CELL, (side * 0.5, FACE_Y - 0.02, 1.14), (0.04, 0.03, 0.52), M_STEEL, bevel=0.008)
box("Cell_HMI", C_CELL, (-0.3, FACE_Y - 0.025, 1.66), (0.46, 0.012, 0.32), M_HMI, bevel=0.006)
box("Cell_HMI_Status", C_CELL, (-0.3, FACE_Y - 0.033, 1.62), (0.36, 0.006, 0.09), M_HMI_S)
for j, w in enumerate((0.36, 0.26, 0.42)):
    box(f"Cell_Panel_Bar_{j}", C_CELL, (0.1 + w / 2, FACE_Y - 0.025, 1.76 - j * 0.1), (w, 0.01, 0.04), M_GRAYDK)
stack = empty("Stack_Light", C_CELL, (0.62, FACE_Y + 0.3, 2.0))
stack.scale = (1.9, 1.9, 1.9)
cyl("Stack_Pole", C_CELL, (0, 0, 0.16), 0.025, 0.32, M_STEEL, parent=stack)
for nm, m, z in (("Green", M_LENS_G, 0.39), ("Amber", M_LENS_A, 0.53), ("Red", M_LENS_R, 0.67)):
    cyl(f"Stack_Lens_{nm}", C_CELL, (0, 0, z), 0.095, 0.13, m, parent=stack, bevel=0.01)
cyl("Stack_Cap", C_CELL, (0, 0, 0.765), 0.1, 0.06, M_NAVY, parent=stack, bevel=0.01)

# ---------------- dressing: finished-goods pallet + electrical cabinet ----------------
C_DRESS = new_coll("Dressing")
PX, PY = 2.55, 4.25
for dx in (-0.45, 0.0, 0.45):
    box("Pallet_Runner", C_DRESS, (PX + dx, PY, 0.05), (0.1, 1.1, 0.1), M_WOOD, bevel=0.008)
box("Pallet_Deck", C_DRESS, (PX, PY, 0.125), (1.1, 1.1, 0.05), M_WOOD, bevel=0.008)
for i, (dx, dy, z) in enumerate(((-0.27, -0.27, 0), (0.27, -0.27, 0), (-0.27, 0.27, 0), (0.27, 0.27, 0), (-0.27, 0.27, 1), (0.27, 0.0, 1))):
    rz = math.radians(random.uniform(-3, 3))
    cz = 0.15 + 0.2 + z * 0.41
    box(f"Carton_{i}", C_DRESS, (PX + dx, PY + dy, cz), (0.5, 0.5, 0.4), M_KRAFT, bevel=0.012, rz=rz)
    box(f"Carton_Tape_{i}", C_DRESS, (PX + dx, PY + dy, cz + 0.2), (0.08, 0.5, 0.006), M_TAPE, rz=rz)
box("Electrical_Cabinet", C_DRESS, (1.58, 4.05, 0.85), (0.7, 0.5, 1.7), M_CAB, bevel=0.03)
box("Electrical_Cabinet_Seam", C_DRESS, (1.58, 3.797, 0.85), (0.012, 0.006, 1.5), M_GRAYDK)
box("Electrical_Cabinet_Label", C_DRESS, (1.4, 3.797, 1.45), (0.18, 0.006, 0.1), M_NAVY)

# ---------------- part mesh (baked L-bracket with holes) ----------------
C_TMP = new_coll("TMP_Build")
tmp = []
b1 = box("tmp_base", C_TMP, (0, 0, 0.018), (0.41, 0.29, 0.036), M_PART)
b2 = box("tmp_flange", C_TMP, (-0.187, 0, 0.13), (0.036, 0.29, 0.19), M_PART)
for j, hy in enumerate((-0.072, 0.072)):
    h = cyl(f"tmp_hole_{j}", C_TMP, (0.06, hy, 0.018), 0.042, 0.12, M_PART, verts=24)
    m = b1.modifiers.new(f"Hole{j}", 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.solver = 'EXACT'; m.object = h
    h.hide_render = True; h.hide_viewport = True
    tmp.append(h)
for o in (b1, b2):
    bv = o.modifiers.new("Bevel", 'BEVEL'); bv.width = 0.007; bv.segments = 2; bv.limit_method = 'ANGLE'
dg = bpy.context.evaluated_depsgraph_get()
verts, faces = [], []
for o in (b1, b2):
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    me.transform(o.matrix_world)
    off = len(verts)
    verts += [tuple(v.co) for v in me.vertices]
    faces += [[off + i for i in p.vertices] for p in me.polygons]
    bpy.data.meshes.remove(me)
PART_MESH = bpy.data.meshes.new("Part_Bracket_Mesh")
PART_MESH.from_pydata(verts, [], faces)
PART_MESH.update()
PART_MESH.materials.append(M_PART)
for o in [b1, b2] + tmp:
    bpy.data.objects.remove(o)
bpy.data.collections.remove(C_TMP)

# ---------------- hoppers ----------------
C_HOP = new_coll("Hoppers")
HOP_X = 1.8
A_Y, B_Y = -1.3, -0.2
PED_H, PED_W = 1.45, 0.9
FUN_H, FUN_TOP = 0.62, 1.3
PIV = PED_W / 2 + 0.02


def funnel_mesh(name):
    me = bpy.data.meshes.new(name)
    bmf = bmesh.new()
    bmesh.ops.create_cube(bmf, size=1.0)
    for v in bmf.verts:
        if v.co.z > 0:
            v.co.x *= FUN_TOP; v.co.y *= FUN_TOP; v.co.z = FUN_H
        else:
            v.co.x *= PED_W; v.co.y *= PED_W; v.co.z = 0.0
    top = [f for f in bmf.faces if f.calc_center_median().z > FUN_H - 1e-4]
    bmesh.ops.delete(bmf, geom=top, context='FACES_ONLY')
    bmf.to_mesh(me); bmf.free()
    return me


def hopper(name, x, y, body, trim, outlet_dir):
    root = empty(name, C_HOP, (x, y, 0))
    box(f"{name}_Pedestal", C_HOP, (0, 0, PED_H / 2), (PED_W, PED_W, PED_H), body, parent=root, bevel=0.04, segs=4)
    fo = link(bpy.data.objects.new(f"{name}_Funnel", funnel_mesh(f"{name}_Funnel_Mesh")), C_HOP)
    fo.data.materials.append(body)
    fo.parent = root
    fo.location = (0, 0, PED_H)
    so = fo.modifiers.new("Solidify", 'SOLIDIFY'); so.thickness = 0.045; so.offset = -1.0
    bv = fo.modifiers.new("Bevel", 'BEVEL'); bv.width = 0.012; bv.segments = 2; bv.limit_method = 'ANGLE'
    rz = PED_H + FUN_H + 0.02
    half = FUN_TOP / 2
    for sx, sy, dims in ((1, 0, (0.07, FUN_TOP + 0.07, 0.06)), (-1, 0, (0.07, FUN_TOP + 0.07, 0.06)),
                         (0, 1, (FUN_TOP + 0.07, 0.07, 0.06)), (0, -1, (FUN_TOP + 0.07, 0.07, 0.06))):
        box(f"{name}_Rim", C_HOP, (sx * half, sy * half, rz), dims, trim, parent=root, bevel=0.012)
    fill_z = PED_H + 0.44
    box(f"{name}_Fill", C_HOP, (0, 0, fill_z), (1.1, 1.1, 0.02), M_PILE, parent=root)
    for k in range(13):
        p = link(bpy.data.objects.new(f"{name}_Stock_{k}", PART_MESH), C_HOP)
        p.parent = root
        p.location = (random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), fill_z + 0.01 + random.uniform(0, 0.04))
        p.rotation_euler = (math.radians(random.uniform(-25, 25)), math.radians(random.uniform(-25, 25)), random.uniform(0, 6.28))
    box(f"{name}_Outlet", C_HOP, (outlet_dir * (PED_W / 2 + 0.005), 0, PED_H - 0.14), (0.02, 0.42, 0.24), M_BLACK, parent=root)
    return root


hopA = hopper("Hopper_Supplier", -HOP_X, A_Y, M_GRAY, M_GRAYDK, +1)
box("Hopper_Supplier_Plate", C_HOP, (0, -PED_W / 2 - 0.01, 0.9), (0.5, 0.02, 0.26), M_GRAYDK, parent=hopA, bevel=0.01)
beacon = cyl("Hopper_Supplier_Beacon", C_HOP, (-FUN_TOP / 2, -FUN_TOP / 2, PED_H + FUN_H + 0.13), 0.1, 0.16, M_BEACON, parent=hopA, bevel=0.012)

hopB = hopper("Hopper_Lupton", HOP_X, B_Y, M_GREEN, M_NAVY, -1)
box("Lupton_Badge_Plate", C_HOP, (0, -PED_W / 2 - 0.01, 0.9), (0.62, 0.02, 0.62), M_CREAM, parent=hopB, bevel=0.012)


def px(xx, yy):
    return ((xx - 55) / 193.0 - 0.5, 0.5 - (yy - 40) / 190.0)


def prism(name, pts, y0, depth, m, parent, scale, cz):
    n = len(pts)
    verts = [(x * scale, y0, cz + zz * scale) for x, zz in pts] + [(x * scale, y0 + depth, cz + zz * scale) for x, zz in pts]
    faces = [list(range(n))[::-1], list(range(n, 2 * n))] + [[i, (i + 1) % n, (i + 1) % n + n, i + n] for i in range(n)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    bmp = bmesh.new(); bmp.from_mesh(me)
    bmesh.ops.recalc_face_normals(bmp, faces=bmp.faces)
    bmp.to_mesh(me); bmp.free()
    o = link(bpy.data.objects.new(name, me), C_HOP)
    o.data.materials.append(m)
    o.parent = parent
    return o


BADGE = 0.56
BY0 = -PED_W / 2 - 0.035
prism("Lupton_Badge_L", [px(*p) for p in [(108, 87), (129, 87), (105, 167), (194, 167), (201, 186), (79, 186)]], BY0, 0.016, M_NAVY, hopB, BADGE, 0.9)
prism("Lupton_Badge_A", [px(*p) for p in [(150, 87), (173, 87), (223, 186), (203, 186), (196, 167), (123, 167)]], BY0, 0.016, M_NAVY, hopB, BADGE, 0.9)
prism("Lupton_Badge_Counter", [px(*p) for p in [(163, 113), (184, 150), (145, 150)]], BY0 - 0.004, 0.008, M_CREAM, hopB, BADGE, 0.9)

# ---------------- chutes ----------------
CHUTE_TILT = math.radians(18)
REACH = HOP_X - PIV - 0.15
CL = REACH / math.cos(CHUTE_TILT)
PIV_Z = PED_H - 0.1


def chute(name, parent_root, outlet_dir, zrot):
    piv = empty(name, C_HOP, (outlet_dir * PIV, 0, PIV_Z))
    piv.parent = parent_root
    piv.rotation_euler = (0, CHUTE_TILT, zrot)
    box(f"{name}_Bed", C_HOP, (CL / 2, 0, 0), (CL, 0.36, 0.025), M_STEEL, parent=piv, bevel=0.006)
    for side in (-1, 1):
        box(f"{name}_Wall", C_HOP, (CL / 2, side * 0.18, 0.05), (CL, 0.022, 0.1), M_STEEL, parent=piv, bevel=0.006)
    return piv


chA = chute("Chute_Supplier", hopA, +1, 0.0)
chB = chute("Chute_Lupton", hopB, -1, math.pi)


def chute_point(root_xy, zrot, s, lift=0.0125):
    rx, ry = root_xy
    d = 1 if zrot == 0 else -1
    piv = Vector((rx + d * PIV, ry, PIV_Z))
    R = Euler((0, CHUTE_TILT, zrot), 'XYZ').to_matrix()
    return piv + R @ Vector((s, 0, lift))


# ---------------- parts flow ----------------
C_PARTS = new_coll("Parts")
V = 0.085
TUNNEL_Y = FACE_Y
BELT_EXIT = FACE_Y + 0.35
landings = {"A": [], "B": []}
jam_obj = None


def spawn(tag, f0, root_xy, zrot, lane_y, jam=False):
    o = link(bpy.data.objects.new(f"Part_{tag}_{f0:+04d}", PART_MESH), C_PARTS)
    chute_rot = (0, CHUTE_TILT, zrot)
    interp('CONSTANT')
    key(o, f0 - 1, scl=0.0)
    key(o, f0, scl=1.0)
    interp('BEZIER')
    key(o, f0, loc=chute_point(root_xy, zrot, -0.3), rot=chute_rot)
    if jam:
        stuck = chute_point(root_xy, zrot, 0.5)
        key(o, f0 + 7, loc=stuck, rot=(0, CHUTE_TILT, zrot))
        interp('LINEAR')
        for f in range(f0 + 8, f0 + 34, 2):
            j = 0.012
            key(o, f, loc=stuck + Vector((random.uniform(-j, j), random.uniform(-j, j), 0)),
                rot=(math.radians(random.uniform(8, 14)), CHUTE_TILT + math.radians(random.uniform(-3, 3)), zrot + math.radians(28)))
        interp('BEZIER')
        return o
    key(o, f0 + 12, loc=chute_point(root_xy, zrot, CL - 0.12), rot=chute_rot)
    land = f0 + 15
    rz = math.radians(90 + random.uniform(-12, 12))
    interp('LINEAR')
    key(o, land, loc=(0, lane_y, BELT_TOP), rot=(0, 0, rz))
    f_exit = land + int(round((BELT_EXIT - lane_y) / V))
    key(o, f_exit, loc=(0, BELT_EXIT, BELT_TOP), rot=(0, 0, rz))
    interp('CONSTANT')
    key(o, f_exit + 1, scl=0.0)
    interp('BEZIER')
    landings[tag].append(land)
    return o


A_XY, B_XY = (-HOP_X, A_Y), (HOP_X, B_Y)
LAST_A = 84
F_JAM = 88
F_EMPTY = LAST_A + 15 + int(math.ceil((TUNNEL_Y - A_Y) / V)) + 2   # last supplier part is inside the cell
F_DROP = 165
F_LAND = F_DROP + 12
F_B0 = 192
F_GREEN = F_B0 + 15 + int(math.ceil((TUNNEL_Y - B_Y) / V))        # first Lupton part reaches the cell
f0 = -70
while f0 <= LAST_A:
    spawn("A", f0, A_XY, 0.0, A_Y)
    f0 += 7
jam_obj = spawn("A", F_JAM, A_XY, 0.0, A_Y, jam=True)
f0 = F_B0
while f0 + 15 <= 360:
    spawn("B", f0, B_XY, math.pi, B_Y)
    f0 += 7

# ---------------- belt motion ----------------
def belt_speed(f):
    if f < F_EMPTY:
        return V
    if f < F_EMPTY + 12:
        return V * (F_EMPTY + 12 - f) / 12
    if f < 186:
        return 0.0
    if f < 196:
        return V * (f - 186) / 10
    return V


pos = 0.0
interp('LINEAR')
for f in range(1, 361):
    pos += belt_speed(f)
    if f % 2 == 1 or f == 360:
        belt_off.outputs[0].default_value = pos
        belt_off.outputs[0].keyframe_insert("default_value", frame=f)
        fix_interp(M_BELT.node_tree, "default_value", f)
interp('BEZIER')

# ---------------- stack light, HMI + beacon states ----------------
interp('CONSTANT')
F_WARN = F_EMPTY - 12
key_emit(M_LENS_G, 1, 4.5); key_emit(M_LENS_G, F_WARN, 0.0); key_emit(M_LENS_G, F_GREEN, 4.5)
HG, HA, HR = srgb("39D46A"), srgb("FFB020"), srgb("FF3B2A")
key_emit(M_HMI_S, 1, HG, "Emission Color"); key_emit(M_HMI_S, F_WARN, HA, "Emission Color")
key_emit(M_HMI_S, F_EMPTY, HR, "Emission Color"); key_emit(M_HMI_S, F_GREEN, HG, "Emission Color")
key_emit(M_HMI_S, 1, 3.0)
for f in range(F_EMPTY, F_GREEN, 6):
    key_emit(M_HMI_S, f, 3.5 if ((f - F_EMPTY) // 6) % 2 == 0 else 0.6)
key_emit(M_HMI_S, F_GREEN, 3.0)
key_emit(M_LENS_A, 1, 0.0)
for f in range(F_WARN, F_EMPTY, 4):
    key_emit(M_LENS_A, f, 4.5 if ((f - F_WARN) // 4) % 2 == 0 else 0.3)
key_emit(M_LENS_A, F_EMPTY, 0.0)
key_emit(M_LENS_R, 1, 0.0)
for f in range(F_EMPTY, F_GREEN, 6):
    key_emit(M_LENS_R, f, 5.0 if ((f - F_EMPTY) // 6) % 2 == 0 else 0.5)
key_emit(M_LENS_R, F_GREEN, 0.0)
key_emit(M_BEACON, 1, 0.0)
for f in range(F_JAM, 230, 5):
    key_emit(M_BEACON, f, 5.0 if ((f - F_JAM) // 5) % 2 == 0 else 0.3)
key_emit(M_BEACON, 230, 1.5)
interp('BEZIER')

# supplier hopper shudders at the jam
interp('LINEAR')
key(hopA, 1, loc=(-HOP_X, A_Y, 0))
key(hopA, F_JAM - 2, loc=(-HOP_X, A_Y, 0))
for f in range(F_JAM, F_JAM + 30, 2):
    key(hopA, f, loc=(-HOP_X + random.uniform(-0.03, 0.03), A_Y + random.uniform(-0.02, 0.02), 0))
key(hopA, F_JAM + 30, loc=(-HOP_X, A_Y, 0))
interp('BEZIER')

# Lupton hopper drops in (gravity), squashes, chute swings into place
Z0 = 13.0
interp('CONSTANT')
key(hopB, 1, loc=(HOP_X, B_Y, Z0), scl=0.0)
key(hopB, F_DROP, scl=1.0)
interp('LINEAR')
T = F_LAND - F_DROP
for i in range(T + 1):
    key(hopB, F_DROP + i, loc=(HOP_X, B_Y, Z0 * (1 - (i / T) ** 2)))
interp('BEZIER')
key(hopB, F_LAND, scl=(1.08, 1.08, 0.86))
key(hopB, F_LAND + 4, loc=(HOP_X, B_Y, 0.07), scl=(0.98, 0.98, 1.04))
key(hopB, F_LAND + 8, loc=(HOP_X, B_Y, 0.0), scl=1.0)
key(chB, 1, rot=(0, math.radians(-75), math.pi))
key(chB, F_LAND + 2, rot=(0, math.radians(-75), math.pi))
key(chB, F_LAND + 8, rot=(0, CHUTE_TILT + math.radians(7), math.pi))
key(chB, F_LAND + 12, rot=(0, CHUTE_TILT - math.radians(2), math.pi))
key(chB, F_LAND + 15, rot=(0, CHUTE_TILT, math.pi))

# ---------------- camera: slow orbit, auto-fit below the text band ----------------
C_CAM = new_coll("Camera_Rig")
cd = bpy.data.cameras.new("DeliveryCamera")
cd.type = 'ORTHO'
cd.sensor_fit = 'VERTICAL'
cd.clip_end = 200
cam = link(bpy.data.objects.new("DeliveryCamera", cd), C_CAM)
scene.camera = cam

scene.frame_set(300)
pts = []
for coll in (C_CONV, C_CELL, C_HOP, C_DRESS):
    for o in coll.objects:
        if o.type == 'MESH' and "_Stock_" not in o.name:
            pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
PT_C = sum(pts, Vector()) / len(pts)
ASP = 1080 / 1920
U0, U1, V0, V1 = 0.05, 0.95, 0.08, 0.65
VC = (V0 + V1) / 2
Z_A, Z_B = -28.0, -20.0


def zdeg_at(f):
    return Z_A + (Z_B - Z_A) * (f - 1) / 359.0


def cam_rot(zdeg):
    return Euler((math.radians(50), 0, math.radians(zdeg)), 'XYZ')


def fit(zdeg):
    Rm = cam_rot(zdeg).to_matrix()
    right, up, fwd = Rm @ Vector((1, 0, 0)), Rm @ Vector((0, 1, 0)), Rm @ Vector((0, 0, -1))
    xs = [right.dot(p) for p in pts]
    ys = [up.dot(p) for p in pts]
    S = max((max(xs) - min(xs)) / ((U1 - U0) * ASP), (max(ys) - min(ys)) / (V1 - V0))
    return S, right, up, fwd, (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2


S_REF = max(fit(zdeg_at(f))[0] for f in (1, 60, 120, 180, 240, 300, 360))


def sstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def push(f):
    if f <= 150:
        return 1.07 + (1.0 - 1.07) * sstep(1, 150, f)
    if f <= 176:
        return 1.0 + (0.975 - 1.0) * sstep(150, 176, f)
    if f <= 215:
        return 0.975 + (1.0 - 0.975) * sstep(177, 215, f)
    return 1.0 + (0.98 - 1.0) * sstep(215, 360, f)


shake = {F_LAND + 1: (0.08, -0.06), F_LAND + 3: (-0.06, 0.04), F_LAND + 5: (0.035, -0.02), F_LAND + 7: (0.0, 0.0)}
frames = sorted(set([f for f in range(1, 361, 6) if not (F_LAND - 1 <= f <= F_LAND + 8)] + [360, F_LAND - 1] + list(shake)))
interp('BEZIER')
for f in frames:
    z = zdeg_at(f)
    _, right, up, fwd, CX, CY = fit(z)
    S = S_REF * push(f)
    dx, dy = shake.get(f, (0.0, 0.0))
    cam.rotation_euler = cam_rot(z)
    cam.keyframe_insert("rotation_euler", frame=f); fix_interp(cam, "rotation_euler", f)
    cam.location = right * (CX + dx) + up * (CY + (0.5 - VC) * S + dy) + fwd * (fwd.dot(PT_C) - 40)
    cam.keyframe_insert("location", frame=f); fix_interp(cam, "location", f)
    cd.ortho_scale = S
    cd.keyframe_insert("ortho_scale", frame=f); fix_interp(cd, "ortho_scale", f)

# ---------------- screen-space anchors for overlay callouts ----------------
anchors = []
for f in range(1, 361, 2):
    scene.frame_set(f)
    row = [f]
    for p in (hopA.matrix_world @ Vector((0, 0, PED_H + FUN_H + 0.3)),
              hopB.matrix_world @ Vector((0, 0, PED_H + FUN_H + 0.3)),
              stack.matrix_world @ Vector((0, 0, 0.85)),
              jam_obj.matrix_world.translation.copy()):
        co = world_to_camera_view(scene, cam, p)
        row += [round(co.x, 4), round(co.y, 4)]
    anchors.append(row)

audit = {}
for nm, idb in (("part", bpy.data.objects["Part_A_+007"]), ("hopB", hopB), ("lensG", M_LENS_G.node_tree), ("belt", M_BELT.node_tree)):
    audit[nm] = sorted({kp.interpolation for fc in fcurves_of(idb) for kp in fc.keyframe_points})
scene.frame_set(1)
result = {"audit": audit, 
    "objects": len(scene.objects), "S_REF": round(S_REF, 3), "CL": round(CL, 3),
    "F_EMPTY": F_EMPTY, "F_WARN": F_WARN, "F_GREEN": F_GREEN, "F_DROP": F_DROP, "F_LAND": F_LAND, "F_JAM": F_JAM, "F_B0": F_B0,
    "landings_A": landings["A"], "landings_B": landings["B"], "anchors": anchors,
    "view_transform": scene.view_settings.view_transform,
}
