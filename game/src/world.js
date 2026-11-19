// world.js — the simulation heart: waves, scoring, endings.
// CHARACTER WIPE (2026-11-19): the user stripped EVERY character out
// of the playable build — too many character bugs, clean slate. What
// this module no longer has: the foes and both bosses, and with them
// the whole combat resolution (damageEnemy / strikeFoe / performSlash /
// killEnemy / hurtPlayer / hurtCrystal), the Nova and the Flying
// Slash ultimate, the boss dialogue, and the win/lose endings
// (endRun / winRun — nothing can call them now). buildWave returns an
// empty queue, so a run's first intermission ends into an 'active'
// wave that never fills: nothing spawns, the clear check can never
// fire, no draft opens, no victory or defeat can trigger.
// REBUILD STEP 1 (later the same morning): Karlsefni alone returns
// as the player — a walker on the ground line (player.js), the
// camera follows him again and the lobby stations answer proximity
// once more. Still no foes, no combat, no endings. The pre-wipe
// source lives in hidden_files/backup-2026-11-19-pre-wipe/.
// REBUILD STEP 2 (same morning): An Rosaline joins him as a second
// playable walker. world.heroId names the active Warden; swapHero
// (worked at the Monument, see main.js) exchanges the pair in place,
// and startRun / toLobby keep the chosen hero. Still no foes, no
// combat, no endings.
// REBUILD STEP 3 (same morning): Tyne Vgernaut completes the trio;
// swapHero is now a three-way cycle through the cast in HERO_IDS
// order (Karlsefni -> Rosaline -> Tyne -> Karlsefni), still worked
// at the Monument, still in place.
// REBUILD STEP 4 (same morning): Karlsefni gains his melee slash
// (player.js's updateKarlSlash, sprites.js's slash pair) — a
// proximity auto-attack against world.enemies. This module is
// unchanged: the enemies array is still empty by design (buildWave
// returns []), so the slash waits for a foe system that does not
// exist yet; damage is wired for any foe object carrying hp.
// REBUILD STEP 5 (same morning): the foe system exists — one kind
// of it. buildWave composes the first Gloomslick group (five
// standing spots from enemies.js), the spawner trickles them in
// during the wave's first seconds, and updateWorld steps them via
// updateSlimes. Still no wave-clear check, no draft trigger, no
// endings: when the group is gone the field is simply quiet again.
// REBUILD STEP 6 (same morning): Rosaline's fire-arrow shot
// (player.js's updateRosaShot) gives the slime a second hunter.
// updateWorld now also steps her loosed arrows (updateArrows)
// after the foes, so a shot released this tick flies the same
// tick. Karlsefni's slash and the slime are unchanged.
// REBUILD STEP 7 (same morning): Tyne's star-cast (player.js's
// updateTyneCast) completes the trio — the same updateArrows
// step flies her bolts too. All three Wardens now answer the
// slime, each at her own range: blade 120, cast 300, bow 440.
// REBUILD STEP 8 (same morning): Karlsefni's ultimate, the
// Flying Slash (player.js's updateKarlUlti / updateUltiWaves).
// updateWorld steps the loosed waves right after the arrows;
// they live in world.slashWaves, which startRun and clearRunFx
// already empty. His Nova meter is the player's own novaCharge,
// charged by his slash — see player.js.
// REBUILD STEP 9 (same morning): only the slime's spawning
// changes, at the user's direction — buildWave now hands
// enemies.js's builder the live RNG, and the group enters from
// random spots at the field's left/right edges instead of five
// fixed standing spots (see enemies.js). Nothing else moves.
// REBUILD STEP 10 (same morning): Tyne's ultimate, the
// Starfall (player.js's updateTyneUlti / launchStarfall).
// updateWorld steps her orb through the same updateUltiWaves
// as Karlsefni's wave; her meter is her own novaCharge, charged
// by her landed bolts — see player.js.
// REBUILD STEP 11 (same morning): Rosaline's ultimate, the
// Crimson Rose (player.js's updateRosaUlti /
// launchCrimsonRose). updateWorld steps her giant arrow
// through the same updateUltiWaves; her meter is her own
// novaCharge, charged by her landed arrows — see player.js.
// All three heroes have their ultimates now.
// REBUILD STEP 12 (same morning): the second foe kind, the
// zombie (enemies.js's updateZombie). updateWorld's foe clock
// steps it beside the slime; buildWave's group is now five
// slimes plus three zombies in the same edge trickle.
// REBUILD STEP 13 (same morning): the third foe kind, the
// goblin (enemies.js's updateGoblin). The foe clock steps it
// beside the others; buildWave's group is now five slimes,
// three zombies and three goblins in the same edge trickle.
// REBUILD STEP 14 (same morning): the WAVE SYSTEM returns —
// the user's "tambahin jadi 25 musuh per wave". A run is
// FINAL_WAVE (10) waves of 25 foes each (enemies.js's
// WAVE_TABLE composition, its capped feeder letting them in
// from the edges). The wave clock below now checks for a
// clear — queue spent and field empty — banks the wave's
// score, and either opens the next intermission (whose
// banner announces the next wave) or, at wave X, calls the
// restored winRun. The Warden's hull reaching 0 calls the
// restored endRun ('The Warden has fallen.'). Both endings
// are the pre-wipe functions, reconnected: state, endReason,
// saveBest, clearRunFx, the particle ring and the audio
// sting all live again, and main.js's results flow (R to
// retry, Enter/Esc/clicks to the lobby) answers them as it
// always did. The draft stays dormant BY DESIGN this step:
// a cleared wave goes straight to the intermission, no
// blessing is offered. Waves 5 and 10 are normal waves —
// the boss slots stay empty until the dragon's and the
// knight's sheets arrive.

