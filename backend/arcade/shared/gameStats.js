/* ==========================================================================
   MINI ROBLOX - REAL GAME STATS TRACKER
   Tracks play counts (clicks on play/icon) and daily / total playtime in real-time
   ========================================================================== */

export class GameStatsTracker {
  constructor() {
    this.storageKey = 'mini_roblox_game_stats_v1';
    this.activeSession = null;
  }

  getTodayDateKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAllStats() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveAllStats(stats) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stats));
    } catch (e) {}
  }

  getGameStats(gameKey) {
    const stats = this.getAllStats();
    const g = stats[gameKey] || { totalPlays: 0, totalSeconds: 0, daily: {} };
    const todayKey = this.getTodayDateKey();
    const dailyToday = g.daily?.[todayKey] || { plays: 0, seconds: 0 };
    return {
      totalPlays: g.totalPlays || 0,
      totalSeconds: g.totalSeconds || 0,
      todayPlays: dailyToday.plays || 0,
      todaySeconds: dailyToday.seconds || 0
    };
  }

  recordGameLaunch(gameKey) {
    if (!gameKey) return;
    const stats = this.getAllStats();
    if (!stats[gameKey]) {
      stats[gameKey] = { totalPlays: 0, totalSeconds: 0, daily: {} };
    }
    const todayKey = this.getTodayDateKey();
    if (!stats[gameKey].daily) stats[gameKey].daily = {};
    if (!stats[gameKey].daily[todayKey]) stats[gameKey].daily[todayKey] = { plays: 0, seconds: 0 };

    stats[gameKey].totalPlays = (stats[gameKey].totalPlays || 0) + 1;
    stats[gameKey].daily[todayKey].plays = (stats[gameKey].daily[todayKey].plays || 0) + 1;

    this.saveAllStats(stats);
    this.startPlaySession(gameKey);
    this.renderAllCards();
  }

  startPlaySession(gameKey) {
    this.endPlaySession();
    this.activeSession = {
      gameKey,
      startTime: Date.now(),
      lastTick: Date.now()
    };
  }

  recordSessionTick() {
    if (!this.activeSession) return;
    const now = Date.now();
    const elapsedSec = Math.floor((now - this.activeSession.lastTick) / 1000);
    if (elapsedSec >= 1) {
      const { gameKey } = this.activeSession;
      this.activeSession.lastTick = now;

      const stats = this.getAllStats();
      if (!stats[gameKey]) stats[gameKey] = { totalPlays: 1, totalSeconds: 0, daily: {} };
      if (!stats[gameKey].daily) stats[gameKey].daily = {};
      const todayKey = this.getTodayDateKey();
      if (!stats[gameKey].daily[todayKey]) stats[gameKey].daily[todayKey] = { plays: 1, seconds: 0 };

      stats[gameKey].totalSeconds = (stats[gameKey].totalSeconds || 0) + elapsedSec;
      stats[gameKey].daily[todayKey].seconds = (stats[gameKey].daily[todayKey].seconds || 0) + elapsedSec;
      this.saveAllStats(stats);
    }
  }

  endPlaySession() {
    if (this.activeSession) {
      this.recordSessionTick();
      this.activeSession = null;
      this.renderAllCards();
    }
  }

  formatPlayTime(seconds) {
    if (!seconds || seconds <= 0) return '0m today';
    if (seconds < 60) return `${seconds}s today`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m today`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m today`;
  }

  formatPlays(plays) {
    if (!plays || plays <= 0) return '0 plays';
    return `${plays} play${plays === 1 ? '' : 's'}`;
  }

  renderAllCards() {
    if (typeof document === 'undefined') return;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
      let gameKey = card.dataset.game;
      if (!gameKey) {
        const href = card.getAttribute('href');
        if (href?.includes('uno')) gameKey = 'uno';
        else if (href?.includes('chess')) gameKey = 'chess';
        else if (href?.includes('voxelcraft')) gameKey = 'voxelcraft';
      }
      if (!gameKey) return;

      const data = this.getGameStats(gameKey);
      const timeEl = card.querySelector('.game-playtime');
      const playsEl = card.querySelector('.game-plays');

      if (timeEl) {
        timeEl.textContent = `⏱️ ${this.formatPlayTime(data.todaySeconds)}`;
        timeEl.title = `Today's Playtime: ${this.formatPlayTime(data.todaySeconds)} (Total: ${this.formatPlayTime(data.totalSeconds).replace(' today', '')})`;
      }
      if (playsEl) {
        playsEl.textContent = `▶️ ${this.formatPlays(data.totalPlays)}`;
        playsEl.title = `Total Times Played: ${data.totalPlays} (Today: ${data.todayPlays})`;
      }
    });
  }
}

export const gameStatsTracker = new GameStatsTracker();
