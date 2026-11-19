// render.js — everything the eye sees: the Crystal, the HUD, screens.
// CHARACTER WIPE (2026-11-19): every character was stripped out of
// the playable build, and this module lost all its character
// renderers with them. REBUILD STEP 1 (same morning): Karlsefni is
// drawn again (sprites.js's drawHeroSprite, in the world layer over
// the ground line) and his dot is back on the minimap; REBUILD STEP
// 2 (same morning) adds Rosaline through the same draw path and the
// lobby overlay now names the active Warden and the Monument swap;
// REBUILD STEP 3 (same morning) adds Tyne the same way, and the
// overlay's step line now names the three-way Monument cycle.
// REBUILD STEP 5 (same morning): the Gloomslick is drawn in the
// world layer (sprites.js's drawSlimeSprite, in front of the
// pickups, behind the Warden) and its living dots join the
// minimap; the overlay's lines name its return.
// REBUILD STEP 6 (same morning): Rosaline's loosed fire arrows
// are drawn in the world layer over the Warden (sprites.js's
// drawProjectiles); the overlay's step line names her shot.
// REBUILD STEP 7 (same morning): Tyne's star-bolts join the same
// draw; the overlay's step line names the completed trio.
// REBUILD STEP 8 (same morning): Karlsefni's Flying Slash waves
// are drawn in the world layer over the projectiles (sprites.js's
// drawSlashWaves), the run HUD gains his Nova meter under the
// score (it fills as his blade lands; at full it calls for Q),
// and the touch cluster gains its NOVA button for him — bottom
// right, its rim an arc of the meter's charge, lit gold at full.
// The overlay's step line names the ultimate.
// REBUILD STEP 10 (same morning): Tyne's Starfall joins the
// same machinery — her orb sequence is drawn by the same
// drawSlashWaves, the HUD meter and the touch NOVA button now
// serve both ultimate heroes (hers in violet, its ready call
// naming the Starfall), and the overlay's step line names her
// ultimate too. Rosaline still has neither meter nor button.
// REBUILD STEP 11 (same morning): Rosaline's Crimson Rose
// completes the trio — the giant arrow is drawn by the same
// drawSlashWaves (rotated to its heading, swelling through its
// three stages), the HUD meter and touch NOVA button now
// serve all three heroes (hers in crimson, its ready call
// naming the Crimson Rose), and the overlay's step line names
// all three ultimates.
// There are still no bosses, no bolts/arcs, no storyboards, no
// select cards and no portraits. The screens are the lobby, the
// Ember Stall, the (dormant) draft, pause and results. Pre-wipe
// source: hidden_files/backup-2026-11-19-pre-wipe/.

import { VIEW_W,VIEW_H,PALETTE,TOUCH_STICK,GROUND_Y,GAME_VERSION, } from './config.js'; import { drawPickup } from './pickups.js'; import { drawStar } from './particles.js'; import { waveLabel, rankForWaves, LOBBY_PROPS, nearestProp } from './world.js';
import { drawHeroSprite, drawHeroAfterimage, drawSlimeSprite, drawZombieSprite, drawGoblinSprite, drawKnightSprite, drawDragonSprite, drawBossTelegraph, drawProjectiles, drawSlashWaves, drawUltiIcon } from './sprites.js';
import { ESSENCES, domainAt } from './domains.js'; import { RARITIES } from './draft.js'; import { ITEMS, UPGRADES, upgradeCost } from './shop.js';
import { getPortrait, PORTRAIT_SUBJECT } from './portraits.js';
import { t } from './strings.js';

const SERIF = 'Georgia, "Times New Roman", serif'; const IN_RUN = ['playing', 'paused', 'draft', 'over', 'victory']; const IN_LOBBY = ['lobby', 'select', 'shop'];

// Pixel restyle: the world renders to a 480×270 offscreen and is blitted
// up unsmoothed (chunky ~2.7× pixels); UI and portraits draw full-res.

const pixCv=document.createElement('canvas'); pixCv.width=480; pixCv.height=270; const pix=pixCv.getContext('2d');

function txt(ctx, s, x, y, font, color, align = 'center') { ctx.fillStyle=color; ctx.font=font; ctx.textAlign=align; ctx.fillText(s,x,y); }

function panel(ctx,x,y,w,h,fill,border,lw=1.4) { ctx.fillStyle=fill; ctx.fillRect(x,y,w,h); if (border) { ctx.strokeStyle=border; ctx.lineWidth=lw; ctx.strokeRect(x,y,w,h); }
}

export function draftCardRect(i) { return { x:170 + i*320,y:262,w:300,h:252 }; }

export function draftCardAt(x,y) { for (let i=0; i < 3; i++) { const r=draftCardRect(i); if (x>=r.x&&x<=r.x + r.w&&y>=r.y&&y<=r.y + r.h) return i; }
  return -1; }

export function shopItemRect(i) { return { x:174 + i*236,y:198,w:224,h:128 }; }

export function shopItemAt(x,y) { for (let i=0; i < ITEMS.length; i++) { const r=shopItemRect(i); if (x>=r.x&&x<=r.x + r.w&&y>=r.y&&y<=r.y + r.h) return i; }
  return -1; }

export function shopUpgradeRect(i) { return { x:174,y:396 + i*42,w:932,h:38 }; }

export function shopUpgradeAt(x,y) { for (let i=0; i < UPGRADES.length; i++) { const r=shopUpgradeRect(i); if (x>=r.x&&x<=r.x + r.w&&y>=r.y&&y<=r.y + r.h) return i; }
  return -1; }

export function resultsButtonRect(which) { return which === 'again'
    ? { x:VIEW_W / 2 - 324,y:548,w:312,h:46 }
 :{ x:VIEW_W / 2 + 12,y:548,w:312,h:46 }; }

export function resultsButtonAt(x,y) { for (const which of ['again', 'lobby']) { const r=resultsButtonRect(which); if (x>=r.x&&x<=r.x + r.w&&y>=r.y&&y<=r.y + r.h) return which; }
  return null; }

// The touch buttons for this screen (input hit-tests the same rects).
// In a run: the pause button, the HUD's hotbar slots, and — for
// the ultimate heroes (Karlsefni, step 8; Tyne, step 10;
// Rosaline, step 11 — the whole trio now) — the
// NOVA button at bottom right, which
// injects Q like the keyboard does (input.js's button map).
// The round ultimate button (step 17): bottom-right, the
// same rect the touch cluster has used since step 8 — now
// drawn for every player (drawHud's drawUltiButton) in the
// Genshin manner: the hero's own ultimate art inside a
// circle that fills as the Nova meter charges. Input
// hit-tests this geometry for touch (touchButtonsFor) and
// for the mouse (main.js's click path; the hover cursor in
// main.js's updateCursor).
export const ULTI_BTN = { x: VIEW_W - 104, y: VIEW_H - 128, w: 76, h: 76 };
export function ultiButtonGeom() { return { cx: ULTI_BTN.x + ULTI_BTN.w / 2, cy: ULTI_BTN.y + ULTI_BTN.h / 2, r: ULTI_BTN.w / 2 }; }
export function ultiButtonAt(x, y) { const g = ultiButtonGeom(); return Math.hypot(x - g.cx, y - g.cy) <= g.r; }

// Step 26: the round DASH button, left of the ultimate
// circle — same treatment (drawn for every player by
// drawHud; input.js's map turns its touch into Space, and
// main.js's click path injects Space too).
export const DASH_BTN = { x: VIEW_W - 188, y: VIEW_H - 118, w: 60, h: 60 };
export function dashButtonGeom() { return { cx: DASH_BTN.x + DASH_BTN.w / 2, cy: DASH_BTN.y + DASH_BTN.h / 2, r: DASH_BTN.w / 2 }; }
export function dashButtonAt(x, y) { const g = dashButtonGeom(); return Math.hypot(x - g.cx, y - g.cy) <= g.r; }

// Per-hero ultimate dressing: the accent the button fills
// with and the words its full state calls (steps 8/10/11's
// table, kept).
export const ULTI_HUD = { karlsefni: { ready: 'FLYING SLASH READY', bar: '#6fe7ff', dim: 'rgba(174, 233, 255, 0.8)', edge: 'rgba(111, 231, 255, 0.5)' },
                    tyne: { ready: 'STARFALL READY', bar: '#b78cff', dim: 'rgba(201, 166, 255, 0.85)', edge: 'rgba(183, 140, 255, 0.55)' },
                    rosaline: { ready: 'CRIMSON ROSE READY', bar: '#ff5a48', dim: 'rgba(255, 150, 130, 0.85)', edge: 'rgba(255, 90, 72, 0.55)' } };

export function touchButtonsFor(world) { if (world.dialogue) return []; if (world.state === 'playing') { return [ { id: 'pause', x: VIEW_W - 66, y: 100, w: 54, h: 54 },
      ...(world.player?.id === 'karlsefni' || world.player?.id === 'tyne' || world.player?.id === 'rosaline' ? [{ id: 'nova', ...ULTI_BTN }, { id: 'dash', ...DASH_BTN }] : []),
      ...ITEMS.map((_, i) => ({ id: `item${i}`, x: 24 + i * 58, y: VIEW_H - 32, w: 54, h: 32 })) ];
  }
  if (world.state === 'paused') return [{ id: 'pause', x: VIEW_W - 66, y: 100, w: 54, h: 54 }]; return []; }

export function touchStickFor() { return { x:TOUCH_STICK.x,y:TOUCH_STICK.y,r:TOUCH_STICK.r }; }

// The ✕ close rect of the overlay that is up, if any.

export function closeRectFor(world) { if (world.dialogue) return { x: 1064, y: 560, w: 36, h: 36 }; if (world.state === 'shop') return { x: 1080, y: 94, w: 40, h: 40 }; if (world.state === 'paused' || world.state === 'over' || world.state === 'victory') return { x: VIEW_W - 58, y: 22, w: 40, h: 40 }; return null; }