import { RANKS,BEST_KEY,LANG_KEY,CRYSTAL_MAX_LIGHT,COMBO_WINDOW,COMBO_STEP,COMBO_MAX_MULT,FINAL_WAVE,VIEW_W,VIEW_H,GROUND_Y,WORLD_W_RUN,WORLD_W_LOBBY,BRIDGE_X,GAME_VERSION,
} from './config.js'; import { ParticleSystem } from './particles.js'; import { Background } from './background.js';
import { t, WAVE_TITLES_ID } from './strings.js';
import { createPlayer, updatePlayer, updateArrows, updateUltiWaves, HERO_IDS } from './player.js';
import { buildSlimeWave, updateSlimes, spawnBoss } from './enemies.js';
import { updatePickups } from './pickups.js'; import { freshBuffs, rollDraft, applyDraft } from './draft.js'; import { loadProfile, saveProfile } from './shop.js';

export const WAVE_TITLES = [ 'The First Stirring', 'Whispers in the Dark', 'The Gloaming Host', 'The Gathering Storm', 'The Knight Wakes', 'The Deepening Dark', 'The Howling Vale', 'Before the Dawn', 'The Longest Night', 'The Final Dragon', ];

function roman(n) { const T=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let s=''; let m=n; while (m >= 40) { s+='XL'; m-=40; } for (const [v,r] of T) while (m >= v) { s+=r; m-=v; } return s || 'I'; }
// Step 18: the label speaks the world's language — the word
// WAVE and the titles translate; the roman numeral stays.
export const waveLabel = (world, n) => { const id = world && world.lang === 'id'; const titles = id ? WAVE_TITLES_ID : WAVE_TITLES; return `${id ? 'GELOMBANG' : 'WAVE'} ${roman(n)} — ${titles[(n - 1) % titles.length].toUpperCase()}`; };

export function rankForScore(score) { for (const row of RANKS) if (score>=row.min) return row; return RANKS[RANKS.length - 1]; }
export function rankForWaves(w) { const rank = w >= 10 ? 'S' : w >= 8 ? 'A' : w >= 6 ? 'B' : w >= 3 ? 'C' : 'D'; const stars = w >= 9 ? 3 : w >= 6 ? 2 : w >= 3 ? 1 : 0; return { rank, stars }; }

