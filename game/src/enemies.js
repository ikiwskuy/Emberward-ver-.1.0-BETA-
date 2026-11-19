// enemies.js — the first foe returns (REBUILD STEP 5, 2026-11-19).
//
// The character wipe emptied this module the same morning (the
// whole bestiary and both bosses; the pre-wipe source lives in
// hidden_files/backup-2026-11-19-pre-wipe/). Step 5 brings back
// ONE kind, on the user's own new art and his own behaviour spec:
// the Gloomslick, a glossy water slime. It moves by small hops —
// hop, land, pause, hop — never sliding. In attack range it stops
// and WINDS UP (the angry frame, a pause of SLIME_WINDUP seconds:
// the user's "tiap nyerang tuh ada jeda dulu"), then LEAPS in an
// arc at the spot the Warden stood on WHEN THE WIND-UP BEGAN —
// the target is locked at that moment and never tracks, so a
// Warden who steps away during the pause is simply not there when
// it lands; the hit lands only if she is still within
// SLIME_HIT_RADIUS of the landing point. It takes Karlsefni's
// slash like anything with hp (his 2.2 a swing — three swings
// kill), flashes red and shows the hurt dome while flashT burns,
// is knocked a step back by a hit, and on death bursts into the
// splash frame for a second before it is gone (the user's
// standing death-linger). Nothing else is restored: no wave
// composition, no other kinds, no bosses.
// Spawning (step 5: kept simple; step 9 — below — replaced the
// fixed spots): world.buildWave hands back the first group's
// spawn positions as the spawn queue; the group trickles
// in during the wave's first seconds (a spawn-in beat after the
// banner) and that is all — no respawn, no second wave.
// REBUILD STEP 12 (same morning): the second foe kind — the
// zombie, on the user's labelled sheet and his behaviour words:
// it attacks like the slime when it closes in ("nyerangnya ada
// tapi saat mau mendekat kayak slime gitu lah"), it walks
// SLOWLY ("jalan zombie lambat" — ZOMBIE_SPEED, a fifth of the
// Warden's pace), its size is made consistent ("sesuaikan
// ukurannya samain" — sprites.js normalizes every standing
// frame to the same 66 world px, the heroes' height, and the
// death collapse at one shared scale), death included ("dan
// mati nya" — the full eight-frame collapse over
// ZOMBIE_DEATH_T, the corpse at the same scale). It shambles
// toward the Warden on the Walk cycle; at ZOMBIE_REACH it stops
// and plays the five-frame swipe — the damage lands at the
// swing's strike moment and only if she is still within reach
// in front of it (stepping away during the swing dodges, the
// slime's philosophy) — then a ZOMBIE_COOLDOWN breather before
// it shambles on. The Run frames are NOT used: slow is the
// spec. The group composition grows: five slimes plus three
// zombies, interleaved in the same edge trickle (step 9's rule
// unchanged — random edges, never the middle, first arrival
// still at spawnT 3.0 s).
// REBUILD STEP 13 (same morning): the third foe kind — the
// goblin, on the user's labelled sheet and his words: "Ini
// juga goblin, nyerangnya sama jarak dekat, ada jeda,
// sesuaikan ukurannya" — a melee attacker too, its attack has
// A PAUSE (a wind-up before the swing, like the slime's
// telegraph), and its size matched consistently (sprites.js
// normalizes its body to 54 world px in every frame, the
// death frame at the same scale). It is the quick one: it
// closes on the Run cycle at GOBLIN_SPEED (the user specified
// slow only for the zombie). At GOBLIN_REACH it stops and
// WINDS UP for GOBLIN_WINDUP — coiled in the crouch squash
// sprites.js draws — then swings: Attack 1 and Attack 2
// alternate per swing, the damage judged at the strike
// moment against where she stands THEN (the pause is the
// dodge window). Cooldown GOBLIN_COOLDOWN, then it runs
// again. The group grows again: five slimes, three zombies,
// three goblins — eleven foes in the same edge trickle.
// REBUILD STEP 14 (same morning): the WAVE SYSTEM returns,
// at the user's direction ("tambahin jadi 25 musuh per
// wave"). A run is ten waves of TWENTY-FIVE foes each,
// composed from WAVE_TABLE below (slime-heavy early,
// zombie/goblin-heavier late; world.js owns the clear check,
// the intermission and the endings). The fixed trickle
// schedule is gone: the feeder lets one foe in at
// SPAWN_FIRST_AT into the active wave, then another every
// SPAWN_FEED_INTERVAL while fewer than WAVE_ALIVE_CAP foes
// are alive, so the rest of the twenty-five feed in as the
// field thins — the field never becomes an unreadable pile.
// Every spawn still obeys step 9's edge rule. The old
// single-group constants (SLIME_GROUP_SIZE and friends) are
// retired; WAVE_TABLE is the composition now.

// REBUILD STEP 16 (same morning): the zombie grows. At its
// step-12 size — 66 world px standing, the heroes' own
// number — it still read SMALL beside them ("itu mah
// kecil"): the chibi Wardens are ~69 px wide of bulk, the
// hunched zombie drew only ~42 px wide. sprites.js now
// normalizes it to 88 world px (visual parity, a factor of
// 4/3, death frames at the same shared scale), and the two
// reach numbers above take a matching +8 nudge so the swipe
// stops and connects at the same visual distance as before.
// Speed, hp, damage, timing and the dodge rule are untouched.

