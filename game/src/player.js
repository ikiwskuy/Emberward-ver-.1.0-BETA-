// player.js — the Warden, steps 1-4 of the user's rebuild
// (2026-11-19).
//
// The character wipe emptied this module the same morning; step 1
// brought Karlsefni back alone, step 2 added An Rosaline beside
// him, and step 3 completes the trio with Tyne Vgernaut — all only
// as walkers: they stand on the ground line, idle on their sheet's
// first frame and walk the four-frame cycle, facing the way they
// move.
// REBUILD STEP 4 (same morning): Karlsefni alone gains his melee
// slash, from the user's own two-frame sheet — a proximity
// auto-attack: when a foe stands within KARL_SLASH_RANGE of him
// (he walked to it, or it walked to him — proximity is proximity)
// he faces it and looses the two-frame slash, at most once per
// KARL_ATK_INTERVAL. The connecting slash applies
// KARL_SLASH_DAMAGE to the nearest foe if that foe carries hp.
// REBUILD STEP 6 (same morning): Rosaline gains her fire-arrow
// shot, from the user's own two-frame sheet — the same proximity
// auto-attack at her long range (ROSA_RANGE): she faces the
// nearest foe, draws (frame 1, ROSA_AIM seconds), then releases
// (frame 2) and a fire arrow flies from her bow to where the foe
// stands at that moment, applying ROSA_DAMAGE through the same
// hp/flashT path as the slash. One shot per ROSA_ATK_INTERVAL —
// a ranged cadence, slower than the blade's.
// REBUILD STEP 7 (same morning): Tyne gains her star-cast, from
// the user's own two-frame sheet — the same machine at her
// MEDIUM range (TYNE_RANGE, between the blade's 120 and the
// bow's 440): she faces the nearest foe, channels (frame 1,
// TYNE_CHANNEL seconds), then casts (frame 2) and a violet
// star-bolt flies from her book to where the foe stands at that
// moment, applying TYNE_DAMAGE through the same path. One cast
// per TYNE_ATK_INTERVAL — between Karlsefni's and Rosaline's
// cadences, like her damage is between theirs. The trio is
// armed; updateRangedShot below is the one machine both ranged
// heroes share.
// REBUILD STEP 8 (same morning): Karlsefni gains his ULTIMATE,
// the Flying Slash — the user's long-standing design, on his own
// new art (the top crescent of his two-effect sheet; the beam
// below it is not used). It rides the Nova meter: the shell's
// player.novaCharge (0..100 all along — the Nova Star pickup and
// the shop's Nova Draught already speak that scale) is now his
// live meter, charged by his own fighting — NOVA_PER_HIT for a
// landed slash, NOVA_PER_KILL more when the slash kills, both
// scaled by the run's Nova Affinity (buffs.novaRatePct). Q (or
// the touch NOVA button, which injects Q) looses ONE crescent
// wave at a FULL meter: it locks the nearest living foe at fire
// time and HOMES to it at any distance, curving as it flies,
// and on connect deals KARL_ULTI_DAMAGE through the same
// hp/flashT path as everything else. The meter empties on use.
// Q on a short meter or an empty field does nothing but blip.
// REBUILD STEP 10 (same morning): Tyne gains HER ultimate, the
// Starfall — the user's word: "sama kayak Hei gitu", the same
// as Karlsefni's. The meter generalises: her own star-bolts now
// charge it as they land (+20 a hit, +20 for a kill, the same
// Nova Affinity scaling — updateArrows credits the bolt's
// owner), and Q at a full meter looses ONE orb from her
// ten-frame sequence: it leaves her hand a small spark, HOMES
// to the nearest living foe at any distance, grows through the
// sequence as it travels (its frame clock is set at launch so
// it arrives near its peak), and bursts on the foe for
// TYNE_ULTI_DAMAGE — the same 8 — leaving the sequence's last
// frame, the dissipating swirls, where it struck. Same lock,
// same retarget rule, same single target. Rosaline still earns
// nothing; her Q is still inert.
// REBUILD STEP 11 (same morning): Rosaline gains HERS, the
// Crimson Rose — the user's word: the bottom row of her sheet
// only, "sama kayak kedua char itu", the same as the other
// two. The meter's generalisation completes: her own fire
// arrows now charge it as they land (updateArrows credits her
// too — all three heroes earn from their own attacks now),
// and Q at a full meter plays her release pose (p.ultiT, drawn
// by sprites.js at her standing size) and looses ONE giant
// crimson arrow: it locks the nearest living foe at any
// distance, HOMES to it while swelling through its three
// stages, and bursts for ROSA_ULTI_DAMAGE — the same 8. Same
// lock, same retarget rule, same single target.
// The inert fields (hull, element) exist only so the dormant
// shell systems that read them (shop.useItem, pickups) stay
// safe and unchanged; nothing displays or spends them.