export function createWorld(rng) { const world={ state: 'dashboard', time: 0, rng, particles: new ParticleSystem(rng), background: new Background(rng), heroIndex: 1, heroId: 'karlsefni', domainIndex: 0, profile: loadProfile(), buffs: freshBuffs(), draftPicks: [], draft: null, dialogue: null,
    slashes:[],echoSlashes:[],shockwaves:[],waves:[],slashWaves:[],fireballs:[],burnPatches:[],decoys:[],wavesCleared:0,lastBossName:null,bossSeen:{},debutSeen:new Set(),runCoins:0,runMats:{},shopMsg:null,novaEchoT:0,phoenixUsed:false,portalT:0,worldW:WORLD_W_LOBBY,camX:WORLD_W_LOBBY / 2 - VIEW_W / 2,camTargetX:WORLD_W_LOBBY / 2 - VIEW_W / 2,bridgeX:null,player:createPlayer(),crystal:{ x:WORLD_W_LOBBY / 2,y:GROUND_Y - 85,light:CRYSTAL_MAX_LIGHT,maxLight:CRYSTAL_MAX_LIGHT,hurtT:0 },
    enemies: [], bullets: [], ebullets: [], pickups: [], arcs: [], corpses: [], prisons: [], spriteFx: [], score: 0, best: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, shotsFired: 0, shotsHit: 0, wave: 0, phase: 'intermission', phaseT: 0, spawnQueue: [], spawnT: 0,
    runTime: 0, shake: 0, hitStop: 0, flash: 0, hurtT: 0, novaFxT: 0, ultiFxT: 0, ultiDir: 1, novaDir: 1, ultiSeq: null, ultiSprite: null, novaRequested: false, banner: null, boss: null, endReason: '', crystalSfxT: 0, emberT: 0, audio: null, shotMode: false, feedT: 0, lang: 'en', langChosen: false, settings: null, settingsUi: null, dashboardUi: null, selectOpen: false, selectUi: null, gameVersion: GAME_VERSION, dashTime: 0, dashParts: [], dashScene: null, }; try { world.best=Number(localStorage.getItem(BEST_KEY) ?? 0)||0; } catch { world.best=0; }
  // Step 18: the remembered language (settings panel). A
  // fresh save has chosen none — lang stays English, and
  // langChosen stays false (the step-19 dashboard's button
  // defaults to the user's own word, MASUK, until he picks).
  try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'id' || saved === 'en') { world.lang = saved; world.langChosen = true; } } catch { }
  return world; }

export const LOBBY_PROPS = [ { id: 'monument', x: 240, y: GROUND_Y, label: 'MONUMENT OF WARDENS', hint: 'Choose your Warden' }, { id: 'portal', x: 2160, y: GROUND_Y, label: 'THE ABYSS PORTAL', hint: 'Enter the Abyss' }, { id: 'shop', x: 1560, y: GROUND_Y, label: 'EMBER STALL', hint: 'Spend Ember Coins' }, ];

// Karlsefni is back, so a station is "near" again when he stands
// within reach of it: the lobby prompt ring arms, E (and the touch
// USE path) works the station he is close to, and clicks keep
// working everywhere as before.
export function nearestProp(world) { const p = world.player; if (!p) return null; let best = null; let bestDist = 104; for (const prop of LOBBY_PROPS) { const d = Math.hypot(p.x - prop.x, p.y - prop.y); if (d < bestDist) { bestDist = d; best = prop; } } return best; }

// The selection mechanism: the Monument advances the active Warden
// to the NEXT one in the cast cycle — Karlsefni -> Rosaline ->
// Tyne -> Karlsefni — in place: the new walker takes the old one's
// spot and facing, so the exchange reads as a changing of the
// guard, not a teleport. world.heroId is the memory of the choice:
// startRun and toLobby rebuild the player from it.
export function swapHero(world) { const i = HERO_IDS.indexOf(world.heroId); world.heroId = HERO_IDS[(i + 1) % HERO_IDS.length]; const old = world.player; const p = createPlayer(world.heroId); if (old) { p.x = old.x; p.face = old.face; } world.player = p; return p; }
// Step 24: the select panel's directed swap — same semantics
// as swapHero (place and facing preserved), to a CHOSEN hero.
export function setHero(world, heroId) { if (!HERO_IDS.includes(heroId) || world.heroId === heroId) return world.player; world.heroId = heroId; const old = world.player; const p = createPlayer(world.heroId); if (old) { p.x = old.x; p.face = old.face; } world.player = p; return p; }

