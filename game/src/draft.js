// draft.js — the skill draft: three cards by rarity, into world.buffs.
// CHARACTER WIPE (2026-11-19): the draft pools were PER HERO — a stat
// skeleton themed to each Warden's weapon plus her signature cards.
// STEP 23 (2026-11-19) refilled the pool with the user's shared
// blessing set (DRAFT_POOL below): eight stackable upgrades offered
// between waves 1-9. The rarity table + buff scaffolding are the
// pre-wipe machinery, kept and reused as-is.

export const RARITIES={ common: { label: 'COMMON', color: '#9fb4c8' }, rare: { label: 'RARE', color: '#5ea8ff' }, epic: { label: 'EPIC', color: '#b78cff' }, legendary: { label: 'LEGENDARY', color: '#ffd23c' }, }; const ROLL = [['common', 0.55], ['rare', 0.85], ['epic', 0.96], ['legendary', 1.01]];
const DOWN = { legendary: 'epic', epic: 'rare', rare: 'common', common: 'common' };

export function freshBuffs() { return { stacks:{},dmgPct:0,speedPct:0,castPct:0,novaRatePct:0,extraBolts:0,echoSlash:0,arcGrowth:0,frostPotency:0,skillCdMul:1,skillDmgPct:0,burnPct:0,arrowSpeedPct:0,chainDmgPct:0,critChance:0,critDmgPct:0,rangePct:0,strikeCount:0,lifestealPct:0,regen:0,execPct:0,multistrike:0,novaDmgPct:0,coinPct:0,afterimage:false,dashCdMul:1,pierce:0,pickupMul:1,splashR:0,chainChance:0,thorns:0,execute:false,phoenixHeart:false,tempestCrown:false,twinNova:false,phoenix:false,timewarp:false,atkSpeedPct:0,magnet:0,}; }

// STEP 23: the pool is the user's shared blessing set —
// eight stackable run upgrades (the Magnet alone is capped,
// at 3). Names and descriptions resolve through strings.js
// in the world's language at draw time.
import { t } from './strings.js';
export const DRAFT_POOLS = { karlsefni: [], rosaline: [], vgernaut: [] };
export const DRAFT_POOL = [
  { id: 'dmg', rarity: 'common', cap: 99, icon: '⚔', name: (w) => t(w, 'upgDmgName'), desc: (w) => t(w, 'upgDmgDesc'), apply: (w) => { w.buffs.dmgPct += 15; } },
  { id: 'atk', rarity: 'common', cap: 99, icon: '»', name: (w) => t(w, 'upgAtkName'), desc: (w) => t(w, 'upgAtkDesc'), apply: (w) => { w.buffs.atkSpeedPct += 12; } },
  { id: 'crit', rarity: 'rare', cap: 99, icon: '✸', name: (w) => t(w, 'upgCritName'), desc: (w) => t(w, 'upgCritDesc'), apply: (w) => { w.buffs.critChance += 0.08; } },
  { id: 'magnet', rarity: 'rare', cap: 3, icon: '◉', name: (w) => t(w, 'upgMagName'), desc: (w) => t(w, 'upgMagDesc'), apply: (w) => { w.buffs.magnet = Math.min(3, (w.buffs.magnet ?? 0) + 1); } },
  { id: 'spd', rarity: 'common', cap: 99, icon: '➤', name: (w) => t(w, 'upgSpdName'), desc: (w) => t(w, 'upgSpdDesc'), apply: (w) => { w.buffs.speedPct += 8; } },
  { id: 'hull', rarity: 'rare', cap: 99, icon: '♥', name: (w) => t(w, 'upgHullName'), desc: (w) => t(w, 'upgHullDesc'), apply: (w) => { const p = w.player; if (p) { p.maxHull += 15; p.hull = Math.min(p.maxHull, p.hull + 15); } } },
  { id: 'nova', rarity: 'common', cap: 99, icon: '✦', name: (w) => t(w, 'upgNovaName'), desc: (w) => t(w, 'upgNovaDesc'), apply: (w) => { w.buffs.novaRatePct += 25; } },
  { id: 'mend', rarity: 'common', cap: 99, icon: '✚', name: (w) => t(w, 'upgMendName'), desc: (w) => t(w, 'upgMendDesc'), apply: (w) => { const p = w.player; if (p) p.hull = Math.min(p.maxHull, p.hull + 40); } },
];
export const draftDef = (id) => DRAFT_POOL.find((d) => d.id === id);
export const poolFor = (world) => DRAFT_POOL;

function available(world, rarity, offer) { return poolFor(world).filter((d) => d.rarity === rarity && (world.buffs.stacks[d.id] ?? 0) < d.cap && !offer.some((o) => o.id === d.id)); }

// Roll three distinct cards; a rarity with nothing left falls to the next.
// With the pools empty this always returns [] — the draft stays shut.
export function rollDraft(world) { const offer = []; for (let slot = 0; slot < 3; slot++) { let rarity = 'common'; const r = world.rng.next(); for (const [name, edge] of ROLL) if (r < edge) { rarity = name; break; }
    let pool = available(world, rarity, offer); while (!pool.length && rarity !== 'common') { rarity = DOWN[rarity]; pool = available(world, rarity, offer); }
    if (!pool.length) break; offer.push(pool[Math.floor(world.rng.next() * pool.length)]); }
  return offer; }

export function applyDraft(world, def) { world.buffs.stacks[def.id] = (world.buffs.stacks[def.id] ?? 0) + 1; world.draftPicks.push(def.id); def.apply(world); }
