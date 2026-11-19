// shots.js — deterministic scenes for the entry's screenshots.
// CHARACTER WIPE (2026-11-19): the staged scenes were portraits of
// the cast — a Warden posed in the lobby, a staged battle at the
// bridge, a boss Nova at the Crystal. With every character stripped
// from the playable build there is nothing left to stage: whatever
// scene is requested, the shot simply rests in the empty lobby and
// the screenshot flow photographs the shell (map, Crystal, menus).

export function stageShotScene(world, audio, scene) { world.shotMode = true; world.state = 'lobby'; }