// The camera follows Karlsefni again, eased and clamped to the
// world's bounds (the wipe's free pan remains as the fallback for a
// player-less world, which no longer occurs).
export function updateCamera(world, input, dt) { const worldW = world.worldW || VIEW_W; const maxX = Math.max(0, worldW - VIEW_W); if (world.camTargetX === undefined) world.camTargetX = world.camX || 0;
  if (world.player) world.camTargetX = Math.max(0, Math.min(maxX, world.player.x - VIEW_W / 2));
  else { let mx = 0; if (input) { mx = (input.down('KeyD', 'ArrowRight') ? 1 : 0) - (input.down('KeyA', 'ArrowLeft') ? 1 : 0); if (input.stickX) mx += input.stickX; }
    mx = Math.max(-1, Math.min(1, mx)); if (mx) world.camTargetX = Math.max(0, Math.min(maxX, world.camTargetX + mx * 640 * dt)); }
  const k = Math.min(1, 5 * dt); world.camX += (world.camTargetX - world.camX) * k; if (Math.abs(world.camTargetX - world.camX) < 0.5) world.camX = world.camTargetX; }

// Screen-feel timers (shake, the flash and hurt overlays, the Nova/ulti
// clocks) decay here and ONLY here, and every state updater calls this —
// so a fade can never freeze mid-decay when the state changes under it.
export function decayFx(world,dt) { world.hurtT=Math.max(0,world.hurtT - dt); world.flash=Math.max(0,world.flash - dt*1.8); world.novaFxT=Math.max(0,world.novaFxT - dt); world.ultiFxT=Math.max(0,(world.ultiFxT || 0) - dt); world.shake=Math.max(0,world.shake - dt*30); }

// Hard reset of everything a run can leave on screen: the shake, every
// overlay timer, a pending storyboard ultimate, and the transient FX
// lists. Called on EVERY exit from a run (a fresh start, results ->
// lobby), so nothing visual can outlive it.
export function clearRunFx(world) { world.shake=0; world.flash=0; world.hurtT=0; world.novaFxT=0; world.ultiFxT=0; world.ultiSeq=null; world.hitStop=0; world.crystal.hurtT=0; world.slashes.length=0; world.echoSlashes.length=0; world.shockwaves.length=0; world.waves.length=0; world.slashWaves.length=0; world.arcs.length=0; world.spriteFx.length=0; world.prisons.length=0; world.fireballs.length=0; world.burnPatches.length=0; world.decoys.length=0; }

export function updateLobby(world,input,audio,dt) { world.audio=audio; world.time+=dt; decayFx(world,dt); world.crystal.hurtT=Math.max(0,world.crystal.hurtT - dt); world.emberT -= dt; if (world.emberT<=0) { world.emberT = 0.12; world.particles.embers(world.crystal.x, world.crystal.y - 40, '#5ff2d0', 2, 30); }
  updatePlayer(world,input,dt); updateCamera(world,input,dt);
  world.portalT -= dt; if (world.portalT<=0) { world.portalT = 0.28; const portal = LOBBY_PROPS[1]; world.particles.sparkles(portal.x + world.rng.range(-26, 26), portal.y + world.rng.range(-34, 12), '#b78cff', 2); }
  if (world.banner) { world.banner.t+=dt; if (world.banner.t > world.banner.dur) world.banner=null; }
  world.particles.update(dt); audio.updateMusic(dt,false); }

export function startRun(world,domainIndex=0) { world.domainIndex=domainIndex; world.worldW=WORLD_W_RUN; world.bridgeX=BRIDGE_X; world.crystal.x=WORLD_W_RUN / 2; world.crystal.y=GROUND_Y - 85; world.player=createPlayer(world.heroId); world.player.x=WORLD_W_RUN / 2; world.camX=world.crystal.x - VIEW_W / 2; world.camTargetX=world.camX; const up=world.profile.upgrades; world.buffs=freshBuffs(); world.buffs.dmgPct+=5*up.power; world.buffs.speedPct+=4*up.swiftness; world.buffs.novaRatePct+=8*up.nova; world.draftPicks=[]; world.draft=null; world.dialogue=null; world.slashes=[]; world.echoSlashes=[]; world.runCoins=0; world.runMats={}; world.phoenixUsed=false;
  world.novaEchoT=0; world.wavesCleared=0; world.lastBossName=null; world.bossSeen={}; world.debutSeen=new Set(); world.fireballs.length=0; world.burnPatches.length=0; world.decoys.length=0; world.crystal.light=world.crystal.maxLight; world.enemies.length=0; world.bullets.length=0; world.ebullets.length=0; world.pickups.length=0; world.arcs.length=0; world.corpses.length=0; world.prisons.length=0; world.spriteFx.length=0; world.shockwaves.length=0; world.waves.length=0; world.slashWaves.length=0; world.score=0; world.combo=0;
  world.comboT = 0; world.maxCombo = 0; world.kills = 0; world.shotsFired = 0; world.shotsHit = 0; world.wave = 0; world.spawnStage = 0; world.spawnQueue = []; world.spawnT = 0; world.feedT = 0; world.runTime = 0; world.shake = 0; world.flash = 0; world.hurtT = 0; world.novaFxT = 0; world.ultiFxT = 0; world.ultiSeq = null; world.boss = null; world.bossSpawned = 0; world.endReason = ''; clearRunFx(world); beginIntermission(world); }

