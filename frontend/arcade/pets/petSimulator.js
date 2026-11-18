/* ==========================================================================
   MINI ROBLOX - GAME 12: PET SIMULATOR X (Authentic Roblox Pet Hatch & Collector)
   Continuous Biome Terrain, Giant Coin Chests, Egg Hatching Stand,
   Pet Evolution & Rainbow Worlds!
   ========================================================================== */

import { gameEngine } from '../shared/gameEngine.js';
import { sounds } from '../shared/audio.js';
import { AdminState } from '../../../backend/arcade/shared/gameModifiers.js';

export class PetSimulatorGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.player = {
      x: 150,
      y: 350,
      width: 32,
      height: 44,
      vx: 0,
      vy: 0,
      speed: 320,
      jumpForce: -620,
      grounded: false
    };

    this.pet = {
      x: 100,
      y: 350,
      tier: 0,
      emoji: '🐣',
      name: 'Baby Chick 🐣',
      power: 1,
      range: 85
    };

    this.coins = 0;
    this.diamonds = 0;
    this.gravity = 1250;
    this.cameraX = 0;
    this.gameTime = 0;
    this.particles = [];
    this.winTriggered = false;

    // Continuous Structured World Platforms (9,000px wide across 3 rich biomes)
    // 1. Starter Meadow (0 - 3000px)
    // 2. Candy Wonderland (3000 - 6000px)
    // 3. Rainbow Heaven & Dragon Realm (6000 - 9000px)
    this.worldWidth = 9000;
    this.groundY = 440;

    this.platforms = [
      // Main Ground across whole world
      { x: -200, y: this.groundY, width: this.worldWidth + 400, height: 160, type: 'ground' },

      // Meadow Platforms (Zone 1)
      { x: 300, y: 340, width: 180, height: 24, type: 'cloud', zone: 0 },
      { x: 580, y: 260, width: 200, height: 24, type: 'cloud', zone: 0 },
      { x: 900, y: 320, width: 160, height: 24, type: 'cloud', zone: 0 },
      { x: 1200, y: 240, width: 220, height: 24, type: 'cloud', zone: 0 },
      { x: 1550, y: 310, width: 190, height: 24, type: 'cloud', zone: 0 },
      { x: 1900, y: 230, width: 240, height: 24, type: 'cloud', zone: 0 },
      { x: 2300, y: 300, width: 200, height: 24, type: 'cloud', zone: 0 },
      { x: 2650, y: 220, width: 220, height: 24, type: 'cloud', zone: 0 },

      // Candy Wonderland Platforms (Zone 2)
      { x: 3250, y: 320, width: 200, height: 24, type: 'candy', zone: 1 },
      { x: 3600, y: 240, width: 240, height: 24, type: 'candy', zone: 1 },
      { x: 3980, y: 310, width: 180, height: 24, type: 'candy', zone: 1 },
      { x: 4300, y: 230, width: 220, height: 24, type: 'candy', zone: 1 },
      { x: 4650, y: 300, width: 200, height: 24, type: 'candy', zone: 1 },
      { x: 5050, y: 220, width: 250, height: 24, type: 'candy', zone: 1 },
      { x: 5450, y: 310, width: 210, height: 24, type: 'candy', zone: 1 },
      { x: 5750, y: 230, width: 200, height: 24, type: 'candy', zone: 1 },

      // Rainbow Heaven Platforms (Zone 3)
      { x: 6250, y: 310, width: 220, height: 24, type: 'gold', zone: 2 },
      { x: 6600, y: 230, width: 240, height: 24, type: 'gold', zone: 2 },
      { x: 7000, y: 300, width: 200, height: 24, type: 'gold', zone: 2 },
      { x: 7350, y: 220, width: 260, height: 24, type: 'gold', zone: 2 },
      { x: 7750, y: 290, width: 220, height: 24, type: 'gold', zone: 2 },
      { x: 8150, y: 210, width: 280, height: 24, type: 'gold', zone: 2 },
      { x: 8550, y: 280, width: 300, height: 24, type: 'gold', zone: 2 }
    ];

    // Collectible Coins, Gems & Giant Breakable Chests
    this.items = [];
    for (let x = 100; x < this.worldWidth; x += 110) {
      const isGem = Math.random() < 0.25;
      const isChest = Math.random() < 0.08;
      const y = Math.random() < 0.5 ? this.groundY - 30 : 160 + Math.random() * 160;

      if (isChest) {
        this.items.push({
          x,
          y: this.groundY - 35,
          type: 'chest',
          hp: 12,
          maxHp: 12,
          value: 100,
          emoji: '🎁',
          active: true,
          floatOffset: 0
        });
      } else {
        this.items.push({
          x,
          y,
          type: isGem ? 'gem' : 'coin',
          value: isGem ? 10 : 2,
          emoji: isGem ? '💎' : '💰',
          active: true,
          floatOffset: Math.random() * Math.PI * 2
        });
      }
    }

    // Egg Hatching Stand at Spawn (x: 200)
    this.eggStand = { x: 200, y: this.groundY - 50, cost: 80 };
  }

  start() {
    this.reset();
    sounds.playClick();
  }

  onKeyDown(e) {
    const k = (e.key || '').toLowerCase();
    const code = e.code || '';

    // Jump: Space, W, Up Arrow
    if ((k === ' ' || k === 'w' || k === 'arrowup' || code === 'Space' || code === 'KeyW' || code === 'ArrowUp') && this.player.grounded) {
      this.player.vy = this.player.jumpForce;
      this.player.grounded = false;
      sounds.playJump();
    }

    // Hatch Egg at Stand: Press E
    if ((k === 'e' || code === 'KeyE') && Math.abs(this.player.x - this.eggStand.x) < 80) {
      this.hatchEgg();
    }
  }

  hatchEgg() {
    if (this.coins < this.eggStand.cost) {
      sounds.playOof();
      this.particles.push({
        x: this.player.x,
        y: this.player.y - 30,
        text: `❌ NEED ${this.eggStand.cost} COINS TO HATCH!`,
        color: '#EF4444',
        life: 1.2
      });
      return;
    }

    this.coins -= this.eggStand.cost;
    sounds.playWin();

    // Random Pet Hatch
    const pets = [
      { name: 'Cute Doggy 🐶', emoji: '🐶', tier: 1, power: 2, range: 100 },
      { name: 'Red Fox 🦊', emoji: '🦊', tier: 2, power: 4, range: 120 },
      { name: 'Magic Unicorn 🦄', emoji: '🦄', tier: 3, power: 8, range: 150 },
      { name: '👑 Cosmic Dragon', emoji: '👑', tier: 4, power: 20, range: 200 }
    ];

    const roll = Math.random();
    let hatched = pets[0];
    if (roll < 0.1) hatched = pets[3];
    else if (roll < 0.3) hatched = pets[2];
    else if (roll < 0.6) hatched = pets[1];

    this.pet = {
      x: this.player.x - 30,
      y: this.player.y,
      tier: hatched.tier,
      emoji: hatched.emoji,
      name: hatched.name,
      power: hatched.power,
      range: hatched.range
    };

    this.particles.push({
      x: this.player.x,
      y: this.player.y - 45,
      text: `✨ HATCHED: ${hatched.name}!`,
      color: '#FACC15',
      life: 2.0
    });
  }

  update(dt, keys, adminState) {
    if (this.winTriggered) return;

    this.gameTime += dt;
    const speedMult = adminState?.speedMultiplier || 1.0;
    const gravMult = adminState?.gravityMultiplier || 1.0;

    // 1. Horizontal Movement
    let moveX = 0;
    if (keys.ArrowRight || keys.KeyD || keys.d || keys.D) moveX += 1;
    if (keys.ArrowLeft || keys.KeyA || keys.a || keys.A) moveX -= 1;

    this.player.vx = moveX * this.player.speed * speedMult;
    this.player.x += this.player.vx * dt;

    // Clamp inside world boundaries
    this.player.x = Math.max(20, Math.min(this.worldWidth - 50, this.player.x));

    // 2. Vertical Movement & Gravity
    this.player.vy += this.gravity * gravMult * dt;
    this.player.y += this.player.vy * dt;

    // 3. Platform & Ground Collisions
    this.player.grounded = false;
    for (const p of this.platforms) {
      // Horizontal overlap
      if (this.player.x + this.player.width > p.x && this.player.x < p.x + p.width) {
        // Landing on top
        if (this.player.vy >= 0 &&
            this.player.y + this.player.height >= p.y &&
            this.player.y + this.player.height <= p.y + p.height + 14) {
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.grounded = true;
          break;
        }
      }
    }

    // 4. Pet Companion Smooth Following
    const targetPetX = this.player.x - 45 * (this.player.vx >= 0 ? 1 : -1);
    const targetPetY = this.player.y + Math.sin(this.gameTime * 4) * 10 - 8;
    this.pet.x += (targetPetX - this.pet.x) * 0.12;
    this.pet.y += (targetPetY - this.pet.y) * 0.12;

    // 5. Coin, Gem & Chest Collection
    for (const item of this.items) {
      if (!item.active) continue;

      // Pet auto-collect / attack within pet range
      const distToPet = Math.hypot(this.pet.x - item.x, this.pet.y - item.y);
      const distToPlayer = Math.hypot(this.player.x - item.x, this.player.y - item.y);

      if (distToPet < this.pet.range || distToPlayer < 45) {
        if (item.type === 'chest') {
          item.hp -= this.pet.power * dt * 4;
          this.particles.push({
            x: item.x,
            y: item.y - 10,
            text: '💥',
            color: '#FACC15',
            life: 0.2
          });

          if (item.hp <= 0) {
            item.active = false;
            this.coins += item.value;
            sounds.playRobux();
            this.particles.push({
              x: item.x,
              y: item.y - 30,
              text: `🎁 CHEST BROKEN! +$${item.value}!`,
              color: '#10B981',
              life: 1.8
            });
          }
        } else {
          item.active = false;
          this.coins += item.value;
          sounds.playRobux();
          this.particles.push({
            x: item.x,
            y: item.y - 20,
            text: `+${item.value} ${item.type === 'gem' ? '💎' : '💰'}`,
            color: item.type === 'gem' ? '#38BDF8' : '#FACC15',
            life: 0.8
          });
        }
      }
    }

    // Check Evolution Milestones
    if (this.coins >= 5000 && this.pet.tier < 4) {
      this.pet.tier = 4;
      this.pet.emoji = '👑';
      this.pet.name = '👑 Cosmic Dragon';
      this.pet.power = 20;
      this.pet.range = 200;
      sounds.playWin();
      this.particles.push({ x: this.player.x, y: this.player.y - 50, text: '🌟 EVOLVED TO COSMIC DRAGON!', color: '#FACC15', life: 2.5 });
    } else if (this.coins >= 1500 && this.pet.tier < 3) {
      this.pet.tier = 3;
      this.pet.emoji = '🦄';
      this.pet.name = '🦄 Magic Unicorn';
      this.pet.power = 8;
      this.pet.range = 150;
      sounds.playWin();
    } else if (this.coins >= 500 && this.pet.tier < 2) {
      this.pet.tier = 2;
      this.pet.emoji = '🦊';
      this.pet.name = '🦊 Red Fox';
      this.pet.power = 4;
      this.pet.range = 120;
      sounds.playWin();
    }

    // Camera follow smoothly
    const targetCamX = this.player.x - 960 / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraX = Math.max(0, Math.min(this.worldWidth - 960, this.cameraX));

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y -= 25 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Win condition at end of world (x > 8600)
    if (this.player.x >= 8600 && !this.winTriggered) {
      this.winTriggered = true;
      sounds.playWin();
      gameEngine.triggerGameOver(
        '🏆 PET SIMULATOR X MASTER!',
        `You completed all worlds and reached Rainbow Realm with ${this.pet.name}!\nTotal Coins: ${this.coins}`,
        true
      );
      return;
    }

    const zoneName = this.player.x < 3000 ? '🌱 Starter Meadow' : (this.player.x < 6000 ? '🍭 Candy Wonderland' : '🌈 Rainbow Heaven');
    gameEngine.updateHUD(this.coins, `Pet: ${this.pet.name} | Zone: ${zoneName}`);
  }

  render(ctx, width, height, user) {
    ctx.save();

    // 1. Dynamic Parallax Sky by Zone
    const zoneIndex = Math.min(2, Math.floor(this.player.x / 3000));
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);

    if (zoneIndex === 0) {
      bgGrad.addColorStop(0, '#38BDF8');
      bgGrad.addColorStop(0.6, '#BAE6FD');
      bgGrad.addColorStop(1, '#E0F2FE');
    } else if (zoneIndex === 1) {
      bgGrad.addColorStop(0, '#EC4899');
      bgGrad.addColorStop(0.5, '#F472B6');
      bgGrad.addColorStop(1, '#FCE7F3');
    } else {
      bgGrad.addColorStop(0, '#8B5CF6');
      bgGrad.addColorStop(0.5, '#EC4899');
      bgGrad.addColorStop(1, '#FACC15');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // 2. Render Continuous Ground & Stepping Platforms
    for (const p of this.platforms) {
      if (p.x + p.width < this.cameraX - 50 || p.x > this.cameraX + width + 50) continue;

      if (p.type === 'ground') {
        // Continuous Ground
        // Meadow section (0 - 3000)
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(-200, p.y, 3200, 20);
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-200, p.y + 20, 3200, p.height);

        // Candy section (3000 - 6000)
        ctx.fillStyle = '#F472B6';
        ctx.fillRect(3000, p.y, 3000, 20);
        ctx.fillStyle = '#9D174D';
        ctx.fillRect(3000, p.y + 20, 3000, p.height);

        // Rainbow Gold section (6000 - 9000)
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(6000, p.y, 3200, 20);
        ctx.fillStyle = '#B45309';
        ctx.fillRect(6000, p.y + 20, 3200, p.height);
      } else {
        // Floating Stepping Platforms
        let topColor = '#86EFAC', bodyColor = '#15803D';
        if (p.zone === 1) { topColor = '#FBCFE8'; bodyColor = '#DB2777'; }
        if (p.zone === 2) { topColor = '#FEF08A'; bodyColor = '#D97706'; }

        ctx.fillStyle = bodyColor;
        ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        ctx.fill();

        ctx.fillStyle = topColor;
        ctx.fillRect(p.x, p.y, p.width, 6);
      }
    }

    // 3. Egg Hatching Stand (at x: 200)
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(this.eggStand.x - 35, this.eggStand.y, 70, 50);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.eggStand.x - 35, this.eggStand.y, 70, 50);

    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥚', this.eggStand.x, this.eggStand.y + 32);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🥚 EGG SHOP', this.eggStand.x, this.eggStand.y - 18);
    ctx.fillStyle = '#FACC15';
    ctx.fillText('Press E ($80)', this.eggStand.x, this.eggStand.y - 6);

    // 4. Zone Portal Archways
    const portals = [
      { x: 3000, name: '🍭 CANDY WONDERLAND' },
      { x: 6000, name: '🌈 RAINBOW REALM' }
    ];

    for (const port of portals) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(port.x - 15, 60, 30, this.groundY - 60);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeRect(port.x - 15, 60, 30, this.groundY - 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ ${port.name} ✨`, port.x, 45);
    }

    // 5. Collectible Coins, Gems & Chests
    for (const item of this.items) {
      if (!item.active || item.x < this.cameraX - 40 || item.x > this.cameraX + width + 40) continue;

      const floatY = item.y + Math.sin(this.gameTime * 3 + item.floatOffset) * 6;
      ctx.font = item.type === 'chest' ? '28px sans-serif' : '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.emoji, item.x, floatY);

      if (item.type === 'chest') {
        // Chest HP bar
        const pct = Math.max(0, item.hp / item.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(item.x - 20, floatY - 26, 40, 6);
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(item.x - 20, floatY - 26, 40 * pct, 6);
      }
    }

    // 6. Player Avatar
    const p = this.player;
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height, 6);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Player Overhead Nametag with Verified Badge
    const nameStr = user?.id || 'Player';
    const isAdmin = user?.role === 'admin';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(nameStr, p.x + p.width / 2, p.y - 20);

    if (isAdmin) {
      const nw = ctx.measureText(nameStr).width;
      const bx = p.x + p.width / 2 + nw / 2 + 8;
      const by = p.y - 23;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#0066FF';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(bx - 3, by);
      ctx.lineTo(bx - 1, by + 2.5);
      ctx.lineTo(bx + 3.5, by - 2.5);
      ctx.stroke();
    }

    // 7. Floating Pet Companion
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.pet.emoji, this.pet.x, this.pet.y);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(this.pet.name, this.pet.x, this.pet.y - 24);

    // 8. Floating Particles
    for (const part of this.particles) {
      ctx.fillStyle = part.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(part.text, part.x, part.y);
    }

    ctx.restore();
    ctx.restore();
  }
}