import { GROUND_Y, WORLD_W_RUN } from './config.js';
import { dropCoin } from './pickups.js';

export const SLIME_HP = 6.5;             // three of Karlsefni's 2.2 slashes
export const SLIME_DAMAGE = 5;           // a landed leap, off the Warden's 100 hull
export const SLIME_ATTACK_RANGE = 100;   // centre distance at which it decides to leap
export const SLIME_WINDUP = 0.7;         // the telegraphed pause before the leap
export const SLIME_LEAP_DUR = 0.42;      // the arc itself
export const SLIME_LEAP_ARC = 58;        // px of lift at the arc's peak
export const SLIME_HIT_RADIUS = 46;      // how close the Warden must still be at landing
export const SLIME_RECOVER = 0.85;       // the breather after a leap
export const SLIME_HOP_DIST = 78;        // one hop's reach
export const SLIME_HOP_DUR = 0.36;
export const SLIME_HOP_ARC = 26;
export const SLIME_PAUSE = 0.42;         // the beat between hops
export const SLIME_DEATH_T = 1.0;        // the splash lingers a second

// Spawning (REBUILD STEP 9, 2026-11-19 — the user's direction:
// "slime munculnya random kanan kiri, jangan spawn langsung di
// tengah"): no more fixed standing spots. Every foe enters
// from an EDGE of the field — a random spot inside the band
// within SLIME_EDGE_BAND of the left wall or the right wall,
// the side itself random per foe, all drawn from the world's
// live RNG so it varies run to run. The split is guaranteed
// mixed (for a step-14 wave of twenty-five: 2–23 from the
// left, the rest from the right) so both edges always send
// foes, and the queue is shuffled, so the feeder's arrival
// order is random too. Nothing ever spawns in the middle
// band: the closest possible spot is 1,350 px from the
// Crystal spawn (x = 1600).
export const SLIME_EDGE_BAND = 250;   // spawn within this many px of an edge
export const SLIME_EDGE_INSET = 40;   // ...but never hard against the wall

// The wave system (REBUILD STEP 14): ten waves, twenty-five
// foes to a wave. WAVE_TABLE rows are [slimes, zombies,
// goblins] for waves I..X — every row totals exactly 25, all
// three kinds appear from wave I on, and the mix leans from
// slime-heavy to zombie/goblin-heavy as the night deepens.
// Waves 5 and 10 carry NO boss: the dragon's and the
// knight's sheets have not been sent, so their slots stay
// empty and those waves are normal waves for now.
export const WAVE_TABLE = [
  [17, 5, 3], [16, 5, 4], [15, 6, 4], [14, 6, 5], [13, 7, 5],
  [12, 7, 6], [11, 8, 6], [10, 8, 7], [8, 9, 8], [7, 9, 9],
];
export function waveComposition(wave) { const row = WAVE_TABLE[Math.max(0, Math.min(WAVE_TABLE.length - 1, (wave || 1) - 1))]; return { slime: row[0], zombie: row[1], goblin: row[2] }; }

// The feeder (step 14): the first foe enters SPAWN_FIRST_AT
// seconds into the active wave (the beat steps 5–13 kept —
// the field is empty before it), then one more every
// SPAWN_FEED_INTERVAL while fewer than WAVE_ALIVE_CAP foes
// are alive (dead-but-lingering corpses do not count). The
// queue holds the whole wave's twenty-five; the cap is what
// keeps the field readable while they feed in.
export const SPAWN_FIRST_AT = 3.0;
export const SPAWN_FEED_INTERVAL = 0.45;
export const WAVE_ALIVE_CAP = 10;

// The zombie (step 12): tougher than the slime, slower than
// everything, dangerous up close.
export const ZOMBIE_HP = 13;              // about twice the slime: 6 Karl slashes / 5 Tyne casts / 4 Rosa arrows
export const ZOMBIE_DAMAGE = 8;           // a landed swipe, off the Warden's 100 hull
export const ZOMBIE_SPEED = 62;           // world px/s — a shamble, well under the Wardens' 268
export const ZOMBIE_REACH = 74;           // centre distance at which it stops and swipes (step 16: 66 + 8 — the bigger body's front overhang grew ~9 px at the new scale, so it stops the same visual distance away)
export const ZOMBIE_STRIKE_RANGE = 90;    // how close she must still be, in front, at the strike moment (step 16: 82 + 8, the same nudge; the arm tip itself now reaches ~71 from centre, so a judged hit still reads connected. The dodge rule is unchanged: judged once, at the strike moment, in front only)
export const ZOMBIE_ATTACK_DUR = 0.55;    // the five-frame swipe
export const ZOMBIE_STRIKE_AT = 0.55;     // the strike lands this far through the swing
export const ZOMBIE_COOLDOWN = 1.2;       // the breather between swipes
export const ZOMBIE_DEATH_T = 1.1;        // the eight-frame collapse, inside the standing ~1-1.15 s linger

