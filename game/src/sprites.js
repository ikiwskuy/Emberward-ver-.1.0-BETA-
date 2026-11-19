// sprites.js — character art. The character wipe (2026-11-19) took
// every sprite out; this module was an inert stub until Karlsefni
// came back the same morning as step 1 of the user's rebuild, with a
// NEW sheet of his own: five poses on black, keyed to transparency
// offline and normalized onto one shared 415x413 canvas — the figure
// measures exactly 397 px tall with its feet on row 404 in EVERY
// frame (idle and walk alike), so a state change can never resize
// him. Frame assignment is the user's: frame 1 (leftmost) is the
// idle, frames 2-5 are the walk cycle in order.
// REBUILD STEP 2 (same morning): An Rosaline returns the same way,
// from her own new sheet (~/workspace/user/files/64162_13_9fzc.png),
// processed by the identical pipeline onto the identical canvas
// geometry — her frames also measure 397 px with feet on row 404,
// so she draws at exactly Karlsefni's size and the two can never
// disagree.
// REBUILD STEP 3 (same morning): Tyne Vgernaut completes the trio,
// from her own new sheet (~/workspace/user/files/64167_14_rs4r.png),
// through the identical pipeline onto the identical canvas — her
// deep-purple hair and outfit survive the black keying untouched
// (zero interior pixels eaten; ~16k dark-purple shading pixels per
// frame stay fully opaque, and the keyed fringe un-premultiplies to
// purple, not black). Everything else stays a stub: no foes, no
// ultimate storyboards — their getters still answer "no art".
// REBUILD STEP 4 (same morning): Karlsefni's melee slash — two
// poses from the user's sheet (~/workspace/user/files/
// 64161_15_6b9n.png), keyed by the same pipeline but NOT normalized
// onto the shared canvas: each pose keeps its own wide canvas (the
// ice arc overflows freely) and carries its own geometry — the
// BODY's rows within the canvas and the head-anchor column —
// measured off the art (hair top to boot sole: 472 and 454 raw px,
// scaled to the same 397). The draw scales by the same 66/397 as
// every other frame and pins the body's baseline row to the feet
// and the anchor column to the Warden's x, so mid-slash his body
// measures exactly 66 world px and his feet never leave the ground
// — the ~124 px attack body of the old build cannot come back.
// REBUILD STEP 5 (same morning): the first foe returns — the
// Gloomslick, from the user's sticker sheet (~/workspace/user/files/
// 64103_16_h7uy.png — thirteen poses in a loose grid, sliced by
// component): the plain neutral dome is the base, the >_< dome the
// hurt flash, the angry dome the attack wind-up, the airborne dome
// the leap (its painted shadow ellipse is NOT baked in — the game
// draws a live ground shadow instead), and the water burst the
// death. Each frame keeps its own canvas and geometry, normalized
// by the BODY exactly like Karlsefni's slash: the dome's rows are
// the same count in every frame, so the slime's body measures
// SLIME_BODY_H world px standing, winding up, hurt or mid-leap —
// only the death burst, which has no body left, draws larger.
// REBUILD STEP 6 (same morning): Rosaline's fire-arrow shot — two
// poses from the user's sheet (~/workspace/user/files/
// 64163_17_kups.png): drawing the bow, then the release with its
// huge flaming arrow. Same treatment as Karlsefni's slash: each
// pose keeps its own wide canvas (bow, arrow and fire swirls
// overflow freely) and carries its own geometry, normalized by
// the BODY — measured off the art (hair top to boot sole: 584 and
// 551 raw px, scaled to the same 397) with the anchor set from her
// face, calibrated to her idle (in the walk frames her face sits
// +25 canvas px right of the anchor column, so the shot frames'
// anchor is their face centroid shifted by the same offset) — so
// mid-shot her body measures exactly 66 world px, her feet never
// leave the ground and her face stays where her idle puts it. The
// loosed arrow itself is code-drawn (drawProjectiles): a glowing
// fire streak in her colours.
// REBUILD STEP 7 (same morning): Tyne's star-cast — two poses
// from the user's sheet (~/workspace/user/files/
// 64166_18_2y3g.png): holding her spellbook out with the
// crystals gathering, then the cast — book floating open under
// a big star-burst, her hand extended. Same treatment again:
// each pose keeps its own canvas (book, star ornaments, swirls
// and sparkles overflow freely), normalized by the BODY (hair
// top to boot sole: 571 and 583 raw px, scaled to the same 397),
// anchor from her face with her idle's own offset (in the walk
// frames her face sits +34 canvas px right of the anchor
// column). Her loosed bolt is code-drawn beside Rosaline's
// arrow in drawProjectiles: a violet orb with a star sparkle.

// REBUILD STEP 8 (same morning): Karlsefni's ultimate — the
// Flying Slash. The user sent two stacked slash-wave effects
// (~/workspace/user/files/64165_19_laqa.png) and chose the TOP
// one only: the curved ice crescent (the straight beam below it
// is NOT used and NOT shipped). Keyed by the same pipeline and
// cropped to its union bbox (1532x393, shards and sparkles
// riding along). It is a pure effect — no body to normalize —
// so it is sized to the Warden instead, per the user's word
// ("sedang aja, sesuai postur tubuh dia"): drawn ULTI_WAVE_LEN
// world px long, 120 = 1.8x his 66-px body height, an extension
// of his own slash arc (which spans ~103 world px) rather than
// a screen-filling wave; its height follows the art's aspect
// (~31 world px). drawSlashWaves below flies it, flipped by its
// travel direction and tilted by its climb, never upside down.

// REBUILD STEP 10 (same morning): Tyne's ultimate — the
// Starfall. The user sent a ten-frame orb sequence (2 rows x 5,
// ~/workspace/user/files/64168_20_kf5c.png): a small violet
// spark that grows frame by frame into a huge crackling star
// sphere (peak at frame 8) and dissipates into swirls (frame
// 10). Keyed by the same pipeline, sliced on the sheet's own
// grid, and normalized onto ONE shared 306x346 canvas with
// every frame's orb body (its largest component) centred — so
// the growth plays around a fixed centre and never jumps.
// Solid areas run 7.7k -> 70.3k (peak) -> 35.9k px. It is a
// pure effect like Karlsefni's wave, sized to the Warden by
// the same rule: the canvas draws TYNE_ULTI_W world px wide —
// 132, exactly 2x her 66-px body height across at the peak —
// its height following the canvas aspect (~149 world px).
// drawSlashWaves flies it too: frames 1-9 play as it travels
// (player.js advances them), frame 10 is the burst it leaves
// on the foe it kills.

// REBUILD STEP 11 (same morning): Rosaline's ultimate — the
// Crimson Rose. The user sent a two-row sheet
// (~/workspace/user/files/64164_21_0o5u.png) and directed:
// ONLY the bottom row, the same as the other two. The bottom
// row is her release pose (a giant crimson arrow leaving her
// bow) and the arrow alone in three stages of growing
// intensity, ending in a starburst tip; the top row's charging
// poses were not extracted and are not shipped. The pose is
// normalized like her other attack art — her BODY spans the
// same 397 canvas rows, her face on the same +25 anchor
// calibration (ROSA_ULTI_GEO) — and drawHeroSprite wears it
// while p.ultiT runs, through the very same draw path as her
// shot poses. The arrow stages share one 495x246 canvas, nose
// and centreline aligned, drawn rotated to their heading at
// ROSA_ARROW_K world px per canvas px — the longest stage
// measures 132 world px, 2x her body height, the same sizing
// rule as the other ultimates.

// REBUILD STEP 12 (same morning): the second foe — the zombie,
// from the user's labelled sheet
// (~/workspace/user/files/64108_22_ur8u.png; the big portrait
// was not used). Idle 1, Walk 3, Attack 5, Hurt 3, Death 8
// were sliced by their labelled groups (Attack 5's reaching
// arm is its own component on the sheet and was merged back).
// The Run 3 frames are sliced and loaded but DORMANT — his
// word is a slow walk, and no code path ever draws them.
// Normalization follows the standing size rule with a foe's
// twist: every STANDING frame (idle/walk/run/attack/hurt) is
// scaled by its own body height so the body spans exactly
// ZOMBIE_BODY_ROWS (264) canvas rows in all of them — 66 world
// px at the constant draw scale, the heroes' own height —
// while the eight DEATH frames share ONE scale (the standing
// median), so the collapse plays at a single size and the
// final corpse measures 240 canvas px long, 0.91x the
// standing body: flat on the same ground line, never
// ballooning. drawZombieSprite below draws every frame at the
// one constant k, pinned by its baseline row and anchor
// column, flipped by facing (the art faces right).