import { GROUND_Y, VIEW_W } from './config.js';

export const PLAYER_SPEED = 268;
export const PLAYER_RADIUS = 14;

// Karlsefni's melee slash (step 4): reach in world px, damage per
// connecting slash (the pre-wipe blade tuning: ~2.2x a bolt), the
// two-frame animation's length, and the shortest interval between
// slash starts — about two deliberate slashes per second, never a
// flicker.
export const KARL_SLASH_RANGE = 120;
export const KARL_SLASH_DAMAGE = 2.2;
export const KARL_ATK_DUR = 0.26;
export const KARL_ATK_INTERVAL = 0.5;

// Karlsefni's ultimate, the Flying Slash (step 8): the Nova
// meter's scale (the 0..100 the pickups and shop already use),
// what his blade earns it — a landed slash, and the bonus when
// that slash kills (one 6.5-hp Gloomslick, three slashes and
// its kill, fills 80; one more landed slash tops it off — an
// ultimate every few landed slashes) — and the wave itself:
// fast, hard-steering, heavy enough to one-shot the slime.
export const NOVA_MAX = 100;
export const NOVA_PER_HIT = 20;
export const NOVA_PER_KILL = 20;
export const KARL_ULTI_DAMAGE = 8;
export const KARL_ULTI_SPEED = 720;
export const KARL_ULTI_TURN = 7.5;
export const KARL_ULTI_HIT_R = 40;
export const KARL_ULTI_LIFE = 3.2;

// Tyne's ultimate, the Starfall (step 10): the same contract as
// Karlsefni's — the same heavy 8 (a one-shot for the slime), a
// hair slower and harder-steering, a slightly wider connect
// (the peak orb is a big sphere), and the burst remnant's life:
// the dissipating last frame lingers where the orb struck.
export const TYNE_ULTI_DAMAGE = 8;
export const TYNE_ULTI_SPEED = 700;
export const TYNE_ULTI_TURN = 8;
export const TYNE_ULTI_HIT_R = 44;
export const TYNE_ULTI_LIFE = 3.4;
export const TYNE_ULTI_BURST_T = 0.3;

// Rosaline's ultimate, the Crimson Rose (step 11): the same
// contract again — the same heavy 8, Karlsefni's own speed and
// turn (her arrow flies like his wave), a connect radius
// between his and Tyne's, and the release pose's stage time:
// she holds the bottom-row pose while ROSA_ULTI_POSE_T runs.
export const ROSA_ULTI_DAMAGE = 8;
export const ROSA_ULTI_SPEED = 720;
export const ROSA_ULTI_TURN = 7.5;
export const ROSA_ULTI_HIT_R = 42;
export const ROSA_ULTI_LIFE = 3.2;
export const ROSA_ULTI_POSE_T = 0.5;

// Rosaline's fire-arrow shot (step 6): her long reach in world px
// (the long-range hero — over three times the blade's), damage
// per arrow (a 6.5-hp Gloomslick takes exactly two), the two-frame
// animation's length (the draw, then the release), and the
// shortest interval between shot starts — a ranged cadence,
// slower than Karlsefni's melee. The arrow itself flies fast and
// straight; a foe inside ARROW_HIT_R of its path takes the hit.
export const ROSA_RANGE = 440;
export const ROSA_DAMAGE = 3.25;
export const ROSA_ATK_DUR = 0.44;
export const ROSA_AIM = ROSA_ATK_DUR / 2;
export const ROSA_ATK_INTERVAL = 1.2;
export const ARROW_SPEED = 950;
export const ARROW_HIT_R = 30;
export const ARROW_LIFE = 0.75;