export function pauseButtonRect(which) { return which === 'resume'
  ? { x:VIEW_W / 2 - 130,y:424,w:260,h:56 }
 :{ x:VIEW_W / 2 - 130,y:496,w:260,h:56 }; }

export function pauseButtonAt(x,y) { for (const which of ['resume', 'exit']) { const r=pauseButtonRect(which); if (x>=r.x&&x<=r.x + r.w&&y>=r.y&&y<=r.y + r.h) return which; }
  return null; }

export function closeButtonAt(world,x,y) { const r=closeRectFor(world); return !!r&&x>=r.x&&x<=r.x + r.w&&y>=r.y&&y<=r.y + r.h; }

function drawCloseButton(ctx,world) { const r=closeRectFor(world); if (!r) return; ctx.save(); ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 - 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.stroke();
  txt(ctx, '✕', r.x + r.w / 2, r.y + r.h / 2 + 6, `bold 15px ${SERIF}`, PALETTE.cream); ctx.restore();
}

export function drawScene(ctx,world) { const inRun = IN_RUN.includes(world.state); const themeName = inRun ? 'abyss' : 'lobby'; const camX = world.camX || 0;
  // Step 28: on the dashboard the vista drifts gently (a
  // slow parallax sway around the Crystal framing).
  const dashDrift = world.state === 'dashboard' ? Math.sin((world.dashTime || 0) * 0.07) * 16 : 0; world.__dashDrift = dashDrift; const camEff = camX + dashDrift;
  pix.setTransform(0.375,0,0,0.375,0,0); pix.save(); world.background.drawSky(pix, world.time, themeName, camEff, inRun && world.wave % 4 === 0);
  pix.save(); if (world.shake > 0.2) { const s=world.shake; pix.translate((world.rng.next() - 0.5)*s,(world.rng.next() - 0.5)*s); }
  pix.translate(-camEff, 0); world.background.drawWorld(pix, world.time, themeName, world); drawCrystal(pix, world); if (IN_LOBBY.includes(world.state) || world.state === 'dashboard') drawLobbyProps(pix, world);
  for (const pk of world.pickups) drawPickup(pix,pk,world.time); for (const e of world.enemies) if (e && (e.kind === 'knight' || e.kind === 'dragon')) drawBossTelegraph(pix, world, e); for (const e of world.enemies) { if (e && e.kind === 'slime') drawSlimeSprite(pix, world, e); else if (e && e.kind === 'zombie') drawZombieSprite(pix, world, e); else if (e && e.kind === 'goblin') drawGoblinSprite(pix, world, e); else if (e && e.kind === 'knight') drawKnightSprite(pix, world, e); else if (e && e.kind === 'dragon') drawDragonSprite(pix, world, e); } if (world.state === 'dashboard') drawDashboardHeroes(pix, world); else if (world.player) { for (const g of world.player.ghosts ?? []) drawHeroAfterimage(pix, world, g); drawHeroSprite(pix, world, world.player); } drawProjectiles(pix, world); drawSlashWaves(pix, world); world.particles.draw(pix); pix.restore(); pix.restore();
  ctx.imageSmoothingEnabled=false; ctx.drawImage(pixCv,0,0,VIEW_W,VIEW_H); if (IN_LOBBY.includes(world.state)) drawLobbyLabels(ctx,world);

  drawVignette(ctx,world); if (world.state === 'playing' || world.state === 'paused' || world.state === 'draft') drawHud(ctx, world); else world.hudHero = null; if (world.state === 'lobby' || inRun) drawMinimap(ctx, world); if (world.banner && world.state === 'playing') drawBanner(ctx, world);
  // STEP 18: the lobby overlay (the big EMBERWARD title, the
  // tagline, the flavour line, the footer block) is GONE —
  // the lobby is the clean scene alone, and its words moved
  // to the step-19 dashboard. What the lobby gains instead
  // is the settings gear (top-right) and, while it is open,
  // the settings panel.
  if (world.state === 'lobby') { drawSettingsGear(ctx, world); if (world.settings) drawSettings(ctx, world); }
  if (world.state === 'dashboard') drawDashboard(ctx, world);
  if (world.state === 'shop') drawShop(ctx, world); if (world.state === 'draft') drawDraft(ctx, world); if (world.selectOpen) drawSelectOverlay(ctx, world);
  if (world.state === 'paused') drawPause(ctx, world); if (world.state === 'over') drawResults(ctx, world, false); if (world.state === 'victory') drawResults(ctx, world, true); drawCloseButton(ctx, world); drawTouchControls(ctx, world); drawRotateOverlay(ctx, world); }

// The minimap strip: the wide world as a line of dots (UI layer).
// Karlsefni's warden dot is back with him; the Crystal and, in the
// plaza, the three stations are the other marks. Step 5 adds the
// living slimes as small violet dots in a run; step 12 adds the
// living zombies as green dots beside them; step 13 adds the
// living goblins as amber dots. No boss dots —
// there are no bosses.
export function minimapMarks(world) { const worldW=world.worldW || VIEW_W; const marks=[];
  if (IN_LOBBY.includes(world.state)) { for (const prop of LOBBY_PROPS) marks.push({ type: 'station', t: prop.x / worldW, color: '#ffd982' }); }
  for (const e of world.enemies || []) { if (e && e.kind === 'slime' && !e.dead) marks.push({ type: 'foe', t: e.x / worldW, color: '#8f7bff' }); else if (e && e.kind === 'zombie' && !e.dead) marks.push({ type: 'foe', t: e.x / worldW, color: '#7ec850' }); else if (e && e.kind === 'goblin' && !e.dead) marks.push({ type: 'foe', t: e.x / worldW, color: '#ffb03a' }); else if (e && e.kind === 'knight' && !e.dead) marks.push({ type: 'boss', t: e.x / worldW, color: '#d7dce8' }); else if (e && e.kind === 'dragon' && !e.dead) marks.push({ type: 'boss', t: e.x / worldW, color: '#ff5a3c' }); }
  marks.push({ type: 'crystal', t: world.crystal.x / worldW, color: '#5ff2d0' }); if (world.player) marks.push({ type: 'warden', t: world.player.x / worldW, color: '#e8fbff' }); return marks; }

function drawMinimap(ctx,world) { const w=340; const x0=VIEW_W / 2 - w / 2; const y=9; ctx.save(); ctx.fillStyle='rgba(8, 6, 22, 0.55)'; ctx.beginPath(); ctx.roundRect(x0 - 6,y - 4,w + 12,17,6); ctx.fill(); ctx.strokeStyle='rgba(255, 215, 130, 0.4)'; ctx.lineWidth=1; ctx.stroke();
  ctx.strokeStyle='rgba(255, 246, 224, 0.35)'; ctx.beginPath(); ctx.moveTo(x0,y + 4.5); ctx.lineTo(x0 + w,y + 4.5); ctx.stroke(); for (const m of minimapMarks(world)) { const mx=x0 + m.t*w; ctx.fillStyle=m.color; ctx.beginPath(); ctx.arc(mx,y + 4.5,m.type === 'warden' ? 3.4 : m.type === 'boss' ? 3.2 : 2.4,0,Math.PI*2); ctx.fill(); if (m.type === 'warden') { ctx.strokeStyle='#fff6e0'; ctx.lineWidth=1; ctx.stroke(); } }
  ctx.restore(); }

// Last moments: the slime's melt frame sinking; the goblin's death frame.
// A portrait drawn whole inside its frame — contain fit, standing on the
// frame's floor; the chibi figures are never stretched or cropped.

// ——— Touch controls: the fixed stick and the pause button ———

