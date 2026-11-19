// audio.js — all sound synthesised with WebAudio; M mutes.

const MUSIC_NOTES=[220.0,261.63,329.63,440.0,523.25,659.25]; const BASS_NOTES=[110.0,87.31,130.81,98.0];

export class SoundEngine { constructor() { this.ctx=null; this.master=null; this.muted=false; this.musicTimer=0; this.musicStep=0; this.noiseBuffer=null; }

  unlock() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AudioCtor=window.AudioContext||window.webkitAudioContext; if (!AudioCtor) return; this.ctx=new AudioCtor(); this.master=this.ctx.createGain(); this.master.gain.value=0.5; this.master.connect(this.ctx.destination); const length=this.ctx.sampleRate*0.5;
    this.noiseBuffer=this.ctx.createBuffer(1,length,this.ctx.sampleRate); const data=this.noiseBuffer.getChannelData(0); for (let i=0; i < length; i++) data[i]=Math.random()*2 - 1; }

  setMuted(muted) { this.muted=muted; if (this.master) this.master.gain.value=muted ? 0:0.5; }

  tone({ freq = 440, end = null, type = 'sine', dur = 0.15, vol = 0.2, delay = 0 }) { if (!this.ctx||this.muted) return; const t0=this.ctx.currentTime + delay; const osc=this.ctx.createOscillator(); const gain=this.ctx.createGain(); osc.type=type; osc.frequency.setValueAtTime(freq,t0);
    if (end!==null) osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t0 + dur); gain.gain.setValueAtTime(vol,t0); gain.gain.exponentialRampToValueAtTime(0.001,t0 + dur); osc.connect(gain).connect(this.master); osc.start(t0); osc.stop(t0 + dur + 0.02); }

  noise({ dur=0.2,vol=0.25,from=3000,to=300,delay=0 }) { if (!this.ctx||this.muted) return; const t0=this.ctx.currentTime + delay; const source=this.ctx.createBufferSource(); source.buffer=this.noiseBuffer; source.loop=true;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(from, t0); filter.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur); const gain = this.ctx.createGain(); gain.gain.setValueAtTime(vol, t0); gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    source.connect(filter).connect(gain).connect(this.master); source.start(t0); source.stop(t0 + dur + 0.02); }

  // Per-hero, element-flavoured SFX — Karlsefni is ICE, Rosaline is
  // FIRE, Tyne is LIGHTNING. No hero ever borrows another's variant.
  attack(hero) {
    if (hero === 'karlsefni') { this.noise({ dur: 0.11, vol: 0.12, from: 6800, to: 2400 }); this.tone({ freq: 1560, end: 2093, type: 'sine', dur: 0.07, vol: 0.05 }); }
    else if (hero === 'rosaline') { this.noise({ dur: 0.16, vol: 0.16, from: 900, to: 300 }); this.tone({ freq: 196, end: 130, type: 'triangle', dur: 0.12, vol: 0.06 }); }
    else { this.tone({ freq: 1240, end: 340, type: 'square', dur: 0.07, vol: 0.06 }); this.noise({ dur: 0.05, vol: 0.07, from: 7000, to: 2600 }); }
  }

  skill(hero) {
    if (hero === 'karlsefni') { this.noise({ dur: 0.5, vol: 0.16, from: 2400, to: 5600 }); [1568, 1318, 1046].forEach((freq, i) => this.tone({ freq, type: 'sine', dur: 0.22, vol: 0.07, delay: 0.05 + i * 0.07 })); }
    else if (hero === 'rosaline') { this.noise({ dur: 0.42, vol: 0.24, from: 500, to: 180 }); this.tone({ freq: 147, end: 73, type: 'sine', dur: 0.4, vol: 0.2 }); this.noise({ dur: 0.3, vol: 0.08, from: 3600, to: 900, delay: 0.1 }); }
    else { this.tone({ freq: 1900, end: 300, type: 'sawtooth', dur: 0.14, vol: 0.14 }); this.tone({ freq: 82, end: 41, type: 'sine', dur: 0.7, vol: 0.22, delay: 0.05 }); this.noise({ dur: 0.5, vol: 0.1, from: 700, to: 120, delay: 0.05 }); }
  }

  ultiImpact(hero) {
    if (hero === 'karlsefni') { this.noise({ dur: 0.4, vol: 0.26, from: 8000, to: 2000 }); [2093, 1760, 1568, 1318, 1174, 1046].forEach((freq, i) => this.tone({ freq, type: 'sine', dur: 0.3, vol: 0.09, delay: i * 0.05 })); this.tone({ freq: 130, end: 48, type: 'sine', dur: 0.4, vol: 0.24 }); }
    else if (hero === 'rosaline') { this.tone({ freq: 65, end: 32, type: 'sine', dur: 0.8, vol: 0.34 }); this.noise({ dur: 0.7, vol: 0.28, from: 2400, to: 150 }); this.noise({ dur: 1.1, vol: 0.1, from: 4200, to: 700, delay: 0.12 }); }
    else { this.tone({ freq: 2400, end: 200, type: 'sawtooth', dur: 0.16, vol: 0.2 }); this.noise({ dur: 0.25, vol: 0.24, from: 9000, to: 2500 }); this.tone({ freq: 55, end: 30, type: 'sine', dur: 1.2, vol: 0.3, delay: 0.04 }); this.noise({ dur: 1.0, vol: 0.12, from: 500, to: 90, delay: 0.04 }); }
  }

  hit() { this.tone({ freq: 300, end: 160, type: 'triangle', dur: 0.06, vol: 0.08 }); }

  explosion(big=false) { this.noise({ dur: big ? 0.5 : 0.25, vol: big ? 0.4 : 0.2, from: 2600, to: 120 }); this.tone({ freq: big ? 160 : 200, end: 45, type: 'sine', dur: big ? 0.45 : 0.25, vol: 0.3 }); }

  playerHurt() { this.tone({ freq: 220, end: 70, type: 'sawtooth', dur: 0.22, vol: 0.18 }); this.noise({ dur: 0.15, vol: 0.12, from: 1200, to: 200 }); }

  crystalHurt() { this.tone({ freq: 1320, end: 990, type: 'sine', dur: 0.16, vol: 0.14 }); this.tone({ freq: 1760, end: 1320, type: 'sine', dur: 0.2, vol: 0.08, delay: 0.03 }); }

  dash(hero) {
    if (hero === 'karlsefni') this.noise({ dur: 0.18, vol: 0.09, from: 5200, to: 1800 });
    else if (hero === 'rosaline') this.noise({ dur: 0.14, vol: 0.11, from: 700, to: 240 });
    else this.tone({ freq: 1760, end: 880, type: 'square', dur: 0.06, vol: 0.05 });
  }

  // Foe melee only (Kael's combo swipe) — heroes never call this.
  slash() { this.noise({ dur: 0.13, vol: 0.13, from: 5200, to: 900 }); this.tone({ freq: 1420, end: 700, type: 'triangle', dur: 0.08, vol: 0.05 }); }

  deny() { this.tone({ freq: 170, end: 110, type: 'square', dur: 0.09, vol: 0.1 }); }

  buy() { [880, 1174].forEach((freq, i) => this.tone({ freq, type: 'sine', dur: 0.12, vol: 0.1, delay: i * 0.06 }), ); }

  pickup() { [660, 880, 1320].forEach((freq, i) => this.tone({ freq, type: 'sine', dur: 0.14, vol: 0.1, delay: i * 0.05 }), ); }

  // The ultimate's charge/launch stage (the explosion lands with
  // ultiImpact at the storyboard's Impact beat).
  nova(hero) {
    if (hero === 'karlsefni') { [523, 784, 1046].forEach((freq, i) => this.tone({ freq, type: 'sine', dur: 0.4, vol: 0.07, delay: i * 0.09 })); this.tone({ freq: 98, end: 65, type: 'sawtooth', dur: 0.55, vol: 0.16, delay: 0.4 }); this.tone({ freq: 104, end: 69, type: 'sawtooth', dur: 0.55, vol: 0.12, delay: 0.4 }); this.noise({ dur: 0.5, vol: 0.08, from: 3000, to: 5200, delay: 0.4 }); }
    else if (hero === 'rosaline') { this.noise({ dur: 0.9, vol: 0.14, from: 300, to: 1500 }); [392, 523, 659].forEach((freq, i) => this.tone({ freq, type: 'triangle', dur: 0.5, vol: 0.08, delay: i * 0.12 })); }
    else { for (let i = 0; i < 7; i++) this.tone({ freq: 1500 + (i % 3) * 420, end: 500, type: 'square', dur: 0.05, vol: 0.05, delay: i * 0.13 }); this.noise({ dur: 0.9, vol: 0.07, from: 6000, to: 3000 }); }
  }

  bossToll() { this.tone({ freq: 98, type: 'sine', dur: 2.4, vol: 0.32 }); this.tone({ freq: 196.5, type: 'sine', dur: 1.8, vol: 0.12 }); this.tone({ freq: 294, type: 'sine', dur: 1.2, vol: 0.06 }); this.tone({ freq: 98, type: 'sine', dur: 2.4, vol: 0.28, delay: 0.85 }); }

  waveStart() { [523.25, 659.25, 783.99].forEach((freq, i) => this.tone({ freq, type: 'triangle', dur: 0.3, vol: 0.1, delay: i * 0.09 }), ); }

  gameOver() { [392, 329.63, 261.63, 196].forEach((freq, i) => this.tone({ freq, type: 'triangle', dur: 0.5, vol: 0.14, delay: i * 0.22 }), ); }

  victory() { [523.25,659.25,783.99,1046.5,1318.5].forEach((freq,i)=>
      this.tone({ freq, type: 'triangle', dur: 0.45, vol: 0.12, delay: i * 0.11 }), ); }

  // A gentle loop while a run is on, scheduled from the update tick.
  updateMusic(dt,playing) { if (!this.ctx||this.muted||!playing) return; this.musicTimer -=dt; if (this.musicTimer > 0) return; this.musicTimer=0.42; const step=this.musicStep++; if (step % 8===0) {
      const bass = BASS_NOTES[(step / 8) % BASS_NOTES.length]; this.tone({ freq: bass, type: 'sine', dur: 2.6, vol: 0.075 }); this.tone({ freq: bass * 2, type: 'triangle', dur: 2.6, vol: 0.03 }); }
    if (step % 2===0&&(step*7) % 5 < 3) { const note = MUSIC_NOTES[(step * 3 + 1) % MUSIC_NOTES.length]; this.tone({ freq: note * 2, type: 'sine', dur: 0.5, vol: 0.028 }); }
  }
}