// Tyne's star-cast (step 7): her medium reach in world px —
// between the blade's 120 and the bow's 440 — damage per bolt
// (a 6.5-hp Gloomslick takes exactly three casts; between the
// blade's 2.2 and the arrow's 3.25), the two-frame animation's
// length (the channel, then the cast), and the shortest interval
// between cast starts — between Karlsefni's 0.5 and Rosaline's
// 1.2. The bolt flies faster than the arrow; same hit radius.
export const TYNE_RANGE = 300;
export const TYNE_DAMAGE = 2.6;
export const TYNE_ATK_DUR = 0.4;
export const TYNE_CHANNEL = TYNE_ATK_DUR / 2;
export const TYNE_ATK_INTERVAL = 0.85;
export const BOLT_SPEED = 1000;
export const BOLT_HIT_R = 30;
export const BOLT_LIFE = 0.6;

// The cast so far: identity only — name and attunement. Movement,
// size and behaviour are shared, so a hero is a sprite set plus
// these two strings.
export const HEROES = { karlsefni: { name: 'Hei Karlsefni', element: 'frost' }, rosaline: { name: 'An Rosaline', element: 'flame' }, tyne: { name: 'Tyne Vgernaut', element: 'storm' } };
export const HERO_IDS = Object.keys(HEROES);

export function createPlayer(heroId = 'karlsefni') { const id = HEROES[heroId] ? heroId : 'karlsefni'; const h = HEROES[id];
  return { id, name: h.name, x: 1200, y: GROUND_Y - 26, vx: 0, face: 1, moving: false, walkPhase: 0, atkT: 0, atkCd: 0, atkFrame: 0, atkTarget: null, radius: PLAYER_RADIUS, hull: 100, maxHull: 100, element: h.element, novaCharge: 0, spriteName: null, spriteRect: null, flipX: false }; }

// X-only movement on the ground line: A/D and the arrow keys, plus
// the touch stick's horizontal axis — the shell's existing controls.
// While an attack is mid-swing (Karlsefni's slash, Rosaline's shot)
// the Warden's facing is the foe's, not the walk's — movement itself
// never pauses for the attack.
// STEP 26: the blitz dash (the user: "Untuk spasi nya itu
// blitz gitu, menghindar — semua karakter"; cooldown set by
// the user: "CD Dash 3 detik aja"). SPACE bursts the Warden
// 200 world px in 0.2 s along her movement (or facing, if
// still), invulnerable for the dash and a breath after
// (0.3 s of i-frames in total), attacks cancelled while it
// lasts, then a 3.0 s cooldown. Afterimages in her wake.
export const DASH_DIST = 200;
export const DASH_TIME = 0.2;
export const DASH_CD = 3.0;
export const DASH_IFRAMES = 0.3;

export function updatePlayer(world, input, dt) { const p = world.player; if (!p || !input) return;
  let mx = (input.down('KeyD', 'ArrowRight') ? 1 : 0) - (input.down('KeyA', 'ArrowLeft') ? 1 : 0);
  if (input.stickX) mx += input.stickX;
  mx = Math.max(-1, Math.min(1, mx));
  p.dashT = Math.max(0, (p.dashT || 0) - dt); p.dashCdT = Math.max(0, (p.dashCdT || 0) - dt); p.iframesT = Math.max(0, (p.iframesT || 0) - dt);
  if (p.ghosts) { for (const g of p.ghosts) g.t -= dt; p.ghosts = p.ghosts.filter(g => g.t > 0); }
  if (input.justPressed('Space') && p.dashCdT <= 0 && !(p.dashT > 0)) { p.dashT = DASH_TIME; p.dashCdT = DASH_CD; p.iframesT = DASH_IFRAMES;
    p.dashDir = mx !== 0 ? Math.sign(mx) : (p.face || 1); p.atkT = 0; p.ghostT = 0; world.particles?.burst?.(p.x, p.y, '#ffd9a0', 6, 130); }
  const dashing = p.dashT > 0;
  const speed = PLAYER_SPEED * (1 + (world.buffs?.speedPct ?? 0) / 100);
  p.vx = dashing ? p.dashDir * (DASH_DIST / DASH_TIME) : mx * speed; p.moving = dashing ? true : mx !== 0;
  if (p.moving) { if (!(p.atkT > 0)) p.face = dashing ? p.dashDir : (mx > 0 ? 1 : -1); p.walkPhase += dt * 9 * Math.abs(dashing ? 1 : mx); }
  if (dashing) { p.ghostT -= dt; if (p.ghostT <= 0) { p.ghostT = 0.045; (p.ghosts ??= []).push({ id: p.id, x: p.x, y: p.y, face: p.face, spriteName: p.spriteName || 'karl-idle', t: 0.26, maxT: 0.26 }); } }
  const worldW = world.worldW || VIEW_W;
  p.x = Math.max(30, Math.min(worldW - 30, p.x + p.vx * dt));
  if (dashing) return; // attacks are cancelled/unavailable mid-dash
  if (p.id === 'karlsefni') { updateKarlSlash(world, p, dt); updateKarlUlti(world, p, input); }
  else if (p.id === 'rosaline') { updateRosaShot(world, p, dt); if ((p.ultiT || 0) > 0) p.ultiT = Math.max(0, p.ultiT - dt); updateRosaUlti(world, p, input); }
  else if (p.id === 'tyne') { updateTyneCast(world, p, dt); updateTyneUlti(world, p, input); } }

