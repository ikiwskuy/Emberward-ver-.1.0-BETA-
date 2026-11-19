// particles.js — the sparkle layer: trails, bursts, rings, float text.

const MAX_PARTICLES=900;

export class ParticleSystem { constructor(rng) { this.rng=rng; this.items=[]; this.texts=[]; }

  spawn(props) { if (this.items.length>=MAX_PARTICLES) this.items.shift(); this.items.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0.6, age: 0, size: 3, color: '#ffd97a', drag: 1, gravity: 0, shape: 'dot', spin: 0, angle: 0, ...props, }); }

  burst(x, y, color, count = 14, speed = 260, shape = 'dot') { for (let i=0; i < count; i++) {
      const a=this.rng.angle(); const v=speed*this.rng.range(0.25,1); this.spawn({ x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:this.rng.range(0.25,0.6),size:this.rng.range(1.5,3.6),color,drag:3.2,shape,angle:a,spin:this.rng.range(-6,6),}); }
  }

  sparkles(x,y,color,count=8) { for (let i=0; i < count; i++) { const a=this.rng.angle(); const v=this.rng.range(20,130); this.spawn({
        x: x + this.rng.range(-8, 8), y: y + this.rng.range(-8, 8), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 24, life: this.rng.range(0.4, 0.9), size: this.rng.range(3, 6.5), color, drag: 2, shape: 'star', angle: this.rng.angle(), spin: this.rng.range(-3, 3), }); }
  }

  embers(x,y,color,count=6,spread=14) { for (let i=0; i < count; i++) { this.spawn({ x: x + this.rng.range(-spread, spread), y: y + this.rng.range(-spread, spread), vx: this.rng.range(-16, 16), vy: this.rng.range(-70, -25), life: this.rng.range(0.6, 1.3), size: this.rng.range(1.6, 3.4), color, drag: 0.4, shape: 'dot',
      }); }
  }

  ring(x,y,color,maxRadius=120,width=5) { this.spawn({ x, y, life: 0.45, size: width, color, shape: 'ring', ringFrom: 6, ringTo: maxRadius, }); }

  trailDot(x,y,color,size=4,life=0.3) { this.spawn({ x, y, life, size, color, shape: 'dot', vx: 0, vy: 0 }); }

  floatText(x, y, text, color = '#fff3c4', size = 17) { this.texts.push({ x,y,text,color,size,age: 0,life: 0.95 }); if (this.texts.length > 24) this.texts.shift(); }

  update(dt) { const items=this.items; for (let i=items.length - 1; i>=0; i--) { const p=items[i]; p.age+=dt; if (p.age>=p.life) { items.splice(i,1); continue; }
      const dragK=Math.max(0,1 - p.drag*dt); p.vx*=dragK; p.vy=p.vy*dragK + p.gravity*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.angle+=p.spin*dt; }
    for (let i=this.texts.length - 1; i>=0; i--) { const t=this.texts[i]; t.age+=dt; t.y -=34*dt; if (t.age>=t.life) this.texts.splice(i,1); }
  }

  draw(ctx) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const p of this.items) { const fade=1 - p.age / p.life; ctx.globalAlpha=Math.max(0,fade); ctx.fillStyle=p.color; ctx.strokeStyle = p.color; if (p.shape === 'ring') {
        const k=p.age / p.life; ctx.globalAlpha=fade*0.8; ctx.lineWidth=p.size*(1 - k) + 1; ctx.beginPath(); ctx.arc(p.x,p.y,p.ringFrom + (p.ringTo - p.ringFrom)*(1 - (1 - k)*(1 - k)),0,Math.PI*2); ctx.stroke(); } else if (p.shape === 'star') { drawStar(ctx,p.x,p.y,p.size*(0.5 + fade*0.5),p.angle);
      } else if (p.shape === 'rune') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-p.size); ctx.lineTo(0,p.size); ctx.moveTo(0,-p.size*0.5); ctx.lineTo(p.size*0.7,-p.size*0.05); ctx.moveTo(0,0); ctx.lineTo(p.size*0.7,p.size*0.45); ctx.stroke(); ctx.restore();
      } else if (p.shape === 'shard') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle); ctx.fillRect(-p.size,-p.size*0.32,p.size*2,p.size*0.64); ctx.restore(); } else { ctx.beginPath(); ctx.arc(p.x,p.y,p.size*fade + 0.4,0,Math.PI*2); ctx.fill(); }
    }
    ctx.restore();

    for (const t of this.texts) {
      const fade = 1 - t.age / t.life; ctx.save(); ctx.globalAlpha = Math.max(0, fade); ctx.font = `bold ${t.size}px Georgia, serif`; ctx.textAlign = 'center'; ctx.fillStyle = t.color; ctx.shadowColor = t.color; ctx.shadowBlur = 8; ctx.fillText(t.text, t.x, t.y); ctx.restore();
    }
  }
}

// A four-point sparkle star, drawn pointing along `angle`.
export function drawStar(ctx,x,y,r,angle=0) { ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(0,-r); ctx.quadraticCurveTo(0,0,r,0); ctx.quadraticCurveTo(0,0,0,r); ctx.quadraticCurveTo(0,0,-r,0); ctx.quadraticCurveTo(0,0,0,-r); ctx.fill(); ctx.restore(); }