// REBUILD STEP 13 (same morning): the third foe — the goblin,
// from the user's labelled sheet
// (~/workspace/user/files/64106_23_yd6d.png; the big portrait
// and the Front/Back views were not used). Idle 4, Walk 3,
// Run 3, Attack 1, Attack 2, Hurt 1, Death 1 were sliced by
// their labelled groups — the sheet's figures fragment into
// many components, so they were re-gathered by x-clustering.
// The body in each frame was measured by its green head (the
// topmost large skin cluster — the club arcs are white/brown
// and never read as skin) down to its feet on the baseline:
// every standing frame is scaled by that body height so the
// body spans exactly GOBLIN_BODY_ROWS (216) canvas rows —
// 54 world px at the constant draw scale, between the slime's
// 44 and the heroes'/zombie's 66. The bottom row's figures
// are drawn bigger on the sheet (attack bodies 181/166, hurt
// 163 sheet px against the mid row's ~135) and normalize down
// to the same 54. The Death frame shares the standing median
// scale: the face-down corpse lies at the same scale, its
// full span (body + outflung club arm) measuring 427 canvas
// px. The Walk frames are sliced and loaded but the goblin
// travels on its Run cycle (the user's spec made only the
// zombie slow), so no draw path selects them either.
// drawGoblinSprite below: one constant k, baseline-pinned,
// flipped by facing; the wind-up wears the idle cycle with a
// crouch squash — the coil before the swing.

import { KARL_URLS, ROSA_URLS, TYNE_URLS, KARL_SLASH_URLS, KARL_ULTI_URLS, ROSA_SHOOT_URLS, TYNE_CAST_URLS, TYNE_ULTI_URLS, ROSA_ULTI_URLS, SLIME_URLS, ZOMBIE_URLS, GOBLIN_URLS, KNIGHT_URLS, DRAGON_URLS } from './sprite-data.js';
import { ZOMBIE_DEATH_T } from './enemies.js';

export const ROSA_ULTI_SEQ = [];
export const TYNE_ULTI_SEQ = [];
export const TYNE_ORB_SEQ = [];

export const foeSettled = Promise.resolve();

export function spriteImg() { return null; }
export function spriteDecoded() { return false; }
export function spriteAnchor() { return 0.5; }
export function foeSprite() { return null; }
export function foeDecoded() { return false; }

// ——— The three Wardens (the whole cast, for now) ———

export const KARL_FRAMES = ['karl-idle', 'karl-walk-1', 'karl-walk-2', 'karl-walk-3', 'karl-walk-4'];
export const ROSA_FRAMES = ['rosa-idle', 'rosa-walk-1', 'rosa-walk-2', 'rosa-walk-3', 'rosa-walk-4'];
export const TYNE_FRAMES = ['tyne-idle', 'tyne-walk-1', 'tyne-walk-2', 'tyne-walk-3', 'tyne-walk-4'];
export const KARL_SLASH_FRAMES = ['karl-slash-1', 'karl-slash-2'];
export const KARL_ULTI_FRAMES = ['karl-ulti-wave'];
export const TYNE_ULTI_FRAMES = ['tyne-ulti-1', 'tyne-ulti-2', 'tyne-ulti-3', 'tyne-ulti-4', 'tyne-ulti-5', 'tyne-ulti-6', 'tyne-ulti-7', 'tyne-ulti-8', 'tyne-ulti-9', 'tyne-ulti-10'];
export const ROSA_SHOOT_FRAMES = ['rosa-shoot-1', 'rosa-shoot-2'];
export const TYNE_CAST_FRAMES = ['tyne-cast-1', 'tyne-cast-2'];
export const ROSA_ULTI_FRAMES = ['rosa-ulti-release', 'rosa-arrow-1', 'rosa-arrow-2', 'rosa-arrow-3'];

// Karlsefni's slash canvases (step 4): each pose's own size (w x h
// px), the rows its BODY spans (bodyTop..bodyBot — always 397 rows
// after the offline scaling, the same BODY_ROWS as the walkers),
// and the head-anchor column that stands on the Warden's x. The
// arc and shards overflow the body rows/columns on purpose.
export const KARL_SLASH_GEO = { 'karl-slash-1': { w: 619, h: 480, bodyTop: 81, bodyBot: 477, anchorX: 356 }, 'karl-slash-2': { w: 668, h: 496, bodyTop: 85, bodyBot: 481, anchorX: 293 } };

// Rosaline's shot canvases (step 6): the same per-pose geometry
// contract — each pose's own size, the rows its BODY spans (397
// after the offline scaling), and the anchor column that stands
// on the Warden's x (her face centroid, shifted by the idle's
// face-to-anchor offset). The bow, the flaming arrow and the
// fire swirls overflow the body rows/columns on purpose.
export const ROSA_SHOOT_GEO = { 'rosa-shoot-1': { w: 491, h: 448, bodyTop: 51, bodyBot: 447, anchorX: 239 }, 'rosa-shoot-2': { w: 696, h: 475, bodyTop: 73, bodyBot: 469, anchorX: 251 } };

// Rosaline's ultimate release pose (step 11): the same geometry
// contract as her shot canvases — her body spans 397 rows
// (71..467) after the offline scaling, anchorX her face column
// less the idle's +25 offset. The bow, the starburst and the
// loosed arrow overflow the canvas on purpose.
export const ROSA_ULTI_GEO = { 'rosa-ulti-release': { w: 792, h: 471, bodyTop: 71, bodyBot: 467, anchorX: 215 } };

// The Crimson Rose arrow's shared canvas (step 11): all three
// stages aligned on nose column and shaft centreline. Drawn at
// ROSA_ARROW_K world px per canvas px, so the longest stage
// (447 canvas px of arrow) spans 132 world px — 2x her body
// height; the stages measure ~108 / 132 / ~118 world px long.
export const ROSA_ARROW_GEO = { w: 495, h: 246 };
export const ROSA_ARROW_K = 132 / 447;

// Tyne's cast canvases (step 7): the same per-pose geometry
// contract — each pose's own size, the rows its BODY spans (397
// after the offline scaling), and the anchor column that stands
// on the Warden's x (her face centroid, shifted by her idle's
// face-to-anchor offset). The spellbook, the star-burst and the
// magic swirls overflow the body rows/columns on purpose.
export const TYNE_CAST_GEO = { 'tyne-cast-1': { w: 489, h: 397, bodyTop: 0, bodyBot: 396, anchorX: 263 }, 'tyne-cast-2': { w: 618, h: 421, bodyTop: 19, bodyBot: 415, anchorX: 251 } };

// Shared-canvas geometry from the sheet processing (see above): the
// figure's solid body is BODY_ROWS tall, its feet end at BASE_EDGE,
// and its head-centred anchor sits at the canvas's horizontal middle.
// All three heroes share it — steps 2 and 3 normalized Rosaline and
// Tyne onto Karlsefni's canvas exactly, so one geometry serves all.
const CANVAS_W = 415, CANVAS_H = 413, BODY_ROWS = 397, BASE_EDGE = 405;
// The drawn body height in world px — the game's standard Warden size.
export const KARL_BODY_H = 66;
export const HERO_BODY_H = KARL_BODY_H;

// One loader per hero: five Images, a ready flag each, and a promise
// that settles when every frame has decoded or failed.
function loadSet(urls, frames) { const imgs = {}; const ready = {}; let pending = frames.length; let resolve;
  const settled = new Promise((res) => { resolve = res; });
  for (const name of frames) { const im = new Image(); imgs[name] = im;
    im.onload = () => { ready[name] = true; if (--pending === 0) resolve(); };
    im.onerror = () => { if (--pending === 0) resolve(); };
    im.src = urls[name]; }
  return { imgs, ready, settled, idle: frames[0], walk: frames.slice(1) }; }