function drawTouchControls(ctx,world) { const input=world.input; if (!input?.touchMode || world.dialogue) return; ctx.save(); if (world.state === 'lobby' || world.state === 'playing') {
    // The joystick stands permanent at its anchor, knob at rest or dragged.
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#0a0820'; ctx.beginPath(); ctx.arc(TOUCH_STICK.x, TOUCH_STICK.y, TOUCH_STICK.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.85; ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalAlpha = 0.6;
    ctx.fillStyle=PALETTE.gold; ctx.beginPath(); ctx.arc(TOUCH_STICK.x + input.stickX*38,TOUCH_STICK.y + input.stickY*38,24,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
  for (const b of touchButtonsFor(world)) {
    if (b.id.startsWith('item')) continue; // the HUD's hotbar slots are the buttons
    if (b.id === 'nova') continue; // step 17: the round ultimate button is drawn by drawHud for every player now, touch or not — drawing it here too would double it. Its touch hit-test still runs through this rect (input.js's button map injects Q).
    if (b.id === 'dash') continue; // step 26: the round dash button is likewise drawn by drawHud; its touch hit-test injects Space.
    const cx=b.x + b.w / 2; const cy=b.y + b.h / 2; const held=input.buttonId===b.id; const r = b.w / 2; ctx.globalAlpha = held ? 0.95 : 0.62; ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = PALETTE.gold; ctx.lineWidth=1.8; ctx.beginPath(); ctx.arc(cx,cy,r - 2,0,Math.PI*2); ctx.stroke();
    txt(ctx, '❚❚', cx, cy + 4, `bold 13px ${SERIF}`, PALETTE.cream);
  }
  ctx.restore(); }

function drawRotateOverlay(ctx,world) { if (!world.input?.touchMode || window.innerWidth >= window.innerHeight) return; ctx.save(); ctx.fillStyle = 'rgba(5, 4, 16, 0.9)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const cx=VIEW_W / 2; const cy=VIEW_H / 2 - 46; ctx.strokeStyle=PALETTE.gold; ctx.lineWidth=3; ctx.beginPath(); ctx.roundRect(cx - 34,cy - 58,68,116,12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 34,cy - 34); ctx.lineTo(cx + 34,cy - 34); ctx.moveTo(cx - 34,cy + 40); ctx.lineTo(cx + 34,cy + 40); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,94,-0.5,1.45); ctx.stroke(); const ax=cx + Math.cos(1.45)*94; const ay=cy + Math.sin(1.45)*94; ctx.fillStyle=PALETTE.gold; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax - 17,ay - 5); ctx.lineTo(ax - 6,ay + 14); ctx.closePath(); ctx.fill();
  txt(ctx, 'ROTATE YOUR PHONE', cx, cy + 152, `bold 34px ${SERIF}`, PALETTE.cream); txt(ctx, 'Emberward is played in landscape', cx, cy + 186, `italic 17px ${SERIF}`, PALETTE.gold); ctx.restore();
}

// ——— The Starfall Crystal ———

function drawCrystal(ctx,world) { const c=world.crystal; const cx=c.x; const base=GROUND_Y; const lightFrac=c.light / c.maxLight; const pulse=1 + Math.sin(world.time*2.4)*0.05; const hurt=c.hurtT > 0;

  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, base - 118); ctx.rotate(world.time*0.05); for (let i=0; i < 6; i++) {
    ctx.rotate(Math.PI / 3); const ray = ctx.createLinearGradient(0, 0, 0, -330); ray.addColorStop(0, `rgba(95, 242, 208, ${0.05 + lightFrac * 0.05})`); ray.addColorStop(1, 'rgba(95, 242, 208, 0)'); ctx.fillStyle = ray; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(-26,-330); ctx.lineTo(26,-330); ctx.closePath(); ctx.fill(); }
  ctx.restore();

  const glowR=(150 + lightFrac*130)*pulse;
  const glow = ctx.createRadialGradient(cx, base - 118, 6, cx, base - 118, glowR); glow.addColorStop(0, hurt ? 'rgba(255, 110, 130, 0.5)' : 'rgba(140, 255, 225, 0.5)'); glow.addColorStop(0.4, 'rgba(95, 242, 208, 0.18)'); glow.addColorStop(1, 'rgba(95, 242, 208, 0)');
  ctx.fillStyle=glow; ctx.fillRect(cx - glowR,base - 118 - glowR,glowR*2,glowR*2);

  drawRuneCircle(ctx, cx, base - 2, 86, world.time * 0.14, '#5ff2d0'); drawRuneCircle(ctx, cx, base - 2, 66, -world.time * 0.2, '#ffd982');

  // The stone pedestal the Crystal stands on.
  ctx.fillStyle = '#2c3350'; ctx.fillRect(cx - 56, base - 14, 112, 14); ctx.fillStyle = '#232a45'; ctx.fillRect(cx - 42, base - 30, 84, 16); ctx.fillStyle = '#39406b'; ctx.fillRect(cx - 42, base - 30, 84, 4);
  ctx.strokeStyle = 'rgba(140, 255, 225, 0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - 56, base - 14); ctx.lineTo(cx + 56, base - 14); ctx.stroke();

  ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * lightFrac; drawShard(ctx, cx, base - 26, 30, 158 * pulse, hurt ? '#ff8fa3' : '#6ff5d8', '#eafffa'); drawShard(ctx, cx - 36, base - 24, 15, 80 * pulse, '#4ad8c2', '#d8fff4');
  drawShard(ctx, cx + 38, base - 24, 12, 62 * pulse, '#4ad8c2', '#d8fff4'); drawShard(ctx, cx + 21, base - 22, 8, 36, '#3cc2ab', '#c8f5ea'); ctx.restore();

  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a=world.time*0.5 + (i / 7)*Math.PI*2; const ox=cx + Math.cos(a)*58;
    const oy = base - 108 + Math.sin(a) * 20 + Math.sin(world.time * 1.3 + i) * 5; ctx.fillStyle = i % 2 ? '#ffd982' : '#5ff2d0'; drawStar(ctx, ox, oy, 4.4, a); }
  ctx.restore(); }

function drawShard(ctx,x,baseY,halfW,height,face,edge) {
  ctx.save(); ctx.shadowColor=face; ctx.shadowBlur=18; ctx.fillStyle=face; ctx.globalAlpha=0.88; ctx.beginPath(); ctx.moveTo(x - halfW,baseY); ctx.lineTo(x - halfW*0.34,baseY - height*0.72); ctx.lineTo(x,baseY - height); ctx.lineTo(x + halfW*0.4,baseY - height*0.66); ctx.lineTo(x + halfW,baseY);
  ctx.closePath(); ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=0.5; ctx.fillStyle=edge; ctx.beginPath(); ctx.moveTo(x,baseY - height); ctx.lineTo(x + halfW*0.4,baseY - height*0.66); ctx.lineTo(x + halfW*0.2,baseY); ctx.lineTo(x - halfW*0.1,baseY); ctx.closePath(); ctx.fill(); ctx.restore(); }

function drawRuneCircle(ctx,x,y,r,rotation,color) { ctx.save(); ctx.translate(x,y); ctx.scale(1,0.36); ctx.rotate(rotation); ctx.strokeStyle=color; ctx.globalAlpha=0.55; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke(); for (let i=0; i < 12; i++) {
    const a=(i / 12)*Math.PI*2; const x1=Math.cos(a)*(r - 9); const y1=Math.sin(a)*(r - 9); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1 + 6,y1 - 4); ctx.moveTo(x1,y1); ctx.lineTo(x1 + 2,y1 + 6); ctx.stroke(); }
  ctx.restore(); }

// ——— Foes ———

// The drawn body sizes in px, ground-anchored (the hero sprite stands
// ~66 tall). Riftborn elites draw at base x elite. Bosses: the knight
// and the dragon, both by height.

function drawVignette(ctx,world) { const v = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.42, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95); v.addColorStop(0, 'rgba(3, 2, 10, 0)'); v.addColorStop(1, 'rgba(3, 2, 10, 0.55)'); ctx.fillStyle = v; ctx.fillRect(0,0,VIEW_W,VIEW_H); if (world.hurtT > 0) {
    ctx.fillStyle = `rgba(190, 30, 60, ${world.hurtT * 0.28})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255, 240, 200, ${world.flash * 0.5})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (world.crystal.light < 30 && world.state === 'playing') {
    const pulse = 0.1 + 0.08 * Math.sin(world.time * 5); ctx.fillStyle = `rgba(160, 20, 50, ${pulse})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

function drawCoinIcon(ctx,x,y,r) {
  ctx.save(); ctx.fillStyle = '#ffd23c'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(146, 90, 10, 0.85)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r - 1.8, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#fff3c4'; drawStar(ctx, x, y, r * 0.52, 0); ctx.restore(); }

function bar(ctx,x,y,w,h,frac,color,back) { ctx.fillStyle=back; ctx.fillRect(x,y,w,h); ctx.fillStyle=color; ctx.fillRect(x,y,w*Math.max(0,Math.min(1,frac)),h); }

function flourish(ctx,cx,y,halfW,color) { ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(cx - halfW,y); ctx.lineTo(cx - 14,y); ctx.moveTo(cx + 14,y); ctx.lineTo(cx + halfW,y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,y - 6); ctx.lineTo(cx + 6,y); ctx.lineTo(cx,y + 6); ctx.lineTo(cx - 6,y); ctx.closePath(); ctx.fill(); ctx.restore(); }

// ——— HUD ———

// ——— HUD ———
// Hers is gone: no name, no HP bar, no Nova meter, no skill icon, no
// combo counter, no boss bar, no draft-pick icons. What remains is
// the run's scaffolding — score, best, coins, the wave banner line,
// the Crystal's light and the (dormant) hotbar.

function drawHud(ctx,world) {
  ctx.save(); txt(ctx, t(world, 'score'), 26, 34, `13px ${SERIF}`, PALETTE.gold, 'left'); ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = 8; txt(ctx, String(world.score).padStart(6, '0'), 24, 66, `bold 30px ${SERIF}`, PALETTE.cream, 'left');
  ctx.shadowBlur=0; txt(ctx, t(world, 'best'), VIEW_W - 26, 34, `13px ${SERIF}`, PALETTE.gold, 'right'); txt(ctx, String(Math.max(world.best, world.score)).padStart(6, '0'), VIEW_W - 24, 62, `bold 22px ${SERIF}`, PALETTE.cream, 'right'); drawCoinIcon(ctx, VIEW_W - 118, 84, 7);
  // STEP 17: the Crystal's light moves to the top-left, into
  // the slot the Nova bar vacated — same bar, same label, new
  // home (the user: "darah crystal nya pindahin ke bagian
  // atas kiri"). Its geometry is left on world.hudCrystal.
  txt(ctx, t(world, 'crystalLight'), 26, 92, `12px ${SERIF}`, '#8ff5dd', 'left'); bar(ctx, 24, 98, 210, 11, world.crystal.light / world.crystal.maxLight, '#5ff2d0', 'rgba(255,255,255,0.13)');
  ctx.strokeStyle = 'rgba(255, 215, 130, 0.5)'; ctx.lineWidth = 1; ctx.strokeRect(24, 98, 210, 11);
  world.hudCrystal = { x: 24, y: 98, w: 210, h: 11, frac: Math.max(0, Math.min(1, world.crystal.light / world.crystal.maxLight)) };
  txt(ctx, String(world.profile.embers), VIEW_W - 24, 90, `bold 16px ${SERIF}`, '#ffd23c', 'right'); txt(ctx, waveLabel(world, world.wave), VIEW_W / 2, 32, `15px ${SERIF}`, PALETTE.cream);
  ITEMS.forEach((item,i)=>{
    const bx = 26 + i * 58; const by = VIEW_H - 25; const count = world.profile.inv[item.id]; ctx.globalAlpha = count > 0 ? 1 : 0.45; panel(ctx, bx, by, 52, 19, 'rgba(10, 8, 24, 0.66)', item.color, 1); txt(ctx, item.key, bx + 5, by + 13.5, `bold 10.5px ${SERIF}`, item.color, 'left');
    txt(ctx, `×${count}`, bx + 47, by + 13.5, `bold 12px ${SERIF}`, PALETTE.cream, 'right'); ctx.globalAlpha = 1;
  }); txt(ctx, world.phase === 'intermission' ? t(world, 'phaseGathers') : t(world, 'phaseQuiet'), VIEW_W / 2, 52, `12px ${SERIF}`, 'rgba(255, 246, 224, 0.55)');
  drawHeroMedallion(ctx, world);
  drawUltiButton(ctx, world);
  drawDashButton(ctx, world);
  ctx.restore(); }

// Step 26: the round dash button, left of the ultimate
// circle — a "»" blitz glyph that dims while the 3 s
// cooldown runs and sweeps back to full as it recharges.
// Drawn for every player (like the ulti button); its touch
// hit-test lives in touchButtonsFor, its mouse click in
// main.js. State left on world.dashUi for the tests.
function drawDashButton(ctx, world) { const p = world.player; world.dashUi = null; if (!p) return;
  const { cx, cy, r } = dashButtonGeom();
  const cdFrac = Math.max(0, Math.min(1, (p.dashCdT || 0) / 3.0)); const ready = cdFrac <= 0;
  const card = SELECT_CARDS.find(c => c.id === p.id); const accent = card ? card.accent : PALETTE.gold;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ready ? PALETTE.gold : 'rgba(255, 215, 130, 0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2); ctx.stroke();
  if (!ready) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r - 3, -Math.PI / 2, -Math.PI / 2 + (1 - cdFrac) * Math.PI * 2); ctx.closePath(); ctx.fillStyle = 'rgba(255, 207, 110, 0.18)'; ctx.fill(); }
  ctx.globalAlpha = ready ? 1 : 0.35;
  txt(ctx, '»', cx, cy + 9, `bold 30px ${SERIF}`, accent, 'center');
  ctx.globalAlpha = 1;
  txt(ctx, 'SPACE', cx, cy + r + 13, `10px ${SERIF}`, 'rgba(255, 246, 224, 0.6)', 'center');
  ctx.restore();
  world.dashUi = { cx, cy, r, ready, cdFrac };
}