// Karlsefni's proximity slash (step 4). The clock runs in the lobby
// and in a run alike — but foes only ever stand in a run's field, so
// the plaza stays peaceful. A slash starts only off cooldown, plays
// its two frames over KARL_ATK_DUR (frame 1 the first half, frame 2
// the second), and the damage lands on the start — the moment the
// blade connects — against the NEAREST foe in reach, if it has hp.
// Step 5 gives the slash its first real prey (the Gloomslick,
// enemies.js); a foe already in its death burst is not a target.
// Step 23: every hero hit — slash, arrow, cast, ultimate —
// is priced here: the run's Damage blessing scales it
// (buffs.dmgPct), and the Keen Eye blessing gives each hit
// a critChance roll for double damage, announced with a
// gold burst and a floating CRIT.
function rollHeroDamage(world, base) { const b = world.buffs ?? {}; let dmg = base * (1 + (b.dmgPct ?? 0) / 100); let crit = false;
  if ((b.critChance ?? 0) > 0 && world.rng.next() < b.critChance) { dmg *= 2; crit = true; } return { dmg, crit }; }
function applyHeroHit(world, target, base) { const { dmg, crit } = rollHeroDamage(world, base); target.hp -= dmg;
  if ('flashT' in target) target.flashT = crit ? 0.32 : 0.2;
  if (crit) { world.particles?.burst?.(target.x, target.y - 10, '#ffd23c', 10, 200); world.particles?.floatText?.(target.x, target.y - 52, 'CRIT', '#ffd23c', 17); } return dmg; }
// Step 23: the Swift Hands blessing shortens every attack
// interval (buffs.atkSpeedPct).
const atkInterval = (world, base) => base / (1 + (world.buffs?.atkSpeedPct ?? 0) / 100);

function updateKarlSlash(world, p, dt) { p.atkCd = Math.max(0, (p.atkCd || 0) - dt);
  if (p.atkT > 0) { p.atkT -= dt; p.atkFrame = p.atkT > KARL_ATK_DUR / 2 ? 0 : 1; if (p.atkT <= 0) { p.atkT = 0; p.atkFrame = 0; } return; }
  if (p.atkCd > 0) return;
  let target = null; let best = KARL_SLASH_RANGE;
  for (const e of world.enemies || []) { if (!e || e.dead) continue; const d = Math.hypot(e.x - p.x, (e.y ?? p.y) - p.y); if (d <= best) { best = d; target = e; } }
  if (!target) return;
  p.face = target.x >= p.x ? 1 : -1;
  p.atkT = KARL_ATK_DUR; p.atkFrame = 0; p.atkCd = atkInterval(world, KARL_ATK_INTERVAL);
  if (typeof target.hp === 'number') { applyHeroHit(world, target, KARL_SLASH_DAMAGE); chargeNova(world, p, target.hp <= 0); }
  world.audio?.attack?.('karlsefni'); }

