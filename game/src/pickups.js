// pickups.js — blessings and currency the dark drops.

import { PICKUPS, ELEMENTS, GROUND_Y } from './config.js'; import { ESSENCES } from './domains.js'; import { saveProfile } from './shop.js';

// Currency drops: coins and materials bank into the profile at once.
function scatter(world,pickup) { const a=world.rng.angle(); const v=world.rng.range(40,130); pickup.vx=Math.cos(a)*v; pickup.vy=Math.sin(a)*v; world.pickups.push(pickup); return pickup; }

export function dropCoin(world,x,y,value) { return scatter(world, { kind: value >= 5 ? 'coin5' : 'coin', value, x, y, t: world.rng.range(0, 6), life: 12 }); }

export function dropMaterial(world,x,y,kind,essence=null) { return scatter(world,{ kind,essence,x,y,t:world.rng.range(0,6),life:14 }); }

const DROP_TABLE = [ { kind: 'heart', weight: 20 }, { kind: 'shard', weight: 18 }, { kind: 'tome', weight: 26 }, { kind: 'tri', weight: 12 }, { kind: 'aegis', weight: 10 }, { kind: 'nova', weight: 14 }, ];

export function maybeDropPickup(world,x,y,chance=0.13) { const rng=world.rng; if (!rng.chance(chance)) return; let total=0; for (const row of DROP_TABLE) total += row.weight; let roll = rng.range(0, total); let kind = 'heart'; for (const row of DROP_TABLE) { roll -= row.weight; if (roll<=0) { kind=row.kind; break; }
  }
  const pickup = { kind, x, y, t: rng.range(0, Math.PI * 2), life: 11 }; if (kind === 'tome') { const others=Object.keys(ELEMENTS).filter((el)=>el!==world.player.element); pickup.element=rng.pick(others); }
  world.pickups.push(pickup); }

// Step 23: the Ember Magnet's pull radii by level — a coin
// flies to the Warden only inside the radius; walking over
// one (COLLECT_R) banks it. Level 0 is the small base radius.
export const MAGNET_RADII = [40, 130, 260, 480];
export const COLLECT_R = 28;
export function updatePickups(world,dt) { const player=world.player; if (!player) return; const restY=GROUND_Y - 10; for (let i=world.pickups.length - 1; i>=0; i--) { const p=world.pickups[i]; p.t+=dt*2.4; p.life -=dt; const dx=player.x - p.x; const dy=player.y - p.y; const dist=Math.hypot(dx,dy);
    if (dist <= COLLECT_R) { applyPickup(world, world.audio ?? { pickup() {} }, p); world.pickups.splice(i,1); continue; }
    const magnetR = MAGNET_RADII[Math.max(0, Math.min(3, world.buffs?.magnet ?? 0))];
    const pulled=dist < magnetR && dist > 1; if (pulled) { const pull=380; p.x+=(dx / dist)*pull*dt; p.y+=(dy / dist)*pull*dt; } else if (p.vx) { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=560*dt; const damp=Math.max(0,1 - 5*dt); p.vx*=damp;
      if (p.y >= restY) { p.y=restY; p.vy=0; if (Math.abs(p.vx) < 4) p.vx=0; }
    } else if (p.y < restY) { p.y=Math.min(restY,p.y + 340*dt); }
    if (p.life<=0) world.pickups.splice(i,1); }
}

const CURRENCY = { coin: '#ffd23c', coin5: '#ffb84d', starshard: '#a8e6ff' };

export function applyPickup(world,audio,pickup) { const player = world.player; if (pickup.kind === 'coin' || pickup.kind === 'coin5') {
    world.profile.embers += pickup.value; world.runCoins += pickup.value; saveProfile(world); world.particles.sparkles(pickup.x, pickup.y, '#ffd23c', 6); world.particles.floatText(pickup.x, pickup.y - 14, `+${pickup.value} Ember`, '#ffd23c', 13); audio.pickup(); return;
  }
  if (pickup.kind === 'starshard' || pickup.kind === 'essence') { const key = pickup.kind === 'starshard' ? 'starshard' : pickup.essence; world.profile.materials[key]++; world.runMats[key] = (world.runMats[key] ?? 0) + 1; saveProfile(world); const color = pickupColor(pickup);
    const name = pickup.kind === 'starshard' ? 'Starshard' : ESSENCES[pickup.essence].name; world.particles.sparkles(pickup.x, pickup.y, color, 12); world.particles.floatText(pickup.x, pickup.y - 16, name, color, 14); audio.pickup(); return; }
  const def = PICKUPS[pickup.kind]; let label = def.label; if (pickup.kind === 'heart') {
    player.hull = Math.min(player.maxHull, player.hull + def.heal); label = `+${def.heal} ${def.label}`;
  } else if (pickup.kind === 'shard') {
    world.crystal.light = Math.min(world.crystal.maxLight, world.crystal.light + def.relight); label = `+${def.relight} Crystal Light`;
  } else if (pickup.kind === 'tome') {
    player.element = pickup.element; player.elementT = def.duration; label = `${ELEMENTS[pickup.element].name} Tome`;
  } else if (pickup.kind === 'tri') { player.triT=def.duration; label=def.label; } else if (pickup.kind === 'aegis') { player.shieldT=def.duration; label=def.label; } else if (pickup.kind === 'nova') {
    player.novaCharge = Math.min(100, player.novaCharge + def.charge); label = `+${def.charge} Nova Charge`;
  }
  world.particles.sparkles(pickup.x,pickup.y,pickupColor(pickup),10); world.particles.floatText(pickup.x,pickup.y - 16,label,pickupColor(pickup),15); audio.pickup(); }