// The goblin (step 13): between the slime and the zombie in
// toughness, the fastest foe on the field, with a telegraphed
// swing — the pause is the point.
export const GOBLIN_HP = 9.5;             // Karlsefni 5 slashes / Tyne 4 casts / Rosaline 3 arrows
export const GOBLIN_DAMAGE = 7;           // a landed club swing, off the Warden's 100 hull
export const GOBLIN_SPEED = 140;          // world px/s on the Run cycle — brisk, half the Wardens' 268
export const GOBLIN_REACH = 65;           // centre distance at which it stops and winds up
export const GOBLIN_WINDUP = 0.45;        // the telegraphed pause before the swing (the dodge window)
export const GOBLIN_ATTACK_DUR = 0.38;    // the swing itself
export const GOBLIN_STRIKE_AT = 0.5;      // the strike lands this far through the swing
export const GOBLIN_STRIKE_RANGE = 80;    // how close she must still be, in front, at the strike moment
export const GOBLIN_COOLDOWN = 1.1;       // the breather between attack cycles
export const GOBLIN_DEATH_T = 1.0;        // the face-down frame lingers a second (the standing linger)

export function createSlime(x, index = 0) { return { kind: 'slime', x, y: GROUND_Y - 26, hp: SLIME_HP, maxHp: SLIME_HP, lastHp: SLIME_HP, flashT: 0,
  state: 'pause', t: 0.3 + 0.17 * index, lift: 0, fromX: x, toX: x, lockX: 0, dead: false, deathT: 0, spriteName: null, spriteRect: null, hpBar: null }; }

export function createZombie(x, index = 0) { return { kind: 'zombie', x, y: GROUND_Y - 26, hp: ZOMBIE_HP, maxHp: ZOMBIE_HP, lastHp: ZOMBIE_HP, flashT: 0,
  state: 'walk', t: 0, walkPhase: index % 3, face: 1, atkT: 0, atkAnim: 0, struck: true, coolT: 0, dead: false, deathT: 0, spriteName: null, spriteRect: null, hpBar: null }; }

export function createGoblin(x, index = 0) { return { kind: 'goblin', x, y: GROUND_Y - 26, hp: GOBLIN_HP, maxHp: GOBLIN_HP, lastHp: GOBLIN_HP, flashT: 0,
  state: 'run', t: 0, runPhase: index % 3, face: 1, swing: 0, atkT: 0, atkAnim: 0, struck: true, coolT: 0, dead: false, deathT: 0, spriteName: null, spriteRect: null, hpBar: null }; }

// One wave's whole composition (step 14): the twenty-five
// foes of WAVE_TABLE's row for this wave, every one an edge
// spawn (step 9), sides and spots drawn from the live RNG,
// kinds interleaved by the same shuffle, handed over as the
// spawn queue of { x, kind } entries. The feeder in
// updateSlimes lets them in under the alive cap.
export function buildSlimeWave(rng, worldW = WORLD_W_RUN, wave = 1) { const w = worldW || WORLD_W_RUN;
  const comp = waveComposition(wave);
  const total = comp.slime + comp.zombie + comp.goblin;
  const leftCount = rng.int(2, total - 2);
  const spots = [];
  for (let i = 0; i < total; i++) { const fromLeft = i < leftCount;
    spots.push(Math.round(fromLeft ? rng.range(SLIME_EDGE_INSET, SLIME_EDGE_BAND) : rng.range(w - SLIME_EDGE_BAND, w - SLIME_EDGE_INSET))); }
  const kinds = [...Array(comp.slime).fill('slime'), ...Array(comp.zombie).fill('zombie'), ...Array(comp.goblin).fill('goblin')];
  // Fisher–Yates on the same RNG, twice: the trickle's order
  // and the kind interleave are both random.
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); const t = spots[i]; spots[i] = spots[j]; spots[j] = t; }
  for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); const t = kinds[i]; kinds[i] = kinds[j]; kinds[j] = t; }
  return spots.map((x, i) => ({ x, kind: kinds[i] })); }

const clampX = (world, x) => Math.max(30, Math.min((world.worldW || WORLD_W_RUN) - 30, x));