// The Nova meter's earnings (step 8): a landed slash charges
// it, a killing slash charges it more, and the run's Nova
// Affinity (the shop's upgrade track, via buffs.novaRatePct)
// fattens both. Capped at the full meter, always.
function chargeNova(world, p, killed) { const rate = 1 + (world.buffs?.novaRatePct ?? 0) / 100;
  p.novaCharge = Math.min(NOVA_MAX, (p.novaCharge || 0) + (NOVA_PER_HIT + (killed ? NOVA_PER_KILL : 0)) * rate); }

// The ultimate trigger (step 8, Karlsefni; step 10, shared
// with Tyne): the Q key — which is also what the touch NOVA
// button injects, so both platforms loose it the same way. The
// press is consumed here, so one press can never fire twice
// across a frame's sim steps. A full meter and a living foe on
// the field are both required; the foe locked is the NEAREST
// one, however far — distance is no defence against an
// ultimate. Anything less earns only the deny blip, and the
// meter is kept. The launch itself is the hero's own.
function updateHeroUlti(world, p, input, launch) { if (!input?.justPressed?.('KeyQ')) return;
  input.pressed?.delete?.('KeyQ');
  if ((p.novaCharge || 0) < NOVA_MAX) { world.audio?.deny?.(); return; }
  let target = null; let best = Infinity;
  for (const e of world.enemies || []) { if (!e || e.dead || typeof e.hp !== 'number') continue; const d = Math.hypot(e.x - p.x, (e.y ?? p.y) - p.y); if (d < best) { best = d; target = e; } }
  if (!target) { world.audio?.deny?.(); return; }
  p.novaCharge = 0;
  p.face = target.x >= p.x ? 1 : -1;
  launch(world, p, target); }

function updateKarlUlti(world, p, input) { updateHeroUlti(world, p, input, launchFlyingSlash); }
function updateTyneUlti(world, p, input) { updateHeroUlti(world, p, input, launchStarfall); }
function updateRosaUlti(world, p, input) { updateHeroUlti(world, p, input, launchCrimsonRose); }

// Karlsefni's launch: ONE crescent wave off his blade, aimed
// at the locked foe, homing from the first instant.
function launchFlyingSlash(world, p, target) {
  const sx = p.x + p.face * 30; const sy = p.y - 4;
  const ang = Math.atan2((target.y + 4) - sy, target.x - sx);
  (world.slashWaves ??= []).push({ kind: 'flying-slash', x: sx, y: sy, vx: Math.cos(ang) * KARL_ULTI_SPEED, vy: Math.sin(ang) * KARL_ULTI_SPEED, face: p.face, life: KARL_ULTI_LIFE, target, dmg: KARL_ULTI_DAMAGE, hitR: KARL_ULTI_HIT_R, speed: KARL_ULTI_SPEED, turn: KARL_ULTI_TURN, hero: 'karlsefni', trail: '#6fe7ff', burst: '#aee9ff', trailT: 0, spriteRect: null });
  world.audio?.nova?.('karlsefni'); }

// Tyne's launch (step 10): ONE orb off her book, aimed at the
// locked foe. Its growth clock is set from the shot's own
// distance — frameDur stretches or compresses so the sequence
// reaches its peak (frame 9 of the flight frames) right around
// the arrival, whether the foe stands near or far: a spark
// leaves her hand, a star falls on the foe.
function launchStarfall(world, p, target) {
  const sx = p.x + p.face * 30; const sy = p.y - 6;
  const ang = Math.atan2((target.y + 4) - sy, target.x - sx);
  const dist = Math.hypot(target.x - sx, (target.y + 4) - sy);
  const frameDur = Math.max(0.055, Math.min(0.15, dist / TYNE_ULTI_SPEED / 8.5));
  (world.slashWaves ??= []).push({ kind: 'tyne-orb', x: sx, y: sy, vx: Math.cos(ang) * TYNE_ULTI_SPEED, vy: Math.sin(ang) * TYNE_ULTI_SPEED, face: p.face, life: TYNE_ULTI_LIFE, target, dmg: TYNE_ULTI_DAMAGE, hitR: TYNE_ULTI_HIT_R, speed: TYNE_ULTI_SPEED, turn: TYNE_ULTI_TURN, hero: 'tyne', trail: '#b78cff', burst: '#d9b8ff', age: 0, frame: 0, frameDur, trailT: 0, spriteRect: null });
  world.audio?.nova?.('tyne'); }