function beginIntermission(world) { world.phase = 'intermission'; world.phaseT = 2.8; world.wave++; world.banner = { text: waveLabel(world, world.wave), sub: t(world, 'bannerQuiet'), t: 0, dur: 2.6 }; world.audio?.waveStart(); }

// A wave's foe budget (step 14): twenty-five, every wave —
// enemies.js's WAVE_TABLE says how they divide among the
// three kinds. buildWave composes the wave the run is about
// to fight (world.wave was already advanced by
// beginIntermission), every foe an edge spawn (step 9),
// handed over as the spawn queue; the feeder in updateSlimes
// lets them in under the alive cap, and updateWorld's clear
// check — queue spent, field empty — ends the wave.
export const WAVE_FOES = 25;
export function buildWave(world) { return buildSlimeWave(world.rng, world.worldW, world.wave); }

// The endings, restored (step 14) in their pre-wipe form:
// the score is banked (the persistent best and the domain
// best), the run's FX are swept, and the state moves to the
// results screen main.js already drives. Defeat wears the
// reason it was given; victory adds its 2,000-point seal.
function saveBest(world) { if (world.shotMode) return; if (world.score > world.best) { world.best = world.score; try { localStorage.setItem(BEST_KEY, String(world.best)); } catch { } }
  if (world.score > (world.profile.domainBest[world.domainIndex] ?? 0)) { world.profile.domainBest[world.domainIndex] = world.score; saveProfile(world); } }

function endRun(world, reason) { world.state = 'over'; world.endReason = reason; saveBest(world); clearRunFx(world); world.particles.ring(world.crystal.x, world.crystal.y, '#ff7d9c', 260, 7); world.particles.burst(world.crystal.x, world.crystal.y, '#ff7d9c', 50, 420); world.audio?.gameOver(); }

function winRun(world) { world.state = 'victory'; world.score += 2000; saveBest(world); clearRunFx(world); world.particles.ring(world.crystal.x, world.crystal.y, '#ffd982', 520, 8); world.particles.sparkles(world.crystal.x, world.crystal.y - 60, '#ffd982', 40); world.audio?.victory(); }

// Between waves the run used to pause for the skill draft. The draft
// machinery stays wired but dormant BY DESIGN (step 14): waves can
// be cleared again, but the clear routes straight to the
// intermission — openDraft is never called and the pools are empty
// besides.
export function openDraft(world) { world.draft = rollDraft(world); world.state = 'draft'; }

export function pickDraft(world,index) { const def = world.draft?.[index]; if (!def) return false; applyDraft(world, def); world.draft = null; world.state = 'playing'; world.audio?.pickup(); beginIntermission(world); return true; }

export function comboMult(world) { return Math.min(COMBO_MAX_MULT,1 + Math.floor(world.combo / COMBO_STEP)); }