// One foe's second of life. States: pause (between hops, and the
// decision point) -> hop -> pause ... -> windup (target locked)
// -> leap (to the locked spot) -> recover -> pause. Death can
// interrupt anything.
function updateSlime(world, e, dt) { const p = world.player;
  e.flashT = Math.max(0, (e.flashT || 0) - dt);
  if (e.dead) { e.deathT -= dt; return; }
  if (e.hp <= 0) { e.dead = true; e.state = 'dead'; e.deathT = SLIME_DEATH_T; e.lift = 0; world.kills++; dropCoin(world, e.x, e.y - 8, 1); world.audio?.hit?.(); return; }
  // A connecting slash shoves it a step away from the Warden and,
  // if it was mid-hop, drops it back to the ground in a brief
  // stun. A leaping slime is committed — no shove touches it.
  if (e.hp < e.lastHp) { if (p && e.state !== 'leap') { e.x = clampX(world, e.x + (e.x >= p.x ? 14 : -14)); if (e.state === 'hop') { e.state = 'pause'; e.t = 0.22; e.lift = 0; } } e.lastHp = e.hp; }
  if (!p) { e.lift = 0; return; }
  const d = Math.abs(p.x - e.x);
  switch (e.state) {
    case 'pause': e.lift = 0; e.t -= dt; if (e.t <= 0) {
      if (d <= SLIME_ATTACK_RANGE) { e.state = 'windup'; e.t = SLIME_WINDUP; e.lockX = p.x; }
      else { e.state = 'hop'; e.fromX = e.x; e.toX = clampX(world, e.x + Math.sign(p.x - e.x) * Math.min(SLIME_HOP_DIST, d - 60)); e.t = SLIME_HOP_DUR; } } break;
    case 'hop': { e.t -= dt; const prog = Math.min(1, 1 - e.t / SLIME_HOP_DUR); e.x = e.fromX + (e.toX - e.fromX) * prog; e.lift = Math.sin(prog * Math.PI) * SLIME_HOP_ARC;
      if (e.t <= 0) { e.x = e.toX; e.lift = 0; e.state = 'pause'; e.t = SLIME_PAUSE * world.rng.range(0.85, 1.15); } } break;
    case 'windup': e.lift = 0; e.t -= dt; if (e.t <= 0) { e.state = 'leap'; e.fromX = e.x; e.toX = clampX(world, e.lockX); e.t = SLIME_LEAP_DUR; } break;
    case 'leap': { e.t -= dt; const prog = Math.min(1, 1 - e.t / SLIME_LEAP_DUR); e.x = e.fromX + (e.toX - e.fromX) * prog; e.lift = Math.sin(prog * Math.PI) * SLIME_LEAP_ARC;
      if (e.t <= 0) { e.x = e.toX; e.lift = 0;
        if (Math.abs(p.x - e.x) <= SLIME_HIT_RADIUS) hurtHero(world, SLIME_DAMAGE);
        e.state = 'recover'; e.t = SLIME_RECOVER; } } break;
    case 'recover': e.lift = 0; e.t -= dt; if (e.t <= 0) { e.state = 'pause'; e.t = 0.25; } break;
    default: e.state = 'pause'; e.t = SLIME_PAUSE; break;
  }
}

// One zombie's second of life (step 12). States: walk (the
// shamble, Walk cycle turning) -> attack (the five-frame swipe;
// the strike is judged once, at ZOMBIE_STRIKE_AT through the
// swing, against where the Warden stands THEN) -> cooldown ->
// walk. Death can interrupt anything, and plays the collapse
// for ZOMBIE_DEATH_T before the sweep. A hit shoves it a step
// back while it walks — a swiping zombie is committed, like a
// leaping slime.
function updateZombie(world, e, dt) { const p = world.player;
  e.flashT = Math.max(0, (e.flashT || 0) - dt);
  if (e.dead) { e.deathT -= dt; return; }
  // The death line carries a whisker of tolerance: 13 hp taken
  // in 2.6 casts accumulates float dust (8.9e-16) that must not
  // leave the zombie standing on a technicality — five casts
  // kill, as the numbers promise.
  if (e.hp <= 0.000001) { e.dead = true; e.state = 'dead'; e.deathT = ZOMBIE_DEATH_T; world.kills++; dropCoin(world, e.x, e.y - 8, 1); world.audio?.hit?.(); return; }
  if (e.hp < e.lastHp) { if (p && e.state === 'walk') e.x = clampX(world, e.x + (e.x >= p.x ? 10 : -10)); e.lastHp = e.hp; }
  if (!p) return;
  const dx = p.x - e.x; const d = Math.abs(dx);
  switch (e.state) {
    case 'walk': e.face = dx >= 0 ? 1 : -1; e.walkPhase = (e.walkPhase || 0) + dt * 5.2;
      if (d <= ZOMBIE_REACH) { e.state = 'attack'; e.atkT = ZOMBIE_ATTACK_DUR; e.atkAnim = 0; e.struck = false; }
      else e.x = clampX(world, e.x + Math.sign(dx) * ZOMBIE_SPEED * dt); break;
    case 'attack': { e.face = dx >= 0 ? 1 : -1; e.atkT -= dt; e.atkAnim = Math.min(1, 1 - Math.max(0, e.atkT) / ZOMBIE_ATTACK_DUR);
      if (!e.struck && e.atkAnim >= ZOMBIE_STRIKE_AT) { e.struck = true;
        if (d <= ZOMBIE_STRIKE_RANGE && (dx === 0 || Math.sign(dx) === e.face)) hurtHero(world, ZOMBIE_DAMAGE); }
      if (e.atkT <= 0) { e.state = 'cooldown'; e.coolT = ZOMBIE_COOLDOWN; } } break;
    case 'cooldown': e.coolT -= dt; if (e.coolT <= 0) e.state = 'walk'; break;
    default: e.state = 'walk'; break;
  }
}

