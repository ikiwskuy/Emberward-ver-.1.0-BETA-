// main.js — boot, heartbeat, and the flow between screens.
// CHARACTER WIPE (2026-11-19): the hero-select flow and setHero are
// gone and the Monument — the select screen's door — is dormant:
// the plaza is worked by clicking its stations or walking Karlsefni
// up to one and pressing E, and ENTER (or the Portal) starts a run
// in the empty Abyss. REBUILD STEP 1 (same morning): Karlsefni is
// created at boot again (createPlayer) and walks the plaza and the
// Abyss; the camera follows him. REBUILD STEP 2 (same morning): An
// Rosaline joins the cast, and the Monument wakes as the pair's one
// selection mechanism — use it (E beside it, the touch USE button,
// or a click) and the active Warden swaps to the other, in place;
// the choice is kept across runs and lobby returns (world.heroId).
// REBUILD STEP 3 (same morning): Tyne Vgernaut completes the cast
// and the Monument swap becomes a three-way cycle through all
// three Wardens.
// Pre-wipe source: hidden_files/backup-2026-11-19-pre-wipe/.

import { VIEW_W, GROUND_Y, WORLD_W_LOBBY, LANG_KEY } from './config.js'; import { makeRng, liveRng } from './random.js'; import { Input } from './input.js'; import { SoundEngine } from './audio.js'; import { createPlayer } from './player.js'; import { createWorld,startRun,updateWorld,updateAmbient,updateLobby,nearestProp,pickDraft,LOBBY_PROPS,clearRunFx,decayFx,swapHero,setHero,
} from './world.js'; import { drawScene,draftCardAt,shopItemAt,shopUpgradeAt,resultsButtonAt,pauseButtonAt,touchButtonsFor,closeButtonAt,ultiButtonAt,dashButtonAt,settingsGearAt,settingsButtonAt,dashboardButtonAt,heroCardAt,selectCloseAt,SELECT_CARDS, } from './render.js'; import { portraitsSettled } from './portraits.js'; import { artSettled } from './sprites.js';
// shots.js loads lazily, only in shot mode.
import { ITEMS, UPGRADES, buyItem, buyUpgrade, useItem } from './shop.js';

const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); const params = new URLSearchParams(location.search); const shotScene = params.get('shot'); const seed = Number(params.get('seed') ?? 1) || 1;

const world=createWorld(shotScene ? makeRng(seed*7919 + 13):liveRng()); const input=new Input(canvas); const audio=new SoundEngine(); world.audio=audio; world.input=input;

if (shotScene) { const { stageShotScene } = await import('./shots.js'); stageShotScene(world, audio, shotScene); }

window.addEventListener('keydown', () => audio.unlock(), { once: false }); window.addEventListener('pointerdown', () => audio.unlock(), { once: false });

let muted=false;

function beginRun(domainIndex=world.domainIndex) { audio.unlock(); startRun(world, domainIndex); world.state = 'playing'; }

function toLobby() { world.state = 'lobby'; world.dashTime = 0; world.dashParts = []; world.settings = null; world.selectOpen = false; clearRunFx(world); world.player = createPlayer(world.heroId); world.enemies.length = 0; world.bullets.length = 0; world.ebullets.length = 0; world.pickups.length = 0; world.corpses = []; world.slashes = []; world.boss = null; world.banner = null; world.dialogue = null;
  world.draft=null; world.fireballs = []; world.burnPatches = []; world.crystal.light=world.crystal.maxLight; world.worldW=WORLD_W_LOBBY; world.bridgeX=null; world.crystal.x=WORLD_W_LOBBY / 2; world.crystal.y=GROUND_Y - 85; world.camX=WORLD_W_LOBBY / 2 - VIEW_W / 2; world.camTargetX=world.camX; world.shockwaves = []; world.waves = []; }

// The Monument is the Wardens' door again (step 2; step 3 made it
// a cycle): using it advances the active Warden to the next of the
// three, in place, with a chime — Karlsefni -> Rosaline -> Tyne ->
// Karlsefni. The Portal and the Stall keep their jobs.
function openProp(prop) { if (!prop) return; if (prop.id === 'monument') { world.selectOpen = true; audio.pickup(); } else if (prop.id === 'portal') beginRun(0); else if (prop.id === 'shop') world.state = 'shop'; }

// Step 18: the settings panel's language switch — the
// choice is the world's, and it is remembered the way the
// best score is (localStorage, config.js's LANG_KEY).
function setLang(lang) { world.lang = lang; world.langChosen = true; try { localStorage.setItem(LANG_KEY, lang); } catch { } }

// Step 18: EXIT GAME. A web page cannot close a tab it did
// not open, so the close is attempted and expected to fail
// silently; either way the session resets (toLobby's fresh
// world) and the player lands on the DASHBOARD — step 19
// gave the game a front door, and Exit now leaves by it.
function exitGame() { try { window.close(); } catch { } toLobby(); world.state = 'dashboard'; }

function shopSay(text,color) { world.shopMsg={ text,color,t:1.8 }; }