// STEP 25: the Warden's own health, bottom-left — her
// portrait in a round ember-ringed medallion (face-cropped
// from the step-24 art) with the hull bar extending right
// from it, one unit. The rebuild's HUD carried NO hero
// health before this (checked: drawHud had no hull readout),
// so this is the one and only display — no duplicate exists
// to remove. The bar's max is the REAL maxHull, step-23
// blessings included; below 30% hull the ring and bar pulse
// red. Item slots keep their row beneath. State is left on
// world.hudHero for the tests.
export function medallionGeom() { return { cx: 58, cy: 638, r: 30, barX: 100, barY: 630, barW: 192, barH: 14 }; }
function drawHeroMedallion(ctx, world) { const p = world.player; world.hudHero = null; if (!p) return;
  const { cx, cy, r, barX, barY, barW, barH } = medallionGeom();
  const frac = Math.max(0, Math.min(1, p.hull / Math.max(1, p.maxHull)));
  const low = frac < 0.3; const pulse = low ? 0.55 + 0.45 * Math.sin(world.time * 6) : 0;
  const card = SELECT_CARDS.find(c => c.id === p.id); const accent = card ? card.accent : PALETTE.gold;
  ctx.save();
  // The portrait, face-cropped from the keyed art.
  const img = getPortrait(p.id); const sub = PORTRAIT_SUBJECT[p.id];
  ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  if (img && sub) { const iw = img.naturalWidth, ih = img.naturalHeight;
    const sw = iw * sub.w * 0.60; const sh = sw; const sx = iw * (sub.x + sub.w / 2) - sw / 2; const sy = ih * sub.y + ih * sub.h * 0.03;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 2.5, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, cx - r + 2.5, cy - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2); ctx.restore(); }
  // The ember ring — red-pulsing when the hull runs low.
  ctx.strokeStyle = low ? `rgba(255, 62, 48, ${0.55 + 0.45 * pulse})` : PALETTE.gold; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.stroke();
  // Step 26's readiness cue: a thin outer arc that sweeps
  // back as the dash recharges (full + gold when ready).
  const dashFrac = 1 - Math.max(0, Math.min(1, (p.dashCdT || 0) / 3.0));
  if (dashFrac >= 1) { ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.stroke(); }
  else if (dashFrac > 0) { ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r + 4, -Math.PI / 2, -Math.PI / 2 + dashFrac * Math.PI * 2); ctx.stroke(); }
  // The hull bar beside it.
  ctx.fillStyle = 'rgba(10, 8, 24, 0.72)'; ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(barX, barY, barW, barH);
  if (frac > 0) { ctx.fillStyle = low ? `rgba(255, 62, 48, ${0.65 + 0.35 * pulse})` : '#ffc44d'; ctx.fillRect(barX, barY, barW * frac, barH); }
  ctx.strokeStyle = low ? `rgba(255, 62, 48, ${0.5 + 0.5 * pulse})` : 'rgba(255, 215, 130, 0.5)'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH);
  txt(ctx, `${Math.ceil(p.hull)} / ${p.maxHull}`, barX + 2, barY + barH + 14, `11.5px ${SERIF}`, 'rgba(255, 246, 224, 0.75)', 'left');
  ctx.restore();
  world.hudHero = { cx, cy, r, barX, barY, barW, barH, frac, hull: p.hull, maxHull: p.maxHull, hero: p.id, low };
}