const karlSet = loadSet(KARL_URLS, KARL_FRAMES);
const rosaSet = loadSet(ROSA_URLS, ROSA_FRAMES);
const tyneSet = loadSet(TYNE_URLS, TYNE_FRAMES);
const karlSlashSet = loadSet(KARL_SLASH_URLS, KARL_SLASH_FRAMES);
const karlUltiSet = loadSet(KARL_ULTI_URLS, KARL_ULTI_FRAMES);
const tyneUltiSet = loadSet(TYNE_ULTI_URLS, TYNE_ULTI_FRAMES);
const rosaShootSet = loadSet(ROSA_SHOOT_URLS, ROSA_SHOOT_FRAMES);
const tyneCastSet = loadSet(TYNE_CAST_URLS, TYNE_CAST_FRAMES);
const rosaUltiSet = loadSet(ROSA_ULTI_URLS, ROSA_ULTI_FRAMES);
export const karlSettled = karlSet.settled;
export const rosaSettled = rosaSet.settled;
export const tyneSettled = tyneSet.settled;
export const karlSlashSettled = karlSlashSet.settled;
export const karlUltiSettled = karlUltiSet.settled;
export const tyneUltiSettled = tyneUltiSet.settled;
export const rosaShootSettled = rosaShootSet.settled;
export const tyneCastSettled = tyneCastSet.settled;
export const rosaUltiSettled = rosaUltiSet.settled;

// ——— The Gloomslick (step 5) ———

// Five frames sliced from the user's sticker sheet: base (the
// plain dome), hurt (the >_< dome), angry (the wind-up telegraph),
// leap (the airborne dome, motion swooshes and all — but NOT its
// painted shadow ellipse; the draw lays a live shadow on the
// ground instead) and death (the water burst, droplets included).
export const SLIME_FRAMES = ['slime-base', 'slime-hurt', 'slime-angry', 'slime-leap', 'slime-death'];

// Each frame's own canvas (w x h px) and the rows its BODY (the
// dome) spans within it, plus the body-centre column that stands
// on the slime's x — the same per-frame geometry contract as
// KARL_SLASH_GEO. The death burst's "body" is the splash itself;
// its scaleMul spreads the burst wider than a body would draw.
export const SLIME_GEO = { 'slime-base': { w: 380, h: 241, bodyTop: 11, bodyBot: 229, anchorX: 191 }, 'slime-hurt': { w: 416, h: 303, bodyTop: 75, bodyBot: 293, anchorX: 223 }, 'slime-angry': { w: 353, h: 240, bodyTop: 10, bodyBot: 229, anchorX: 182 }, 'slime-leap': { w: 352, h: 291, bodyTop: 7, bodyBot: 226, anchorX: 198 }, 'slime-death': { w: 505, h: 277, bodyTop: 50, bodyBot: 268, anchorX: 348, scaleMul: 1.25 } };

// The slime's drawn body height in world px — a small monster
// beside the Wardens' 66.
export const SLIME_BODY_H = 44;

const slimeSet = loadSet(SLIME_URLS, SLIME_FRAMES);
export const slimeSettled = slimeSet.settled;
export function slimeSprite(name) { return slimeSet.ready[name] ? slimeSet.imgs[name] : null; }
export function slimeDecoded(name) { return !!slimeSet.ready[name]; }

// ——— The zombie (step 12) ———

// The labelled groups, Run included but dormant (see the
// header note): no draw path ever selects a run frame.
export const ZOMBIE_FRAMES = ['zombie-idle', 'zombie-walk-1', 'zombie-walk-2', 'zombie-walk-3', 'zombie-run-1', 'zombie-run-2', 'zombie-run-3', 'zombie-attack-1', 'zombie-attack-2', 'zombie-attack-3', 'zombie-attack-4', 'zombie-attack-5', 'zombie-hurt-1', 'zombie-hurt-2', 'zombie-hurt-3', 'zombie-death-1', 'zombie-death-2', 'zombie-death-3', 'zombie-death-4', 'zombie-death-5', 'zombie-death-6', 'zombie-death-7', 'zombie-death-8'];

// Each frame's own canvas and the rows its BODY spans, plus
// the anchor column (the alpha centroid of its bottom rows —
// the legs while it stands, the corpse's base once it falls)
// that stands on the zombie's x. Standing frames: bodyTop 0
// and bodyBot 263 in every one — the body is 264 rows tall
// everywhere, by the offline normalization. Death frames keep
// their own shrinking rows at the one shared scale.
export const ZOMBIE_GEO = { 'zombie-idle': { w: 168, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 63 }, 'zombie-walk-1': { w: 178, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 71 }, 'zombie-walk-2': { w: 182, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 71 }, 'zombie-walk-3': { w: 180, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 60 }, 'zombie-run-1': { w: 230, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 71 }, 'zombie-run-2': { w: 192, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 48 }, 'zombie-run-3': { w: 229, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 88 }, 'zombie-attack-1': { w: 164, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 77 }, 'zombie-attack-2': { w: 233, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 92 }, 'zombie-attack-3': { w: 285, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 104 }, 'zombie-attack-4': { w: 313, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 90 }, 'zombie-attack-5': { w: 314, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 101 }, 'zombie-hurt-1': { w: 190, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 86 }, 'zombie-hurt-2': { w: 148, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 61 }, 'zombie-hurt-3': { w: 158, h: 264, bodyTop: 0, bodyBot: 263, anchorX: 95 }, 'zombie-death-1': { w: 170, h: 284, bodyTop: 0, bodyBot: 283, anchorX: 71 }, 'zombie-death-2': { w: 146, h: 240, bodyTop: 0, bodyBot: 239, anchorX: 55 }, 'zombie-death-3': { w: 177, h: 205, bodyTop: 0, bodyBot: 204, anchorX: 63 }, 'zombie-death-4': { w: 223, h: 162, bodyTop: 0, bodyBot: 161, anchorX: 73 }, 'zombie-death-5': { w: 208, h: 129, bodyTop: 0, bodyBot: 128, anchorX: 99 }, 'zombie-death-6': { w: 230, h: 88, bodyTop: 0, bodyBot: 87, anchorX: 108 }, 'zombie-death-7': { w: 214, h: 71, bodyTop: 0, bodyBot: 70, anchorX: 109 }, 'zombie-death-8': { w: 240, h: 72, bodyTop: 0, bodyBot: 71, anchorX: 123 } };

// The zombie's drawn body height in world px — and the canvas
// rows it spans. STEP 16: at step 12 this was 66, the heroes'
// own number, yet beside them the zombie read SMALL — equal
// height, unequal presence: the chibi Wardens draw ~69 px
// wide of big-headed bulk while the zombie's hunched figure
// drew only ~42 px wide, its 66 px spent on a bent back and
// a low-carried head. The user called it ("itu mah kecil")
// and asked for a body EQUIVALENT to the characters, so the
// zombie is scaled by VISUAL PARITY instead: 88 world px
// standing (a factor of 4/3) — an adult humanoid looming a
// head over the chibi Wardens. Every frame, death included,
// shares the one scale, so the corpse stays at the same
// proportion of the standing height (~0.91x long) as before.
export const ZOMBIE_BODY_H = 88;
export const ZOMBIE_BODY_ROWS = 264;

const zombieSet = loadSet(ZOMBIE_URLS, ZOMBIE_FRAMES);
export const zombieSettled = zombieSet.settled;
export function zombieSprite(name) { return zombieSet.ready[name] ? zombieSet.imgs[name] : null; }
export function zombieDecoded(name) { return !!zombieSet.ready[name]; }

// ——— The goblin (step 13) ———

// The labelled groups. The Walk frames are loaded but unused:
// the goblin travels on the Run cycle (see the header note).
export const GOBLIN_FRAMES = ['goblin-idle-1', 'goblin-idle-2', 'goblin-idle-3', 'goblin-idle-4', 'goblin-walk-1', 'goblin-walk-2', 'goblin-walk-3', 'goblin-run-1', 'goblin-run-2', 'goblin-run-3', 'goblin-attack-1', 'goblin-attack-2', 'goblin-hurt', 'goblin-death'];

