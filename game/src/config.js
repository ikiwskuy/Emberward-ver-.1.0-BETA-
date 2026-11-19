// config.js — Emberward's tuning table, palette and shell.
// CHARACTER WIPE (2026-11-19): every character was stripped out of the
// playable build at the user's request (too many character bugs — he
// wants a clean slate). HEROES, the player/dash/Nova tuning, the slash
// tuning and the per-kit attack ranges all lived here; they are gone.
// What remains is the shell's tuning: the stage, the Crystal, the
// palette, the (now dormant) pickup/element data and the profile keys.

export const VIEW_W=1280; export const VIEW_H=720;

// Side view: one ground line; worlds run wider than the screen and the
// camera pans across them. The Crystal stands at the world's centre.
export const GROUND_Y=600; export const WORLD_W_RUN=3200; export const WORLD_W_LOBBY=2400; export const BRIDGE_X=1050; export const BRIDGE_W=120;

export const CRYSTAL_X=VIEW_W / 2; export const CRYSTAL_Y=VIEW_H / 2 + 16; export const CRYSTAL_RADIUS=40; export const CRYSTAL_MAX_LIGHT=100;

export const COMBO_WINDOW=3.0; export const COMBO_STEP=8; export const COMBO_MAX_MULT=8;

export const FINAL_WAVE=10;

// The anime-fantasy palette: deep indigo night, teal magic, gold trim.
export const PALETTE={ ink: '#07060f', nightTop: '#191038', nightMid: '#100c2a', nightLow: '#0a1430', gold: '#ffd982', goldDeep: '#e8a94e', cream: '#fff6e0', teal: '#5ff2d0', violet: '#b78cff', rose: '#ff7d9c', };

// Elements: colour and behaviour of bolts under that attunement.
// (Dormant data now — the pickup table still names elements, and a
// future cast will read this again.)
export const ELEMENTS={ flame: { name: 'Flame', color: '#ff8a3c', core: '#ffd23c', fireRate: 6.5, bulletSpeed: 630, damage: 1, burstRadius: 44, burstDamage: 1 }, frost: { name: 'Frost', color: '#6fe7ff', core: '#e8fbff', fireRate: 7.5, bulletSpeed: 720, damage: 1, piercing: true, slowFactor: 0.5, slowTime: 1.3 },
  lightning: { name: 'Lightning', color: '#b78cff', core: '#efe4ff', fireRate: 6.0, bulletSpeed: 790, damage: 1, chainRange: 128, chainChance: 0.45, chainDamage: 1 }, };

// Pickup kinds; tomes carry their element in their own field.
export const PICKUPS={ heart: { label: 'Heart Bloom', color: '#ff7d9c', heal: 26 }, shard: { label: 'Crystal Shard', color: '#5ff2d0', relight: 22 }, tome: { label: 'Tome', duration: 14 }, tri: { label: 'Tri-Star Charm', color: '#ffd982', duration: 12 }, aegis: { label: 'Aegis Ward', color: '#a8c8ff', duration: 8 },
  nova: { label: 'Nova Star', color: '#fff3c4', charge: 45 }, };

// Score thresholds for the results screen's rank, best first.
export const RANKS = [ { rank: 'S', min: 24000, stars: 5 }, { rank: 'A', min: 16000, stars: 4 }, { rank: 'B', min: 10000, stars: 3 }, { rank: 'C', min: 5000, stars: 2 }, { rank: 'D', min: 0, stars: 1 }, ];

export const BEST_KEY = 'emberward-best-score-v1'; export const PROFILE_KEY = 'emberward-profile-v1'; export const LANG_KEY = 'emberward-lang-v1';

// STEP 27: the game's version — ONE constant, the single
// source of truth (the user: "Versi game masih 1.0"). The
// dashboard's corner label and the settings panel's version
// line both read from here; nowhere else displays it.
export const GAME_VERSION = '1.0';

// The touch joystick: a fixed base in the lower-left, always on in touch mode.
export const TOUCH_STICK={ x:124,y:560,r:62,grab:96 };
