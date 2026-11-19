// background.js — side-view scenery: sky (screen space, parallax) and the
// ground world (world space): ground strip, river + bridge, scattered props.

import { VIEW_W, VIEW_H, GROUND_Y, BRIDGE_W } from './config.js';

const NEBULAE = [ { x: 210, y: 130, r: 300, color: 'rgba(103, 64, 214, 0.20)' }, { x: 1080, y: 110, r: 260, color: 'rgba(28, 140, 160, 0.16)' }, { x: 900, y: 610, r: 320, color: 'rgba(150, 52, 130, 0.13)' }, { x: 150, y: 620, r: 240, color: 'rgba(40, 90, 180, 0.14)' }, ];

export const THEMES = { abyss: { sky: ['#1b1140', '#100c2a', '#0a1430'], stars: 1, nebula: true, mist: true, orb: { x: 1152, y: 84, r: 24, color: '#e9efff', halo: 'rgba(230, 238, 255, 0.35)', craters: true }, ridge: 'spires', ridgeColor: 'rgba(5, 4, 14, A)', pool: ['rgba(95, 242, 208, 0.10)', 'rgba(80, 120, 220, 0.05)'],
    decor: ['rune', 'shard', 'rune', 'rock'], mote: '#b8ff9e', moteMode: 'wander' } };

const VIS = {
  abyss: { far: ['deadtree', 'ridge', 'deadtree', 'spire'], near: ['deadtree', 'rock', 'lantern', 'deadtree', 'rock'], ground: ['#141b38', '#0b1026'], edge: '#2a3a6e', decor: ['rune', 'shard', 'rune', 'rock'], mote: '#b8ff9e' },
  lobby: { sky: ['#2c1e4e', '#4a2c5a', '#8a4a52'], far: ['roof', 'roof', 'tower'], near: ['tree', 'lamp', 'tree', 'lamp'], ground: ['#3a2c50', '#241a38'], edge: '#6a4a7a', decor: ['rune', 'shard'], mote: '#ffd9a0', orb: { x: 190, y: 96, r: 30, color: '#ffd9a0', halo: 'rgba(255, 200, 130, 0.4)' } },
};
const WIDTHS = [2400, 3200];

export class Background {
  constructor(rng) {
    this.layers = [0.012, 0.03, 0.06].map((parallax, layer) => {
      const stars = [];
      const count = [90, 60, 36][layer];
      for (let i = 0; i < count; i++) stars.push({ x: rng.range(0, VIEW_W), y: rng.range(0, VIEW_H), r: rng.range(0.6, 1.1 + layer * 0.7), phase: rng.range(0, Math.PI * 2), speed: rng.range(0.6, 1.8) });
      return { parallax, stars };
    });
    this.motes = [];
    for (let i = 0; i < 26; i++) this.motes.push({ x: rng.range(30, VIEW_W - 30), y: rng.range(30, VIEW_H - 30), phase: rng.range(0, Math.PI * 2), speed: rng.range(0.25, 0.7), drift: rng.range(8, 26) });
    this.scenes = {};
    for (const [name, vis] of Object.entries(VIS)) {
      for (const w of WIDTHS) {
        const near = [];
        let x = rng.range(120, 260);
        let i = 0;
        while (x < w - 120) { near.push({ x, kind: vis.near[i % vis.near.length], s: rng.range(0.8, 1.3), seed: rng.range(0, 6) }); x += rng.range(190, 330); i++; }
        const far = [];
        x = rng.range(40, 160);
        i = 0;
        while (x < w * 0.5 + VIEW_W) { far.push({ x, kind: vis.far[i % vis.far.length], s: rng.range(0.8, 1.4), seed: rng.range(0, 6) }); x += rng.range(240, 420); i++; }
        const decor = [];
        for (let d = 0; d < Math.round(w / 110); d++) decor.push({ x: rng.range(30, w - 30), s: rng.range(0.7, 1.3), seed: rng.range(0, Math.PI * 2), kind: vis.decor[d % vis.decor.length] });
        this.scenes[`${name}:${w}`] = { near, far, decor };
      }
    }
    this.rng = rng;
  }

  sceneFor(themeName, worldW) { return this.scenes[`${themeName}:${worldW >= 2800 ? 3200 : 2400}`] ?? this.scenes[`${themeName}:2400`]; }
  propsFor(themeName, worldW) { return this.sceneFor(themeName, worldW)?.near ?? []; }