function tryBuyItem(i) { const item=ITEMS[i]; if (buyItem(world,item.id)) {
    audio.buy(); shopSay(`${item.name} — yours. Key ${item.key} in the field.`, '#ffd23c');
  } else { audio.deny(); shopSay(world.profile.inv[item.id] >= 9 ? 'Your pack is full of those.' : 'Not enough Ember Coins.', '#ff8fa3'); }
}

function tryBuyUpgrade(i) { const track=UPGRADES[i]; if (buyUpgrade(world,track.id)) {
    audio.buy(); shopSay(`${track.name} rises to ${world.profile.upgrades[track.id]}.`, '#ffd23c');
  } else { audio.deny(); shopSay('Not enough materials for that.', '#ff8fa3'); }
}

// Keys and clicks between screens, read once a frame.
function handleFrameKeys() { if (input.justPressed('KeyM')) { muted=!muted; audio.setMuted(muted); }
  if (world.dialogue) { if (input.clicked || input.justPressed('Enter', 'KeyE', 'Space', 'Escape')) world.dialogue = null; return; }
  // Step 19: the dashboard's one door — ENTER, or a click /
  // tap on the Masuk button — opens the lobby. Nothing else
  // on the dashboard answers.
  if (world.state === 'dashboard') { if (input.justPressed('Enter') || (input.clicked && dashboardButtonAt(input.mouseX, input.mouseY))) { world.state = 'lobby'; world.dashTime = 0; world.dashParts = []; } return; }
  if (world.state === 'lobby') {
    // Step 18: while the settings panel is open it owns the
    // frame's keys and clicks — ENTER cannot start a run, E
    // cannot work a station, and the sim switches to ambient
    // below so the Warden stands still behind the panel.
    if (world.settings) {
      if (input.justPressed('Escape')) world.settings = null;
      else if (input.clicked) { const b = settingsButtonAt(world, input.mouseX, input.mouseY);
        if (b === 'close') world.settings = null;
        else if (b === 'back') world.settings.tab = 'main';
        else if (b === 'lang-en') setLang('en');
        else if (b === 'lang-id') setLang('id');
        else if (b === 'tutorial') world.settings.tab = 'tutorial';
        else if (b === 'exit') exitGame(); }
      return; }
    // Step 24: while the character-select panel is open it
    // owns the frame, exactly like settings — a card click
    // swaps the Warden in place and closes; the active card,
    // the ✕, Esc or E close without changing anything.
    if (world.selectOpen) {
      if (input.justPressed('Escape', 'KeyE')) world.selectOpen = false;
      else if (input.clicked) { if (selectCloseAt(input.mouseX, input.mouseY)) world.selectOpen = false;
        else { const card = heroCardAt(input.mouseX, input.mouseY); if (card >= 0) { const id = SELECT_CARDS[card].id; if (id !== world.heroId) { setHero(world, id); audio.pickup(); } world.selectOpen = false; } } }
      return; }
    if (input.clicked && settingsGearAt(input.mouseX, input.mouseY)) { world.settings = { tab: 'main' }; return; }
    if (input.justPressed('Enter')) { beginRun(0); return; }
    if (input.justPressed('KeyE')) openProp(nearestProp(world)); if (input.clicked) { const prop=LOBBY_PROPS.find((p)=>Math.hypot(input.mouseX - (p.x - (world.camX || 0)),input.mouseY - (GROUND_Y - 45)) < 78); openProp(prop ?? null); }
  } else if (world.state === 'shop') { for (let i=0; i < ITEMS.length; i++) {
      if (input.justPressed(`Digit${i + 1}`)) tryBuyItem(i);
    }
    if (input.clicked && closeButtonAt(world, input.mouseX, input.mouseY)) { world.state = 'lobby'; return; }
    if (input.clicked) { const item=shopItemAt(input.mouseX,input.mouseY); if (item>=0) tryBuyItem(item); else { const upgrade=shopUpgradeAt(input.mouseX,input.mouseY); if (upgrade>=0) tryBuyUpgrade(upgrade); }
    }
    if (input.justPressed('Escape', 'Enter')) world.state = 'lobby'; } else if (world.state === 'playing') { if (input.justPressed('KeyP', 'Escape')) { world.state = 'paused'; return; }
    // Step 17: a mouse click on the round ultimate button
    // fires the ultimate exactly like Q (the touch path
    // injects KeyQ through input.js's button map; this is
    // the mouse's door to the same press).
    if (input.clicked && ultiButtonAt(input.mouseX, input.mouseY)) input.pressed.add('KeyQ');
    // Step 26: a mouse click on the round dash button dashes, exactly like Space.
    if (input.clicked && dashButtonAt(input.mouseX, input.mouseY)) input.pressed.add('Space');
    for (let i=0; i < ITEMS.length; i++) {
      if (input.justPressed(`Digit${i + 1}`)) {
        if (useItem(world,ITEMS[i].id)) audio.pickup(); else { audio.deny(); world.shake=Math.min(5,world.shake + 2); }
      }
    }
  } else if (world.state === 'paused') { if (input.justPressed('KeyP', 'Escape', 'Enter')) world.state = 'playing'; else if (input.clicked) { const pb = pauseButtonAt(input.mouseX, input.mouseY); if (pb === 'exit') toLobby(); else if (pb === 'resume' || closeButtonAt(world, input.mouseX, input.mouseY)) world.state = 'playing'; } } else if (world.state === 'draft') { for (let i=0; i < 3; i++) {
      if (input.justPressed(`Digit${i + 1}`)) {
        pickDraft(world,i); return; }
    }
    if (input.clicked) { const card=draftCardAt(input.mouseX,input.mouseY); if (card>=0) pickDraft(world,card); }
  } else if (world.state === 'over' || world.state === 'victory') { if (input.justPressed('KeyR')) beginRun(world.domainIndex); else if (input.justPressed('Enter', 'Escape')) toLobby(); else if (input.clicked) { if (closeButtonAt(world, input.mouseX, input.mouseY)) toLobby(); else { const button = resultsButtonAt(input.mouseX, input.mouseY); if (button === 'again') beginRun(world.domainIndex);
      else if (button === 'lobby') toLobby(); } }
  }
}