// STEP 17: the ultimate leaves the top-left bar and becomes
// a round button at bottom-right, Genshin-burst style (the
// user: "ulti pindahin ke pojok kanan bawah dan tombol
// ultinya bulat, di tombol nya ada gambar slash ulti
// karakter, kalo udah kekumpul jadi ngisi si tombol
// bulatnya"). The circle wears the ACTIVE hero's ultimate
// art (sprites.js's drawUltiIcon — Karlsefni's crescent,
// Tyne's orb, Rosaline's arrow; it swaps with the Monument)
// and FILLS with a radial sweep in the hero's accent as the
// Nova meter charges — the same meter math as ever (+20 a
// landed hit, +20 a kill, full at 100). At full the rim
// gilds and pulses and the hint reads READY. Clicking or
// tapping it fires the ultimate exactly like Q (main.js's
// click path and input.js's touch button map both inject
// KeyQ through this geometry); Q itself keeps working. The
// button's state is left on world.ultiBtn for the tests.
function drawUltiButton(ctx, world) {
  const p = world.player; const uh = p && ULTI_HUD[p.id]; world.ultiBtn = null; if (!uh) return;
  const { cx, cy, r } = ultiButtonGeom();
  const frac = Math.max(0, Math.min(1, (p.novaCharge || 0) / 100)); const full = frac >= 1;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.fill();
  if (frac > 0) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = uh.bar; ctx.globalAlpha = 0.42; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r - 5, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = full ? 1 : 0.4 + 0.45 * frac; drawUltiIcon(ctx, p.id, cx, cy, 60); ctx.restore();
  ctx.strokeStyle = 'rgba(255, 246, 224, 0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.stroke();
  if (full) { ctx.save(); ctx.globalAlpha = 0.65 + 0.35 * Math.sin(world.time * 5); ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  else { ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.stroke(); }
  txt(ctx, full ? t(world, 'readyQ') : 'Q', cx, cy + r + 15, `bold 11px ${SERIF}`, full ? PALETTE.gold : 'rgba(255, 246, 224, 0.55)');
  ctx.restore();
  world.ultiBtn = { cx, cy, r, frac, full, hero: p.id };
}

function drawBanner(ctx,world) { const b=world.banner; const fadeIn=Math.min(1,b.t / 0.3); const fadeOut=Math.min(1,(b.dur - b.t) / 0.4);
  const alpha = Math.max(0, Math.min(fadeIn, fadeOut)); ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.fillStyle = PALETTE.cream; ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = 18; ctx.font = `bold 44px ${SERIF}`;
  ctx.fillText(b.text, VIEW_W / 2, 168); ctx.shadowBlur = 0; flourish(ctx, VIEW_W / 2, 190, 210, PALETTE.gold); ctx.fillStyle = PALETTE.gold; ctx.font = `italic 17px ${SERIF}`; ctx.fillText(b.sub, VIEW_W / 2, 220); ctx.restore();
}

// ——— Screens ———

// ——— The lobby: a walkable plaza around the Crystal ———

function drawLobbyProps(ctx,world) { for (const prop of LOBBY_PROPS) { const { x } = prop; const y = GROUND_Y; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 46, 9, 0, 0, Math.PI * 2); ctx.fill(); if (prop.id === 'monument') {
      ctx.strokeStyle = 'rgba(95, 242, 208, 0.4)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, y + 2, 40, 10, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#232040'; ctx.strokeStyle = '#4a4470'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(x - 17, y - 118, 34, 118, 6);
      ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(140, 255, 225, 0.65)'; ctx.lineWidth = 1.3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 8,y - 84 + i*22); ctx.lineTo(x + 2,y - 92 + i*22); ctx.lineTo(x + 8,y - 82 + i*22); ctx.stroke(); }
      ctx.save(); ctx.shadowColor = '#5ff2d0'; ctx.shadowBlur = 14; ctx.fillStyle = '#6ff5d8'; const fy = y - 136 - Math.sin(world.time * 1.8) * 3; ctx.beginPath(); ctx.moveTo(x, fy - 12); ctx.lineTo(x + 7, fy + 4); ctx.lineTo(x, fy + 10);
      ctx.lineTo(x - 7, fy + 4); ctx.closePath(); ctx.fill(); ctx.restore(); } else if (prop.id === 'portal') { for (const s of [-1,1]) {
        ctx.fillStyle = '#2a2145'; ctx.strokeStyle = '#5a4a8a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect(x + s * 40 - 7, y - 124, 14, 124, 5); ctx.fill(); ctx.stroke(); }
      const swirl = ctx.createRadialGradient(x, y - 62, 4, x, y - 62, 52); swirl.addColorStop(0, 'rgba(230, 210, 255, 0.85)'); swirl.addColorStop(0.45, 'rgba(150, 90, 255, 0.5)'); swirl.addColorStop(1, 'rgba(90, 40, 180, 0)'); ctx.fillStyle = swirl; ctx.beginPath();
      ctx.ellipse(x, y - 62, 38, 56, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(200, 170, 255, 0.9)'; ctx.lineWidth=2.2; for (let i=0; i < 3; i++) { const a0=world.time*(1.1 + i*0.35) + i*2.1; ctx.beginPath(); ctx.ellipse(x,y - 62,30 - i*7,44 - i*9,0,a0,a0 + 2.2); ctx.stroke(); }
    } else {
      ctx.fillStyle = '#4a3220'; ctx.fillRect(x - 46, y - 30, 92, 30); ctx.fillStyle = '#5e4028'; ctx.fillRect(x - 46, y - 30, 92, 6); ctx.fillRect(x - 44, y - 84, 5, 56); ctx.fillRect(x + 39, y - 84, 5, 56); ctx.save(); ctx.beginPath(); ctx.moveTo(x - 56, y - 82); ctx.lineTo(x + 56, y - 82); ctx.lineTo(x + 44, y - 98);
      ctx.lineTo(x - 44,y - 98); ctx.closePath(); ctx.clip(); for (let i=0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#a52440' : '#fff3c4'; ctx.fillRect(x - 56 + i * 14, y - 100, 14, 22); }
      ctx.restore(); ctx.strokeStyle = '#ffd23c'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 56, y - 82); ctx.lineTo(x + 56,y - 82); ctx.stroke(); for (let i=0; i < 4; i++) { ctx.fillStyle=ITEMS[i].color; ctx.beginPath(); ctx.arc(x - 30 + i*20,y - 38,5.4,0,Math.PI*2); ctx.fill(); }
      drawCoinIcon(ctx,x + 52,y - 62 + Math.sin(world.time*2)*1.6,8); }
    ctx.restore(); }
}

// Prop names and the near-prop prompt are UI: full-res, over the plaza.

function drawLobbyLabels(ctx,world) { const near=nearestProp(world); const camX=world.camX || 0; ctx.save(); for (const prop of LOBBY_PROPS) { const x = prop.x - camX; if (x < -140 || x > VIEW_W + 140) continue; const y = GROUND_Y; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255, 246, 224, 0.85)'; ctx.font = `bold 12px ${SERIF}`;
    const cap = prop.id[0].toUpperCase() + prop.id.slice(1);
    ctx.fillText(t(world, `prop${cap}`), x, prop.id === 'shop' ? y - 108 : y - 146); if (near === prop) {
      const pulse = 0.72 + 0.28 * Math.sin(world.time * 4); ctx.globalAlpha = pulse; ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(x, y + 2, 50, 12, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = 'rgba(10, 8, 24, 0.82)';
      const label = `E — ${t(world, `prop${cap}Hint`)}`; ctx.font = `bold 14.5px ${SERIF}`;
      const w=ctx.measureText(label).width + 26; ctx.beginPath(); ctx.roundRect(x - w / 2,y - 196,w,28,8); ctx.fill(); ctx.strokeStyle=PALETTE.gold; ctx.lineWidth=1.2; ctx.stroke(); ctx.fillStyle=PALETTE.cream; ctx.fillText(label,x,y - 177); ctx.globalAlpha=1; } }
  ctx.restore(); }

// ——— STEP 18: the settings gear and panel (lobby only) ———

// The gear's home: the top-right corner — clear of the
// minimap (top-centre), of the Crystal and of every station.
// It exists only in the lobby.
export function settingsGearRect() { return { x: VIEW_W - 58, y: 22, w: 40, h: 40 }; }
export function settingsGearAt(x, y) { const r = settingsGearRect(); return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

function drawGear(ctx, cx, cy, r, color) { ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillRect(-2.2, -r - 3.4, 4.4, 6.4); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 3.4; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.lineWidth = 2.6; ctx.stroke(); ctx.restore(); }

function drawSettingsGear(ctx, world) { const r = settingsGearRect(); const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  ctx.save(); ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(cx, cy, r.w / 2 - 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.stroke();
  drawGear(ctx, cx, cy, 9, PALETTE.cream); ctx.restore();
  world.settingsUi = { gear: r, panel: null, buttons: {} }; }

// The panel's named rects for a tab — main.js hit-tests the
// same geometry (and drawSettings leaves it on
// world.settingsUi for the tests).
export function settingsRects(world) { const P = { x: VIEW_W / 2 - 310, y: 110, w: 620, h: 500 };
  if (world.settings && world.settings.tab === 'tutorial') return { panel: P, buttons: {
    back: { x: P.x + P.w / 2 - 110, y: P.y + P.h - 74, w: 220, h: 46 },
    close: { x: P.x + P.w - 52, y: P.y + 14, w: 38, h: 38 } } };
  return { panel: P, buttons: {
    'lang-en': { x: P.x + 60, y: P.y + 128, w: 240, h: 52 },
    'lang-id': { x: P.x + P.w - 300, y: P.y + 128, w: 240, h: 52 },
    tutorial: { x: P.x + P.w / 2 - 150, y: P.y + 226, w: 300, h: 52 },
    exit: { x: P.x + P.w / 2 - 150, y: P.y + 306, w: 300, h: 52 },
    close: { x: P.x + P.w - 52, y: P.y + 14, w: 38, h: 38 } } }; }

export function settingsButtonAt(world, x, y) { if (!world.settings) return null; const { buttons } = settingsRects(world);
  for (const [id, r] of Object.entries(buttons)) { if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return id; } return null; }

function settingsBtn(ctx, r, label, active, danger) { panel(ctx, r.x, r.y, r.w, r.h, active ? 'rgba(70, 52, 14, 0.95)' : 'rgba(24, 18, 52, 0.92)', danger ? '#ff8fa3' : PALETTE.gold, active ? 2.4 : 1.4);
  txt(ctx, label, r.x + r.w / 2, r.y + r.h / 2 + 7, `bold 17px ${SERIF}`, danger ? '#ff8fa3' : PALETTE.cream); }

function drawSettings(ctx, world) { const { panel: P, buttons } = settingsRects(world);
  world.settingsUi = { gear: settingsGearRect(), panel: P, buttons };
  ctx.save(); ctx.fillStyle = 'rgba(5, 4, 16, 0.66)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, P.x, P.y, P.w, P.h, 'rgba(14, 11, 32, 0.97)', PALETTE.gold, 1.8);
  const tutorial = world.settings.tab === 'tutorial';
  ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = 12; txt(ctx, tutorial ? t(world, 'tutorialTitle') : t(world, 'settings'), VIEW_W / 2, P.y + 52, `bold 30px ${SERIF}`, PALETTE.gold); ctx.shadowBlur = 0;
  flourish(ctx, VIEW_W / 2, P.y + 70, 170, PALETTE.gold);
  const cr = buttons.close; ctx.save(); ctx.fillStyle = 'rgba(10, 8, 24, 0.85)'; ctx.beginPath(); ctx.arc(cr.x + cr.w / 2, cr.y + cr.h / 2, cr.w / 2 - 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.stroke();
  txt(ctx, '✕', cr.x + cr.w / 2, cr.y + cr.h / 2 + 6, `bold 15px ${SERIF}`, PALETTE.cream); ctx.restore();
  if (tutorial) {
    const lines = t(world, 'tutorial');
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255, 246, 224, 0.92)'; ctx.font = `14.5px ${SERIF}`;
    lines.forEach((line, i) => { wrapTextLeft(ctx, '· ' + line, P.x + 44, P.y + 116 + i * 40, P.w - 88, 19); });
    settingsBtn(ctx, buttons.back, t(world, 'back'), false, false);
  } else {
    txt(ctx, t(world, 'language'), VIEW_W / 2, P.y + 112, `bold 14px ${SERIF}`, PALETTE.cream);
    settingsBtn(ctx, buttons['lang-en'], 'ENGLISH', world.lang !== 'id', false);
    settingsBtn(ctx, buttons['lang-id'], 'INDONESIA', world.lang === 'id', false);
    settingsBtn(ctx, buttons.tutorial, t(world, 'tutorialBtn'), false, false);
    settingsBtn(ctx, buttons.exit, t(world, 'exitGame'), false, true);
    txt(ctx, `${t(world, 'versionWord')} ${GAME_VERSION}`, VIEW_W / 2, P.y + P.h - 50, `12.5px ${SERIF}`, 'rgba(255, 207, 110, 0.75)');
    txt(ctx, t(world, 'settingsHint'), VIEW_W / 2, P.y + P.h - 26, `12.5px ${SERIF}`, 'rgba(255, 246, 224, 0.6)');
  }
  ctx.restore(); }

// ——— STEP 19: the dashboard (the game's front door) ———

// The start page the game boots to: the lobby scene behind
// (drawn by drawScene — the dashboard is a veil and words
// over the plaza), the game's name big in the centre in the
// typography the old lobby title used (that design moved
// here when step 18 cleaned the lobby), the tagline and the
// flavour line under it, and one centred button. Nothing
// else lives here: no gear (settings stay in the lobby),
// and no run starts from it — the button (or ENTER) only
// opens the lobby door.
export function dashboardButtonRect() { return { x: VIEW_W / 2 - 130, y: 430, w: 260, h: 56 }; }
export function dashboardButtonAt(x, y) { const r = dashboardButtonRect(); return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

// STEP 28: on the dashboard the three Wardens stand by the
// Crystal — the game's faces on its title screen. They are
// lightweight stand-ins fed to the ordinary hero draw (idle
// frames, a breathing bob, an occasional weight-shift into
// the walk cycle), each on a soft ground glow in her accent.
// The real player object is not drawn in this state.
const DASH_HEROES = [ { id: 'karlsefni', dx: -120, face: 1 }, { id: 'tyne', dx: 118, face: -1 }, { id: 'rosaline', dx: 236, face: -1 } ];
const DASH_ACCENTS = { karlsefni: '#6fe7ff', tyne: '#b78cff', rosaline: '#ff5a48' };
function drawDashboardHeroes(pix, world) { const T = world.dashTime || 0; const cx = world.crystal.x;
  DASH_HEROES.forEach((h, i) => { const bob = Math.sin(T * 1.35 + i * 2.1) * 1.6;
    pix.save(); pix.fillStyle = DASH_ACCENTS[h.id]; pix.globalAlpha = 0.15 + 0.05 * Math.sin(T * 2 + i * 1.7);
    pix.beginPath(); pix.ellipse(cx + h.dx, GROUND_Y + 4, 34, 7, 0, 0, Math.PI * 2); pix.fill(); pix.restore();
    drawHeroSprite(pix, world, { id: h.id, x: cx + h.dx, y: GROUND_Y - 26 + bob, face: h.face, moving: Math.sin(T * 0.4 + i * 2.4) > 0.88, walkPhase: T * 5, atkT: 0, ultiT: 0 }); }); }

function hash01(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

function drawDashboard(ctx, world) {
  // STEP 28 (upgraded brief: "semegah mungkin" — as
  // magnificent as reasonable): a cinematic title scene over
  // the lobby vista. Layered sky, haloed moon, two-depth
  // twinkling starfield, an occasional shooting star, cloud
  // wisps at two depths, the Crystal as a rotating beacon
  // with pulse rings, rising embers + dust motes (capped,
  // simulated in world.js only while this state lasts), the
  // three Wardens standing by the Crystal (drawn in the
  // world pass), letters that rise and settle before a gold
  // shimmer takes to sweeping them, a fading tagline, an
  // ornate breathing Masuk button, and a soft vignette.
  // Everything is a function of world.dashTime; the button
  // answers from the first frame — no intro lock-out.
  const T = world.dashTime || 0;
  // The button's word follows the remembered language —
  // ENTER / MASUK — except on a fresh save, where no
  // language has ever been chosen: there it defaults to
  // the user's own word for it, MASUK (his brief).
  const label = world.langChosen ? t(world, 'enterBtn') : 'MASUK';
  const r = dashboardButtonRect();
  // Step 27 (as amended): the version sits in the
  // BOTTOM-LEFT corner of the dashboard — "v1.0", small.
  world.dashboardUi = { button: r, label, version: { text: `v${GAME_VERSION}`, x: 22, y: VIEW_H - 16 } };
  ctx.save();
  // — The sky deepens toward the top of the frame —
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H); sky.addColorStop(0, 'rgba(6, 4, 22, 0.50)'); sky.addColorStop(0.45, 'rgba(6, 4, 22, 0.08)'); sky.addColorStop(1, 'rgba(6, 4, 22, 0.34)');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // — The moon's halo breathes (the lobby moon sits at 190, 96) —
  const halo = ctx.createRadialGradient(190, 96, 8, 190, 96, 132 + Math.sin(T * 0.7) * 9);
  halo.addColorStop(0, 'rgba(255, 217, 160, 0.32)'); halo.addColorStop(0.35, 'rgba(255, 190, 120, 0.12)'); halo.addColorStop(1, 'rgba(255, 190, 120, 0)');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, 470, 310);
  // — A two-depth twinkling starfield (deterministic hash) —
  for (let layer = 0; layer < 2; layer++) { const n = layer === 0 ? 85 : 45;
    for (let i = 0; i < n; i++) { const hx = hash01(i * 3 + layer * 977), hy = hash01(i * 7 + layer * 613), hp = hash01(i * 13 + layer * 389);
      const x = hx * VIEW_W, y = hy * 400; const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * (0.7 + hp * 1.6) + hp * 40));
      ctx.globalAlpha = tw * (layer === 0 ? 0.5 : 0.9); ctx.fillStyle = '#ffeecf';
      const sz = layer === 0 ? 1.4 : 2.2; ctx.fillRect(x, y, sz, sz);
      if (layer === 1 && hp > 0.86) { ctx.globalAlpha = tw * 0.45; ctx.fillRect(x - 4, y + 0.6, 10, 1); ctx.fillRect(x + 0.6, y - 4, 1, 10); } } }
  ctx.globalAlpha = 1;
  // — A shooting star, one at a time on a ~5.5 s cycle —
  const cyc = Math.floor(T / 5.5), sph = T - cyc * 5.5;
  if (sph < 0.8) { const sx0 = 240 + hash01(cyc * 31 + 5) * 760, sy0 = 50 + hash01(cyc * 47 + 9) * 130, k = sph / 0.8, hx2 = sx0 + k * 210, hy2 = sy0 + k * 74;
    const grad = ctx.createLinearGradient(hx2, hy2, hx2 - 64, hy2 - 23); grad.addColorStop(0, `rgba(255, 244, 214, ${0.85 * (1 - k)})`); grad.addColorStop(1, 'rgba(255, 244, 214, 0)');
    ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx2, hy2); ctx.lineTo(hx2 - 64, hy2 - 23); ctx.stroke(); }
  // — Cloud wisps drift at two depths —
  for (let i = 0; i < 5; i++) { const depth = i % 2, speed = depth === 0 ? 5 : 11, w = 190 + hash01(i * 17) * 150;
    const x = ((hash01(i * 23) * (VIEW_W + 420) + T * speed) % (VIEW_W + 420)) - 210, y = 44 + hash01(i * 41) * 120;
    const cg = ctx.createRadialGradient(x, y, 6, x, y, w / 2); cg.addColorStop(0, `rgba(24, 16, 48, ${depth === 0 ? 0.32 : 0.24})`); cg.addColorStop(1, 'rgba(24, 16, 48, 0)');
    ctx.fillStyle = cg; ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.32); ctx.translate(-x, -y); ctx.beginPath(); ctx.arc(x, y, w / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  // — The Crystal as a beacon: rotating rays + pulse rings —
  const csx = world.crystal.x - (world.camX || 0) - (world.__dashDrift || 0), cyy = GROUND_Y - 118;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(csx, cyy); ctx.rotate(T * 0.11);
  for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); const ray = ctx.createLinearGradient(0, 0, 0, -360);
    ray.addColorStop(0, `rgba(95, 242, 208, ${0.10 + 0.04 * Math.sin(T * 1.8)})`); ray.addColorStop(1, 'rgba(95, 242, 208, 0)');
    ctx.fillStyle = ray; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-13, -360); ctx.lineTo(13, -360); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  for (let i = 0; i < 2; i++) { const rp = (T * 0.22 + i * 0.5) % 1;
    ctx.strokeStyle = `rgba(95, 242, 208, ${0.30 * (1 - rp)})`; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(csx, GROUND_Y + 2, 30 + rp * 120, (30 + rp * 120) * 0.24, 0, 0, Math.PI * 2); ctx.stroke(); }
  // — Embers and motes (simulated in world.js, capped) —
  for (const p of world.dashParts || []) { const fade = Math.min(1, p.t / 0.4) * Math.min(1, Math.max(0, (p.life - p.t) / 0.8));
    if (p.kind === 'ember') { ctx.fillStyle = `rgba(255, ${168 + Math.floor(40 * Math.sin(p.sway + T * 3))}, 84, ${0.75 * fade})`; }
    else { ctx.fillStyle = `rgba(255, 240, 210, ${0.30 * fade})`; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
  // — The veil (step 19's, lighter now the scene carries itself) —
  const veil = ctx.createLinearGradient(0, 0, 0, VIEW_H); veil.addColorStop(0, 'rgba(5, 4, 16, 0.30)'); veil.addColorStop(0.42, 'rgba(5, 4, 16, 0.03)'); veil.addColorStop(1, 'rgba(5, 4, 16, 0.38)');
  ctx.fillStyle = veil; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // — EMBERWARD: the letters rise and settle, then a slow
  //    gold shimmer sweeps them on a loop —
  const title = 'EMBERWARD'; ctx.font = `bold 88px ${SERIF}`;
  const widths = [...title].map(ch => ctx.measureText(ch).width); const totalW = widths.reduce((a, b) => a + b, 0);
  const sweepX = VIEW_W / 2 - totalW / 2 - 210 + ((T * 130) % (totalW + 420));
  let lx = VIEW_W / 2 - totalW / 2; ctx.textAlign = 'left';
  [...title].forEach((ch, i) => { const lt = Math.max(0, Math.min(1, (T - 0.12 - i * 0.07) / 0.55)); const ease = 1 - Math.pow(1 - lt, 3);
    const shimmer = Math.max(0, 1 - Math.abs((lx + widths[i] / 2) - sweepX) / 90);
    ctx.save(); ctx.globalAlpha = ease; ctx.shadowColor = PALETTE.goldDeep; ctx.shadowBlur = 16 + 18 * ease;
    ctx.fillStyle = shimmer > 0.03 ? `rgb(255, ${207 + Math.floor(40 * shimmer)}, ${110 + Math.floor(120 * shimmer)})` : PALETTE.gold;
    ctx.fillText(ch, lx, 268 - (1 - ease) * 34); ctx.restore(); lx += widths[i]; });
  ctx.textAlign = 'center';
  // — The tagline and flavour fade in beneath —
  const tagA = Math.max(0, Math.min(1, (T - 0.85) / 0.7));
  if (tagA > 0) { ctx.save(); ctx.globalAlpha = tagA; txt(ctx, t(world, 'tagline'), VIEW_W / 2, 304, `italic 20px ${SERIF}`, PALETTE.cream); ctx.restore(); flourish(ctx, VIEW_W / 2, 326, 250 * tagA, PALETTE.gold); }
  const flA = Math.max(0, Math.min(1, (T - 1.25) / 0.7));
  if (flA > 0) { ctx.save(); ctx.globalAlpha = flA;
    txt(ctx, t(world, 'flavour')(world.player?.name ?? 'The Warden'), VIEW_W / 2, 358, `16px ${SERIF}`, 'rgba(255, 246, 224, 0.92)');
    if (world.best > 0) txt(ctx, `${t(world, 'rowBest')}: ${world.best}`, VIEW_W / 2, 384, `14px ${SERIF}`, PALETTE.gold);
    ctx.restore(); }
  // — The ornate Masuk button: framed, breathing, flaring on hover —
  const hover = dashboardButtonAt(world.input?.mouseX ?? -1, world.input?.mouseY ?? -1);
  const breathe = 1 + Math.sin(T * 2.1) * 0.014;
  ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(breathe, breathe); ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
  ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = hover ? 30 : 15 + 6 * Math.sin(T * 2.1);
  panel(ctx, r.x, r.y, r.w, r.h, 'rgba(14, 11, 34, 0.92)', PALETTE.gold, 1.8); ctx.shadowBlur = 0;
  for (const [cdx, cdy] of [[0, 0], [r.w, 0], [0, r.h], [r.w, r.h]]) { ctx.save(); ctx.translate(r.x + cdx, r.y + cdy); ctx.rotate(Math.PI / 4); ctx.fillStyle = PALETTE.gold; const ds = hover ? 6.5 : 5; ctx.fillRect(-ds / 2, -ds / 2, ds, ds); ctx.restore(); }
  txt(ctx, label, r.x + r.w / 2, r.y + 37, `bold 21px ${SERIF}`, PALETTE.cream);
  ctx.restore();
  // — The version, bottom-left (step 27) —
  txt(ctx, `v${GAME_VERSION}`, 22, VIEW_H - 16, `13px ${SERIF}`, 'rgba(255, 246, 224, 0.55)', 'left');
  // — A soft vignette finishes the frame —
  const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.42, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.86);
  vg.addColorStop(0, 'rgba(3, 2, 10, 0)'); vg.addColorStop(1, 'rgba(3, 2, 10, 0.44)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.restore();
  world.dashScene = { heroes: DASH_HEROES.map(h => h.id), parts: (world.dashParts || []).length,
    embers: (world.dashParts || []).filter(p => p.kind === 'ember').length, motes: (world.dashParts || []).filter(p => p.kind === 'mote').length,
    stars: 130, clouds: 5, dashTime: T };
}

function drawShop(ctx,world) {  const profile = world.profile; ctx.save(); ctx.fillStyle = 'rgba(5, 4, 16, 0.66)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H); panel(ctx, 150, 84, 980, 560, 'rgba(14, 11, 32, 0.96)', PALETTE.gold, 1.8); txt(ctx, 'THE EMBER STALL', VIEW_W / 2, 128, `bold 30px ${SERIF}`, PALETTE.gold); ctx.font = `bold 17px ${SERIF}`;
  const balanceLabel = `${profile.embers} Ember Coins`;
  const balanceW = ctx.measureText(balanceLabel).width; drawCoinIcon(ctx, VIEW_W / 2 - balanceW / 2 - 16, 148, 7.5); txt(ctx, balanceLabel, VIEW_W / 2 - balanceW / 2, 154, `bold 17px ${SERIF}`, '#ffd23c', 'left');
  txt(ctx, 'S U P P L I E S — spend Ember Coins · use in the field on keys 1–4', 174, 186, `bold 14px ${SERIF}`, PALETTE.cream, 'left'); ITEMS.forEach((item, i) => { const r = shopItemRect(i); const owned = profile.inv[item.id];
    panel(ctx, r.x, r.y, r.w, r.h, 'rgba(24, 18, 52, 0.9)', item.color, 1.3); ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(r.x + 30, r.y + 32, 13, 0, Math.PI * 2); ctx.fill(); txt(ctx, item.key, r.x + 30, r.y + 37, `bold 14px ${SERIF}`, '#1a1030');
    txt(ctx, item.name, r.x + 52, r.y + 38, `bold 15.5px ${SERIF}`, PALETTE.cream, 'left'); ctx.fillStyle = 'rgba(255, 246, 224, 0.75)'; ctx.font = `12px ${SERIF}`; ctx.textAlign = 'left'; wrapTextLeft(ctx, item.desc, r.x + 14, r.y + 66, r.w - 28, 15); drawCoinIcon(ctx, r.x + 22, r.y + 106, 6.5);
    txt(ctx, String(item.price), r.x + 34, r.y + 111, `bold 15px ${SERIF}`, profile.embers >= item.price && owned < 9 ? '#ffd23c' : 'rgba(255,210,60,0.45)', 'left'); txt(ctx, `owned ×${owned}`, r.x + r.w - 12, r.y + 111, `bold 14px ${SERIF}`, PALETTE.cream, 'right');
  }); txt(ctx, 'P E R M A N E N T   U P G R A D E S — spend materials won in the Abyss', 174, 352, `bold 14px ${SERIF}`, PALETTE.cream, 'left');
  let mx = 174; ctx.font = `bold 13px ${SERIF}`;
  const mats = [['starshard', 'Starshard', '#a8e6ff'], ...Object.entries(ESSENCES).map(([id,e])=>[id,e.name,e.color])]; for (const [id,name,color] of mats) {
    ctx.fillStyle = color; drawStar(ctx, mx + 6, 372, 6, 0.4); txt(ctx, `${name} ×${profile.materials[id]}`, mx + 16, 377, `bold 13px ${SERIF}`, PALETTE.cream, 'left'); mx += ctx.measureText(`${name} ×${profile.materials[id]}`).width + 52;
  }
  UPGRADES.forEach((track,i)=>{ const r=shopUpgradeRect(i); const level=profile.upgrades[track.id];
    const cost = upgradeCost(track, level + 1); panel(ctx, r.x, r.y, r.w, r.h, 'rgba(24, 18, 52, 0.9)', 'rgba(255, 215, 130, 0.4)', 1); txt(ctx, track.name, r.x + 14, r.y + 24, `bold 14.5px ${SERIF}`, PALETTE.cream, 'left');
    txt(ctx, track.desc, r.x + 150, r.y + 24, `12.5px ${SERIF}`, 'rgba(255, 246, 224, 0.72)', 'left');
    for (let p=0; p < track.max; p++) { ctx.fillStyle = p < level ? ESSENCES[track.essence].color : 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.arc(r.x + 470 + p * 17, r.y + 19, 5.4, 0, Math.PI * 2); ctx.fill(); }
    if (!cost) {
      txt(ctx, 'M A X', r.x + r.w - 16, r.y + 24, `bold 14px ${SERIF}`, PALETTE.gold, 'right');
    } else { const afford=profile.materials.starshard>=cost.shard
     &&profile.materials[track.essence]>=cost.ess;
      const essPart = cost.ess > 0 ? `  +  ${ESSENCES[track.essence].name} ×${cost.ess}` : ''; txt(ctx, `Starshard ×${cost.shard}${essPart}`, r.x + r.w - 16, r.y + 24, `bold 13.5px ${SERIF}`, afford ? PALETTE.cream : 'rgba(255,246,224,0.45)', 'right');
    }
  }); if (world.shopMsg&&world.shopMsg.t > 0) {
    txt(ctx, world.shopMsg.text, VIEW_W / 2, 622, `bold 15px ${SERIF}`, world.shopMsg.color);
  }
  txt(ctx, 'Click to buy · ESC steps back to the plaza', VIEW_W / 2, 636, `13px ${SERIF}`, 'rgba(255, 246, 224, 0.65)'); ctx.restore();
}

function wrapTextLeft(ctx,text,x,y,maxW,lineH) { const words = text.split(' '); let line = ''; let yy = y; for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxW&&line) { ctx.fillText(line,x,yy); line=word; yy+=lineH; } else { line=trial; }
  }
  if (line) ctx.fillText(line,x,yy); }

