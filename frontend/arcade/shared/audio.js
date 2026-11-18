/* ==========================================================================
   MINI ROBLOX - SOUND SYNTHESIZER (Web Audio API)
   Zero external assets needed - Instant, responsive classic sounds!
   ========================================================================== */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Classic UI Click
  playClick() {
    if (!this.enabled) return;
    this.initContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Classic Roblox "Oof" Sound
  playOof() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    // Pitch drops down rapidly like "OOF"
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Jump Sound
  playJump() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Robux / Coin Chime
  playRobux() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.08));
      
      gain.gain.setValueAtTime(0.2, now + (i * 0.08));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.08) + 0.18);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + (i * 0.08));
      osc.stop(now + (i * 0.08) + 0.2);
    });
  }

  // Laser / Attack Sound
  playLaser() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Tsunami Warning Siren / Wave Roar
  playTsunamiRoar() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.3);
    osc.frequency.linearRampToValueAtTime(50, now + 0.6);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Win Fanfare
  playWin() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + (idx * 0.1));
      
      gain.gain.setValueAtTime(0.2, now + (idx * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx * 0.1) + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + (idx * 0.1));
      osc.stop(now + (idx * 0.1) + 0.3);
    });
  }
}

export const sounds = new SoundManager();