// STEP 28: the dashboard's cinematic clock and its
// screen-space particles (rising embers + drifting motes,
// capped at 44 + 16). They live ONLY while the dashboard is
// up: leaving for the lobby or a run zeroes the clock and
// empties the list, so the scene costs nothing elsewhere.
const DASH_EMBER_CAP = 44, DASH_MOTE_CAP = 16;
function updateDashParts(world, dt) { const parts = world.dashParts ??= [];
  let embers = 0, motes = 0; for (const p of parts) { if (p.kind === 'ember') embers++; else motes++; }
  if (embers < DASH_EMBER_CAP && world.rng.next() < 0.6) parts.push({ kind: 'ember', x: world.rng.range(0, VIEW_W), y: VIEW_H + 6, vx: world.rng.range(-6, 6), vy: -world.rng.range(22, 52), t: 0, life: world.rng.range(3.2, 5.5), size: world.rng.range(1.2, 2.6), sway: world.rng.range(0, 6.28) });
  if (motes < DASH_MOTE_CAP && world.rng.next() < 0.1) parts.push({ kind: 'mote', x: world.rng.range(0, VIEW_W), y: world.rng.range(80, 560), vx: world.rng.range(-7, 7), vy: world.rng.range(-3, 3), t: 0, life: world.rng.range(6, 10), size: world.rng.range(0.8, 1.6), sway: world.rng.range(0, 6.28) });
  for (const p of parts) { p.t += dt; p.x += (p.vx + Math.sin((world.dashTime || 0) * 1.3 + p.sway) * 7) * dt; p.y += p.vy * dt; }
  world.dashParts = parts.filter(p => p.t < p.life && p.y > -12); }

export function updateAmbient(world,dt) { world.time+=dt; decayFx(world,dt); world.crystal.hurtT=Math.max(0,world.crystal.hurtT - dt); world.emberT -= dt; if (world.emberT<=0) { world.emberT = 0.12; world.particles.embers(world.crystal.x, world.crystal.y - 40, '#5ff2d0', 2, 30); }
  if (world.state === 'dashboard') { world.dashTime = (world.dashTime || 0) + dt; updateDashParts(world, dt); } else { world.dashTime = 0; if (world.dashParts && world.dashParts.length) world.dashParts = []; }
  world.particles.update(dt); if (world.banner) { world.banner.t+=dt; if (world.banner.t > world.banner.dur) world.banner=null; }
}

export function updateWorld(world,input,audio,dt) { world.audio=audio; world.time+=dt; world.runTime+=dt; world.crystalSfxT=Math.max(0,world.crystalSfxT - dt); world.crystal.hurtT=Math.max(0,world.crystal.hurtT - dt);
  decayFx(world,dt); if (world.comboT > 0) { world.comboT -=dt; if (world.comboT<=0) world.combo=0; }
  if (world.banner) { world.banner.t+=dt; if (world.banner.t > world.banner.dur) world.banner=null; }

  world.emberT -= dt; if (world.emberT<=0) { world.emberT = 0.14; world.particles.embers(world.crystal.x, world.crystal.y - 30, '#5ff2d0', 2, 26); }

  updatePlayer(world,input,dt); updateCamera(world,input,dt);

  // The wave clock turns (step 14) — intermission, then an
  // 'active' wave — and the foe clock with it: the wave's
  // twenty-five feed in from the edges under the alive cap
  // and hunt. After the foe and weapon clocks, the run's two
  // endings are judged: the Warden's hull first (a fallen
  // Warden never clears a wave posthumously), then the clear
  // — the queue spent and the field empty — which banks the
  // wave's score and, since step 23, opens the between-wave
  // blessing draft (waves I–IX; pickDraft then begins the
  // next intermission) or, at wave X, wins the run.
  if (world.phase === 'intermission') { world.phaseT -= dt; if (world.phaseT<=0) { world.phase = 'active'; world.spawnQueue = buildWave(world); world.spawnT = 0; world.feedT = 0;
    // The bosses (steps 21-22, swapped): wave V brings the
    // knight, wave X the dragon — in addition to the 25 foes.
    if (world.wave === 5 && world.bossSpawned !== 5) { world.bossSpawned = 5; spawnBoss(world, 'knight'); }
    else if (world.wave === 10 && world.bossSpawned !== 10) { world.bossSpawned = 10; spawnBoss(world, 'dragon'); } }
  }
  updateSlimes(world, dt);
  updateArrows(world, dt);
  updateUltiWaves(world, dt);

  if (world.state === 'playing' && world.player && world.player.hull <= 0) { world.player.hull = 0; endRun(world, t(world, 'endFallen')); }
  else if (world.state === 'playing' && world.phase === 'active' && world.spawnQueue.length === 0 && world.enemies.length === 0) { world.score += 100 * world.wave; world.wavesCleared = Math.max(world.wavesCleared, world.wave);
    if (world.wave >= FINAL_WAVE) winRun(world); else openDraft(world); }

  updatePickups(world, dt); world.particles.update(dt); audio.updateMusic(dt, world.state === 'playing'); }