// One goblin's second of life (step 13). States: run (the
// Run cycle, closing fast) -> windup (the telegraphed pause —
// it does not move, and sprites.js coils it into the crouch
// squash) -> attack (the swing; the strike is judged once, at
// GOBLIN_STRIKE_AT through it, against where the Warden
// stands THEN; Attack 1 and Attack 2 alternate per swing) ->
// cooldown -> run. Death can interrupt anything, and the
// face-down frame lingers GOBLIN_DEATH_T before the sweep. A
// hit shoves it a step back while it runs — a winding-up or
// swinging goblin is committed.
function updateGoblin(world, e, dt) { const p = world.player;
  e.flashT = Math.max(0, (e.flashT || 0) - dt);
  if (e.dead) { e.deathT -= dt; return; }
  if (e.hp <= 0.000001) { e.dead = true; e.state = 'dead'; e.deathT = GOBLIN_DEATH_T; world.kills++; dropCoin(world, e.x, e.y - 8, 1); world.audio?.hit?.(); return; }
  if (e.hp < e.lastHp) { if (p && e.state === 'run') e.x = clampX(world, e.x + (e.x >= p.x ? 10 : -10)); e.lastHp = e.hp; }
  if (!p) return;
  const dx = p.x - e.x; const d = Math.abs(dx);
  switch (e.state) {
    case 'run': e.face = dx >= 0 ? 1 : -1; e.runPhase = (e.runPhase || 0) + dt * 9;
      if (d <= GOBLIN_REACH) { e.state = 'windup'; e.t = GOBLIN_WINDUP; }
      else e.x = clampX(world, e.x + Math.sign(dx) * GOBLIN_SPEED * dt); break;
    case 'windup': e.face = dx >= 0 ? 1 : -1; e.t -= dt;
      if (e.t <= 0) { e.state = 'attack'; e.atkT = GOBLIN_ATTACK_DUR; e.atkAnim = 0; e.struck = false; } break;
    case 'attack': { e.atkT -= dt; e.atkAnim = Math.min(1, 1 - Math.max(0, e.atkT) / GOBLIN_ATTACK_DUR);
      if (!e.struck && e.atkAnim >= GOBLIN_STRIKE_AT) { e.struck = true;
        if (d <= GOBLIN_STRIKE_RANGE && (dx === 0 || Math.sign(dx) === e.face)) hurtHero(world, GOBLIN_DAMAGE); }
      if (e.atkT <= 0) { e.state = 'cooldown'; e.coolT = GOBLIN_COOLDOWN; e.swing = (e.swing || 0) ^ 1; } } break;
    case 'cooldown': e.coolT -= dt; if (e.coolT <= 0) e.state = 'run'; break;
    default: e.state = 'run'; break;
  }
}

// The foe clock for a run: feed the wave's queue in while
// the wave is active (step 14's feeder: first foe at
// SPAWN_FIRST_AT, then one per SPAWN_FEED_INTERVAL while
// the alive count is under WAVE_ALIVE_CAP), step every foe,
// and sweep out the ones whose death has finished. Foes of
// no known kind (a test target, a future kind) are left
// exactly as they are.
export function updateSlimes(world, dt) {
  if (world.phase === 'active' && world.spawnQueue && world.spawnQueue.length) { world.spawnT += dt; world.feedT = (world.feedT || 0) + dt;
    const alive = world.enemies.reduce((n, e) => n + (e && !e.dead && e.kind !== 'knight' && e.kind !== 'dragon' ? 1 : 0), 0); // bosses never eat the feeder cap (steps 21-22)
    if (world.spawnT >= SPAWN_FIRST_AT && world.feedT >= SPAWN_FEED_INTERVAL && alive < WAVE_ALIVE_CAP) { world.feedT = 0; const spot = world.spawnQueue.shift();
      // The queue holds { x, kind } entries (step 12); a bare
      // number is read as a slime, as it was through step 11.
      const x = typeof spot === 'number' ? spot : spot.x; const kind = typeof spot === 'number' ? 'slime' : spot.kind;
      world.enemies.push(kind === 'zombie' ? createZombie(x, world.enemies.length) : kind === 'goblin' ? createGoblin(x, world.enemies.length) : createSlime(x, world.enemies.length)); } }
  for (const e of world.enemies) { if (!e) continue; if (e.kind === 'slime') updateSlime(world, e, dt); else if (e.kind === 'zombie') updateZombie(world, e, dt); else if (e.kind === 'goblin') updateGoblin(world, e, dt); else if (e.kind === 'knight') updateKnight(world, e, dt); else if (e.kind === 'dragon') updateDragon(world, e, dt); }
  for (let i = world.enemies.length - 1; i >= 0; i--) { const e = world.enemies[i]; if (e && e.dead && e.deathT <= 0 && (e.kind === 'slime' || e.kind === 'zombie' || e.kind === 'goblin' || e.kind === 'knight' || e.kind === 'dragon')) { world.enemies.splice(i, 1); if (world.boss === e) world.boss = null; } }
}