// Each frame's own canvas and the rows its BODY spans (head
// to feet, measured by the green-head method — see the header
// note), plus the anchor column that stands on the goblin's
// x. Standing frames: the body spans 215-216 rows in every
// one. The club arcs overflow their canvases on purpose.
export const GOBLIN_GEO = { 'goblin-idle-1': { w: 158, h: 221, bodyTop: 5, bodyBot: 219, anchorX: 90 }, 'goblin-idle-2': { w: 157, h: 221, bodyTop: 5, bodyBot: 219, anchorX: 90 }, 'goblin-idle-3': { w: 141, h: 219, bodyTop: 3, bodyBot: 218, anchorX: 95 }, 'goblin-idle-4': { w: 164, h: 219, bodyTop: 3, bodyBot: 218, anchorX: 86 }, 'goblin-walk-1': { w: 176, h: 221, bodyTop: 5, bodyBot: 219, anchorX: 87 }, 'goblin-walk-2': { w: 148, h: 221, bodyTop: 5, bodyBot: 219, anchorX: 86 }, 'goblin-walk-3': { w: 148, h: 221, bodyTop: 5, bodyBot: 219, anchorX: 68 }, 'goblin-run-1': { w: 203, h: 223, bodyTop: 7, bodyBot: 221, anchorX: 106 }, 'goblin-run-2': { w: 188, h: 225, bodyTop: 9, bodyBot: 223, anchorX: 104 }, 'goblin-run-3': { w: 181, h: 223, bodyTop: 7, bodyBot: 221, anchorX: 102 }, 'goblin-attack-1': { w: 311, h: 226, bodyTop: 10, bodyBot: 224, anchorX: 200 }, 'goblin-attack-2': { w: 393, h: 251, bodyTop: 35, bodyBot: 250, anchorX: 254 }, 'goblin-hurt': { w: 272, h: 235, bodyTop: 19, bodyBot: 233, anchorX: 151 }, 'goblin-death': { w: 427, h: 144, bodyTop: 46, bodyBot: 142, anchorX: 301 } };

// The goblin's drawn body height in world px — a small
// creature: between the slime's 44 and the Wardens' 66 — and
// the canvas rows it spans.
export const GOBLIN_BODY_H = 54;
export const GOBLIN_BODY_ROWS = 216;

const goblinSet = loadSet(GOBLIN_URLS, GOBLIN_FRAMES);
export const goblinSettled = goblinSet.settled;
export function goblinSprite(name) { return goblinSet.ready[name] ? goblinSet.imgs[name] : null; }
export function goblinDecoded(name) { return !!goblinSet.ready[name]; }

// The boot sequence's "art is ready" gate now means ALL THREE
// Wardens' frames plus Karlsefni's slash pair plus his ulti
// wave plus Rosaline's
// shot pair plus Tyne's cast pair plus her ulti orb sequence
// plus Rosaline's ulti pose-and-arrow set (step 11)
// plus the zombie's twenty-three (step 12)
// plus the goblin's fourteen (step 13)
// plus the slime's five; the
// other settle flags stay instant, as the wipe left them.
export const spritesSettled = Promise.all([karlSettled, rosaSettled, tyneSettled, karlSlashSettled, karlUltiSettled, rosaShootSettled, tyneCastSettled, tyneUltiSettled, rosaUltiSettled, slimeSettled, zombieSettled, goblinSettled]);
export const artSettled = spritesSettled;

export function karlSprite(name) { return karlSet.ready[name] ? karlSet.imgs[name] : null; }
export function rosaSprite(name) { return rosaSet.ready[name] ? rosaSet.imgs[name] : null; }
export function tyneSprite(name) { return tyneSet.ready[name] ? tyneSet.imgs[name] : null; }
export function karlSlashSprite(name) { return karlSlashSet.ready[name] ? karlSlashSet.imgs[name] : null; }
export function karlUltiSprite(name) { return karlUltiSet.ready[name] ? karlUltiSet.imgs[name] : null; }
export function tyneUltiSprite(name) { return tyneUltiSet.ready[name] ? tyneUltiSet.imgs[name] : null; }
export function rosaShootSprite(name) { return rosaShootSet.ready[name] ? rosaShootSet.imgs[name] : null; }
export function tyneCastSprite(name) { return tyneCastSet.ready[name] ? tyneCastSet.imgs[name] : null; }
export function rosaUltiSprite(name) { return rosaUltiSet.ready[name] ? rosaUltiSet.imgs[name] : null; }

const HERO_SETS = { karlsefni: karlSet, rosaline: rosaSet, tyne: tyneSet };

// Per-hero attack art (steps 4, 6 and 7): the two-frame set a
// hero wears mid-attack, with its per-pose geometry. Karlsefni's
// is the melee slash; Rosaline's is the bow shot; Tyne's is the
// star-cast. One draw path serves all three — same ground line,
// same body size.
const ATK_ART = { karlsefni: { frames: KARL_SLASH_FRAMES, geo: KARL_SLASH_GEO, get: karlSlashSprite }, rosaline: { frames: ROSA_SHOOT_FRAMES, geo: ROSA_SHOOT_GEO, get: rosaShootSprite }, tyne: { frames: TYNE_CAST_FRAMES, geo: TYNE_CAST_GEO, get: tyneCastSprite } };