// Rosaline's launch (step 11): she takes the release pose —
// p.ultiT runs the pose's stage time, and sprites.js wears the
// bottom-row pose for exactly that long — and ONE giant
// crimson arrow leaves her bow, aimed at the locked foe. Its
// stage clock is set from the shot's distance, like Tyne's
// frame clock, so the arrow swells through its three stages
// en route and arrives at its starburst fiercest.
function launchCrimsonRose(world, p, target) {
  p.ultiT = ROSA_ULTI_POSE_T;
  const sx = p.x + p.face * 34; const sy = p.y - 4;
  const ang = Math.atan2((target.y + 4) - sy, target.x - sx);
  const dist = Math.hypot(target.x - sx, (target.y + 4) - sy);
  const stageDur = Math.max(0.14, Math.min(0.5, dist / ROSA_ULTI_SPEED / 2.4));
  (world.slashWaves ??= []).push({ kind: 'rosa-arrow', x: sx, y: sy, vx: Math.cos(ang) * ROSA_ULTI_SPEED, vy: Math.sin(ang) * ROSA_ULTI_SPEED, face: p.face, life: ROSA_ULTI_LIFE, target, dmg: ROSA_ULTI_DAMAGE, hitR: ROSA_ULTI_HIT_R, speed: ROSA_ULTI_SPEED, turn: ROSA_ULTI_TURN, hero: 'rosaline', trail: '#ff4a3c', burst: '#ff7a5c', age: 0, stage: 0, stageDur, trailT: 0, spriteRect: null });
  world.audio?.nova?.('rosaline'); }

// The ultimates in flight (step 8's Flying Slash; step 10's
// Starfall orb and step 11's Crimson Rose arrow ride the same
// list and the same rules), stepped
// by updateWorld after the arrows: each flyer steers toward its
// locked foe, curving at its own turn rate, shedding motes in
// its hero's colour as it goes. If the locked foe dies on the
// way — to a basic attack, say — the flyer takes the nearest
// other living foe instead; with none left it flies straight
// and dies of old age. On connect the foe takes the ultimate's
// damage through the same hp/flashT path as everything else,
// with the impact burst, a shake and the hero's ultiImpact
// chime. Tyne's orb also ages through its growth sequence as
// it travels, and on connect leaves its dissipating last frame
// behind as a brief, harmless 'tyne-orb-burst' remnant.
export function updateUltiWaves(world, dt) { const waves = world.slashWaves; if (!waves || !waves.length) return;
  const worldW = world.worldW || VIEW_W;
  for (let i = waves.length - 1; i >= 0; i--) { const w = waves[i]; if (!w) continue;
    if (w.kind === 'tyne-orb-burst') { w.life -= dt; if (w.life <= 0) waves.splice(i, 1); continue; }
    if (w.kind !== 'flying-slash' && w.kind !== 'tyne-orb' && w.kind !== 'rosa-arrow') continue;
    const speed = w.speed ?? KARL_ULTI_SPEED; const turnRate = w.turn ?? KARL_ULTI_TURN;
    let t = w.target;
    if (t && (t.dead || t.hp <= 0 || !(world.enemies || []).includes(t))) t = null;
    if (!t) { let best = Infinity;
      for (const e of world.enemies || []) { if (!e || e.dead || typeof e.hp !== 'number') continue; const d = Math.hypot(e.x - w.x, (e.y + 4) - w.y); if (d < best) { best = d; t = e; } }
      w.target = t; }
    if (t) { const want = Math.atan2((t.y + 4) - w.y, t.x - w.x); const cur = Math.atan2(w.vy, w.vx);
      let diff = want - cur; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      const turn = Math.max(-turnRate * dt, Math.min(turnRate * dt, diff)); const na = cur + turn;
      w.vx = Math.cos(na) * speed; w.vy = Math.sin(na) * speed; w.face = w.vx >= 0 ? 1 : -1; }
    w.x += w.vx * dt; w.y += w.vy * dt; w.life -= dt;
    if (w.kind === 'tyne-orb') { w.age = (w.age || 0) + dt; w.frame = Math.min(8, Math.floor(w.age / (w.frameDur || 0.12))); }
    if (w.kind === 'rosa-arrow') { w.age = (w.age || 0) + dt; w.stage = Math.min(2, Math.floor(w.age / (w.stageDur || 0.3))); }
    w.trailT = (w.trailT || 0) - dt; if (w.trailT <= 0) { w.trailT = 0.024; world.particles?.embers(w.x - w.vx * 0.03, w.y - w.vy * 0.03, w.trail || '#6fe7ff', 1, 3); }
    let hit = null;
    for (const e of world.enemies || []) { if (!e || e.dead || typeof e.hp !== 'number') continue; if (Math.hypot(e.x - w.x, (e.y + 4) - w.y) <= w.hitR + (e === t ? 10 : 0)) { hit = e; break; } }
    if (hit) { applyHeroHit(world, hit, w.dmg); world.shotsHit = (world.shotsHit || 0) + 1; world.particles?.burst(hit.x, hit.y - 6, w.burst || '#aee9ff', 14, 240); world.shake = Math.min(6, world.shake + 2.5); world.audio?.ultiImpact?.(w.hero || 'karlsefni');
      if (w.kind === 'tyne-orb') waves.push({ kind: 'tyne-orb-burst', x: hit.x, y: (hit.y ?? w.y) + 4, vx: 0, vy: 0, life: TYNE_ULTI_BURST_T, maxLife: TYNE_ULTI_BURST_T, spriteRect: null });
      waves.splice(i, 1); continue; }
    if (w.life <= 0 || w.x < -80 || w.x > worldW + 80) waves.splice(i, 1); } }

