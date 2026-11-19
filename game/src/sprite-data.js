// sprite-data.js — where the Wardens' sprite frames live on disk.
// The multi-file build reads them from game/img/sprites/ by relative
// path. The single-file playable build swaps this whole module for a
// generated copy whose URLs are data URLs under the same names, so
// the loader in sprites.js never knows the difference.
export const KARL_URLS = {
  'karl-idle': './img/sprites/karl-idle.png',
  'karl-walk-1': './img/sprites/karl-walk-1.png',
  'karl-walk-2': './img/sprites/karl-walk-2.png',
  'karl-walk-3': './img/sprites/karl-walk-3.png',
  'karl-walk-4': './img/sprites/karl-walk-4.png',
};
export const ROSA_URLS = {
  'rosa-idle': './img/sprites/rosa-idle.png',
  'rosa-walk-1': './img/sprites/rosa-walk-1.png',
  'rosa-walk-2': './img/sprites/rosa-walk-2.png',
  'rosa-walk-3': './img/sprites/rosa-walk-3.png',
  'rosa-walk-4': './img/sprites/rosa-walk-4.png',
};
export const TYNE_URLS = {
  'tyne-idle': './img/sprites/tyne-idle.png',
  'tyne-walk-1': './img/sprites/tyne-walk-1.png',
  'tyne-walk-2': './img/sprites/tyne-walk-2.png',
  'tyne-walk-3': './img/sprites/tyne-walk-3.png',
  'tyne-walk-4': './img/sprites/tyne-walk-4.png',
};
export const KARL_SLASH_URLS = {
  'karl-slash-1': './img/sprites/karl-slash-1.png',
  'karl-slash-2': './img/sprites/karl-slash-2.png',
};
export const KARL_ULTI_URLS = {
  'karl-ulti-wave': './img/sprites/karl-ulti-wave.png',
};
export const ROSA_SHOOT_URLS = {
  'rosa-shoot-1': './img/sprites/rosa-shoot-1.png',
  'rosa-shoot-2': './img/sprites/rosa-shoot-2.png',
};
export const TYNE_CAST_URLS = {
  'tyne-cast-1': './img/sprites/tyne-cast-1.png',
  'tyne-cast-2': './img/sprites/tyne-cast-2.png',
};
export const TYNE_ULTI_URLS = {
  'tyne-ulti-1': './img/sprites/tyne-ulti-1.png',
  'tyne-ulti-2': './img/sprites/tyne-ulti-2.png',
  'tyne-ulti-3': './img/sprites/tyne-ulti-3.png',
  'tyne-ulti-4': './img/sprites/tyne-ulti-4.png',
  'tyne-ulti-5': './img/sprites/tyne-ulti-5.png',
  'tyne-ulti-6': './img/sprites/tyne-ulti-6.png',
  'tyne-ulti-7': './img/sprites/tyne-ulti-7.png',
  'tyne-ulti-8': './img/sprites/tyne-ulti-8.png',
  'tyne-ulti-9': './img/sprites/tyne-ulti-9.png',
  'tyne-ulti-10': './img/sprites/tyne-ulti-10.png',
};
export const ROSA_ULTI_URLS = {
  'rosa-ulti-release': './img/sprites/rosa-ulti-release.png',
  'rosa-arrow-1': './img/sprites/rosa-arrow-1.png',
  'rosa-arrow-2': './img/sprites/rosa-arrow-2.png',
  'rosa-arrow-3': './img/sprites/rosa-arrow-3.png',
};
export const SLIME_URLS = {
  'slime-base': './img/sprites/slime-base.png',
  'slime-hurt': './img/sprites/slime-hurt.png',
  'slime-angry': './img/sprites/slime-angry.png',
  'slime-leap': './img/sprites/slime-leap.png',
  'slime-death': './img/sprites/slime-death.png',
};
export const ZOMBIE_URLS = {
  'zombie-idle': './img/sprites/zombie-idle.png',
  'zombie-walk-1': './img/sprites/zombie-walk-1.png',
  'zombie-walk-2': './img/sprites/zombie-walk-2.png',
  'zombie-walk-3': './img/sprites/zombie-walk-3.png',
  'zombie-run-1': './img/sprites/zombie-run-1.png',
  'zombie-run-2': './img/sprites/zombie-run-2.png',
  'zombie-run-3': './img/sprites/zombie-run-3.png',
  'zombie-attack-1': './img/sprites/zombie-attack-1.png',
  'zombie-attack-2': './img/sprites/zombie-attack-2.png',
  'zombie-attack-3': './img/sprites/zombie-attack-3.png',
  'zombie-attack-4': './img/sprites/zombie-attack-4.png',
  'zombie-attack-5': './img/sprites/zombie-attack-5.png',
  'zombie-hurt-1': './img/sprites/zombie-hurt-1.png',
  'zombie-hurt-2': './img/sprites/zombie-hurt-2.png',
  'zombie-hurt-3': './img/sprites/zombie-hurt-3.png',
  'zombie-death-1': './img/sprites/zombie-death-1.png',
  'zombie-death-2': './img/sprites/zombie-death-2.png',
  'zombie-death-3': './img/sprites/zombie-death-3.png',
  'zombie-death-4': './img/sprites/zombie-death-4.png',
  'zombie-death-5': './img/sprites/zombie-death-5.png',
  'zombie-death-6': './img/sprites/zombie-death-6.png',
  'zombie-death-7': './img/sprites/zombie-death-7.png',
  'zombie-death-8': './img/sprites/zombie-death-8.png',
};
export const GOBLIN_URLS = {
  'goblin-idle-1': './img/sprites/goblin-idle-1.png',
  'goblin-idle-2': './img/sprites/goblin-idle-2.png',
  'goblin-idle-3': './img/sprites/goblin-idle-3.png',
  'goblin-idle-4': './img/sprites/goblin-idle-4.png',
  'goblin-walk-1': './img/sprites/goblin-walk-1.png',
  'goblin-walk-2': './img/sprites/goblin-walk-2.png',
  'goblin-walk-3': './img/sprites/goblin-walk-3.png',
  'goblin-run-1': './img/sprites/goblin-run-1.png',
  'goblin-run-2': './img/sprites/goblin-run-2.png',
  'goblin-run-3': './img/sprites/goblin-run-3.png',
  'goblin-attack-1': './img/sprites/goblin-attack-1.png',
  'goblin-attack-2': './img/sprites/goblin-attack-2.png',
  'goblin-hurt': './img/sprites/goblin-hurt.png',
  'goblin-death': './img/sprites/goblin-death.png',
};