export function pickupColor(pickup) { if (pickup.kind === 'tome') return ELEMENTS[pickup.element].color; if (pickup.kind === 'essence') return ESSENCES[pickup.essence].color; if (CURRENCY[pickup.kind]) return CURRENCY[pickup.kind]; return PICKUPS[pickup.kind].color; }

// Each kind has its own little sigil, drawn in code.
export function drawPickup(ctx,pickup,time) { const color=pickupColor(pickup); const bob=Math.sin(pickup.t)*3; const x=pickup.x; const y=pickup.y + bob; const blink=pickup.life < 3 ? (Math.sin(time*14) > 0 ? 1:0.25):1;

  ctx.save(); ctx.globalAlpha = blink; const halo = ctx.createRadialGradient(x, y, 2, x, y, 26); halo.addColorStop(0, color + '55'); halo.addColorStop(1, color + '00'); ctx.fillStyle = halo; ctx.fillRect(x - 26, y - 26, 52, 52); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur=10;

  if (pickup.kind === 'coin' || pickup.kind === 'coin5') { const r = pickup.kind === 'coin5' ? 10 : 7.5; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(146, 90, 10, 0.85)'; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.arc(x, y, r - 2.4, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#fff3c4'; drawMiniStar(ctx, x, y, r * 0.52); } else if (pickup.kind === 'starshard') { drawMiniStar(ctx, x, y, 11 + Math.sin(pickup.t * 1.4) * 1.6); ctx.fillStyle = '#eaf7ff'; drawMiniStar(ctx, x, y, 5); } else if (pickup.kind === 'essence') {
    ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.quadraticCurveTo(x + 8, y + 2, x + 5, y + 8); ctx.quadraticCurveTo(x, y + 13, x - 5, y + 8); ctx.quadraticCurveTo(x - 8, y + 2, x, y - 12); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x - 2, y - 3, 2.2, 0, Math.PI * 2); ctx.fill();
  } else if (pickup.kind === 'heart') { ctx.beginPath(); ctx.moveTo(x,y + 8); ctx.bezierCurveTo(x - 13,y - 2,x - 9,y - 12,x,y - 5); ctx.bezierCurveTo(x + 9,y - 12,x + 13,y - 2,x,y + 8); ctx.fill(); } else if (pickup.kind === 'shard') {
    ctx.beginPath(); ctx.moveTo(x,y - 12); ctx.lineTo(x + 7,y - 2); ctx.lineTo(x + 4,y + 11); ctx.lineTo(x - 4,y + 11); ctx.lineTo(x - 7,y - 2); ctx.closePath(); ctx.fill(); } else if (pickup.kind === 'tome') {
    ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(x,y - 8); ctx.quadraticCurveTo(x - 10,y - 11,x - 10,y + 7); ctx.quadraticCurveTo(x - 5,y + 4,x,y + 7); ctx.quadraticCurveTo(x + 5,y + 4,x + 10,y + 7); ctx.quadraticCurveTo(x + 10,y - 11,x,y - 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y - 8);
    ctx.lineTo(x,y + 7); ctx.stroke(); } else if (pickup.kind === 'tri') { for (let i=0; i < 3; i++) { const a=-Math.PI / 2 + (i*Math.PI*2) / 3 + pickup.t*0.4; drawMiniStar(ctx,x + Math.cos(a)*8,y + Math.sin(a)*8,5.5); }
    drawMiniStar(ctx,x,y,4.5); } else if (pickup.kind === 'aegis') {
    ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(x,y - 11); ctx.quadraticCurveTo(x + 10,y - 8,x + 9,y + 1); ctx.quadraticCurveTo(x + 8,y + 8,x,y + 12); ctx.quadraticCurveTo(x - 8,y + 8,x - 9,y + 1); ctx.quadraticCurveTo(x - 10,y - 8,x,y - 11); ctx.stroke(); } else if (pickup.kind === 'nova') {
    drawMiniStar(ctx,x,y,12 + Math.sin(pickup.t*1.4)*2); }
  ctx.restore(); }

function drawMiniStar(ctx,x,y,r) { ctx.beginPath(); ctx.moveTo(x,y - r); ctx.quadraticCurveTo(x,y,x + r,y); ctx.quadraticCurveTo(x,y,x,y + r); ctx.quadraticCurveTo(x,y,x - r,y); ctx.quadraticCurveTo(x,y,x,y - r); ctx.fill(); }