// The ranged heroes' proximity attack (steps 6 and 7) — one
// machine, two tunings. The clock runs in the lobby and in a run
// alike, but foes only ever stand in a run's field. An attack
// starts only off cooldown, against the NEAREST live foe within
// the hero's range: she faces it (her facing then locks for the
// attack; movement never pauses), frame 1 plays for the first
// half of the animation (Rosaline draws her bow, Tyne channels),
// and the moment the animation turns to frame 2 the projectile
// is loosed — aimed at where the foe stands at THAT moment.
// From there the projectile is its own thing (updateArrows):
// fast, straight, first foe in its path.
const ROSA_SHOT_CFG = { range: ROSA_RANGE, dur: ROSA_ATK_DUR, interval: ROSA_ATK_INTERVAL, release: releaseFireArrow };
const TYNE_CAST_CFG = { range: TYNE_RANGE, dur: TYNE_ATK_DUR, interval: TYNE_ATK_INTERVAL, release: releaseStarBolt };

function updateRangedShot(world, p, dt, cfg) { p.atkCd = Math.max(0, (p.atkCd || 0) - dt);
  if (p.atkT > 0) { const wasFrame = p.atkFrame; p.atkT -= dt; p.atkFrame = p.atkT > cfg.dur / 2 ? 0 : 1;
    if (wasFrame === 0 && p.atkFrame === 1) cfg.release(world, p);
    if (p.atkT <= 0) { p.atkT = 0; p.atkFrame = 0; p.atkTarget = null; } return; }
  if (p.atkCd > 0) return;
  let target = null; let best = cfg.range;
  for (const e of world.enemies || []) { if (!e || e.dead) continue; const d = Math.hypot(e.x - p.x, (e.y ?? p.y) - p.y); if (d <= best) { best = d; target = e; } }
  if (!target) return;
  p.face = target.x >= p.x ? 1 : -1;
  p.atkT = cfg.dur; p.atkFrame = 0; p.atkCd = atkInterval(world, cfg.interval); p.atkTarget = target; }

function updateRosaShot(world, p, dt) { updateRangedShot(world, p, dt, ROSA_SHOT_CFG); }
function updateTyneCast(world, p, dt) { updateRangedShot(world, p, dt, TYNE_CAST_CFG); }

// The shared aim: from an origin in front of the Warden toward
// the target's position at the release instant — or straight
// along her facing if the target is already gone.
function aimVelocity(world, p, ox, oy, speed) { const t = p.atkTarget && !p.atkTarget.dead && (world.enemies || []).includes(p.atkTarget) ? p.atkTarget : null;
  const tx = t ? t.x : p.x + p.face * 240; const ty = t ? t.y + 4 : oy;
  const dx = tx - ox; const dy = ty - oy; const len = Math.hypot(dx, dy) || 1;
  return { vx: dx / len * speed, vy: dy / len * speed }; }