function drawDraft(ctx,world) {
  ctx.save(); ctx.fillStyle = 'rgba(5, 4, 16, 0.62)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H); ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = 16; txt(ctx, t(world, 'draftTitle'), VIEW_W / 2, 196, `bold 40px ${SERIF}`, PALETTE.cream); ctx.shadowBlur = 0;
  txt(ctx, t(world, 'draftSub').replace('{wave}', String(world.wave)), VIEW_W / 2, 226, `italic 16px ${SERIF}`, PALETTE.gold); (world.draft ?? []).forEach((def, i) => { const r = draftCardRect(i); const rarity = RARITIES[def.rarity];
    const cx = r.x + r.w / 2; ctx.shadowColor = rarity.color; ctx.shadowBlur = def.rarity === 'common' ? 0 : 14; panel(ctx, r.x, r.y, r.w, r.h, 'rgba(14, 11, 34, 0.94)', rarity.color, def.rarity === 'legendary' || def.rarity === 'epic' ? 2.6 : 1.6); ctx.shadowBlur = 0;
    txt(ctx, rarity.label, cx, r.y + 28, `bold 12.5px ${SERIF}`, rarity.color); ctx.beginPath(); ctx.arc(cx, r.y + 76, 27, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); ctx.strokeStyle = rarity.color; ctx.lineWidth = 1.6; ctx.stroke();
    txt(ctx, def.icon, cx, r.y + 84, `bold 21px ${SERIF}`, rarity.color); txt(ctx, typeof def.name === 'function' ? def.name(world) : def.name, cx, r.y + 132, `bold 19px ${SERIF}`, PALETTE.cream); ctx.fillStyle = 'rgba(255, 246, 224, 0.85)'; ctx.font = `13.5px ${SERIF}`; ctx.textAlign = 'center'; wrapText(ctx, def.desc(world), cx, r.y + 162, r.w - 36, 18);
    const owned=world.buffs.stacks[def.id] ?? 0;
    if (owned > 0) txt(ctx, t(world, 'draftOwned').replace('{n}', String(owned)), cx, r.y + 216, `12.5px ${SERIF}`, 'rgba(255, 246, 224, 0.6)'); txt(ctx, t(world, 'draftPress').replace('{n}', String(i + 1)), cx, r.y + 238, `bold 14px ${SERIF}`, rarity.color);
  }); txt(ctx, t(world, 'draftHint'), VIEW_W / 2, 556, `13.5px ${SERIF}`, 'rgba(255, 246, 224, 0.7)'); ctx.restore();
}

