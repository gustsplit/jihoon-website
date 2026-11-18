/* ==========================================================================
   MINI ROBLOX - BASE GAME ENGINE
   Manages game loops, player controls, canvas lifecycle, HUD, and Admin state
   ========================================================================== */

import { auth } from '../../../backend/arcade/shared/guestPlayer.js';
import { sounds } from './audio.js';
import { AdminState } from '../../../backend/arcade/shared/gameModifiers.js';
import { gameStatsTracker } from '../../../backend/arcade/shared/gameStats.js';

// Safe Canvas roundRect Polyfill for all browsers
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
    if (typeof r === 'number') r = [r, r, r, r];
    const [tl, tr, br, bl] = r;
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.activeGame = null;
    this.isRunning = false;
    this.animationId = null;
    this.score = 0;
    this.specialStat = 0;

    // Keys State
    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      KeyW: false,
      KeyA: false,
      KeyS: false,
      KeyD: false,
      Space: false
    };

    this.initGlobalEvents();
  }

  initGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      // Allow browser hard refresh (Ctrl+F5, F5, Ctrl+R, Ctrl+Shift+R) to work seamlessly while in-game
      if (e.key === 'F5' || e.code === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.code === 'KeyR'))) {
        if (e.ctrlKey) {
          // Hard reload with Ctrl+F5
          try {
            window.location.reload(true);
          } catch (err) {
            window.location.reload();
          }
        }
        return; // Do not intercept browser refresh
      }

      this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key] = true;
        this.keys[e.key.toLowerCase()] = true;
      }
      // Space jump
      if (e.code === 'Space' && this.activeGame && !e.target.matches('input, textarea')) {
        e.preventDefault();
      }
      // Press J to toggle Jetpack / Flight Mode anytime
      if (e.code === 'KeyJ' && this.activeGame && !e.target.matches('input, textarea')) {
        this.toggleJetpack();
      }
      if (this.activeGame && this.activeGame.onKeyDown) {
        try {
          this.activeGame.onKeyDown(e);
        } catch (err) {
          console.error('onKeyDown error:', err);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key] = false;
        this.keys[e.key.toLowerCase()] = false;
      }
      if (this.activeGame && this.activeGame.onKeyUp) {
        try {
          this.activeGame.onKeyUp(e);
        } catch (err) {
          console.error('onKeyUp error:', err);
        }
      }
    });

    // In-game Hard Reload Button (Ctrl + F5)
    const reloadBtn = document.getElementById('inGameReloadBtn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        sounds.playClick();
        try {
          window.location.reload(true);
        } catch (e) {
          window.location.reload();
        }
      });
    }

    // In-game Jetpack Toggle Button
    const jetpackBtn = document.getElementById('inGameJetpackBtn');
    if (jetpackBtn) {
      jetpackBtn.addEventListener('click', () => {
        this.toggleJetpack();
      });
    }

    // In-game Topbar buttons
    const leaveBtn = document.getElementById('leaveGameBtn');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        this.stopGame();
        sounds.playClick();
      });
    }

    const inGameMenuBtn = document.getElementById('inGameMenuBtn');
    if (inGameMenuBtn) {
      inGameMenuBtn.addEventListener('click', () => {
        if (confirm('Roblox Menu: Return to Discover Hub?')) {
          this.stopGame();
          sounds.playClick();
        }
      });
    }

    const startOverlay = document.getElementById('gameInstructionOverlay');
    const startOverlayBtn = document.getElementById('startGameBtn');
    const beginGame = () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      if (this.activeGame && this.activeGame.start) {
        try {
          this.activeGame.start();
        } catch (err) {
          console.error('Game start error:', err);
        }
      }
      sounds.playClick();
    };

    if (startOverlayBtn) startOverlayBtn.addEventListener('click', beginGame);
    if (startOverlay) startOverlay.addEventListener('click', beginGame);

    const nextStageBtn = document.getElementById('nextStageBtn');
    if (nextStageBtn) {
      nextStageBtn.addEventListener('click', () => {
        document.getElementById('gameOverOverlay').classList.add('hidden');
        this.currentStage = (this.currentStage || 1) + 1;
        if (this.activeGame) {
          if (this.activeGame.setStage) this.activeGame.setStage(this.currentStage);
          if (this.activeGame.reset) this.activeGame.reset(this.currentStage);
          if (this.activeGame.start) this.activeGame.start(this.currentStage);
        }
        sounds.playRobux();
        this.addInGameChatMessage('SYSTEM', `⭐ LEVEL UP! Advanced to Stage ${this.currentStage}! Difficulty increased!`, true);
      });
    }

    const restartBtn = document.getElementById('restartGameBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        document.getElementById('gameOverOverlay').classList.add('hidden');
        this.currentStage = 1;
        if (this.activeGame) {
          if (this.activeGame.setStage) this.activeGame.setStage(1);
          if (this.activeGame.reset) this.activeGame.reset(1);
          if (this.activeGame.start) this.activeGame.start(1);
        }
        sounds.playClick();
      });
    }

    const exitToHubBtn = document.getElementById('exitToHubBtn');
    if (exitToHubBtn) {
      exitToHubBtn.addEventListener('click', () => {
        this.stopGame();
        sounds.playClick();
      });
    }

    // Canvas click / pointer listener for interactive tools
    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        if (this.activeGame && this.activeGame.onClick) {
          try {
            this.activeGame.onClick(clickX, clickY);
          } catch (err) {}
        }
      });

      this.canvas.addEventListener('pointermove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const moveX = (e.clientX - rect.left) * scaleX;
        const moveY = (e.clientY - rect.top) * scaleY;

        if (this.activeGame && this.activeGame.onMouseMove) {
          try {
            this.activeGame.onMouseMove(moveX, moveY);
          } catch (err) {}
        }
      });

      this.canvas.addEventListener('wheel', (e) => {
        if (this.activeGame && this.activeGame.onWheel) {
          try {
            this.activeGame.onWheel(e);
          } catch (err) {}
        }
      }, { passive: false });
    }

    // On-Screen Touch / Mouse Control Buttons
    const bindTouchBtn = (id, keyName, keyCode) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const press = (e) => {
        e.preventDefault();
        this.keys[keyName] = true;
        btn.classList.add('active');
        if (this.activeGame && this.activeGame.onKeyDown) {
          try {
            this.activeGame.onKeyDown({ code: keyCode, key: keyName });
          } catch (err) {}
        }
      };
      const release = (e) => {
        e.preventDefault();
        this.keys[keyName] = false;
        btn.classList.remove('active');
        if (this.activeGame && this.activeGame.onKeyUp) {
          try {
            this.activeGame.onKeyUp({ code: keyCode, key: keyName });
          } catch (err) {}
        }
      };
      btn.addEventListener('mousedown', press);
      btn.addEventListener('touchstart', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('touchend', release);
      btn.addEventListener('mouseleave', release);
    };

    bindTouchBtn('ctrlLeft', 'ArrowLeft', 'ArrowLeft');
    bindTouchBtn('ctrlRight', 'ArrowRight', 'ArrowRight');
    bindTouchBtn('ctrlJump', 'Space', 'Space');
    bindTouchBtn('ctrlAction', 'KeyF', 'KeyF');

    // In-game Chat Toggle
    const chatBtn = document.getElementById('inGameChatBtn');
    const chatDrawer = document.getElementById('inGameChatDrawer');
    const chatForm = document.getElementById('inGameChatForm');
    const chatInput = document.getElementById('inGameChatInput');

    if (chatBtn && chatDrawer) {
      chatBtn.addEventListener('click', () => {
        chatDrawer.classList.toggle('hidden');
        if (!chatDrawer.classList.contains('hidden') && chatInput) {
          chatInput.focus();
        }
        sounds.playClick();
      });
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (msg) {
          this.addInGameChatMessage(auth.currentUser?.id || 'Player', msg, auth.currentUser?.role === 'admin');
          chatInput.value = '';
        }
      });
    }
  }

  loadGame(gameInstance, gameTitle, instructionTitle, instructionText, specialLabel = 'Level') {
    this.stopGame();
    this.activeGame = gameInstance;
    this.score = 0;
    this.currentStage = 1;
    this.specialStat = 1;

    if (this.activeGame && this.activeGame.setStage) {
      try {
        this.activeGame.setStage(1);
      } catch (err) {}
    }

    // Hide Topbar and other views to give full screen immersion
    const topNav = document.getElementById('topNav');
    if (topNav) topNav.classList.add('hidden');

    document.getElementById('discoverView')?.classList.add('hidden');
    document.getElementById('shopView')?.classList.add('hidden');
    document.getElementById('adminView')?.classList.add('hidden');
    document.getElementById('gameView')?.classList.remove('hidden');

    // Update Title & HUD
    document.getElementById('inGameTitle').textContent = gameTitle;
    document.getElementById('inGameScoreVal').textContent = '0';
    document.getElementById('inGameSpecialLabel').textContent = `${specialLabel}:`;
    document.getElementById('inGameSpecialVal').textContent = '1';

    // Show Instruction Overlay
    const overlay = document.getElementById('gameInstructionOverlay');
    document.getElementById('instructionTitle').textContent = instructionTitle;
    document.getElementById('instructionText').textContent = instructionText;
    overlay.classList.remove('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');

    this.isRunning = true;
    this.startLoop();
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (!this.isRunning) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (this.ctx && this.canvas && this.activeGame) {
        try {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.activeGame.update(dt, this.keys, AdminState);
          this.activeGame.render(this.ctx, this.canvas.width, this.canvas.height, auth.currentUser);
        } catch (err) {
          console.error('Render/Update loop error:', err);
        }
      }

      // Live Playtime Tick
      gameStatsTracker.recordSessionTick();

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stopGame() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.activeGame && this.activeGame.cleanup) {
      try {
        this.activeGame.cleanup();
      } catch (err) {}
    }
    this.activeGame = null;

    // End playtime session and update Discover card badges
    gameStatsTracker.endPlaySession();

    // Restore top navigation
    const topNav = document.getElementById('topNav');
    if (topNav && auth.currentUser) topNav.classList.remove('hidden');

    document.getElementById('gameView')?.classList.add('hidden');
    document.getElementById('discoverView')?.classList.remove('hidden');
  }

  updateHUD(score, specialVal) {
    this.score = score;
    this.specialStat = specialVal;
    const scoreEl = document.getElementById('inGameScoreVal');
    const specialEl = document.getElementById('inGameSpecialVal');
    if (scoreEl) scoreEl.textContent = `${score}`;
    if (specialEl) specialEl.textContent = `${specialVal}`;
  }

  triggerGameOver(title, summary, isVictory = false) {
    const overlay = document.getElementById('gameOverOverlay');
    const titleEl = document.getElementById('gameOverTitle');
    const summaryEl = document.getElementById('gameOverSummary');
    const nextBtn = document.getElementById('nextStageBtn');

    if (isVictory) {
      sounds.playWin();
      const currentStage = this.currentStage || 1;
      const nextStage = currentStage + 1;
      titleEl.textContent = `⭐ LEVEL UP! (Stage ${currentStage} Complete)`;
      summaryEl.textContent = `${summary} Ready for Stage ${nextStage} (Higher Challenge & Speed)?`;
      if (nextBtn) {
        nextBtn.textContent = `🚀 Level Up to Stage ${nextStage}!`;
        nextBtn.classList.remove('hidden');
      }
    } else {
      sounds.playOof();
      titleEl.textContent = title;
      summaryEl.textContent = summary;
      if (nextBtn) {
        nextBtn.classList.add('hidden');
      }
    }

    overlay.classList.remove('hidden');
  }

  toggleJetpack() {
    AdminState.flying = !AdminState.flying;
    if (AdminState.flying) {
      if (!AdminState.spawnedItems.includes('jetpack')) {
        AdminState.spawnedItems.push('jetpack');
      }
      sounds.playRobux();
      this.addInGameChatMessage('SYSTEM', '🚀 Infinite Jetpack ACTIVATED! Hold Spacebar or W to fly.', true);
    } else {
      AdminState.spawnedItems = AdminState.spawnedItems.filter(item => item !== 'jetpack');
      sounds.playClick();
      this.addInGameChatMessage('SYSTEM', '🛑 Infinite Jetpack DEACTIVATED.', true);
    }
  }
}

export const gameEngine = new GameEngine();