  drawSky(ctx, time, themeName, camX, climax = false) {
    const theme = THEMES[themeName];
    const vis = VIS[themeName] ?? VIS.abyss;
    const sky = theme ? theme.sky : vis.sky;
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grad.addColorStop(0, sky[0]); grad.addColorStop(0.55, sky[1]); grad.addColorStop(1, sky[2]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (theme?.nebula) {
      for (const n of NEBULAE) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.color); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }
    }
    if (!theme || theme.stars > 0) {
      for (const layer of this.layers) {
        for (const s of layer.stars) {
          const tw = 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
          ctx.globalAlpha = tw;
          ctx.fillStyle = '#dfe9ff';
          const sx = ((s.x - camX * layer.parallax * 8) % VIEW_W + VIEW_W) % VIEW_W;
          ctx.beginPath(); ctx.arc(sx, s.y * 0.8, s.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    const orb = theme ? theme.orb : vis.orb;
    if (orb) {
      const ox = orb.x - camX * 0.05;
      const halo = ctx.createRadialGradient(ox, orb.y, 8, ox, orb.y, orb.r * 3.8);
      halo.addColorStop(0, orb.halo); halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(ox - orb.r * 4, orb.y - orb.r * 4, orb.r * 8, orb.r * 8);
      ctx.fillStyle = orb.color;
      ctx.beginPath(); ctx.arc(ox, orb.y, orb.r, 0, Math.PI * 2); ctx.fill();
      if (orb.craters) {
        ctx.fillStyle = 'rgba(180, 195, 230, 0.5)';
        ctx.beginPath(); ctx.arc(ox - 8, orb.y - 5, 5, 0, Math.PI * 2); ctx.arc(ox + 9, orb.y + 8, 3.6, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Far silhouettes at half parallax.
    const scene = this.sceneFor(themeName, 3200);
    if (scene) {
      for (const f of scene.far) {
        const fx = f.x - camX * 0.5;
        if (fx < -220 || fx > VIEW_W + 220) continue;
        drawFarProp(ctx, f, themeName, time);
      }
    }
    if (theme?.mist) {
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const my = VIEW_H - 150 + i * 44;
        const mx = ((time * (6 + i * 3) + i * 470) % (VIEW_W + 500)) - 250;
        const mist = ctx.createRadialGradient(mx, my, 10, mx, my, 250);
        mist.addColorStop(0, 'rgba(170, 190, 255, 0.055)'); mist.addColorStop(1, 'rgba(170, 190, 255, 0)');
        ctx.fillStyle = mist; ctx.fillRect(mx - 250, my - 60, 500, 120);
      }
      ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const f of this.motes) {
      const x = f.x + Math.sin(time * f.speed + f.phase) * f.drift;
      const y = f.y + Math.cos(time * f.speed * 0.8 + f.phase * 1.7) * f.drift * 0.6;
      const glow = 0.35 + 0.3 * Math.sin(time * 1.7 + f.phase * 3);
      ctx.globalAlpha = Math.max(0.08, glow);
      ctx.fillStyle = vis.mote;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    if (climax) {
      const dark = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      dark.addColorStop(0, 'rgba(16, 2, 18, 0.5)'); dark.addColorStop(0.6, 'rgba(24, 4, 26, 0.28)'); dark.addColorStop(1, 'rgba(10, 2, 14, 0.42)');
      ctx.fillStyle = dark; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      const rift = ctx.createRadialGradient(VIEW_W / 2, -60, 10, VIEW_W / 2, -60, 560);
      rift.addColorStop(0, 'rgba(255, 70, 100, 0.30)'); rift.addColorStop(0.5, 'rgba(160, 40, 160, 0.12)'); rift.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rift; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  // World space: the caller has already translated by -camX.
  drawWorld(ctx, time, themeName, world) {
    const vis = VIS[themeName] ?? VIS.abyss;
    const worldW = world.worldW || VIEW_W;
    const camX = world.camX || 0;
    const x0 = Math.max(0, camX - 40), x1 = Math.min(worldW, camX + VIEW_W + 40);
    // The river runs beneath the bridge, in/behind the ground strip.
    if (world.bridgeX != null) {
      const rx = world.bridgeX - 74, rw = BRIDGE_W + 148;
      const water = ctx.createLinearGradient(0, GROUND_Y - 4, 0, GROUND_Y + 52);
      water.addColorStop(0, '#1d4a7a');
      water.addColorStop(1, '#0c2447');
      ctx.fillStyle = water; ctx.fillRect(rx, GROUND_Y - 4, rw, 56);
      ctx.strokeStyle = 'rgba(200, 235, 255, 0.5)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) {
        const wy = GROUND_Y + 8 + i * 11;
        const off = Math.sin(time * 1.6 + i * 2.2) * 7;
        ctx.beginPath(); ctx.moveTo(rx + 12 + off, wy); ctx.lineTo(rx + 52 + off, wy); ctx.moveTo(rx + 78 - off, wy + 3); ctx.lineTo(rx + 122 - off, wy + 3); ctx.stroke();
      }
    }
    // Ground strip.
    const gg = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);
    gg.addColorStop(0, vis.ground[0]); gg.addColorStop(1, vis.ground[1]);
    ctx.fillStyle = gg; ctx.fillRect(x0, GROUND_Y, x1 - x0, VIEW_H - GROUND_Y);
    ctx.fillStyle = vis.edge; ctx.fillRect(x0, GROUND_Y, x1 - x0, 4);
    if (world.bridgeX != null) {
      // Bridge planks over the river, at ground level: walkable.
      const bx = world.bridgeX - 16, bw = BRIDGE_W + 32;
      ctx.fillStyle = '#6a4a2c'; ctx.fillRect(bx, GROUND_Y - 7, bw, 9);
      ctx.fillStyle = '#8a6238';
      for (let px = bx + 3; px < bx + bw - 6; px += 13) ctx.fillRect(px, GROUND_Y - 7, 9, 9);
      ctx.fillStyle = '#54381e';
      ctx.fillRect(bx + 2, GROUND_Y - 26, 5, 20); ctx.fillRect(bx + bw - 7, GROUND_Y - 26, 5, 20);
      ctx.strokeStyle = '#8a6238'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + 2, GROUND_Y - 24); ctx.lineTo(bx + bw - 4, GROUND_Y - 24); ctx.stroke();
    }
    const scene = this.sceneFor(themeName, worldW);
    if (scene) {
      for (const d of scene.decor) {
        if (d.x < x0 - 30 || d.x > x1 + 30) continue;
        drawGroundDecor(ctx, d, themeName);
      }
      for (const pr of scene.near) {
        if (pr.x < x0 - 160 || pr.x > x1 + 160) continue;
        drawNearProp(ctx, pr, themeName, time);
      }
    }
    // Crystal pool glow on the ground.
    const c = world.crystal;
    if (c) {
      const pool = ctx.createRadialGradient(c.x, GROUND_Y, 8, c.x, GROUND_Y, 300);
      const theme = THEMES[themeName];
      pool.addColorStop(0, theme ? theme.pool[0] : 'rgba(255, 217, 160, 0.12)');
      pool.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pool;
      ctx.fillRect(c.x - 300, GROUND_Y - 60, 600, 120);
    }
  }
}

function drawFarProp(ctx, f, themeName, time) {
  const { x, s } = f;
  ctx.save(); ctx.translate(x, GROUND_Y); ctx.scale(s, s);
  if (f.kind === 'deadtree') {
    ctx.strokeStyle = 'rgba(8, 6, 20, 0.85)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, -86); ctx.moveTo(2, -52); ctx.lineTo(-26, -84); ctx.moveTo(3, -66); ctx.lineTo(30, -96); ctx.stroke();
  } else if (f.kind === 'ridge' || f.kind === 'spire') {
    ctx.fillStyle = 'rgba(8, 6, 20, 0.7)';
    ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-30, -110 - f.seed * 14); ctx.lineTo(6, -52); ctx.lineTo(44, -138 - f.seed * 10); ctx.lineTo(96, 0); ctx.closePath(); ctx.fill();
  } else if (f.kind === 'pillar') {
    ctx.fillStyle = 'rgba(238, 232, 214, 0.55)';
    ctx.fillRect(-11, -190, 22, 190); ctx.fillRect(-17, -198, 34, 10); ctx.fillRect(-17, -12, 34, 12);
  } else if (f.kind === 'isle') {
    const iy = -252 - f.seed * 16 + Math.sin(time * 0.5 + f.seed * 3) * 5;
    ctx.fillStyle = 'rgba(240, 235, 220, 0.8)';
    ctx.beginPath(); ctx.ellipse(0, iy, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(190, 175, 150, 0.8)';
    ctx.beginPath(); ctx.moveTo(-44, iy + 4); ctx.lineTo(44, iy + 4); ctx.lineTo(0, iy + 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(150, 200, 120, 0.85)';
    ctx.beginPath(); ctx.ellipse(0, iy - 3, 47, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (f.kind === 'roof') {
    ctx.fillStyle = 'rgba(16, 10, 30, 0.8)';
    ctx.fillRect(-52, -64, 104, 64);
    ctx.beginPath(); ctx.moveTo(-62, -64); ctx.lineTo(0, -96); ctx.lineTo(62, -64); ctx.closePath(); ctx.fill();
  } else if (f.kind === 'tower') {
    ctx.fillStyle = 'rgba(16, 10, 30, 0.8)';
    ctx.fillRect(-16, -150, 32, 150);
    ctx.beginPath(); ctx.moveTo(-22, -150); ctx.lineTo(0, -178); ctx.lineTo(22, -150); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255, 200, 120, 0.75)'; ctx.fillRect(-4, -120, 8, 11); ctx.fillRect(-4, -84, 8, 11);
  }
  ctx.restore();
}

function drawNearProp(ctx, pr, themeName, time) {
  const { x, s } = pr;
  ctx.save(); ctx.translate(x, GROUND_Y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 3, 20, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  if (pr.kind === 'deadtree') {
    ctx.strokeStyle = themeName === 'abyss' ? '#131022' : '#3a2c22'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(2, -64); ctx.moveTo(1, -38); ctx.lineTo(-20, -62); ctx.moveTo(2, -50); ctx.lineTo(22, -74); ctx.stroke();
    ctx.strokeStyle = 'rgba(150, 190, 255, 0.35)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(1, -30); ctx.lineTo(2, -62); ctx.stroke();
  } else if (pr.kind === 'rock') {
    ctx.fillStyle = '#2c3350';
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-9, -13); ctx.lineTo(3, -17); ctx.lineTo(14, -6); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill();
  } else if (pr.kind === 'lantern' || pr.kind === 'lamp') {
    ctx.fillStyle = '#1c1830'; ctx.fillRect(-2.5, -74, 5, 74);
    ctx.fillStyle = '#ffd23c';
    ctx.save(); ctx.shadowColor = '#ffb84d'; ctx.shadowBlur = 13;
    ctx.fillRect(-5, -84, 10, 12); ctx.restore();
    ctx.strokeStyle = '#1c1830'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-7, -84); ctx.lineTo(7, -84); ctx.stroke();
  } else if (pr.kind === 'pillar') {
    ctx.fillStyle = '#f2ecd9'; ctx.fillRect(-9, -118, 18, 118);
    ctx.fillStyle = '#ddd5ba'; ctx.fillRect(-14, -126, 28, 9); ctx.fillRect(-14, -10, 28, 10);
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.8)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-9, -100); ctx.lineTo(9, -100); ctx.moveTo(-9, -22); ctx.lineTo(9, -22); ctx.stroke();
  } else if (pr.kind === 'pine') {
    ctx.fillStyle = '#5e4630'; ctx.fillRect(-3, -22, 6, 22);
    ctx.fillStyle = '#bcd8b0';
    for (const [oy, w] of [[-26, 26], [-46, 20], [-64, 13]]) {
      ctx.beginPath(); ctx.moveTo(-w, oy + 12); ctx.lineTo(0, oy - 8); ctx.lineTo(w, oy + 12); ctx.closePath(); ctx.fill();
    }
  } else if (pr.kind === 'tree') {
    ctx.fillStyle = '#2c1e33'; ctx.fillRect(-3.5, -34, 7, 34);
    ctx.fillStyle = '#4a3560';
    for (const [ox, oy, r] of [[-14, -48, 15], [12, -54, 17], [0, -70, 15]]) {
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 160, 120, 0.5)';
    for (const [ox, oy] of [[-10, -44], [14, -62], [2, -76]]) { ctx.beginPath(); ctx.arc(ox, oy, 2, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function drawGroundDecor(ctx, d, themeName) {
  const { x, s } = d;
  const y = GROUND_Y + 6 + (d.seed % 1) * 26;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (d.kind === 'rune') {
    ctx.strokeStyle = 'rgba(150, 130, 255, 0.4)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(120, 110, 200, 0.5)';
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3, 3.4); ctx.lineTo(-3, 3.4); ctx.closePath(); ctx.fill();
  } else if (d.kind === 'shard') {
    ctx.fillStyle = 'rgba(160, 190, 255, 0.6)';
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(4, 4); ctx.lineTo(0, 6.5); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
  } else if (d.kind === 'rock') {
    ctx.fillStyle = 'rgba(110, 96, 84, 0.7)';
    ctx.beginPath(); ctx.moveTo(-7, 3.4); ctx.lineTo(-3.4, -4.2); ctx.lineTo(2.6, -6); ctx.lineTo(7, 0.8); ctx.lineTo(4.2, 3.4); ctx.closePath(); ctx.fill();
  } else if (d.kind === 'marble') {
    ctx.fillStyle = 'rgba(250, 246, 235, 0.8)';
    ctx.beginPath(); ctx.moveTo(0, -8.6); ctx.lineTo(4.3, 1.7); ctx.lineTo(1.7, 6); ctx.lineTo(-3.4, 5.1); ctx.lineTo(-4.6, -1.7); ctx.closePath(); ctx.fill();
  } else if (d.kind === 'cloudpuff') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (const [ox, oy, r] of [[-6, 1.7, 5.1], [0, -0.85, 6.8], [6, 1.7, 5.1]]) { ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}