// -----------------------------------------------------------------
// THE BOSSES (steps 21-22, order swapped by amendment: the
// KNIGHT holds wave V, the DRAGON wave X). Both join their
// wave in ADDITION to its 25 foes, never eat the feeder cap,
// and the wave cannot clear while they live (they ride
// world.enemies, so the clear check sees them). Every attack
// follows the house dodge law: a 2.0 s wind-up, the target
// LOCKED at wind-up start, a visible telegraph, damage judged
// once at the strike moment against the locked zone. Bosses
// are never shoved by hits — too heavy.
export const KNIGHT_HP = 120;
export const KNIGHT_REACH = 110;          // stops and winds up within this
export const KNIGHT_WINDUP = 2.0;
export const KNIGHT_DAMAGE = 14;
export const KNIGHT_RUN_SPEED = 160;
export const KNIGHT_WALK_SPEED = 72;
export const KNIGHT_ZONE_NEAR = 25;       // the slash arc, from its anchor
export const KNIGHT_ZONE_FAR = 212;
export const KNIGHT_DEATH_T = 1.5;
export const DRAGON_HP = 190;
export const DRAGON_WINDUP = 2.0;         // every skill, per the user's spec
export const DRAGON_WALK_SPEED = 80;
export const DRAGON_CLAW_RANGE = 175;     // positions to this band, then winds up
export const DRAGON_CLAW_DAMAGE = 12;
export const DRAGON_CLAW_NEAR = 40;
export const DRAGON_CLAW_FAR = 235;
export const DRAGON_BREATH_RANGE = 470;   // holds and breathes within this
export const DRAGON_BREATH_DAMAGE = 12;
export const DRAGON_BREATH_REACH = 545;   // the flame's length from the mouth
export const DRAGON_BREATH_BURN = 1.5;
export const DRAGON_LEAP_DAMAGE = 14;
export const DRAGON_SLAM_RADIUS = 100;
export const DRAGON_DEATH_T = 1.5;
const BOSS_DEATH_EPS = 0.000001;

export function createKnight(x) { return { kind: 'knight', x, y: GROUND_Y - 26, hp: KNIGHT_HP, maxHp: KNIGHT_HP, lastHp: KNIGHT_HP, flashT: 0,
  state: 'enter', t: 0, vx: 0, animT: 0, face: 1, lockFace: 1, zone: null, tele: null, struck: true, coolT: 0, lift: 0,
  dead: false, deathT: 0, frameName: 'knight-idle-1', spriteName: null, spriteRect: null, hpBar: null }; }
export function createDragon(x) { return { kind: 'dragon', x, y: GROUND_Y - 26, hp: DRAGON_HP, maxHp: DRAGON_HP, lastHp: DRAGON_HP, flashT: 0,
  state: 'enter', t: 0, vx: 0, animT: 0, face: 1, lockFace: 1, lockX: 0, zone: null, tele: null, skill: 'claw', skillIdx: 0, struck: true,
  fromX: x, landX: x, lift: 0, dead: false, deathT: 0, frameName: 'dragon-fly', spriteName: null, spriteRect: null, hpBar: null }; }

// The boss walks/flys in from the field edge on the hero's
// half of the arena, in addition to the wave's queue.
export function spawnBoss(world, kind) { const p = world.player; const w = world.worldW || WORLD_W_RUN;
  const fromLeft = !p || p.x <= w / 2; const x = fromLeft ? 70 : w - 70;
  const e = kind === 'dragon' ? createDragon(x) : createKnight(x);
  e.face = fromLeft ? 1 : -1;
  if (kind === 'dragon' && p) { e.landX = clampX(world, p.x - e.face * 250); }
  world.enemies.push(e); world.boss = e; return e; }

// The one door through which foes hurt the Warden (step
// 26: the dash's i-frames close it — a strike that lands
// while she blurs past simply does not connect).
function hurtHero(world, dmg, shakeAdd = 2) { const p = world.player; if (!p || (p.iframesT || 0) > 0) return false;
  p.hull = Math.max(0, p.hull - dmg); world.hurtT = 0.45; world.shake = Math.min(6, world.shake + shakeAdd); world.audio?.playerHurt?.(); return true; }
function bossHit(world, dmg) { hurtHero(world, dmg, 3); }
function bossDie(world, e, deathT) { e.dead = true; e.state = 'dead'; e.deathT = deathT; e.tele = null; world.kills++; world.audio?.hit?.();
  // Step 23: a boss dies rich — a burst of coins where it fell.
  const burst = e.kind === 'dragon' ? 10 : 6; for (let i = 0; i < burst; i++) dropCoin(world, e.x, e.y - 14, 1);
  world.particles?.burst?.(e.x, e.y - 30, e.kind === 'dragon' ? '#ff7a3c' : '#c8ccd8', e.kind === 'dragon' ? 26 : 18, 190); }

