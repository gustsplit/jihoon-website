/**
 * Nuke / Atomic Explosion Physics & Particle Visual Engine
 */

export class NukePhysicsEngine {
  constructor() {
    this.audioCtx = null;
    this.particles = [];
    this.shockwaves = [];
    this.isAnimating = false;
  }

  getAudioContext() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    return this.audioCtx;
  }

  /**
   * Evaluates Nuke Explosion on a board matrix.
   * @param {Array<Array<string|null>>} board - Board grid
   * @param {number} r - Capture row
   * @param {number} c - Capture col
   * @param {string} capturingPiece - The piece that made the capture
   * @returns {Object} Explosion blast details
   */
  explode(board, r, c, capturingPiece) {
    const rows = board.length;
    const cols = board[0].length;
    const vaporized = [];
    let whiteKingDead = false;
    let blackKingDead = false;

    // Capturing piece dies in the explosion
    vaporized.push({ r, c, piece: capturingPiece, isCenter: true });
    board[r][c] = null;

    // 8 Surrounding neighbor squares
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const victim = board[nr][nc];
          if (victim) {
            const pieceType = victim[1].toLowerCase();
            // In atomic rules, Pawns survive adjacent blasts, but all other pieces (Knights, Bishops, Rooks, Queens, Amazons, Kings) are vaporized!
            if (pieceType !== 'p') {
              vaporized.push({ r: nr, c: nc, piece: victim, isCenter: false });
              if (victim === 'wK') whiteKingDead = true;
              if (victim === 'bK') blackKingDead = true;
              board[nr][nc] = null;
            }
          }
        }
      }
    }

    return {
      center: { r, c },
      vaporized,
      whiteKingDead,
      blackKingDead,
      hasExplosion: true
    };
  }

  /**
   * Synthesize deep cinematic nuke sound via Web Audio API
   */
  playNukeAudio() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. Sub-bass boom oscillator
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.8);

      // 2. White noise blast generator for rumble
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {
      console.warn('Audio nuke sound error:', e);
    }
  }

  /**
   * Triggers screen rumble on the board container
   */
  shakeScreen(boardElement) {
    if (!boardElement) return;
    boardElement.classList.add('nuke-shaking');
    setTimeout(() => {
      boardElement.classList.remove('nuke-shaking');
    }, 450);
  }

  /**
   * Spawns particle blast explosion on canvas
   */
  spawnNukeParticles(canvas, pixelX, pixelY) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Spawn 45 particles (fire, ember, smoke)
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const size = Math.random() * 7 + 4;
      const life = Math.random() * 30 + 25;
      const colors = ['#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#ffffff', '#38bdf8'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: pixelX,
        y: pixelY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color,
        life,
        maxLife: life
      });
    }

    // Shockwave ring
    this.shockwaves.push({
      x: pixelX,
      y: pixelY,
      radius: 5,
      maxRadius: 85,
      alpha: 1.0,
      width: 6
    });

    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animateParticles(canvas);
    }
  }

  animateParticles(canvas) {
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += 4;
        sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${sw.alpha * 0.9})`;
        ctx.lineWidth = sw.width;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        if (sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }

      // Render debris particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.size *= 0.95;
        p.life--;

        const alpha = Math.max(0, p.life / p.maxLife);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        if (p.life <= 0 || p.size <= 0.8) {
          this.particles.splice(i, 1);
        }
      }

      if (this.particles.length > 0 || this.shockwaves.length > 0) {
        requestAnimationFrame(render);
      } else {
        this.isAnimating = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    requestAnimationFrame(render);
  }
}

export const nukePhysics = new NukePhysicsEngine();