// The bosses (steps 21-22): the knight of wave V and the
// dragon of wave X. Their frames already live in
// game/img/sprites/ — sliced from the user's sheets
// (64107 knight, 64118 dragon) by the pre-wipe pipeline;
// the re-sent sheets are pixel-identical to those.
export const KNIGHT_URLS = {
  'knight-idle-1': './img/sprites/knight-idle-1.png',
  'knight-idle-2': './img/sprites/knight-idle-2.png',
  'knight-idle-3': './img/sprites/knight-idle-3.png',
  'knight-idle-4': './img/sprites/knight-idle-4.png',
  'knight-walk-1': './img/sprites/knight-walk-1.png',
  'knight-walk-2': './img/sprites/knight-walk-2.png',
  'knight-walk-3': './img/sprites/knight-walk-3.png',
  'knight-walk-4': './img/sprites/knight-walk-4.png',
  'knight-run-1': './img/sprites/knight-run-1.png',
  'knight-run-2': './img/sprites/knight-run-2.png',
  'knight-run-3': './img/sprites/knight-run-3.png',
  'knight-attack-1': './img/sprites/knight-attack-1.png',
  'knight-attack-2': './img/sprites/knight-attack-2.png',
  'knight-attack-3': './img/sprites/knight-attack-3.png',
  'knight-attack-4': './img/sprites/knight-attack-4.png',
  'knight-hurt-1': './img/sprites/knight-hurt-1.png',
  'knight-hurt-2': './img/sprites/knight-hurt-2.png',
  'knight-death': './img/sprites/knight-death.png',
};

export const DRAGON_URLS = {
  'dragon-idle-1': './img/sprites/dragon-idle-1.png',
  'dragon-idle-2': './img/sprites/dragon-idle-2.png',
  'dragon-idle-3': './img/sprites/dragon-idle-3.png',
  'dragon-walk-1': './img/sprites/dragon-walk-1.png',
  'dragon-walk-2': './img/sprites/dragon-walk-2.png',
  'dragon-walk-3': './img/sprites/dragon-walk-3.png',
  'dragon-walk-4': './img/sprites/dragon-walk-4.png',
  'dragon-walk-5': './img/sprites/dragon-walk-5.png',
  'dragon-walk-6': './img/sprites/dragon-walk-6.png',
  'dragon-claw-1': './img/sprites/dragon-claw-1.png',
  'dragon-claw-2': './img/sprites/dragon-claw-2.png',
  'dragon-claw-3': './img/sprites/dragon-claw-3.png',
  'dragon-leap-1': './img/sprites/dragon-leap-1.png',
  'dragon-leap-2': './img/sprites/dragon-leap-2.png',
  'dragon-leap-3': './img/sprites/dragon-leap-3.png',
  'dragon-fly': './img/sprites/dragon-fly.png',
  'dragon-land': './img/sprites/dragon-land.png',
  'dragon-slam': './img/sprites/dragon-slam.png',
  'dragon-shake': './img/sprites/dragon-shake.png',
  'dragon-breath': './img/sprites/dragon-breath.png',
};

// The hero portraits (step 24): the user's three illustrations
// (64102 Karlsefni, 64100 Rosaline, 64097 Tyne), black keyed
// by the edge-flood method and downscaled to 640 px.
export const PORTRAIT_URLS = {
  'portrait-karlsefni': './img/sprites/portrait-karlsefni.png',
  'portrait-rosaline': './img/sprites/portrait-rosaline.png',
  'portrait-tyne': './img/sprites/portrait-tyne.png',
};