// Rosaline's release: one fire arrow leaves her bow (a hand's
// breadth in front of her, at chest height). The FIRE attack SFX
// plays (audio.attack('rosaline')).
function releaseFireArrow(world, p) { const ox = p.x + p.face * 32; const oy = p.y - 2;
  const v = aimVelocity(world, p, ox, oy, ARROW_SPEED);
  (world.bullets ??= []).push({ kind: 'fire-arrow', owner: p.id, x: ox, y: oy, vx: v.vx, vy: v.vy, face: p.face, life: ARROW_LIFE, dmg: ROSA_DAMAGE, hitR: ARROW_HIT_R, trail: '#ff8a3c', burst: '#ffb03a', trailT: 0 });
  world.shotsFired = (world.shotsFired || 0) + 1;
  world.audio?.attack?.('rosaline'); }

// Tyne's cast: one star-bolt leaves her floating book (in front
// of her, at chest height) — a violet orb on the same straight
// flight. The LIGHTNING attack SFX plays (audio.attack('tyne')).
function releaseStarBolt(world, p) { const ox = p.x + p.face * 30; const oy = p.y - 6;
  const v = aimVelocity(world, p, ox, oy, BOLT_SPEED);
  (world.bullets ??= []).push({ kind: 'star-bolt', owner: p.id, x: ox, y: oy, vx: v.vx, vy: v.vy, face: p.face, life: BOLT_LIFE, dmg: TYNE_DAMAGE, hitR: BOLT_HIT_R, trail: '#b78cff', burst: '#c9a6ff', trailT: 0 });
  world.shotsFired = (world.shotsFired || 0) + 1;
  world.audio?.attack?.('tyne'); }

// The projectiles' flight (steps 6 and 7), stepped by
// updateWorld after the foes: each arrow/bolt runs straight,
// sheds a coloured mote now and then, and the first live foe
// within its hit radius takes the hit — its damage off the
// foe's hp and the hit-flash set, exactly the slash's damage
// path. A foe that hops out of the line is simply missed; a
// projectile that finds nothing dies of old age or at the
// field's edge.
// Step 10: a landed projectile also feeds its owner's Nova
// meter when she is a hero whose ultimate rides it — Tyne's
// bolts charge hers (+20 a hit, +20 for the kill, through
// chargeNova, exactly Karlsefni's numbers; his blade charges
// directly in updateKarlSlash). Step 11 completes the set:
// Rosaline's arrows charge hers the same way — all three
// heroes now earn their ultimates from their own attacks.
const PROJECTILE_NOVA_EARNERS = new Set(['tyne', 'rosaline']);
export function updateArrows(world, dt) { const arrows = world.bullets; if (!arrows || !arrows.length) return;
  const worldW = world.worldW || VIEW_W;
  for (let i = arrows.length - 1; i >= 0; i--) { const a = arrows[i]; if (!a || typeof a.dmg !== 'number') continue;
    a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
    a.trailT = (a.trailT || 0) - dt; if (a.trailT <= 0) { a.trailT = 0.03; world.particles?.embers(a.x - a.vx * 0.02, a.y - a.vy * 0.02, a.trail || '#ff8a3c', 1, 3); }
    let hit = null;
    for (const e of world.enemies || []) { if (!e || e.dead || typeof e.hp !== 'number') continue; if (Math.hypot(e.x - a.x, (e.y + 4) - a.y) <= (a.hitR || ARROW_HIT_R)) { hit = e; break; } }
    if (hit) { applyHeroHit(world, hit, a.dmg); world.shotsHit = (world.shotsHit || 0) + 1; world.particles?.burst(hit.x, hit.y - 6, a.burst || '#ffb03a', 8, 170);
      if (a.owner && PROJECTILE_NOVA_EARNERS.has(a.owner) && world.player?.id === a.owner) chargeNova(world, world.player, hit.hp <= 0);
      arrows.splice(i, 1); continue; }
    if (a.life <= 0 || a.x < -40 || a.x > worldW + 40) arrows.splice(i, 1); } }