// Draws the current Warden in the world layer: feet on the ground
// line (p.y + 26, the shell's old convention), facing flipped by
// p.face, idle frame when standing, the walk cycle while moving.
// Standing still means ONE fixed frame — no cycling, ever (the
// user's rule). All three heroes draw through this one path at one
// size. Mid-attack (Karlsefni's slash, step 4; Rosaline's shot,
// step 6; Tyne's cast, step 7) the hero draws her attack pose
// instead: same ground line, same body size — the pose's own
// canvas is scaled by the shared 66/397 and pinned by its
// measured baseline row and anchor column, so the arc/bow/book
// swings wide while the body inside it neither grows nor leaves
// the ground.
export function drawHeroSprite(ctx, world, p) { if (!p) return;
  const set = HERO_SETS[p.id] ?? karlSet;
  // Rosaline's ultimate release pose (step 11) outranks her
  // shot poses while p.ultiT runs: same draw path, her own GEO.
  const ultiPose = p.id === 'rosaline' && (p.ultiT || 0) > 0 ? { frames: ROSA_ULTI_FRAMES, geo: ROSA_ULTI_GEO, get: rosaUltiSprite } : null;
  const atk = ultiPose || ((p.atkT || 0) > 0 ? ATK_ART[p.id] : null);
  const atkName = atk ? (ultiPose ? atk.frames[0] : atk.frames[p.atkFrame ? 1 : 0]) : null;
  const atkImg = atkName ? atk.get(atkName) : null;
  const name = atkImg ? atkName : (p.moving ? set.walk[Math.floor(p.walkPhase || 0) % set.walk.length] : set.idle);
  p.spriteName = name; p.flipX = (p.face || 1) < 0;
  const feetY = p.y + 26;
  ctx.fillStyle = 'rgba(2,6,16,0.42)'; ctx.beginPath(); ctx.ellipse(p.x, feetY + 2, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
  if (atkImg) { const g = atk.geo[atkName]; const k = HERO_BODY_H / BODY_ROWS; const W = g.w * k; const H = g.h * k;
    ctx.save(); ctx.translate(Math.round(p.x), Math.round(feetY)); ctx.scale(p.face || 1, 1);
    ctx.drawImage(atkImg, -g.anchorX * k, -(g.bodyBot + 1) * k, W, H); ctx.restore();
    p.spriteRect = { w: W, h: H, bodyH: HERO_BODY_H }; return; }
  const img = set.ready[name] ? set.imgs[name] : null; if (!img) return;
  const H = HERO_BODY_H * CANVAS_H / BODY_ROWS; const W = H * CANVAS_W / CANVAS_H;
  ctx.save(); ctx.translate(Math.round(p.x), Math.round(feetY)); ctx.scale(p.face || 1, 1);
  ctx.drawImage(img, -W / 2, -H * BASE_EDGE / CANVAS_H, W, H); ctx.restore();
  p.spriteRect = { w: W, h: H, bodyH: HERO_BODY_H };
}

// ——— Foe health bars (REBUILD STEP 15) ———

// The user's word: "nah tiap monster ada bar darahnya dong" —
// every monster wears its health over its head. A slim bar
// floats just above the foe's body: a dark backing, a maroon
// track where health is already lost, and a fill in the foe's
// own colour — the same hues as its minimap dot (slime violet,
// zombie green, goblin amber) — draining with the REAL hp the
// damage system uses. Each foe's own draw path calls this in
// the same breath as its sprite, with the body's top edge for
// that exact frame, so the bar rides hops and leaps without
// ever detaching and never covers the sprite itself. It shows
// the whole time the foe lives (a fresh foe shows a full bar)
// and is gone the moment the death sequence starts. The bar's
// width is the foe's body size — the same BODY_H number its
// sprite is normalized by — and its geometry is left on
// e.hpBar in world coordinates for the tests.
export const FOE_BAR_H = 8;
export const FOE_BAR_GAP = 6;
export const FOE_BAR_COLORS = { slime: '#8f7bff', zombie: '#7ec850', goblin: '#ffb03a', knight: '#d7dce8', dragon: '#ff5a3c' };
function drawFoeHealthBar(ctx, e, cx, bodyTopY, w) {
  const frac = Math.max(0, Math.min(1, (e.hp || 0) / (e.maxHp || 1)));
  const x = cx - w / 2; const y = bodyTopY - FOE_BAR_GAP - FOE_BAR_H;
  ctx.fillStyle = 'rgba(4, 3, 10, 0.78)'; ctx.fillRect(x - 1, y - 1, w + 2, FOE_BAR_H + 2);
  ctx.fillStyle = 'rgba(88, 20, 28, 0.88)'; ctx.fillRect(x, y, w, FOE_BAR_H);
  if (frac > 0) { ctx.fillStyle = FOE_BAR_COLORS[e.kind] || '#ff5040'; ctx.fillRect(x + 1, y + 1, (w - 2) * frac, FOE_BAR_H - 2); }
  e.hpBar = { x, y, w, h: FOE_BAR_H, frac, top: bodyTopY };
}

// Red silhouette copies of the slime frames, built once per frame:
// the hit feedback — a foe flashes red while its flashT decays
// (the pre-wipe game's universal rule, restored with the slime).
const slimeRedCache = {};
function slimeRed(name) { if (slimeRedCache[name]) return slimeRedCache[name]; const img = slimeSet.ready[name] ? slimeSet.imgs[name] : null; if (!img) return null;
  const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const c2 = cv.getContext('2d'); c2.drawImage(img, 0, 0); c2.globalCompositeOperation = 'source-in'; c2.fillStyle = '#ff3030'; c2.fillRect(0, 0, cv.width, cv.height); slimeRedCache[name] = cv; return cv; }

// Draws one Gloomslick in the world layer: the frame follows the
// foe's state (enemies.js) — the burst while it dies, the airborne
// dome mid-leap, the hurt dome while its hit-flash burns, the
// angry dome through the wind-up, the plain dome otherwise. Every
// frame is scaled by its own measured body rows, so the dome
// measures SLIME_BODY_H world px in all of them; the body's
// baseline row pins to the ground line (lifted by e.lift while it
// hops or leaps), over a live ground shadow that shrinks as it
// rises. Jelly on top: the wind-up squashes down and out, a hop
// stretches a touch. The art faces front — no mirroring.
export function drawSlimeSprite(ctx, world, e) { if (!e) return;
  const name = e.dead ? 'slime-death' : e.state === 'leap' ? 'slime-leap' : (e.flashT || 0) > 0 ? 'slime-hurt' : e.state === 'windup' ? 'slime-angry' : 'slime-base';
  e.spriteName = name;
  const img = slimeSprite(name); if (!img) { e.spriteRect = null; e.hpBar = null; return; }
  const g = SLIME_GEO[name]; const bodyRows = g.bodyBot - g.bodyTop + 1; const k = SLIME_BODY_H / bodyRows * (g.scaleMul || 1);
  let sx = 1, sy = 1; if (!e.dead) { if (e.state === 'windup') { sy = 0.86; sx = 1.1; } else if ((e.lift || 0) > 2) { sy = 1.05; sx = 0.97; } }
  const W = g.w * k * sx; const H = g.h * k * sy;
  const groundY = e.y + 26; const lift = e.lift || 0;
  const shScale = Math.max(0.45, 1 - lift / 170); ctx.fillStyle = `rgba(2,6,16,${0.42 * shScale})`; ctx.beginPath(); ctx.ellipse(e.x, groundY + 2, 17 * shScale + 4, 4.5 * shScale, 0, 0, Math.PI * 2); ctx.fill();
  const dx = e.x - g.anchorX * k * sx; const dy = (groundY - lift) - (g.bodyBot + 1) * k * sy;
  ctx.drawImage(img, dx, dy, W, H);
  if (!e.dead && (e.flashT || 0) > 0) { const red = slimeRed(name); if (red) { ctx.save(); ctx.globalAlpha = 0.75 * Math.min(1, e.flashT / 0.2); ctx.drawImage(red, dx, dy, W, H); ctx.restore(); } }
  // Step 15: the health bar rides the dome — its top edge for
  // THIS frame (lift and jelly squash included), so the bar
  // follows hops and leaps exactly. Gone once it is dead.
  if (!e.dead) drawFoeHealthBar(ctx, e, e.x, dy + g.bodyTop * k * sy, SLIME_BODY_H); else e.hpBar = null;
  e.spriteRect = { w: W, h: H, bodyH: SLIME_BODY_H * (g.scaleMul || 1) };
}

// Red silhouette copies of the zombie frames, the same hit
// feedback as the slime's.
const zombieRedCache = {};
function zombieRed(name) { if (zombieRedCache[name]) return zombieRedCache[name]; const img = zombieSet.ready[name] ? zombieSet.imgs[name] : null; if (!img) return null;
  const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const c2 = cv.getContext('2d'); c2.drawImage(img, 0, 0); c2.globalCompositeOperation = 'source-in'; c2.fillStyle = '#ff3030'; c2.fillRect(0, 0, cv.width, cv.height); zombieRedCache[name] = cv; return cv; }

// Draws one zombie in the world layer (step 12): the frame
// follows the foe's state (enemies.js) — the collapse sequence
// while it dies (eight frames across ZOMBIE_DEATH_T), a hurt
// frame while its hit-flash burns, the swipe's five frames
// through an attack, the walk cycle while it shambles, the
// idle frame at rest. EVERY frame draws at the one constant
// scale k = 88/264 (step 16: raised from 66/264 for visual
// parity with the Wardens — see ZOMBIE_BODY_H) with its
// baseline row pinned to the ground
// line, so the body measures 88 world px tall in every living
// frame and the corpse stays at the same scale lying down —
// the size rule, kept. The art faces right; facing flips it.
export function drawZombieSprite(ctx, world, e) { if (!e) return;
  let name;
  if (e.dead) { const prog = Math.max(0, Math.min(1, 1 - (e.deathT || 0) / ZOMBIE_DEATH_T)); name = `zombie-death-${1 + Math.min(7, Math.floor(prog * 8))}`; }
  else if ((e.flashT || 0) > 0) name = `zombie-hurt-${1 + (Math.floor((world.time || 0) * 7) % 3)}`;
  else if (e.state === 'attack') name = `zombie-attack-${1 + Math.min(4, Math.floor((e.atkAnim || 0) * 5))}`;
  else if (e.state === 'walk') name = `zombie-walk-${1 + (Math.floor(e.walkPhase || 0) % 3)}`;
  else name = 'zombie-idle';
  e.spriteName = name;
  const img = zombieSprite(name); if (!img) { e.spriteRect = null; e.hpBar = null; return; }
  const g = ZOMBIE_GEO[name]; const k = ZOMBIE_BODY_H / ZOMBIE_BODY_ROWS;
  const W = g.w * k; const H = g.h * k;
  const groundY = e.y + 26;
  ctx.fillStyle = 'rgba(2,6,16,0.42)'; ctx.beginPath(); ctx.ellipse(e.x, groundY + 2, 17, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(Math.round(e.x), Math.round(groundY)); ctx.scale(e.face || 1, 1);
  ctx.drawImage(img, -g.anchorX * k, -(g.bodyBot + 1) * k, W, H);
  if (!e.dead && (e.flashT || 0) > 0) { const red = zombieRed(name); if (red) { ctx.save(); ctx.globalAlpha = 0.75 * Math.min(1, e.flashT / 0.2); ctx.drawImage(red, -g.anchorX * k, -(g.bodyBot + 1) * k, W, H); ctx.restore(); } }
  ctx.restore();
  // Step 15: the health bar over the head — the body's top
  // edge at the one shared scale. Gone once it is dead.
  if (!e.dead) drawFoeHealthBar(ctx, e, e.x, groundY - (g.bodyBot + 1 - g.bodyTop) * k, ZOMBIE_BODY_H); else e.hpBar = null;
  e.spriteRect = { w: W, h: H, bodyH: (g.bodyBot - g.bodyTop + 1) * k };
}

// Red silhouette copies of the goblin frames, the same hit
// feedback as the other foes'.
const goblinRedCache = {};
function goblinRed(name) { if (goblinRedCache[name]) return goblinRedCache[name]; const img = goblinSet.ready[name] ? goblinSet.imgs[name] : null; if (!img) return null;
  const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const c2 = cv.getContext('2d'); c2.drawImage(img, 0, 0); c2.globalCompositeOperation = 'source-in'; c2.fillStyle = '#ff3030'; c2.fillRect(0, 0, cv.width, cv.height); goblinRedCache[name] = cv; return cv; }

// Draws one goblin in the world layer (step 13): the frame
// follows the foe's state (enemies.js) — the face-down death
// frame while it lies dead, the hurt frame while its
// hit-flash burns, the swing's own frame through an attack
// (Attack 1 and Attack 2 alternate, enemies.js keeps the
// count on e.swing), the Run cycle while it closes in, and
// the slow Idle cycle at rest — coiled into a crouch squash
// through the wind-up, the telegraph before the swing. EVERY
// frame draws at the one constant scale k = 54/216 with its
// baseline row pinned to the ground line, so the body
// measures 54 world px in every living frame and the corpse
// stays at the same scale lying down — the size rule, kept.
// The art faces right; facing flips it.
export function drawGoblinSprite(ctx, world, e) { if (!e) return;
  let name;
  if (e.dead) name = 'goblin-death';
  else if ((e.flashT || 0) > 0) name = 'goblin-hurt';
  else if (e.state === 'attack') name = `goblin-attack-${1 + (e.swing || 0)}`;
  else if (e.state === 'run') name = `goblin-run-${1 + (Math.floor(e.runPhase || 0) % 3)}`;
  else name = `goblin-idle-${1 + (Math.floor((world.time || 0) * 2.2) % 4)}`;
  e.spriteName = name;
  const img = goblinSprite(name); if (!img) { e.spriteRect = null; e.hpBar = null; return; }
  const g = GOBLIN_GEO[name]; const k = GOBLIN_BODY_H / GOBLIN_BODY_ROWS;
  let sx = 1, sy = 1; if (!e.dead && e.state === 'windup') { sy = 0.88; sx = 1.07; }
  const W = g.w * k * sx; const H = g.h * k * sy;
  const groundY = e.y + 26;
  ctx.fillStyle = 'rgba(2,6,16,0.42)'; ctx.beginPath(); ctx.ellipse(e.x, groundY + 2, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(Math.round(e.x), Math.round(groundY)); ctx.scale((e.face || 1) * sx, sy);
  ctx.drawImage(img, -g.anchorX * k, -(g.bodyBot + 1) * k, g.w * k, g.h * k);
  if (!e.dead && (e.flashT || 0) > 0) { const red = goblinRed(name); if (red) { ctx.save(); ctx.globalAlpha = 0.75 * Math.min(1, e.flashT / 0.2); ctx.drawImage(red, -g.anchorX * k, -(g.bodyBot + 1) * k, g.w * k, g.h * k); ctx.restore(); } }
  ctx.restore();
  // Step 15: the health bar over the head — the body's top
  // edge for this frame (the wind-up squash included). Gone
  // once it is dead.
  if (!e.dead) drawFoeHealthBar(ctx, e, e.x, groundY - (g.bodyBot + 1 - g.bodyTop) * k * sy, GOBLIN_BODY_H); else e.hpBar = null;
  e.spriteRect = { w: W, h: H, bodyH: (g.bodyBot - g.bodyTop + 1) * k };
}

// The heroes' loosed projectiles (step 6, step 7), drawn in the
// world layer over the Warden. Rosaline's fire arrow is a glowing
// streak in her fire colours — a wide soft halo, a hot orange
// shaft and a white-gold core — tipped with a bright arrowhead
// and flickering as it flies. Tyne's star-bolt is a violet orb
// with a turning four-point star sparkle at its heart. Both are
// code-drawn; the flight and the hit live in player.js's
// updateArrows.
export function drawProjectiles(ctx, world) { const t = world.time || 0;
  for (const a of world.bullets || []) { if (!a) continue;
    if (a.kind === 'star-bolt') { const flick = 0.85 + 0.3 * Math.sin(t * 41 + a.x * 0.3);
      ctx.save(); ctx.translate(a.x, a.y);
      ctx.fillStyle = `rgba(150,90,255,${0.28 * flick})`; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(176,120,255,${0.9 * flick})`; ctx.beginPath(); ctx.arc(0, 0, 6.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f4ecff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(t * 2.6 + a.x * 0.02); ctx.fillStyle = `rgba(230,214,255,${0.85 * flick})`;
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(2.1, -2.1); ctx.lineTo(11, 0); ctx.lineTo(2.1, 2.1); ctx.lineTo(0, 11); ctx.lineTo(-2.1, 2.1); ctx.lineTo(-11, 0); ctx.lineTo(-2.1, -2.1); ctx.closePath(); ctx.fill();
      ctx.restore(); continue; }
    if (a.kind !== 'fire-arrow') continue;
    const ang = Math.atan2(a.vy, a.vx); const flick = 0.85 + 0.3 * Math.sin(t * 47 + a.x * 0.35);
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang);
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(255,64,10,${0.30 * flick})`; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(8, 0); ctx.stroke();
    ctx.strokeStyle = `rgba(255,128,26,${0.85 * flick})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(10, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,236,170,0.95)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(11, 0); ctx.stroke();
    ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(9, -4.4); ctx.lineTo(11.5, 0); ctx.lineTo(9, 4.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,170,60,${0.8 * flick})`; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-27, -3.4); ctx.lineTo(-24.5, 0); ctx.lineTo(-27, 3.4); ctx.closePath(); ctx.fill();
    ctx.restore(); } }

// ——— Karlsefni's Flying Slash (step 8) ———

// The crescent's native canvas (its keyed crop) and the length
// it is drawn at in the world: ULTI_WAVE_LEN world px = 1.8x
// the Warden's 66-px body height — medium, fitted to his
// posture, an extension of his own slash. The drawn height
// follows the art's own aspect (393/1532), ~31 world px.
export const KARL_ULTI_GEO = { w: 1532, h: 393 };
export const ULTI_WAVE_LEN = 120;
export const ULTI_WAVE_H = ULTI_WAVE_LEN * KARL_ULTI_GEO.h / KARL_ULTI_GEO.w;

// Tyne's Starfall orb (step 10): the sequence's shared canvas
// and the width it is drawn at in the world — TYNE_ULTI_W world
// px = exactly 2x her 66-px body height, so the peak burst is
// proportionate to her posture, not screen-filling. The drawn
// height follows the canvas aspect (~149 world px). Every
// frame draws at this same size: the growth is IN the art.
export const TYNE_ULTI_GEO = { w: 306, h: 346 };
export const TYNE_ULTI_W = 132;
export const TYNE_ULTI_H = TYNE_ULTI_W * TYNE_ULTI_GEO.h / TYNE_ULTI_GEO.w;

// The loosed Flying Slash waves (world.slashWaves), drawn in
// the world layer over the projectiles. Each wave is centred on
// its position, flipped horizontally by its travel direction
// and tilted by its climb or dive — the tilt is measured
// against the horizontal it travels, so the crescent leans into
// its curve but never turns upside down. Its flight and hit
// live in player.js's updateUltiWaves.
// Step 10 adds Tyne's Starfall orbs to the same list and draw:
// the orb is centred on its position and plays the growth
// sequence as it flies (player.js advances w.frame through
// frames 1-9); on connect it leaves a 'tyne-orb-burst' — the
// sequence's last frame, the dissipating swirls, fading out
// over its short life where the foe stood.
// Step 11 adds Rosaline's Crimson Rose arrow: centred on its
// position and ROTATED to its heading (like her code-drawn
// basic arrows), playing its three stages as it flies
// (player.js advances w.stage); the art points +x, so the
// rotation alone aims it, nose first, at any heading.
export function drawSlashWaves(ctx, world) {
  for (const w of world.slashWaves || []) { if (!w) continue;
    if (w.kind === 'rosa-arrow') {
      const stage = Math.max(0, Math.min(2, w.stage ?? 0));
      const img = rosaUltiSprite(`rosa-arrow-${stage + 1}`); if (!img) { w.spriteRect = null; continue; }
      const W = ROSA_ARROW_GEO.w * ROSA_ARROW_K; const H = ROSA_ARROW_GEO.h * ROSA_ARROW_K;
      ctx.save(); ctx.translate(w.x, w.y); ctx.rotate(Math.atan2(w.vy || 0, w.vx || 1));
      ctx.drawImage(img, -W / 2, -H / 2, W, H);
      ctx.restore();
      w.spriteRect = { w: W, h: H, stage }; continue; }
    if (w.kind === 'tyne-orb' || w.kind === 'tyne-orb-burst') {
      const frame = w.kind === 'tyne-orb-burst' ? 10 : Math.max(1, Math.min(9, (w.frame ?? 0) + 1));
      const img = tyneUltiSprite(`tyne-ulti-${frame}`); if (!img) { w.spriteRect = null; continue; }
      ctx.save(); ctx.translate(w.x, w.y);
      if (w.kind === 'tyne-orb-burst') ctx.globalAlpha = Math.max(0, Math.min(1, (w.life ?? 0) / (w.maxLife || 0.3)));
      ctx.drawImage(img, -TYNE_ULTI_W / 2, -TYNE_ULTI_H / 2, TYNE_ULTI_W, TYNE_ULTI_H);
      ctx.restore();
      w.spriteRect = { w: TYNE_ULTI_W, h: TYNE_ULTI_H, frame }; continue; }
    if (w.kind !== 'flying-slash') continue;
    const img = karlUltiSprite('karl-ulti-wave'); if (!img) { w.spriteRect = null; continue; }
    const dirX = (w.vx || 0) >= 0 ? 1 : -1;
    const tilt = Math.max(-0.6, Math.min(0.6, Math.atan2(w.vy || 0, Math.abs(w.vx || 1))));
    ctx.save(); ctx.translate(w.x, w.y); ctx.scale(dirX, 1); ctx.rotate(dirX * tilt);
    ctx.drawImage(img, -ULTI_WAVE_LEN / 2, -ULTI_WAVE_H / 2, ULTI_WAVE_LEN, ULTI_WAVE_H);
    ctx.restore();
    w.spriteRect = { w: ULTI_WAVE_LEN, h: ULTI_WAVE_H }; } }

// ——— The ultimate button's icon (step 17) ———

// Draws the ACTIVE hero's ultimate art centred at (cx, cy),
// contain-fitted inside `size` px: Karlsefni's Flying Slash
// crescent, Tyne's Starfall orb at its fullest flying frame,
// Rosaline's Crimson Rose arrow at its longest stage. The
// step-17 HUD draws it inside the round Nova button — dimmed
// while the meter charges, bright at full — so the button
// wears the very art Q will loose. Returns false while the
// art is still loading.
export function drawUltiIcon(ctx, heroId, cx, cy, size) {
  let img = null, gw = 1, gh = 1;
  if (heroId === 'tyne') { img = tyneUltiSprite('tyne-ulti-9'); gw = TYNE_ULTI_GEO.w; gh = TYNE_ULTI_GEO.h; }
  else if (heroId === 'rosaline') { img = rosaUltiSprite('rosa-arrow-3'); gw = ROSA_ARROW_GEO.w; gh = ROSA_ARROW_GEO.h; }
  else { img = karlUltiSprite('karl-ulti-wave'); gw = KARL_ULTI_GEO.w; gh = KARL_ULTI_GEO.h; }
  if (!img) return false;
  const k = Math.min(size / gw, size / gh); const w = gw * k, h = gh * k;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h); return true;
}
export const KNIGHT_GEO = { 'knight-idle-1': { w: 131, h: 169, bodyTop: 2, bodyBot: 166, anchorX: 71 }, 'knight-idle-2': { w: 104, h: 160, bodyTop: 2, bodyBot: 157, anchorX: 57 }, 'knight-idle-3': { w: 97, h: 158, bodyTop: 2, bodyBot: 155, anchorX: 47 }, 'knight-idle-4': { w: 100, h: 161, bodyTop: 2, bodyBot: 158, anchorX: 47 }, 'knight-walk-1': { w: 115, h: 170, bodyTop: 2, bodyBot: 167, anchorX: 61 }, 'knight-walk-2': { w: 91, h: 165, bodyTop: 2, bodyBot: 162, anchorX: 43 }, 'knight-walk-3': { w: 109, h: 164, bodyTop: 2, bodyBot: 161, anchorX: 47 }, 'knight-walk-4': { w: 111, h: 168, bodyTop: 2, bodyBot: 165, anchorX: 48 }, 'knight-run-1': { w: 159, h: 153, bodyTop: 2, bodyBot: 150, anchorX: 61 }, 'knight-run-2': { w: 126, h: 162, bodyTop: 2, bodyBot: 159, anchorX: 38 }, 'knight-run-3': { w: 126, h: 161, bodyTop: 2, bodyBot: 158, anchorX: 49 }, 'knight-attack-1': { w: 160, h: 182, bodyTop: 2, bodyBot: 179, anchorX: 73 }, 'knight-attack-2': { w: 195, h: 177, bodyTop: 2, bodyBot: 174, anchorX: 125 }, 'knight-attack-3': { w: 138, h: 208, bodyTop: 2, bodyBot: 205, anchorX: 72 }, 'knight-attack-4': { w: 234, h: 187, bodyTop: 2, bodyBot: 184, anchorX: 115 }, 'knight-hurt-1': { w: 135, h: 135, bodyTop: 2, bodyBot: 132, anchorX: 55 }, 'knight-hurt-2': { w: 135, h: 135, bodyTop: 2, bodyBot: 132, anchorX: 55 }, 'knight-death': { w: 281, h: 85, bodyTop: 2, bodyBot: 82, anchorX: 152 } };

export const DRAGON_GEO = { 'dragon-idle-1': { w: 264, h: 235, bodyTop: 2, bodyBot: 232, anchorX: 129 }, 'dragon-idle-2': { w: 222, h: 184, bodyTop: 2, bodyBot: 181, anchorX: 99 }, 'dragon-idle-3': { w: 228, h: 184, bodyTop: 2, bodyBot: 181, anchorX: 105 }, 'dragon-walk-1': { w: 227, h: 151, bodyTop: 2, bodyBot: 148, anchorX: 103 }, 'dragon-walk-2': { w: 229, h: 145, bodyTop: 2, bodyBot: 142, anchorX: 94 }, 'dragon-walk-3': { w: 225, h: 143, bodyTop: 2, bodyBot: 140, anchorX: 101 }, 'dragon-walk-4': { w: 276, h: 141, bodyTop: 2, bodyBot: 138, anchorX: 133 }, 'dragon-walk-5': { w: 213, h: 142, bodyTop: 2, bodyBot: 139, anchorX: 94 }, 'dragon-walk-6': { w: 256, h: 139, bodyTop: 2, bodyBot: 136, anchorX: 107 }, 'dragon-claw-1': { w: 278, h: 189, bodyTop: 2, bodyBot: 186, anchorX: 124 }, 'dragon-claw-2': { w: 270, h: 210, bodyTop: 2, bodyBot: 207, anchorX: 136 }, 'dragon-claw-3': { w: 227, h: 223, bodyTop: 2, bodyBot: 220, anchorX: 135 }, 'dragon-leap-1': { w: 240, h: 175, bodyTop: 2, bodyBot: 172, anchorX: 100 }, 'dragon-leap-2': { w: 221, h: 189, bodyTop: 2, bodyBot: 186, anchorX: 95 }, 'dragon-leap-3': { w: 276, h: 267, bodyTop: 23, bodyBot: 219, anchorX: 110 }, 'dragon-fly': { w: 346, h: 203, bodyTop: 2, bodyBot: 200, anchorX: 140 }, 'dragon-land': { w: 387, h: 197, bodyTop: 2, bodyBot: 194, anchorX: 170 }, 'dragon-slam': { w: 312, h: 202, bodyTop: 2, bodyBot: 199, anchorX: 151 }, 'dragon-shake': { w: 421, h: 199, bodyTop: 2, bodyBot: 196, anchorX: 150 }, 'dragon-breath': { w: 785, h: 217, bodyTop: 2, bodyBot: 214, anchorX: 130 } };

// -----------------------------------------------------------------
// The bosses (steps 21-22, swapped by amendment: knight = wave
// V, dragon = wave X). Same draw law as every foe: ONE scale
// from the reference idle frame's figure rows, each frame's
// own figure bottom pinned to the ground line, flipped around
// the anchor. Knight: 108 world px standing (~1.64x a hero),
// from knight-idle-1's 165 figure rows. Dragon: 165 world px
// of standing silhouette (~2.5x a hero), from dragon-idle-1's
// 231 figure rows. GEO measured from the keyed PNGs (largest
// closed component; the breath/shake/leap anchors hand-set to
// the dragon's body — the flame's mass skewed the medians).
export const KNIGHT_BODY_H = 108;
export const KNIGHT_BODY_ROWS = 165;
export const KNIGHT_BAR_W = 92;
export const DRAGON_BODY_H = 165;
export const DRAGON_BODY_ROWS = 231;
export const DRAGON_BAR_W = 128;
const KNIGHT_FRAMES = ['knight-idle-1', 'knight-idle-2', 'knight-idle-3', 'knight-idle-4', 'knight-walk-1', 'knight-walk-2', 'knight-walk-3', 'knight-walk-4', 'knight-run-1', 'knight-run-2', 'knight-run-3', 'knight-attack-1', 'knight-attack-2', 'knight-attack-3', 'knight-attack-4', 'knight-hurt-1', 'knight-hurt-2', 'knight-death'];
const DRAGON_FRAMES = ['dragon-idle-1', 'dragon-idle-2', 'dragon-idle-3', 'dragon-walk-1', 'dragon-walk-2', 'dragon-walk-3', 'dragon-walk-4', 'dragon-walk-5', 'dragon-walk-6', 'dragon-claw-1', 'dragon-claw-2', 'dragon-claw-3', 'dragon-leap-1', 'dragon-leap-2', 'dragon-leap-3', 'dragon-fly', 'dragon-land', 'dragon-slam', 'dragon-shake', 'dragon-breath'];
const knightSet = loadSet(KNIGHT_URLS, KNIGHT_FRAMES);
const dragonSet = loadSet(DRAGON_URLS, DRAGON_FRAMES);
export const knightSettled = knightSet.settled;
export const dragonSettled = dragonSet.settled;
const knightRedCache = {};
const dragonRedCache = {};
function bossRed(cache, img, name) { if (!img) return null;
  if (!cache[name]) { const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ff2a2a'; x.fillRect(0, 0, c.width, c.height); cache[name] = c; }
  return cache[name]; }

// The shared boss draw: the AI (enemies.js) names the frame
// each tick (e.frameName); the draw mirrors it to
// e.spriteName, pins the feet, lays the hit flash, and floats
// the wide step-15 health bar. The dragon's death is a
// collapse: the crouched land frame sinking and fading over
// its linger (the sheet has no death frames).
function drawBossSprite(ctx, world, e, set, GEO, BODY_H, BODY_ROWS, BAR_W, redCache, deathT) { if (!e) return;
  const name = e.frameName || set.idle; e.spriteName = name;
  const img = set.imgs[name]; const g = GEO[name];
  if (!img || !g) { e.spriteRect = null; e.hpBar = null; return; }
  const k = BODY_H / BODY_ROWS; const W = g.w * k; const H = g.h * k;
  const groundY = e.y + 26; const lift = e.lift || 0;
  const deadSink = e.dead ? (1 - Math.max(0, (e.deathT || 0)) / deathT) * 26 : 0;
  const shadowScale = Math.max(0.35, 1 - lift / 340);
  ctx.fillStyle = 'rgba(2,6,16,0.42)'; ctx.beginPath(); ctx.ellipse(e.x, groundY + 2, BODY_H * 0.42 * shadowScale, BODY_H * 0.075 * shadowScale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(Math.round(e.x), Math.round(groundY - lift + deadSink)); ctx.scale(e.face || 1, 1);
  if (e.dead) ctx.globalAlpha = Math.max(0, (e.deathT || 0) / deathT);
  ctx.drawImage(img, -g.anchorX * k, -(g.bodyBot + 1) * k, W, H);
  if (!e.dead && (e.flashT || 0) > 0) { const red = bossRed(redCache, img, name); if (red) { ctx.save(); ctx.globalAlpha = 0.75 * Math.min(1, e.flashT / 0.2); ctx.drawImage(red, -g.anchorX * k, -(g.bodyBot + 1) * k, W, H); ctx.restore(); } }
  ctx.restore();
  if (!e.dead) drawFoeHealthBar(ctx, e, e.x, groundY - lift - (g.bodyBot + 1 - g.bodyTop) * k, BAR_W); else e.hpBar = null;
  e.spriteRect = { w: W, h: H, bodyH: (g.bodyBot - g.bodyTop + 1) * k };
}
export function drawKnightSprite(ctx, world, e) { drawBossSprite(ctx, world, e, knightSet, KNIGHT_GEO, KNIGHT_BODY_H, KNIGHT_BODY_ROWS, KNIGHT_BAR_W, knightRedCache, 1.5); }
export function drawDragonSprite(ctx, world, e) { drawBossSprite(ctx, world, e, dragonSet, DRAGON_GEO, DRAGON_BODY_H, DRAGON_BODY_ROWS, DRAGON_BAR_W, dragonRedCache, 1.5); }
export function knightSprite(name) { return knightSet.imgs[name] || null; }
export function dragonSprite(name) { return dragonSet.imgs[name] || null; }

// The telegraph (steps 21-22): during a boss wind-up the AI
// leaves e.tele describing where the strike will land — a
// ground zone (knight slash / dragon claw), a lane (dragon
// breath) or a ring (dragon leap target). Pulsing ember-red,
// impossible to miss, gone the moment the strike fires.
export function drawBossTelegraph(ctx, world, e) { const tele = e && e.tele; if (!tele || e.dead) return;
  const groundY = e.y + 26; const pulse = 0.13 + 0.07 * Math.sin((world.time || 0) * 10);
  ctx.save();
  if (tele.kind === 'ring') { const r = tele.r || 100;
    ctx.fillStyle = `rgba(255,64,40,${pulse})`; ctx.strokeStyle = 'rgba(255,110,70,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(tele.x, groundY - 2, r, r * 0.34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tele.x - r * 0.4, groundY - 2 - r * 0.14); ctx.lineTo(tele.x + r * 0.4, groundY - 2 + r * 0.14); ctx.moveTo(tele.x + r * 0.4, groundY - 2 - r * 0.14); ctx.lineTo(tele.x - r * 0.4, groundY - 2 + r * 0.14); ctx.stroke();
  } else { const x0 = Math.min(tele.x0, tele.x1); const x1 = Math.max(tele.x0, tele.x1); const h = tele.kind === 'lane' ? 112 : 138;
    ctx.fillStyle = `rgba(255,64,40,${pulse})`; ctx.fillRect(x0, groundY - h, x1 - x0, h - 4);
    ctx.strokeStyle = 'rgba(255,110,70,0.65)'; ctx.lineWidth = 2; ctx.strokeRect(x0, groundY - h, x1 - x0, h - 4);
  }
  ctx.restore();
}

// Step 26: a dash afterimage — the Warden's frame a moment
// ago, fading where she blurred through. Same draw law as
// drawHeroSprite's plain frames (uniform canvases, feet on
// the ground line), at a ghost alpha.
export function drawHeroAfterimage(ctx, world, g) { const set = HERO_SETS[g.id] ?? karlSet; const img = set.ready[g.spriteName] ? set.imgs[g.spriteName] : null; if (!img) return;
  const H = HERO_BODY_H * CANVAS_H / BODY_ROWS; const W = H * CANVAS_W / CANVAS_H; const feetY = g.y + 26;
  ctx.save(); ctx.globalAlpha = 0.42 * Math.max(0, g.t / (g.maxT || 0.26)); ctx.translate(Math.round(g.x), Math.round(feetY)); ctx.scale(g.face || 1, 1);
  ctx.drawImage(img, -W / 2, -H * BASE_EDGE / CANVAS_H, W, H); ctx.restore(); }