// The knight (wave V): smooth is the brief. He RUNS the hero
// down at 160 px/s with eased accel/decel, settles into a
// WALK inside 200 px, IDLEs while holding, and his one slash
// is the house telegraph: 2.0 s of sword-raised wind-up (the
// arc zone locked and shown), the swing through attack-3 ->
// attack-4, damage 14 judged once as attack-4 begins. The
// Hurt frames stay unused — the hit flash carries feedback,
// and a reaction frame would pop the motion the brief asks
// to keep smooth.
function updateKnight(world, e, dt) { const p = world.player;
  e.flashT = Math.max(0, (e.flashT || 0) - dt);
  if (e.dead) { e.deathT -= dt; e.frameName = 'knight-death'; return; }
  if (e.hp <= BOSS_DEATH_EPS) { bossDie(world, e, KNIGHT_DEATH_T); e.frameName = 'knight-death'; return; }
  if (!p) return;
  const dx = p.x - e.x; const d = Math.abs(dx);
  const approach = (target, accel) => { const dv = target - e.vx; const step = accel * dt; e.vx += Math.abs(dv) <= step ? dv : Math.sign(dv) * step; };
  switch (e.state) {
    case 'enter': e.face = dx >= 0 ? 1 : -1; approach(e.face * KNIGHT_RUN_SPEED, 340); e.x = clampX(world, e.x + e.vx * dt);
      e.animT += dt * 7; e.frameName = `knight-run-${1 + (Math.floor(e.animT) % 3)}`;
      if (d <= 380) e.state = 'chase'; break;
    case 'chase': { e.coolT = Math.max(0, e.coolT - dt);
      if (d > 12) e.face = dx >= 0 ? 1 : -1;
      const want = d > KNIGHT_REACH + 90 ? KNIGHT_RUN_SPEED : d > KNIGHT_REACH ? KNIGHT_WALK_SPEED : 0;
      approach(e.face * want, e.vx !== 0 && Math.sign(e.vx) !== e.face ? 520 : 340); e.x = clampX(world, e.x + e.vx * dt);
      const sp = Math.abs(e.vx);
      if (sp > 115) { e.animT += dt * 7; e.frameName = `knight-run-${1 + (Math.floor(e.animT) % 3)}`; }
      else if (sp > 10) { e.animT += dt * 6; e.frameName = `knight-walk-${1 + (Math.floor(e.animT) % 4)}`; }
      else { e.animT += dt * 2.4; e.frameName = `knight-idle-${1 + (Math.floor(e.animT) % 4)}`; }
      if (d <= KNIGHT_REACH && e.coolT <= 0) { e.state = 'windup'; e.t = KNIGHT_WINDUP; e.lockFace = dx >= 0 ? 1 : -1; e.face = e.lockFace;
        e.zone = { x0: e.x + e.lockFace * KNIGHT_ZONE_NEAR, x1: e.x + e.lockFace * KNIGHT_ZONE_FAR };
        e.tele = { kind: 'zone', x0: e.zone.x0, x1: e.zone.x1 }; } } break;
    case 'windup': approach(0, 620); e.x = clampX(world, e.x + e.vx * dt); e.t -= dt;
      e.frameName = (KNIGHT_WINDUP - e.t) < 1.05 ? 'knight-attack-1' : 'knight-attack-2';
      if (e.t <= 0) { e.state = 'strike'; e.t = 0.52; e.struck = false; e.tele = null; } break;
    case 'strike': { const el = 0.52 - e.t; e.frameName = el < 0.14 ? 'knight-attack-3' : 'knight-attack-4';
      if (!e.struck && el >= 0.14) { e.struck = true; const z = e.zone;
        if (z && p.x >= Math.min(z.x0, z.x1) - 16 && p.x <= Math.max(z.x0, z.x1) + 16) bossHit(world, KNIGHT_DAMAGE); }
      e.t -= dt; if (e.t <= 0) { e.state = 'recover'; e.t = 0.9; } } break;
    case 'recover': e.animT += dt * 2.4; e.frameName = `knight-idle-${1 + (Math.floor(e.animT) % 4)}`; e.t -= dt;
      if (e.t <= 0) { e.state = 'chase'; e.coolT = 0.55; } break;
    default: e.state = 'chase'; break;
  }
}