function wrapText(ctx,text,cx,y,maxW,lineH) { const words = text.split(' '); let line = ''; let yy = y; for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxW&&line) { ctx.fillText(line,cx,yy); line=word; yy+=lineH; } else { line=trial; }
  }
  if (line) ctx.fillText(line,cx,yy); }

function drawPause(ctx,world) {
  ctx.save(); ctx.fillStyle = 'rgba(5, 4, 16, 0.62)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H); ctx.textAlign = 'center'; ctx.fillStyle = PALETTE.cream; ctx.font = `bold 52px ${SERIF}`; ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = 16; ctx.fillText(t(world, 'paused'), VIEW_W / 2, 300); ctx.shadowBlur = 0;
  flourish(ctx, VIEW_W / 2, 326, 150, PALETTE.gold);
  for (const [which, label] of [['resume', t(world, 'resume')], ['exit', t(world, 'exitToLobby')]]) { const r = pauseButtonRect(which); ctx.fillStyle = 'rgba(14, 11, 34, 0.92)'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.fillStyle = PALETTE.cream; ctx.font = `bold 19px ${SERIF}`; ctx.fillText(label, r.x + r.w / 2, r.y + 36); }
  ctx.fillStyle = PALETTE.gold; ctx.font = `15px ${SERIF}`; ctx.fillText(t(world, 'pauseHint'), VIEW_W / 2, 592); ctx.restore();
}

