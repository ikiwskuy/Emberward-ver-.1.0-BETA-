// random.js — a tiny seeded generator (mulberry32) and helpers.

export function makeRng(seed) { let state=(seed >>> 0)||1; const next=()=>{ state=(state + 0x6d2b79f5) | 0; let t=state; t=Math.imul(t ^ (t >>> 15),t | 1); t ^=t + Math.imul(t ^ (t >>> 7),t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return {
    next,range:(min,max)=>min + next()*(max - min),int:(min,max)=>Math.floor(min + next()*(max - min + 1)),pick:(list)=>list[Math.floor(next()*list.length)],chance:(p)=>next() < p,angle:()=>next()*Math.PI*2,}; }

// The live game seeds itself from the clock; shot scenes pass a fixed seed.
export function liveRng() { return makeRng((Date.now() % 2147483646) + 1); }
