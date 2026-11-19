// input.js — keyboard, mouse and touch state.

import { TOUCH_STICK } from './config.js';

export class Input { constructor(canvas) { this.canvas=canvas; this.keys=new Set(); this.pressed=new Set(); this.mouseX=640; this.mouseY=300; this.mouseDown=false; this.clicked=false;
    // Touch: a fixed stick (lower-left), plain taps, and on-screen buttons
    // whose rects main.js registers each frame. A touch-capable device is
    // in touch mode from boot; the first touch also wakes it anywhere else.
    this.touchMode=navigator.maxTouchPoints > 0; this.walkMode=false; this.touches=new Map(); this.buttonRects=[]; this.buttonId=null; this.stickId=null; this.stickCX=TOUCH_STICK.x; this.stickCY=TOUCH_STICK.y; this.stickX=0; this.stickY=0; this.aimId=null; this.rotateBlock=false; this.lockTried=false;

    window.addEventListener('keydown', (event) => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) { event.preventDefault(); }
      if (!event.repeat) this.pressed.add(event.code); this.keys.add(event.code); }); window.addEventListener('keyup', (event) => { this.keys.delete(event.code); }); window.addEventListener('blur', () => {
      this.keys.clear(); this.mouseDown=false; this.touches.clear(); this.buttonId=null; this.stickId=null; this.stickX=0; this.stickY=0; this.aimId=null; });

    canvas.addEventListener('mousemove', (event) => { const rect = canvas.getBoundingClientRect(); this.mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width; this.mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height; }); canvas.addEventListener('mousedown', (event) => {
      if (event.button===0) { this.mouseDown=true; this.clicked=true; }
    }); window.addEventListener('mouseup', (event) => { if (event.button===0) this.mouseDown=false; }); canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    // No scroll or pull-refresh may ever steal a touch from the game.
    canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false }); canvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false }); canvas.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') return; event.preventDefault(); this.touchMode = true; if (!this.lockTried) {
        this.lockTried = true; try { screen.orientation?.lock?.('landscape')?.catch?.(() => {}); } catch { /* the rotate overlay covers refusal */ }
      }
      const pt=this.toGame(event); const btn=this.buttonRects.find((b)=>
        pt.x>=b.x&&pt.x < b.x + b.w&&pt.y>=b.y&&pt.y < b.y + b.h); if (btn) { this.touches.set(event.pointerId, 'button'); this.buttonId = btn.id; const code = { dash: 'Space', skill: 'KeyE', nova: 'KeyQ', pause: 'KeyP', interact: 'KeyE' }[btn.id]
          ?? (btn.id.startsWith('item') ? `Digit${Number(btn.id.slice(4)) + 1}` : null);
        if (code) this.pressed.add(code); return; }
      if (this.walkMode&&this.stickId===null&&Math.hypot(pt.x - this.stickCX,pt.y - this.stickCY) <= TOUCH_STICK.grab) { this.touches.set(event.pointerId, 'stick'); this.stickId = event.pointerId; this.stickX = 0; this.stickY = 0; return; }
      // Any other touch is a plain tap: it clicks menus and dismisses
      // dialogue, but it never aims and never fires — in touch mode the
      // Warden strikes on her own (see player.js's touch target).
      this.touches.set(event.pointerId, 'tap'); this.mouseX = pt.x; this.mouseY = pt.y; this.clicked = true; }); window.addEventListener('pointermove', (event) => { if (event.pointerType !== 'touch') return; const role = this.touches.get(event.pointerId); if (!role) return;
      const pt = this.toGame(event); if (role === 'stick') { const dx=pt.x - this.stickCX; const dy=pt.y - this.stickCY; const len=Math.hypot(dx,dy); if (len < 10) { this.stickX=0; this.stickY=0; }
        else { const cl=Math.min(len,56) / 56; this.stickX=(dx / len)*cl; this.stickY=(dy / len)*cl; }
      }
    }); const release=(event)=>{ if (event.pointerType !== 'touch') return; const role = this.touches.get(event.pointerId); if (!role) return; this.touches.delete(event.pointerId); if (role === 'stick') { this.stickId=null; this.stickX=0; this.stickY=0; }
      if (role === 'button') this.buttonId = null; }; window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); }

  toGame(event) { const rect=this.canvas.getBoundingClientRect(); return { x:((event.clientX - rect.left) / rect.width)*this.canvas.width,y:((event.clientY - rect.top) / rect.height)*this.canvas.height,}; }

  setButtons(rects) { this.buttonRects=rects; }

  down(...codes) { return codes.some((code)=>this.keys.has(code)); }

  justPressed(...codes) { return codes.some((code)=>this.pressed.has(code)); }

  endFrame() { this.pressed.clear(); this.clicked=false; }
}