function drawResults(ctx,world,victory) { ctx.save(); ctx.fillStyle = victory ? 'rgba(10, 8, 4, 0.55)' : 'rgba(8, 3, 10, 0.68)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H); ctx.textAlign = 'center';

  ctx.font = `bold 64px ${SERIF}`;
  ctx.shadowBlur=26; if (victory) { ctx.fillStyle = PALETTE.gold; ctx.shadowColor = PALETTE.goldDeep; ctx.fillText(t(world, 'resultsVictory'), VIEW_W / 2, 138); } else { ctx.fillStyle = '#ff8fa3'; ctx.shadowColor = '#c22e4a'; ctx.fillText(t(world, 'resultsDefeat'), VIEW_W / 2, 138); }
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255, 246, 224, 0.85)'; ctx.font = `italic 17px ${SERIF}`; ctx.fillText(victory ? t(world, 'victorySub') : world.endReason, VIEW_W / 2, 172); flourish(ctx, VIEW_W / 2, 196, 230, PALETTE.gold);

  

  const rank = rankForWaves(world.wavesCleared ?? 0); ctx.fillStyle = PALETTE.gold; ctx.shadowColor = PALETTE.goldDeep; ctx.shadowBlur = 30; ctx.font = `bold 120px ${SERIF}`; ctx.fillText(rank.rank, VIEW_W / 2 - 190, 330); ctx.shadowBlur = 0; ctx.font = `15px ${SERIF}`;
  ctx.fillText(t(world, 'rank'), VIEW_W / 2 - 190, 362); for (let i = 0; i < 3; i++) { ctx.fillStyle = i < rank.stars ? PALETTE.gold : 'rgba(255,255,255,0.18)'; drawStar(ctx, VIEW_W / 2 - 226 + i * 36, 386, 11, world.time * 0.4); }

  const accuracy=world.shotsFired ? Math.round((world.shotsHit / world.shotsFired)*100):0; const matParts=[];
  if (world.runMats.starshard) matParts.push(`Starshard ×${world.runMats.starshard}`);
  for (const [id,e] of Object.entries(ESSENCES)) {
    if (world.runMats[id]) matParts.push(`${e.name} ×${world.runMats[id]}`);
  }
  const rows = [ [t(world, 'rowScore'), String(world.score)], [t(world, 'rowBest'), String(world.best)], [t(world, 'rowMap'), domainAt(world).name], [t(world, 'rowWaves'), String(world.wavesCleared ?? 0)], [t(world, 'rowFoes'), String(world.kills)], [t(world, 'rowAccuracy'), `${accuracy}%`], [t(world, 'rowCombo'), `${world.maxCombo}`],
    [t(world, 'rowTime'), formatTime(world.runTime)], [t(world, 'rowCoins'), `+${world.runCoins}`], [t(world, 'rowMats'), matParts.length ? matParts.join(' · ') : t(world, 'rowNone')],
  ]; ctx.textAlign = 'left'; rows.forEach(([label, value], i) => {
    const y = 254 + i * 27; ctx.fillStyle = 'rgba(255, 246, 224, 0.66)'; ctx.font = `15px ${SERIF}`; ctx.fillText(label, VIEW_W / 2 - 60, y); ctx.fillStyle = PALETTE.cream; ctx.font = `bold 16px ${SERIF}`; ctx.fillText(value, VIEW_W / 2 + 130, y);
  });

  for (const [which, label] of [['again', t(world, 'againBtn')], ['lobby', t(world, 'lobbyBtn')]]) {
    const r = resultsButtonRect(which); ctx.fillStyle = 'rgba(14, 11, 34, 0.9)'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.fillStyle = PALETTE.cream; ctx.font = `bold 16px ${SERIF}`;
    ctx.textAlign = 'center'; ctx.fillText(label, r.x + r.w / 2, r.y + 29); }
  ctx.restore(); }

function formatTime(seconds) { const m=Math.floor(seconds / 60); const s=Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// -----------------------------------------------------------------
// The Monument's character-select panel (step 24): three
// cards over the paused lobby — portrait (the user's keyed
// art, subject-normalised), name, role, range and ultimate;
// the active Warden's card is gilded and marked. Clicking a
// card swaps (main.js does the deed via world.setHero);
// clicking the active card, the ✕, Esc or E closes quietly.
// All words follow the step-18 language.
export const SELECT_CARDS = [
  { id: 'karlsefni', name: 'Hei Karlsefni', roleKey: 'roleKarl', range: 120, ulti: 'Flying Slash', accent: '#6fe7ff' },
  { id: 'rosaline', name: 'An Rosaline', roleKey: 'roleRosa', range: 440, ulti: 'Crimson Rose', accent: '#ff5a48' },
  { id: 'tyne', name: 'Tyne Vgernaut', roleKey: 'roleTyne', range: 300, ulti: 'Starfall', accent: '#b78cff' },
];
export function heroCardRect(i) { return { x: 170 + i * 320, y: 208, w: 300, h: 372 }; }
export function heroCardAt(x, y) { for (let i = 0; i < 3; i++) { const r = heroCardRect(i); if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i; } return -1; }
export function selectCloseRect() { return { x: VIEW_W - 58, y: 22, w: 40, h: 40 }; }
export function selectCloseAt(x, y) { const r = selectCloseRect(); return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

function drawSelectOverlay(ctx, world) { ctx.save();
  ctx.fillStyle = 'rgba(5, 4, 16, 0.62)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.shadowColor = PALETTE.gold; ctx.shadowBlur = 16; txt(ctx, t(world, 'selectTitle'), VIEW_W / 2, 150, `bold 38px ${SERIF}`, PALETTE.cream); ctx.shadowBlur = 0;
  const close = selectCloseRect();
  ctx.fillStyle = 'rgba(14, 11, 34, 0.92)'; ctx.beginPath(); ctx.arc(close.x + 20, close.y + 20, 19, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.6; ctx.stroke(); txt(ctx, '✕', close.x + 20, close.y + 27, `bold 16px ${SERIF}`, PALETTE.cream);
  const cards = SELECT_CARDS.map((card, i) => { const r = heroCardRect(i); const active = world.heroId === card.id; const cx = r.x + r.w / 2;
    panel(ctx, r.x, r.y, r.w, r.h, 'rgba(14, 11, 34, 0.94)', active ? PALETTE.gold : card.accent, active ? 2.6 : 1.4);
    if (active) { ctx.fillStyle = PALETTE.gold; ctx.fillRect(cx - 52, r.y + 12, 104, 20); txt(ctx, t(world, 'activeMark'), cx, r.y + 27, `bold 12px ${SERIF}`, '#241703'); }
    const img = getPortrait(card.id); const sub = PORTRAIT_SUBJECT[card.id];
    const bx = r.x + 36, by = r.y + 44, bw = r.w - 72, bh = 204;
    const glow = ctx.createRadialGradient(cx, by + bh / 2, 8, cx, by + bh / 2, 130); glow.addColorStop(0, card.accent + '44'); glow.addColorStop(1, card.accent + '00');
    ctx.fillStyle = glow; ctx.fillRect(bx - 14, by - 8, bw + 28, bh + 16);
    if (img && sub) { const sw = img.naturalWidth * sub.w, sh = img.naturalHeight * sub.h, sx = img.naturalWidth * sub.x, sy = img.naturalHeight * sub.y;
      const k = Math.min(bw / sw, bh / sh); const dw = sw * k, dh = sh * k;
      ctx.drawImage(img, sx, sy, sw, sh, cx - dw / 2, by + bh - dh, dw, dh); }
    txt(ctx, card.name, cx, r.y + 292, `bold 20px ${SERIF}`, PALETTE.cream);
    txt(ctx, t(world, card.roleKey), cx, r.y + 318, `italic 15px ${SERIF}`, card.accent);
    txt(ctx, `${t(world, 'rangeLabel')} ${card.range}`, cx, r.y + 342, `14px ${SERIF}`, 'rgba(255, 246, 224, 0.85)');
    txt(ctx, `${t(world, 'ultiLabel')}: ${card.ulti}`, cx, r.y + 364, `14px ${SERIF}`, 'rgba(255, 246, 224, 0.85)');
    return { ...r, id: card.id }; });
  world.selectUi = { cards, close, active: world.heroId };
  ctx.restore(); }
