/* ==========================================================================
   MINI ROBLOX - GAME 24: UNO CARD BATTLE (Roblox Edition)
   Features:
   - Full authentic 108-card deck + 2% chaotic drop rate (🔥 +99 🔥 & ⚡ +110 ⚡)
   - 4-Player Match: You vs Noob, Guest 666, and Bacon Hair
   - Turn Pointer Arrow: Dynamically points at whichever player's turn it is
   - Guidance / Hint Arrow: Points to playable cards or to Draw Pile when card is needed
   - Safe Discard Pile Reshuffling for massive draws
   - Rapid machine-gun cascade dealing with screen shake
   - Interactive Wild Color Selector, UNO callout mechanics & Web Audio SFX
   ========================================================================== */

import { gameEngine } from '../shared/gameEngine.js';
import { sounds } from '../shared/audio.js';
import { auth } from '../../../backend/arcade/shared/guestPlayer.js';
import { unoClient } from '../../../interface/arcade/uno/unoOffline.js';

export class Card {
  constructor(color, value, id = Math.random().toString(36).substring(2, 9)) {
    this.color = color; // 'red', 'yellow', 'green', 'blue', 'wild'
    this.value = value; // '0'-'9', 'Skip', 'Reverse', 'Draw Two', 'Wild', 'Draw Four', '🔥 DRAW +99 🔥', '⚡ MAXIMUM OVERLOAD +110 ⚡'
    this.id = id;
    this.x = 480;
    this.y = 270;
    this.targetX = 480;
    this.targetY = 270;
    this.angle = 0;
    this.targetAngle = 0;
    this.scale = 1.0;
    this.targetScale = 1.0;
    this.faceUp = false;
    this.isPlayable = false;
  }

  isWild() {
    return this.color === 'wild' || this.color === 'Wild' || this.value.includes('+99') || this.value.includes('+110');
  }

  isChaotic() {
    return this.value.includes('+99') || this.value.includes('+110');
  }

  matches(topCard, chosenColor) {
    if (this.isWild()) return true;
    const activeColor = chosenColor || topCard.color;
    if (this.color.toLowerCase() === activeColor.toLowerCase()) return true;
    if (this.value === topCard.value) return true;
    return false;
  }

  toString() {
    if (this.isWild()) return `[${this.value}]`;
    return `[${this.color.toUpperCase()} ${this.value}]`;
  }
}

export class UnoGame {
  constructor() {
    this.audioCtx = null;
    this.reset();
  }

  initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSfx(type) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      if (type === 'cardPlay') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'cardDraw') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'unoCall') {
        // Party horn fanfare
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.25, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.2);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.22);
        });
      } else if (type === 'chaos') {
        // Deep bass explosion rumble
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'turnAlert') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    } catch (e) {
      // Audio fallback
    }
  }

  reset() {
    this.score = 0;
    this.round = 1;
    this.isGameOver = false;
    this.winner = null;

    // Deck & Piles
    this.drawPile = [];
    this.discardPile = [];
    this.chosenColor = null; // When Wild is played: 'red', 'yellow', 'green', 'blue'

    // Turn Management
    this.players = [
      { id: 0, name: 'You', isBot: false, hand: [], calledUno: false, color: '#3B82F6', avatar: '😎' },
      { id: 1, name: 'Noob', isBot: true, hand: [], calledUno: false, color: '#10B981', avatar: '🐣', botDelay: 0.8 },
      { id: 2, name: 'Guest 666', isBot: true, hand: [], calledUno: false, color: '#EF4444', avatar: '👹', botDelay: 0.9 },
      { id: 3, name: 'Bacon Hair', isBot: true, hand: [], calledUno: false, color: '#F59E0B', avatar: '🥓', botDelay: 0.85 }
    ];

    this.currentTurn = 0; // 0: You, 1: Noob, 2: Guest 666, 3: Bacon Hair
    this.direction = 1; // 1: Clockwise (0->1->2->3), -1: Counter-Clockwise (0->3->2->1)
    this.turnTimer = 0;
    this.state = 'DEALING'; // 'DEALING', 'WAITING_INPUT', 'BOT_THINKING', 'SELECTING_COLOR', 'CASCADE_DRAW', 'ROUND_OVER'

    // Special mechanics
    this.fastMode = false;
    this.stackingEnabled = true; // House rule: Stack +2 and +4
    this.pendingDrawPenalty = 0; // Stacked draw penalty (+2, +4, +99, etc.)
    this.screenShake = 0;
    this.announcement = 'Welcome to UNO Card Battle!';
    this.announcementTimer = 3.0;
    this.particles = [];

    // Multiplayer Networking
    this.isMultiplayer = false;
    this.roomId = null;
    this.localPlayerId = null;
    this.isHost = false;
    this.pendingCardPlay = null;

    // Interactive Guidance & Pointer Arrows
    this.gameTime = 0;
    this.hoveredCardIdx = -1;
    this.hoveredColorChoice = null;
    this.suggestedCardIdx = -1;
    this.unoButtonBounds = { x: 800, y: 440, w: 120, h: 60 };
    this.drawDeckBounds = { x: 380, y: 210, w: 90, h: 130 };
    this.colorWheelBounds = { x: 480, y: 270, radius: 100 };

    // Rapid Cascade Dealing Queue (for +99 / +110 chaos cards)
    this.cascadeQueue = {
      active: false,
      targetPlayerId: -1,
      totalCount: 0,
      currentCount: 0,
      timer: 0,
      sourceX: 420,
      sourceY: 270
    };

    // Card dimensions
    this.cardW = 75;
    this.cardH = 110;

    // Build and deal deck
    this.initializeStandardDeck();
    this.dealInitialHands();
  }

  start() {
    this.initAudio();
    if (auth && auth.currentUser && auth.currentUser.username) {
      this.players[0].name = auth.currentUser.username;
    }
  }

  enableMultiplayer(roomId, playerId, isHost = false) {
    this.isMultiplayer = true;
    this.roomId = roomId;
    this.localPlayerId = playerId;
    this.isHost = isHost;
  }

  applyServerState(serverState) {
    if (!serverState) return;
    this.state = serverState.status === 'PLAYING' ? (serverState.currentTurnPlayerId === this.localPlayerId ? 'WAITING_INPUT' : 'BOT_THINKING') : serverState.status;
    this.currentTurn = serverState.currentTurn;
    this.direction = serverState.direction;
    this.chosenColor = serverState.activeColor;
    if (serverState.announcement) {
      this.announcement = serverState.announcement;
      this.announcementTimer = 3.0;
    }

    // Top discard card
    if (serverState.topDiscard) {
      const top = new Card(serverState.topDiscard.color, serverState.topDiscard.value, serverState.topDiscard.id);
      top.faceUp = true;
      this.discardPile = [top];
    }

    if (serverState.drawPileCount !== undefined) {
      this.drawPile.length = serverState.drawPileCount;
    }

    // Players sync
    if (serverState.players && serverState.players.length > 0) {
      // Find my seat index
      const mySeat = serverState.players.find(p => p.id === this.localPlayerId)?.seat || 0;

      for (let i = 0; i < serverState.players.length; i++) {
        const sp = serverState.players[i];
        // Relative seat index so local player is always at the bottom (seat 0)
        const relIdx = (sp.seat - mySeat + 4) % 4;

        if (!this.players[relIdx]) {
          this.players[relIdx] = { id: sp.id, name: sp.name, avatar: sp.avatar, color: sp.color, hand: [], calledUno: false, isBot: sp.isBot };
        }
        this.players[relIdx].id = sp.id;
        this.players[relIdx].name = sp.name;
        this.players[relIdx].avatar = sp.avatar;
        this.players[relIdx].color = sp.color;
        this.players[relIdx].calledUno = sp.calledUno;
        this.players[relIdx].isBot = sp.isBot;

        if (sp.isSelf && sp.hand) {
          this.players[0].hand = sp.hand.map(c => {
            const card = new Card(c.color, c.value, c.id);
            card.faceUp = true;
            card.isPlayable = c.isPlayable;
            return card;
          });
        } else if (!sp.isSelf) {
          this.players[relIdx].hand = Array(sp.cardCount || 0).fill(null);
        }
      }
      // Update relative currentTurn
      this.currentTurn = (serverState.currentTurn - mySeat + 4) % 4;
    }

    if (serverState.winner) {
      this.isGameOver = true;
      this.winner = serverState.winner;
    }

    this.updatePlayableStatus();
  }

  async sendMultiplayerAction(action, data = {}) {
    if (!this.roomId || !this.localPlayerId) return;
    try {
      await unoClient.post('action', {
        roomId: this.roomId,
        playerId: this.localPlayerId,
        action,
        ...data
      });
    } catch (e) {
      console.error('Multiplayer action failed:', e);
    }
  }

  // 1. Create standard 108-card deck
  initializeStandardDeck() {
    this.drawPile = [];
    this.discardPile = [];
    const colors = ['red', 'yellow', 'green', 'blue'];

    for (const color of colors) {
      // One '0' card per color
      this.drawPile.push(new Card(color, '0'));
      // Two of each 1-9 per color
      for (let i = 1; i <= 9; i++) {
        this.drawPile.push(new Card(color, String(i)));
        this.drawPile.push(new Card(color, String(i)));
      }
      // Action cards: 2 Skips, 2 Reverses, 2 Draw Twos per color
      for (let i = 0; i < 2; i++) {
        this.drawPile.push(new Card(color, 'Skip'));
        this.drawPile.push(new Card(color, 'Reverse'));
        this.drawPile.push(new Card(color, 'Draw Two'));
      }
    }

    // 4 Wilds and 4 Wild Draw Fours
    for (let i = 0; i < 4; i++) {
      this.drawPile.push(new Card('wild', 'Wild'));
      this.drawPile.push(new Card('wild', 'Draw Four'));
    }

    this.shuffle(this.drawPile);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // 2. Automated safety reshuffle (as per Java design)
  reshuffleDiscardPile() {
    if (this.discardPile.length <= 1) {
      // In extreme case where all cards are held in players' hands, generate fresh cards
      const colors = ['red', 'yellow', 'green', 'blue'];
      for (let i = 0; i < 16; i++) {
        const c = colors[Math.floor(Math.random() * colors.length)];
        const v = String(Math.floor(Math.random() * 10));
        this.drawPile.push(new Card(c, v));
      }
      this.shuffle(this.drawPile);
      return;
    }

    // Save top card of discard pile
    const topCard = this.discardPile.pop();

    // Move remainder to draw pile and shuffle
    while (this.discardPile.length > 0) {
      const c = this.discardPile.pop();
      c.faceUp = false;
      this.drawPile.push(c);
    }
    this.shuffle(this.drawPile);

    // Put top card back on discard
    this.discardPile.push(topCard);
  }

  // 3. Core drawing mechanic with 2% chaotic card chance
  drawCard(player) {
    // Roll 1-100 for chaotic chance
    const chance = Math.floor(Math.random() * 100) + 1;

    let drawn = null;
    if (chance === 1) {
      drawn = new Card('wild', '🔥 DRAW +99 🔥');
    } else if (chance === 2) {
      drawn = new Card('wild', '⚡ MAXIMUM OVERLOAD +110 ⚡');
    } else {
      if (this.drawPile.length === 0) {
        this.reshuffleDiscardPile();
      }
      if (this.drawPile.length > 0) {
        drawn = this.drawPile.pop();
      } else {
        drawn = new Card('wild', 'Wild');
      }
    }

    drawn.faceUp = (player.id === 0);
    drawn.x = this.drawDeckBounds.x + 45;
    drawn.y = this.drawDeckBounds.y + 65;
    return drawn;
  }

  dealInitialHands() {
    for (let i = 0; i < 7; i++) {
      for (const p of this.players) {
        p.hand.push(this.drawCard(p));
      }
    }

    // Flip first card to discard pile (cannot start on Wild Draw 4 or Chaotic card)
    let startCard = this.drawPile.pop();
    while (startCard.isWild() || startCard.value === 'Skip' || startCard.value === 'Draw Two') {
      this.drawPile.unshift(startCard);
      this.shuffle(this.drawPile);
      startCard = this.drawPile.pop();
    }
    startCard.faceUp = true;
    startCard.x = 540;
    startCard.y = 270;
    this.discardPile.push(startCard);
    this.chosenColor = null;

    this.state = 'WAITING_INPUT';
    this.currentTurn = 0;
    this.updatePlayableStatus();
    this.playSfx('turnAlert');
  }

  getTopDiscard() {
    return this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;
  }

  getActiveColor() {
    if (this.chosenColor) return this.chosenColor;
    const top = this.getTopDiscard();
    return top ? top.color : 'red';
  }

  updatePlayableStatus() {
    const top = this.getTopDiscard();
    const activeColor = this.getActiveColor();

    let hasPlayable = false;
    this.suggestedCardIdx = -1;

    for (let i = 0; i < this.players[0].hand.length; i++) {
      const card = this.players[0].hand[i];
      card.isPlayable = (this.currentTurn === 0 && this.state === 'WAITING_INPUT') ? card.matches(top, activeColor) : false;
      if (card.isPlayable) {
        hasPlayable = true;
        // Prioritize non-wild matching cards for suggestion
        if (this.suggestedCardIdx === -1 || (!card.isWild() && this.players[0].hand[this.suggestedCardIdx].isWild())) {
          this.suggestedCardIdx = i;
        }
      }
    }

    // Reset Uno call status if player has more than 1 card
    if (this.players[0].hand.length > 1) {
      this.players[0].calledUno = false;
    }
  }

  // Card Play Resolution
  playCard(playerId, cardIdx) {
    const player = this.players[playerId];
    const card = player.hand.splice(cardIdx, 1)[0];
    card.faceUp = true;
    card.targetX = 540 + (Math.random() * 16 - 8);
    card.targetY = 270 + (Math.random() * 16 - 8);
    card.targetAngle = (Math.random() * 0.4 - 0.2);
    this.discardPile.push(card);

    this.playSfx('cardPlay');
    this.spawnCardParticles(card.targetX, card.targetY, this.getColorHex(card.color));

    // Reset Uno state check
    if (player.hand.length === 1 && !player.calledUno) {
      if (player.isBot) {
        // Bots call Uno 85% of time automatically
        if (Math.random() < 0.85) {
          player.calledUno = true;
          this.showAnnouncement(`🔊 ${player.name} shouted "UNO!"`, 2.5);
          this.playSfx('unoCall');
        } else {
          this.showAnnouncement(`⚠️ ${player.name} has 1 card left and didn't call UNO!`, 3.0);
        }
      } else {
        // Player has 1 card left
        this.showAnnouncement(`⚠️ SHOUT UNO QUICKLY! Press the UNO button!`, 3.0);
      }
    }

    // Win condition check
    if (player.hand.length === 0) {
      this.handleVictory(player);
      return;
    }

    // Handle Card Actions
    if (card.isChaotic()) {
      this.handleChaoticPlay(player, card);
    } else if (card.value === 'Draw Four') {
      this.handleDrawFourPlay(player);
    } else if (card.value === 'Wild') {
      this.handleWildPlay(player);
    } else if (card.value === 'Draw Two') {
      this.handleDrawTwoPlay(player);
    } else if (card.value === 'Reverse') {
      this.handleReversePlay(player);
    } else if (card.value === 'Skip') {
      this.handleSkipPlay(player);
    } else {
      // Normal number card
      this.chosenColor = null;
      this.advanceTurn();
    }
  }

  handleChaoticPlay(player, card) {
    this.screenShake = 1.2;
    this.playSfx('chaos');

    const count = card.value.includes('+99') ? 99 : 110;
    const title = card.value.includes('+99') ? '🔥 DRAW +99 🔥' : '⚡ MAXIMUM OVERLOAD +110 ⚡';

    this.showAnnouncement(`💥 ${player.name} PLAYED ${title}!`, 4.0);

    // Pick color
    if (player.isBot) {
      this.chosenColor = this.getBotBestColor(player);
      this.applyPendingChaosDraw(count);
    } else {
      this.state = 'SELECTING_COLOR';
      this.pendingDrawPenalty = count;
    }
  }

  applyPendingChaosDraw(count) {
    const nextPlayer = this.getNextPlayer();
    this.showAnnouncement(`🚨 ${nextPlayer.name} IS DRAWING ${count} CARDS!`, 3.5);

    // Start rapid cascade dealing
    this.cascadeQueue = {
      active: true,
      targetPlayerId: nextPlayer.id,
      totalCount: count,
      currentCount: 0,
      timer: 0,
      sourceX: this.drawDeckBounds.x + 45,
      sourceY: this.drawDeckBounds.y + 65
    };
    this.state = 'CASCADE_DRAW';
  }

  handleDrawFourPlay(player) {
    this.playSfx('chaos');
    this.showAnnouncement(`🌈 ${player.name} played Wild Draw 4!`, 2.5);

    if (player.isBot) {
      this.chosenColor = this.getBotBestColor(player);
      const nextPlayer = this.getNextPlayer();
      this.executeDrawCards(nextPlayer, 4);
      this.showAnnouncement(`💥 ${nextPlayer.name} drew 4 cards and lost turn!`, 2.0);
      this.advanceTurn(2); // Skip victim's turn
    } else {
      this.state = 'SELECTING_COLOR';
      this.pendingDrawPenalty = 4;
    }
  }

  handleWildPlay(player) {
    this.showAnnouncement(`🌈 ${player.name} played Wild!`, 2.0);
    if (player.isBot) {
      this.chosenColor = this.getBotBestColor(player);
      this.advanceTurn();
    } else {
      this.state = 'SELECTING_COLOR';
      this.pendingDrawPenalty = 0;
    }
  }

  handleDrawTwoPlay(player) {
    const nextPlayer = this.getNextPlayer();
    this.executeDrawCards(nextPlayer, 2);
    this.chosenColor = null;
    this.showAnnouncement(`📦 ${nextPlayer.name} drew 2 cards and was skipped!`, 2.0);
    this.advanceTurn(2); // Skip victim's turn
  }

  handleReversePlay(player) {
    this.direction *= -1;
    this.chosenColor = null;
    this.showAnnouncement(`🔄 REVERSE! Turn order changed!`, 2.0);
    this.playSfx('unoCall');
    this.advanceTurn();
  }

  handleSkipPlay(player) {
    const skipped = this.getNextPlayer();
    this.chosenColor = null;
    this.showAnnouncement(`🚫 SKIP! ${skipped.name} skipped!`, 2.0);
    this.advanceTurn(2);
  }

  executeDrawCards(player, count) {
    for (let i = 0; i < count; i++) {
      player.hand.push(this.drawCard(player));
    }
    this.playSfx('cardDraw');
  }

  getNextPlayer(step = 1) {
    const count = this.players.length;
    const nextIdx = (this.currentTurn + this.direction * step + count * 10) % count;
    return this.players[nextIdx];
  }

  advanceTurn(step = 1) {
    this.currentTurn = (this.currentTurn + this.direction * step + this.players.length * 10) % this.players.length;
    this.turnTimer = 0;

    // Check if player didn't call Uno
    const prevTurn = (this.currentTurn - this.direction * step + this.players.length * 10) % this.players.length;
    const prevPlayer = this.players[prevTurn];
    if (prevPlayer.hand.length === 1 && !prevPlayer.calledUno) {
      this.showAnnouncement(`🚨 ${prevPlayer.name} caught with 1 card! +2 Penalty!`, 3.0);
      this.executeDrawCards(prevPlayer, 2);
    }

    if (this.currentTurn === 0) {
      this.state = 'WAITING_INPUT';
      this.updatePlayableStatus();
      this.playSfx('turnAlert');
    } else {
      this.state = 'BOT_THINKING';
    }
  }

  getBotBestColor(bot) {
    const counts = { red: 0, yellow: 0, green: 0, blue: 0 };
    for (const card of bot.hand) {
      if (counts[card.color] !== undefined) counts[card.color]++;
    }
    let best = 'red';
    let max = -1;
    for (const [c, cnt] of Object.entries(counts)) {
      if (cnt > max) {
        max = cnt;
        best = c;
      }
    }
    return best;
  }

  handleVictory(winner) {
    this.state = 'ROUND_OVER';
    this.isGameOver = true;
    this.winner = winner;

    if (winner.id === 0) {
      this.score += 500;
      if (gameEngine && gameEngine.updateHUD) {
        gameEngine.updateHUD(this.score, this.players[0].hand.length);
      }
      if (auth && auth.currentUser) {
        auth.currentUser.robux = (auth.currentUser.robux || 0) + 500;
        auth.saveUsers();
      }
      sounds.playRobux();
      this.showAnnouncement(`🏆 VICTORY! YOU WON THE UNO BATTLE! (+500 Robux)`, 10.0);
    } else {
      sounds.playOof();
      this.showAnnouncement(`💀 ${winner.name} won the UNO match! Better luck next time!`, 10.0);
    }
  }

  showAnnouncement(msg, duration = 3.0) {
    this.announcement = msg;
    this.announcementTimer = duration;
  }

  // Interactive Clicks
  onClick(clickX, clickY) {
    if (this.isGameOver) {
      this.reset();
      return;
    }

    // Toggle Fast Mode Button Click (850, 8, 98, 76)
    if (clickX >= 845 && clickX <= 955 && clickY >= 6 && clickY <= 88) {
      this.fastMode = !this.fastMode;
      this.playSfx('cardPlay');
      this.showAnnouncement(this.fastMode ? '⚡ FAST MODE ENABLED!' : '🐢 NORMAL SPEED RESTORED', 1.5);
      return;
    }

    // 1. Color Selector Modal active
    if (this.state === 'SELECTING_COLOR') {
      const selected = this.checkColorWheelClick(clickX, clickY);
      if (selected) {
        this.chosenColor = selected;
        this.playSfx('cardPlay');
        this.showAnnouncement(`Selected color: ${selected.toUpperCase()}!`, 2.0);

        if (this.isMultiplayer && this.pendingCardPlay) {
          this.sendMultiplayerAction('play', { cardId: this.pendingCardPlay.id, chosenColor: selected });
          this.state = 'WAITING_INPUT';
          this.pendingCardPlay = null;
          return;
        }

        if (this.pendingDrawPenalty > 0) {
          const nextPlayer = this.getNextPlayer();
          if (this.pendingDrawPenalty >= 99) {
            this.applyPendingChaosDraw(this.pendingDrawPenalty);
          } else {
            this.executeDrawCards(nextPlayer, this.pendingDrawPenalty);
            this.advanceTurn(2);
          }
          this.pendingDrawPenalty = 0;
        } else {
          this.advanceTurn();
        }
      }
      return;
    }

    // 2. "UNO!" Button Click
    const b = this.unoButtonBounds;
    if (clickX >= b.x && clickX <= b.x + b.w && clickY >= b.y && clickY <= b.y + b.h) {
      if (this.isMultiplayer) {
        this.sendMultiplayerAction('uno');
        this.playSfx('unoCall');
        this.spawnConfetti(b.x + b.w / 2, b.y + b.h / 2);
        return;
      }
      if (this.players[0].hand.length <= 2) {
        this.players[0].calledUno = true;
        this.playSfx('unoCall');
        this.showAnnouncement(`🎉 YOU SHOUTED "UNO!" 🎉`, 3.0);
        this.spawnConfetti(b.x + b.w / 2, b.y + b.h / 2);
      } else {
        // False Uno call penalty!
        this.playSfx('chaos');
        this.showAnnouncement(`❌ You can only shout UNO with 1 or 2 cards! +2 Penalty!`, 3.0);
        this.executeDrawCards(this.players[0], 2);
      }
      return;
    }

    // 3. Draw Deck Click
    const d = this.drawDeckBounds;
    if (clickX >= d.x && clickX <= d.x + d.w && clickY >= d.y && clickY <= d.y + d.h) {
      if (this.currentTurn === 0 && this.state === 'WAITING_INPUT') {
        if (this.isMultiplayer) {
          this.sendMultiplayerAction('draw');
          this.playSfx('cardDraw');
          return;
        }
        const drawn = this.drawCard(this.players[0]);
        this.players[0].hand.push(drawn);
        this.playSfx('cardDraw');
        this.showAnnouncement(`You drew ${drawn.toString()}!`, 2.0);

        // Check if drawn card is playable
        const top = this.getTopDiscard();
        if (drawn.matches(top, this.getActiveColor())) {
          this.showAnnouncement(`Card is playable! Click it or pass.`, 2.5);
        } else {
          // Auto advance turn
          this.advanceTurn();
        }
        this.updatePlayableStatus();
      }
      return;
    }

    // 4. Click Player Hand Cards
    if (this.currentTurn === 0 && this.state === 'WAITING_INPUT') {
      const hand = this.players[0].hand;
      const count = hand.length;
      const startX = 480 - ((count - 1) * 36) / 2;

      // Click reverse loop so topmost card in fan gets priority
      for (let i = count - 1; i >= 0; i--) {
        const cx = count > 14 ? 120 + i * (720 / count) : startX + i * 40;
        const cy = 430 - (i === this.hoveredCardIdx || hand[i].isPlayable ? 18 : 0);

        if (clickX >= cx - this.cardW / 2 && clickX <= cx + this.cardW / 2 &&
            clickY >= cy - this.cardH / 2 && clickY <= cy + this.cardH / 2) {
          if (hand[i].isPlayable) {
            if (this.isMultiplayer) {
              if (hand[i].isWild()) {
                this.pendingCardPlay = hand[i];
                this.state = 'SELECTING_COLOR';
              } else {
                this.sendMultiplayerAction('play', { cardId: hand[i].id });
              }
            } else {
              this.playCard(0, i);
            }
          } else {
            this.playSfx('chaos');
            this.showAnnouncement(`❌ Cannot play ${hand[i].toString()} on ${this.getTopDiscard().toString()}!`, 2.0);
          }
          break;
        }
      }
    }
  }

  onMouseMove(moveX, moveY) {
    if (this.state === 'SELECTING_COLOR') {
      this.hoveredColorChoice = this.checkColorWheelClick(moveX, moveY);
      return;
    }

    // Hover cards
    this.hoveredCardIdx = -1;
    if (this.currentTurn === 0 && this.state === 'WAITING_INPUT') {
      const hand = this.players[0].hand;
      const count = hand.length;
      const startX = 480 - ((count - 1) * 36) / 2;

      for (let i = count - 1; i >= 0; i--) {
        const cx = count > 14 ? 120 + i * (720 / count) : startX + i * 40;
        const cy = 430;
        if (moveX >= cx - this.cardW / 2 && moveX <= cx + this.cardW / 2 &&
            moveY >= cy - this.cardH / 2 && moveY <= cy + this.cardH / 2) {
          this.hoveredCardIdx = i;
          break;
        }
      }
    }
  }

  onKeyDown(e) {
    if (e.code === 'KeyU') {
      // Shout UNO
      this.onClick(this.unoButtonBounds.x + 10, this.unoButtonBounds.y + 10);
    } else if (e.code === 'KeyD' || e.code === 'Space') {
      // Draw card
      this.onClick(this.drawDeckBounds.x + 10, this.drawDeckBounds.y + 10);
    } else if (this.state === 'SELECTING_COLOR') {
      if (e.code === 'KeyR') this.selectColor('red');
      if (e.code === 'KeyY') this.selectColor('yellow');
      if (e.code === 'KeyG') this.selectColor('green');
      if (e.code === 'KeyB') this.selectColor('blue');
    } else if (e.code.startsWith('Digit')) {
      const digit = parseInt(e.code.replace('Digit', ''), 10);
      if (digit >= 1 && digit <= this.players[0].hand.length) {
        const idx = digit - 1;
        if (this.players[0].hand[idx].isPlayable) {
          this.playCard(0, idx);
        }
      }
    }
  }

  selectColor(color) {
    this.chosenColor = color;
    this.playSfx('cardPlay');
    this.showAnnouncement(`Color chosen: ${color.toUpperCase()}!`, 2.0);

    if (this.pendingDrawPenalty > 0) {
      const nextPlayer = this.getNextPlayer();
      if (this.pendingDrawPenalty >= 99) {
        this.applyPendingChaosDraw(this.pendingDrawPenalty);
      } else {
        this.executeDrawCards(nextPlayer, this.pendingDrawPenalty);
        this.advanceTurn(2);
      }
      this.pendingDrawPenalty = 0;
    } else {
      this.advanceTurn();
    }
  }

  checkColorWheelClick(x, y) {
    const cx = this.colorWheelBounds.x;
    const cy = this.colorWheelBounds.y;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist > this.colorWheelBounds.radius) return null;

    if (x >= cx && y < cy) return 'red';
    if (x >= cx && y >= cy) return 'yellow';
    if (x < cx && y >= cy) return 'green';
    if (x < cx && y < cy) return 'blue';
    return null;
  }

  // Update Game Loop
  update(dt) {
    this.gameTime += dt;

    if (this.announcementTimer > 0) {
      this.announcementTimer -= dt;
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2.0);
    }

    // Cascade Draw Animation (+99 / +110 cards)
    if (this.state === 'CASCADE_DRAW' && this.cascadeQueue.active) {
      this.cascadeQueue.timer += dt;
      // Deal 5 cards every 0.05 seconds for high-speed machine gun effect
      if (this.cascadeQueue.timer >= 0.04) {
        this.cascadeQueue.timer = 0;
        const target = this.players[this.cascadeQueue.targetPlayerId];
        const batch = Math.min(6, this.cascadeQueue.totalCount - this.cascadeQueue.currentCount);

        for (let b = 0; b < batch; b++) {
          target.hand.push(this.drawCard(target));
          this.cascadeQueue.currentCount++;
        }
        this.playSfx('cardDraw');

        // Target position coordinates
        const targetPos = this.getPlayerCenterPos(target.id);
        this.spawnCardParticles(targetPos.x, targetPos.y, '#EF4444');

        if (this.cascadeQueue.currentCount >= this.cascadeQueue.totalCount) {
          this.cascadeQueue.active = false;
          this.showAnnouncement(`💥 Done! ${target.name} drew ${this.cascadeQueue.totalCount} cards!`, 2.5);
          this.advanceTurn(2); // Skip victim's turn
        }
      }
      return;
    }

    // Bot AI Turn (Only in local offline play)
    if (!this.isMultiplayer && this.state === 'BOT_THINKING') {
      this.turnTimer += dt;
      const bot = this.players[this.currentTurn];
      const waitTime = this.fastMode ? 0.3 : (bot.botDelay || 0.8);

      if (this.turnTimer >= waitTime) {
        this.turnTimer = 0;
        this.executeBotTurn(bot);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  executeBotTurn(bot) {
    const top = this.getTopDiscard();
    const activeColor = this.getActiveColor();

    // Find playable cards
    const playableIndices = [];
    for (let i = 0; i < bot.hand.length; i++) {
      if (bot.hand[i].matches(top, activeColor)) {
        playableIndices.push(i);
      }
    }

    if (playableIndices.length > 0) {
      // Prioritize chaotic cards, then action cards, then normal cards
      playableIndices.sort((a, b) => {
        const ca = bot.hand[a];
        const cb = bot.hand[b];
        if (ca.isChaotic()) return -1;
        if (cb.isChaotic()) return 1;
        if (ca.value === 'Draw Four') return -1;
        if (cb.value === 'Draw Four') return 1;
        return 0;
      });

      const chosenIdx = playableIndices[0];
      this.playCard(bot.id, chosenIdx);
    } else {
      // Bot must draw
      const drawn = this.drawCard(bot);
      bot.hand.push(drawn);
      this.playSfx('cardDraw');
      this.showAnnouncement(`${bot.name} drew a card.`, 1.5);

      // Play drawn card immediately if valid
      if (drawn.matches(top, activeColor)) {
        this.playCard(bot.id, bot.hand.length - 1);
      } else {
        this.advanceTurn();
      }
    }
  }

  getPlayerCenterPos(id) {
    if (id === 0) return { x: 480, y: 460 };
    if (id === 1) return { x: 90, y: 270 };
    if (id === 2) return { x: 480, y: 70 };
    return { x: 870, y: 270 };
  }

  // Visual Particles
  spawnCardParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life: 0.5 + Math.random() * 0.3
      });
    }
  }

  spawnConfetti(x, y) {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        life: 1.0 + Math.random() * 0.6
      });
    }
  }

  // ========================================================================
  // RENDER PIPELINE (960 x 540)
  // ========================================================================
  render(ctx, width, height, user) {
    this.draw(ctx);
  }

  draw(ctx) {
    ctx.save();

    // Screen Shake effect
    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * 16 * this.screenShake;
      const oy = (Math.random() - 0.5) * 16 * this.screenShake;
      ctx.translate(ox, oy);
    }

    // 1. Table Background (Rich Roblox Green / Felt Arena)
    this.drawTable(ctx);

    // 2. Center Ring & Rotation Arrow
    this.drawCenterRing(ctx);

    // 3. Draw Pile & Discard Pile
    this.drawPiles(ctx);

    // 4. Opponent Bots & Player Hands
    this.drawPlayers(ctx);

    // 5. Turn Pointer Arrow (Points directly at the active player)
    this.drawTurnPointerArrow(ctx);

    // 6. Card Guidance / Hint Arrow (Points at playable card or draw pile)
    this.drawGuidanceArrow(ctx);

    // 7. Interactive UNO! Button
    this.drawUnoButton(ctx);

    // 8. Color Selection Overlay
    if (this.state === 'SELECTING_COLOR') {
      this.drawColorWheel(ctx);
    }

    // 9. Cascade Draw Overlay Counter (+99 / +110 machine-gun count)
    if (this.state === 'CASCADE_DRAW' && this.cascadeQueue.active) {
      this.drawCascadeCounter(ctx);
    }

    // 10. Announcements & HUD
    this.drawHUD(ctx);

    // 11. Particles
    this.drawParticles(ctx);

    // 12. Game Over Modal
    if (this.isGameOver) {
      this.drawGameOver(ctx);
    }

    ctx.restore();
  }

  drawTable(ctx) {
    // Outer Border
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 960, 540);

    // Felt Arena Mat
    const matGrad = ctx.createRadialGradient(480, 270, 80, 480, 270, 440);
    matGrad.addColorStop(0, '#1E293B');
    matGrad.addColorStop(1, '#0B0F19');
    ctx.fillStyle = matGrad;
    ctx.beginPath();
    ctx.roundRect(20, 20, 920, 500, 30);
    ctx.fill();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawCenterRing(ctx) {
    const cx = 480;
    const cy = 270;
    const activeColorHex = this.getColorHex(this.getActiveColor());

    // Pulsing colored ring around center table
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.strokeStyle = activeColorHex;
    ctx.lineWidth = 4;
    ctx.shadowColor = activeColorHex;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Directional Rotation Arrows
    ctx.save();
    ctx.translate(cx, cy);
    const spin = this.gameTime * (this.direction * 1.2);
    ctx.rotate(spin);

    ctx.fillStyle = activeColorHex;
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 4; i++) {
      ctx.rotate((Math.PI / 2));
      ctx.beginPath();
      ctx.moveTo(95, -12);
      ctx.lineTo(115, 0);
      ctx.lineTo(95, 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Active Color Pill Badge
    ctx.save();
    ctx.fillStyle = activeColorHex;
    ctx.shadowColor = activeColorHex;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(cx - 65, cy - 135, 130, 26, 13);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`COLOR: ${this.getActiveColor().toUpperCase()}`, cx, cy - 122);
    ctx.restore();
  }

  drawPiles(ctx) {
    // 1. Draw Pile
    const d = this.drawDeckBounds;
    // 3D Deck Stacking effect
    for (let i = 4; i >= 0; i--) {
      ctx.fillStyle = i === 0 ? '#1E1B4B' : '#312E81';
      ctx.beginPath();
      ctx.roundRect(d.x - i * 1.5, d.y - i * 1.5, d.w, d.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#4338CA';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Deck Center Label
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 14px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DRAW', d.x + d.w / 2, d.y + d.h / 2);

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`${this.drawPile.length} cards`, d.x + d.w / 2, d.y + d.h + 16);

    // 2. Discard Pile
    const topCard = this.getTopDiscard();
    if (topCard) {
      this.drawCardGraphic(ctx, topCard, 540, 270, 0, false, false);
    }
  }

  drawPlayers(ctx) {
    // 1. Bottom: Human Player
    const p0 = this.players[0];
    this.drawAvatarBadge(ctx, p0, 480, 395, 'YOU');

    // Human Hand Cards
    const count = p0.hand.length;
    const startX = 480 - ((count - 1) * 36) / 2;
    for (let i = 0; i < count; i++) {
      const card = p0.hand[i];
      const cx = count > 14 ? 120 + i * (720 / count) : startX + i * 40;
      const isHovered = (i === this.hoveredCardIdx);
      const isLifted = (isHovered || card.isPlayable);
      const cy = 470 - (isLifted ? 20 : 0);

      this.drawCardGraphic(ctx, card, cx, cy, 0, true, card.isPlayable, isHovered);
    }

    // 2. Left: Noob
    const p1 = this.players[1];
    this.drawAvatarBadge(ctx, p1, 75, 230, `${p1.hand.length} cards`);
    this.drawOpponentHand(ctx, p1, 75, 310, 'vertical');

    // 3. Top: Guest 666
    const p2 = this.players[2];
    this.drawAvatarBadge(ctx, p2, 480, 50, `${p2.hand.length} cards`);
    this.drawOpponentHand(ctx, p2, 480, 110, 'horizontal');

    // 4. Right: Bacon Hair
    const p3 = this.players[3];
    this.drawAvatarBadge(ctx, p3, 885, 230, `${p3.hand.length} cards`);
    this.drawOpponentHand(ctx, p3, 885, 310, 'vertical');
  }

  drawAvatarBadge(ctx, player, x, y, subtext) {
    const isTurn = (this.currentTurn === player.id);

    ctx.save();
    // Pulsing Turn Halo
    if (isTurn) {
      const pulse = 1.0 + Math.sin(this.gameTime * 6) * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, 28 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.fill();
    }

    // Avatar Circle
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = isTurn ? '#FACC15' : '#475569';
    ctx.lineWidth = isTurn ? 3 : 2;
    ctx.stroke();

    // Emoji Face
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.avatar, x, y);

    // Name & Subtext
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = isTurn ? '#FACC15' : '#F8FAFC';
    ctx.fillText(player.name, x, y + 32);

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(subtext, x, y + 46);

    // Uno Called Pill
    if (player.hand.length === 1 && player.calledUno) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(x - 25, y - 36, 50, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 10px Fredoka, sans-serif';
      ctx.fillText('UNO!', x, y - 27);
    }
    ctx.restore();
  }

  drawOpponentHand(ctx, player, x, y, orient) {
    const count = Math.min(player.hand.length, 10);
    const cardMiniW = 28;
    const cardMiniH = 40;

    for (let i = 0; i < count; i++) {
      ctx.save();
      let cx = x;
      let cy = y;

      if (orient === 'horizontal') {
        cx = x - ((count - 1) * 16) / 2 + i * 16;
      } else {
        cy = y - ((count - 1) * 12) / 2 + i * 12;
      }

      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.roundRect(cx - cardMiniW / 2, cy - cardMiniH / 2, cardMiniW, cardMiniH, 4);
      ctx.fill();
      ctx.strokeStyle = '#4338CA';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Mini Roblox tilt symbol
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
      ctx.restore();
    }
  }

  // ========================================================================
  // REQUIREMENT 1: TURN POINTER ARROW (Points at the active player)
  // ========================================================================
  drawTurnPointerArrow(ctx) {
    const activeId = this.currentTurn;
    const bob = Math.sin(this.gameTime * 7) * 6;

    ctx.save();
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#FACC15';
    ctx.shadowBlur = 10;

    if (activeId === 0) {
      // Bottom (Human Player): Arrow floats above avatar, pointing DOWN
      const ax = 480;
      const ay = 345 + bob;
      this.drawArrow(ctx, ax, ay, 18, Math.PI); // Points Down
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR TURN!', ax, ay - 14);
    } else if (activeId === 1) {
      // Left (Noob): Arrow floats to right of avatar, pointing LEFT
      const ax = 125 + bob;
      const ay = 230;
      this.drawArrow(ctx, ax, ay, 18, -Math.PI / 2); // Points Left
    } else if (activeId === 2) {
      // Top (Guest 666): Arrow floats below avatar, pointing UP
      const ax = 480;
      const ay = 100 - bob;
      this.drawArrow(ctx, ax, ay, 18, 0); // Points Up
    } else if (activeId === 3) {
      // Right (Bacon Hair): Arrow floats to left of avatar, pointing RIGHT
      const ax = 835 - bob;
      const ay = 230;
      this.drawArrow(ctx, ax, ay, 18, Math.PI / 2); // Points Right
    }
    ctx.restore();
  }

  // ========================================================================
  // REQUIREMENT 2: CARD GUIDANCE ARROW (Points to playable card or Draw Pile)
  // ========================================================================
  drawGuidanceArrow(ctx) {
    if (this.currentTurn !== 0 || this.state !== 'WAITING_INPUT') return;

    const bob = Math.sin(this.gameTime * 8) * 5;
    const hand = this.players[0].hand;

    // Check if player has any playable card
    let hasPlayable = false;
    let targetIdx = this.suggestedCardIdx;

    if (targetIdx !== -1 && hand[targetIdx] && hand[targetIdx].isPlayable) {
      hasPlayable = true;
    }

    ctx.save();
    if (hasPlayable) {
      // POINT ARROW AT PLAYABLE CARD!
      const count = hand.length;
      const startX = 480 - ((count - 1) * 36) / 2;
      const cardX = count > 14 ? 120 + targetIdx * (720 / count) : startX + targetIdx * 40;
      const cardY = 385 + bob;

      ctx.fillStyle = '#10B981';
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 12;

      this.drawArrow(ctx, cardX, cardY, 16, Math.PI); // Points Down at Card
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#34D399';
      ctx.fillText('PLAY THIS! ⬇️', cardX, cardY - 14);
    } else {
      // NO PLAYABLE CARDS: POINT ARROW AT DRAW PILE!
      const drawX = this.drawDeckBounds.x + this.drawDeckBounds.w / 2;
      const drawY = this.drawDeckBounds.y - 12 + bob;

      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 12;

      this.drawArrow(ctx, drawX, drawY, 18, Math.PI); // Points Down at Draw Pile
      ctx.font = 'bold 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText('DRAW A CARD! ⬇️', drawX, drawY - 16);
    }
    ctx.restore();
  }

  drawArrow(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.8, size * 0.5);
    ctx.lineTo(size * 0.35, size * 0.4);
    ctx.lineTo(size * 0.35, size);
    ctx.lineTo(-size * 0.35, size);
    ctx.lineTo(-size * 0.35, size * 0.4);
    ctx.lineTo(-size * 0.8, size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Card Rendering Engine
  drawCardGraphic(ctx, card, x, y, angle = 0, isInteractive = false, isPlayable = false, isHovered = false) {
    const w = this.cardW;
    const h = this.cardH;

    ctx.save();
    ctx.translate(x, y);
    if (angle !== 0) ctx.rotate(angle);

    // Playable card golden glow
    if (isPlayable) {
      ctx.shadowColor = '#FACC15';
      ctx.shadowBlur = 16;
    } else if (card.isChaotic()) {
      ctx.shadowColor = card.value.includes('+99') ? '#FF3D00' : '#00E5FF';
      ctx.shadowBlur = 20;
    }

    // Card Outer Base
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.fill();

    // Inner Face Color
    const colorHex = this.getColorHex(card.color);
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 8);
    ctx.fill();

    // Center Ellipse Badge
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.38, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center Value / Symbol
    this.drawCardValue(ctx, card, colorHex);

    // Corner Value Indicators (Top-Left & Bottom-Right)
    this.drawCornerValues(ctx, card);

    // Glowing border for chaotic cards
    if (card.isChaotic()) {
      ctx.strokeStyle = card.value.includes('+99') ? '#FFD600' : '#00FFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 10);
      ctx.stroke();
    } else if (isPlayable) {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCardValue(ctx, card, colorHex) {
    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (card.isChaotic()) {
      // +99 or +110 Chaos Badge
      ctx.fillStyle = card.value.includes('+99') ? '#D50000' : '#0091EA';
      ctx.font = '900 13px Fredoka, sans-serif';
      ctx.fillText(card.value.includes('+99') ? '🔥 +99' : '⚡ +110', 0, -6);
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('CHAOS', 0, 10);
    } else if (card.value === 'Skip') {
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('⊘', 0, 0);
    } else if (card.value === 'Reverse') {
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('⇄', 0, 0);
    } else if (card.value === 'Draw Two') {
      ctx.font = '900 20px Fredoka, sans-serif';
      ctx.fillText('+2', 0, 0);
    } else if (card.value === 'Draw Four') {
      ctx.font = '900 18px Fredoka, sans-serif';
      ctx.fillStyle = '#EF4444';
      ctx.fillText('+4', 0, 0);
    } else if (card.value === 'Wild') {
      ctx.font = '900 13px Fredoka, sans-serif';
      ctx.fillStyle = '#312E81';
      ctx.fillText('WILD', 0, 0);
    } else {
      // 0-9 Numbers
      ctx.font = '900 32px Fredoka, sans-serif';
      ctx.fillText(card.value, 0, 1);
    }
  }

  drawCornerValues(ctx, card) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let displayVal = card.value;
    if (card.value === 'Draw Two') displayVal = '+2';
    if (card.value === 'Draw Four') displayVal = '+4';
    if (card.value === 'Skip') displayVal = '⊘';
    if (card.value === 'Reverse') displayVal = '⇄';
    if (card.value === 'Wild') displayVal = '★';
    if (card.value.includes('+99')) displayVal = '+99';
    if (card.value.includes('+110')) displayVal = '+110';

    // Top-Left
    ctx.fillText(displayVal, -this.cardW / 2 + 13, -this.cardH / 2 + 13);
    // Bottom-Right
    ctx.fillText(displayVal, this.cardW / 2 - 13, this.cardH / 2 - 13);
  }

  getColorHex(color) {
    const c = (color || '').toLowerCase();
    if (c === 'red') return '#EF4444';
    if (c === 'yellow') return '#F59E0B';
    if (c === 'green') return '#10B981';
    if (c === 'blue') return '#3B82F6';
    if (c === 'wild') return '#312E81';
    return '#64748B';
  }

  drawUnoButton(ctx) {
    const b = this.unoButtonBounds;
    const isUrgent = (this.players[0].hand.length <= 2 && !this.players[0].calledUno);
    const pulse = isUrgent ? (1.0 + Math.sin(this.gameTime * 10) * 0.08) : 1.0;

    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.scale(pulse, pulse);

    // Button Background
    ctx.fillStyle = isUrgent ? '#DC2626' : '#334155';
    if (isUrgent) {
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 16);
    ctx.fill();

    ctx.strokeStyle = isUrgent ? '#FACC15' : '#64748B';
    ctx.lineWidth = 3;
    ctx.stroke();

    // UNO! Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UNO!', 0, -4);

    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillStyle = isUrgent ? '#FDE047' : '#94A3B8';
    ctx.fillText(isUrgent ? 'SHOUT NOW! [U]' : 'CALLOUT [U]', 0, 16);
    ctx.restore();
  }

  drawColorWheel(ctx) {
    const cx = this.colorWheelBounds.x;
    const cy = this.colorWheelBounds.y;
    const r = this.colorWheelBounds.radius;

    ctx.save();
    // Modal Overlay Backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, 960, 540);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 20px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT NEXT COLOR', cx, cy - r - 25);

    // 4 Quadrants
    const quadrants = [
      { name: 'red', color: '#EF4444', start: -Math.PI / 2, end: 0, label: 'RED [R]' },
      { name: 'yellow', color: '#F59E0B', start: 0, end: Math.PI / 2, label: 'YELLOW [Y]' },
      { name: 'green', color: '#10B981', start: Math.PI / 2, end: Math.PI, label: 'GREEN [G]' },
      { name: 'blue', color: '#3B82F6', start: Math.PI, end: Math.PI * 1.5, label: 'BLUE [B]' }
    ];

    for (const q of quadrants) {
      const isHover = (this.hoveredColorChoice === q.name);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, isHover ? r + 10 : r, q.start, q.end);
      ctx.closePath();
      ctx.fillStyle = q.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label
      const midAngle = (q.start + q.end) / 2;
      const lx = cx + Math.cos(midAngle) * (r * 0.65);
      const ly = cy + Math.sin(midAngle) * (r * 0.65);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(q.label, lx, ly);
    }
    ctx.restore();
  }

  drawCascadeCounter(ctx) {
    const q = this.cascadeQueue;
    const target = this.players[q.targetPlayerId];

    ctx.save();
    // Dramatic Alert Banner
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.roundRect(280, 180, 400, 110, 16);
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 CHAOS CASCADE! 🔥', 480, 215);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#FEF08A';
    ctx.fillText(`${target.name} DRAWING: ${q.currentCount} / ${q.totalCount}`, 480, 245);

    // Progress Bar
    const progress = q.currentCount / q.totalCount;
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.roundRect(320, 260, 320, 14, 7);
    ctx.fill();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.roundRect(320, 260, 320 * progress, 14, 7);
    ctx.fill();
    ctx.restore();
  }

  drawHUD(ctx) {
    ctx.save();

    // 1. Top-Left: Robux Reward Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(12, 8, 98, 76, 16);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.font = '900 16px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R$', 61, 36);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${this.score} Robux`, 61, 58);

    // 2. Center Top: MASSIVE Turn Recorder & Announcement Shower Box
    const boxX = 118;
    const boxY = 8;
    const boxW = 724;
    const boxH = 76;
    const boxR = 22;

    const hasAnnouncement = this.announcement && this.announcementTimer > 0;
    const isMyTurn = (this.currentTurn === 0 && this.state === 'WAITING_INPUT');
    const activePlayerName = this.players[this.currentTurn]?.name || 'Player';

    // Box Background Gradient
    const bannerGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    bannerGrad.addColorStop(0, '#0F172A');
    bannerGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = bannerGrad;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, boxR);
    ctx.fill();

    // Box Glowing Border
    let borderColor = '#334155';
    if (hasAnnouncement) {
      borderColor = '#FACC15';
    } else if (isMyTurn) {
      borderColor = '#38BDF8';
    } else {
      borderColor = '#64748B';
    }
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Turn Recorder / Shower Content
    if (hasAnnouncement) {
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📢 MATCH ANNOUNCEMENT & LIVE RECORDER', boxX + boxW / 2, boxY + 26);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 19px Fredoka, Inter, sans-serif';
      ctx.fillText(this.announcement, boxX + boxW / 2, boxY + 54);
    } else {
      if (isMyTurn) {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 TURN RECORDER • YOUR ACTION NEEDED', boxX + boxW / 2, boxY + 26);

        ctx.fillStyle = '#10B981';
        ctx.font = '900 19px Fredoka, Inter, sans-serif';
        ctx.fillText('👉 YOUR TURN! Click a matching card or Draw Deck [D]', boxX + boxW / 2, boxY + 54);
      } else {
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 TURN RECORDER • LIVE MATCH FEED', boxX + boxW / 2, boxY + 26);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText(`⏳ ${activePlayerName}'s Turn — Selecting a move...`, boxX + boxW / 2, boxY + 54);
      }
    }

    // 3. Top-Right: Fast Mode Button
    ctx.fillStyle = this.fastMode ? '#2563EB' : 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(850, 8, 98, 76, 16);
    ctx.fill();
    ctx.strokeStyle = this.fastMode ? '#60A5FA' : '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = this.fastMode ? '#FFFFFF' : '#94A3B8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPEED', 899, 32);

    ctx.fillStyle = this.fastMode ? '#FACC15' : '#F8FAFC';
    ctx.font = '900 14px Fredoka, sans-serif';
    ctx.fillText(this.fastMode ? '⚡ FAST' : '🐢 NORMAL', 899, 56);

    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawGameOver(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 960, 540);

    const isWin = (this.winner && this.winner.id === 0);

    ctx.fillStyle = isWin ? '#22C55E' : '#EF4444';
    ctx.font = '900 36px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isWin ? '🏆 VICTORY!' : '💀 DEFEAT!', 480, 220);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(isWin ? 'You eliminated all cards and won the UNO Match!' : `${this.winner.name} won the UNO Match!`, 480, 265);

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Click anywhere to play another round', 480, 310);
    ctx.restore();
  }
}