// The dragon (wave X): flies in and lands a few steps from
// the hero, then rotates its skills 1 NYAKAR -> 2 NYEMBUR
// API -> 3 LONCAT+MENGHANTAM -> 1... Each skill: position,
// 2.0 s wind-up with the target locked and telegraphed,
// strike judged once against the locked zone. The breath is
// judged ONCE at ignition (the hero standing in the lane as
// the flame lights takes 12; stepping out before ignition —
// or being out — takes nothing). Between skills it WALKS at
// a heavy 80 px/s and IDLEs while holding.
const DRAGON_SKILLS = ['claw', 'breath', 'leap'];
function updateDragon(world, e, dt) { const p = world.player;
  e.flashT = Math.max(0, (e.flashT || 0) - dt);
  if (e.dead) { e.deathT -= dt; e.frameName = 'dragon-land'; e.lift = 0; return; }
  if (e.hp <= BOSS_DEATH_EPS) { bossDie(world, e, DRAGON_DEATH_T); e.frameName = 'dragon-land'; e.lift = 0; return; }
  if (!p) return;
  const dx = p.x - e.x; const d = Math.abs(dx);
  switch (e.state) {
    case 'enter': { const total = Math.max(1, Math.abs(e.landX - e.fromX)); const done = 1 - Math.abs(e.landX - e.x) / total;
      e.face = e.landX >= e.fromX ? 1 : -1; const step = 340 * dt;
      e.x = Math.abs(e.landX - e.x) <= step ? e.landX : e.x + Math.sign(e.landX - e.x) * step;
      e.lift = 26 + Math.sin(Math.min(1, done) * Math.PI) * 95; e.frameName = 'dragon-fly';
      if (e.x === e.landX) { e.state = 'land'; e.t = 0.55; world.shake = Math.min(5, world.shake + 2); world.particles?.burst?.(e.x, e.y + 20, '#8a7a5c', 10, 120); } } break;
    case 'land': e.lift = Math.max(0, e.lift - 90 * dt); e.frameName = 'dragon-land'; e.t -= dt;
      if (e.t <= 0) { e.lift = 0; if (e.leapRecovery) { e.leapRecovery = false; e.skillIdx = (e.skillIdx + 1) % 3; } e.state = 'chase'; } break;
    case 'chase': { e.skill = DRAGON_SKILLS[e.skillIdx % 3]; e.face = dx >= 0 ? 1 : -1;
      const band = e.skill === 'claw' ? DRAGON_CLAW_RANGE : e.skill === 'breath' ? DRAGON_BREATH_RANGE : -1;
      if (band > 0 && d > band) { e.animT += dt * 7; e.frameName = `dragon-walk-${1 + (Math.floor(e.animT) % 6)}`; e.x = clampX(world, e.x + Math.sign(dx) * DRAGON_WALK_SPEED * dt); }
      else { // in position: the wind-up begins, target locked NOW
        e.state = 'windup'; e.t = DRAGON_WINDUP; e.lockFace = dx >= 0 ? 1 : -1; e.face = e.lockFace; e.lockX = p.x;
        if (e.skill === 'claw') { e.zone = { x0: e.x + e.lockFace * DRAGON_CLAW_NEAR, x1: e.x + e.lockFace * DRAGON_CLAW_FAR }; e.tele = { kind: 'zone', x0: e.zone.x0, x1: e.zone.x1 }; }
        else if (e.skill === 'breath') { const mouth = e.x + e.lockFace * 95; e.zone = { x0: mouth, x1: mouth + e.lockFace * DRAGON_BREATH_REACH }; e.tele = { kind: 'lane', x0: e.zone.x0, x1: e.zone.x1 }; }
        else e.tele = { kind: 'ring', x: e.lockX, r: DRAGON_SLAM_RADIUS }; } } break;
    case 'windup': e.t -= dt;
      e.frameName = e.skill === 'claw' ? 'dragon-claw-1' : e.skill === 'breath' ? 'dragon-shake' : 'dragon-leap-1';
      if (e.t <= 0) { e.tele = null;
        if (e.skill === 'claw') { e.state = 'strike'; e.t = 0.54; e.struck = false; }
        else if (e.skill === 'breath') { e.state = 'breath'; e.t = DRAGON_BREATH_BURN; const z = e.zone;
          if (z && p.x >= Math.min(z.x0, z.x1) - 16 && p.x <= Math.max(z.x0, z.x1) + 16) bossHit(world, DRAGON_BREATH_DAMAGE); }
        else { e.state = 'leapfly'; e.t = 0.55; e.fromX = e.x; } } break;
    case 'strike': { const el = 0.54 - e.t; e.frameName = el < 0.14 ? 'dragon-claw-2' : 'dragon-claw-3';
      if (!e.struck && el >= 0.14) { e.struck = true; const z = e.zone;
        if (z && p.x >= Math.min(z.x0, z.x1) - 16 && p.x <= Math.max(z.x0, z.x1) + 16) bossHit(world, DRAGON_CLAW_DAMAGE); }
      e.t -= dt; if (e.t <= 0) { e.state = 'recover'; e.t = 0.8; } } break;
    case 'breath': e.frameName = 'dragon-breath'; e.t -= dt; if (e.t <= 0) { e.state = 'recover'; e.t = 0.8; } break;
    case 'leapfly': { e.t -= dt; const prog = Math.min(1, 1 - Math.max(0, e.t) / 0.55);
      e.x = e.fromX + (e.lockX - e.fromX) * prog; e.lift = Math.sin(prog * Math.PI) * 150;
      e.frameName = prog < 0.45 ? 'dragon-leap-2' : 'dragon-leap-3';
      if (e.t <= 0) { e.x = clampX(world, e.lockX); e.lift = 0;
        if (Math.abs(p.x - e.lockX) <= DRAGON_SLAM_RADIUS + 16) bossHit(world, DRAGON_LEAP_DAMAGE);
        e.state = 'slam'; e.t = 0.5; world.shake = Math.min(6, world.shake + 3); world.particles?.burst?.(e.x, e.y + 20, '#8a7a5c', 12, 150); } } break;
    case 'slam': e.frameName = 'dragon-slam'; e.t -= dt; if (e.t <= 0) { e.state = 'land'; e.t = 0.6; e.leapRecovery = true; } break;
    case 'recover': e.animT += dt * 2.2; e.frameName = `dragon-idle-${1 + (Math.floor(e.animT) % 3)}`; e.t -= dt;
      if (e.t <= 0) { e.skillIdx = (e.skillIdx + 1) % 3; e.state = 'chase'; } break;
    default: e.state = 'chase'; break;
  }
}
