// portraits.js — the Wardens' portraits (REBUILD STEP 24):
// the user's three illustrations, black-keyed, used by the
// Monument's character-select cards (and, from step 25, the
// in-run medallion). PORTRAIT_SUBJECT is each keyed image's
// subject bounding box as fractions of the frame — measured
// at keying time — so cards can draw the figure normalised
// instead of the raw canvas (Tyne's sheet is wide with the
// princess centred; the other two are near-square).

import { PORTRAIT_URLS } from './sprite-data.js';

const NAMES = { karlsefni: 'portrait-karlsefni', rosaline: 'portrait-rosaline', tyne: 'portrait-tyne' };
export const PORTRAIT_SUBJECT = {
  karlsefni: { x: 0.031, y: 0.015, w: 0.959, h: 0.970 },
  rosaline: { x: 0.138, y: 0.026, w: 0.788, h: 0.944 },
  tyne: { x: 0.269, y: 0.046, w: 0.454, h: 0.889 },
};
const imgs = {}; const ready = {};
let resolve; const settled = new Promise((res) => { resolve = res; });
let pending = Object.keys(NAMES).length;
for (const [id, name] of Object.entries(NAMES)) { const im = new Image(); imgs[id] = im;
  im.onload = () => { ready[id] = true; if (--pending === 0) resolve(); };
  im.onerror = () => { if (--pending === 0) resolve(); };
  im.src = PORTRAIT_URLS[name]; }

export function getPortrait(heroId) { return ready[heroId] ? imgs[heroId] : null; }
export const portraitsSettled = settled;