const STEP=1 / 60; let last=performance.now(); let accumulator=0; let shotReadyRaised=false;

// Staged scenes are photographed only once the portraits settle.
let portraitsDone=false; portraitsSettled.then(()=>{ portraitsDone=true; });
let artDone=false; artSettled.then(()=>{ artDone=true; });

// The themed cursors live in the page CSS as custom properties (an ember
// shard; a brighter gold shard for clickable things). Each frame the plain
// shard is shown in-world, the bright one whenever the mouse rests on
// something clickable — the same hit tests the click handler uses.
const cursorCss = getComputedStyle(document.documentElement);
const CURSOR_PLAIN = cursorCss.getPropertyValue('--ew-cursor').trim();
const CURSOR_POINT = cursorCss.getPropertyValue('--ew-cursor-pointer').trim();
let cursorShown = '';
function updateCursor() { if (!CURSOR_PLAIN || !CURSOR_POINT) return; const mx=input.mouseX; const my=input.mouseY; let point=false;
  if (world.dialogue) point = true;
  else if (world.state === 'dashboard') point = dashboardButtonAt(mx, my);
  else if (world.state === 'lobby') point = !!world.settings ? !!settingsButtonAt(world, mx, my) : world.selectOpen ? (heroCardAt(mx, my) >= 0 || selectCloseAt(mx, my)) : settingsGearAt(mx, my) || !!nearestProp(world) || LOBBY_PROPS.some((p) => Math.hypot(mx - (p.x - (world.camX || 0)), my - (GROUND_Y - 45)) < 78);
  else if (world.state === 'shop') point = shopItemAt(mx, my) >= 0 || shopUpgradeAt(mx, my) >= 0 || closeButtonAt(world, mx, my);
  else if (world.state === 'draft') point = draftCardAt(mx, my) >= 0;
  else if (world.state === 'playing') point = ultiButtonAt(mx, my) || dashButtonAt(mx, my);
  else if (world.state === 'paused') point = closeButtonAt(world, mx, my) || !!pauseButtonAt(mx, my);
  else if (world.state === 'over' || world.state === 'victory') point = !!resultsButtonAt(mx, my) || closeButtonAt(world, mx, my);
  const want = point ? CURSOR_POINT : CURSOR_PLAIN; if (want !== cursorShown) { cursorShown = want; canvas.style.cursor = want; } }

function animate(now) { requestAnimationFrame(animate); const frameDt=Math.min(0.1,(now - last) / 1000); last=now;

  input.walkMode = world.state === 'lobby' || world.state === 'playing'; input.setButtons(input.touchMode ? touchButtonsFor(world) : []);
  // A portrait phone waits behind the rotate overlay: no keys, no sim.
  input.rotateBlock=input.touchMode&&window.innerWidth < window.innerHeight; if (!input.rotateBlock) handleFrameKeys(); if (world.shopMsg) { world.shopMsg.t -=frameDt; if (world.shopMsg.t<=0) world.shopMsg=null; }

  // The pause freezes the sim, but never a fade: shake/overlay decay
  // still advances there, as it does in every other state via its updater.
  if (world.state === 'paused' && !input.rotateBlock) decayFx(world, frameDt);
  if (world.state !== 'paused' && !input.rotateBlock) { accumulator+=frameDt; while (accumulator>=STEP) { accumulator -= STEP; if (world.hitStop > 0) { world.hitStop -= STEP; continue; }
      if (world.state === 'playing' && !world.dialogue) updateWorld(world, input, audio, STEP); else if (world.state === 'lobby' && !world.settings && !world.selectOpen) updateLobby(world, input, audio, STEP); else updateAmbient(world,STEP); }
  }

  drawScene(ctx,world); input.endFrame(); updateCursor();

  const needsPortraits = shotScene === 'lobby' || shotScene === 'select' || shotScene === 'boss'; if (shotScene&&!shotReadyRaised&&(!needsPortraits||portraitsDone)&&artDone) { shotReadyRaised=true; window.__shotReady=true; }
}

window.__game=world; requestAnimationFrame(animate);
