import { gameEngine } from '../shared/gameEngine.js';
import { sounds } from '../shared/audio.js';
import { AdminState } from '../../../backend/arcade/shared/gameModifiers.js';

export class WorkAtPizzaGame {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.player = { x: 480, y: 270, speed: 200, holding: null, size: 30 };
        this.score = 0;
        this.pizzasDelivered = 0;
        this.pizzaOnTable = { dough: false, sauce: false, cheese: false, pepperoni: false };
        this.oven = { active: false, timer: 0, maxTime: 3, done: false };
        
        // Stations
        this.stations = [
            { id: 'dough', name: 'Dough', x: 100, y: 100, w: 80, h: 80, color: '#f5deb3' },
            { id: 'sauce', name: 'Sauce', x: 200, y: 100, w: 80, h: 80, color: '#ff0000' },
            { id: 'cheese', name: 'Cheese', x: 300, y: 100, w: 80, h: 80, color: '#ffd700' },
            { id: 'pepperoni', name: 'Pepperoni', x: 400, y: 100, w: 80, h: 80, color: '#a52a2a' },
            { id: 'assembly', name: 'Table', x: 250, y: 250, w: 100, h: 100, color: '#8b4513' },
            { id: 'oven', name: 'Oven', x: 600, y: 150, w: 120, h: 120, color: '#444' },
            { id: 'boxes', name: 'Boxes', x: 800, y: 250, w: 80, h: 80, color: '#deb887' },
            { id: 'delivery', name: 'Delivery', x: 800, y: 400, w: 100, h: 100, color: '#32cd32' }
        ];
    }
    
    start() {
        this.reset();
        gameEngine.updateHUD(this.score, `Orders: ${this.pizzasDelivered}/5`);
    }
    
    onKeyDown(e) {
        if (e.code === 'Space' || e.code === 'KeyE') {
            this.interact();
        }
    }
    
    interact() {
        let nearest = null;
        let minDist = 100;
        
        for (let s of this.stations) {
            let cx = s.x + s.w/2;
            let cy = s.y + s.h/2;
            let dist = Math.hypot(this.player.x - cx, this.player.y - cy);
            if (dist < minDist) {
                minDist = dist;
                nearest = s;
            }
        }
        
        if (!nearest) return;
        
        if (nearest.id === 'dough' || nearest.id === 'sauce' || nearest.id === 'cheese' || nearest.id === 'pepperoni') {
            if (!this.player.holding) {
                this.player.holding = nearest.id;
                sounds.playClick();
            }
        } else if (nearest.id === 'assembly') {
            if (this.player.holding === 'dough' && !this.pizzaOnTable.dough) {
                this.pizzaOnTable.dough = true;
                this.player.holding = null;
                sounds.playClick();
            } else if (this.player.holding === 'sauce' && this.pizzaOnTable.dough && !this.pizzaOnTable.sauce) {
                this.pizzaOnTable.sauce = true;
                this.player.holding = null;
                sounds.playClick();
            } else if (this.player.holding === 'cheese' && this.pizzaOnTable.sauce && !this.pizzaOnTable.cheese) {
                this.pizzaOnTable.cheese = true;
                this.player.holding = null;
                sounds.playClick();
            } else if (this.player.holding === 'pepperoni' && this.pizzaOnTable.cheese && !this.pizzaOnTable.pepperoni) {
                this.pizzaOnTable.pepperoni = true;
                this.player.holding = null;
                sounds.playClick();
            } else if (!this.player.holding && this.pizzaOnTable.dough && this.pizzaOnTable.sauce && this.pizzaOnTable.cheese && this.pizzaOnTable.pepperoni) {
                this.player.holding = 'raw_pizza';
                this.pizzaOnTable = { dough: false, sauce: false, cheese: false, pepperoni: false };
                sounds.playClick();
            }
        } else if (nearest.id === 'oven') {
            if (this.player.holding === 'raw_pizza' && !this.oven.active && !this.oven.done) {
                this.player.holding = null;
                this.oven.active = true;
                this.oven.timer = 0;
                sounds.playJump();
            } else if (this.oven.done && !this.player.holding) {
                this.oven.done = false;
                this.player.holding = 'baked_pizza';
                sounds.playClick();
            }
        } else if (nearest.id === 'boxes') {
            if (this.player.holding === 'baked_pizza') {
                this.player.holding = 'boxed_pizza';
                sounds.playClick();
            }
        } else if (nearest.id === 'delivery') {
            if (this.player.holding === 'boxed_pizza') {
                this.player.holding = null;
                this.score += 500;
                this.pizzasDelivered++;
                sounds.playRobux();
                gameEngine.updateHUD(this.score, `Orders: ${this.pizzasDelivered}/5`);
                
                if (this.pizzasDelivered >= 5) {
                    sounds.playWin();
                    gameEngine.triggerGameOver("Shift Complete!", `You earned $${this.score}!`, true);
                }
            }
        }
    }
    
    update(dt, keys, adminState) {
        let speed = this.player.speed * (adminState.speedHack ? 2 : 1);
        if (keys['ArrowUp'] || keys['KeyW']) this.player.y -= speed * dt;
        if (keys['ArrowDown'] || keys['KeyS']) this.player.y += speed * dt;
        if (keys['ArrowLeft'] || keys['KeyA']) this.player.x -= speed * dt;
        if (keys['ArrowRight'] || keys['KeyD']) this.player.x += speed * dt;
        
        this.player.x = Math.max(0, Math.min(960, this.player.x));
        this.player.y = Math.max(0, Math.min(540, this.player.y));
        
        if (this.oven.active) {
            this.oven.timer += dt;
            if (this.oven.timer >= this.oven.maxTime) {
                this.oven.active = false;
                this.oven.done = true;
                sounds.playWin();
            }
        }
    }
    
    render(ctx, width, height, user) {
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, 0, width, height);
        
        for (let s of this.stations) {
            ctx.fillStyle = s.color;
            ctx.fillRect(s.x, s.y, s.w, s.h);
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(s.name, s.x + s.w/2, s.y - 10);
        }
        
        let ax = 250 + 50, ay = 250 + 50;
        if (this.pizzaOnTable.dough) {
            ctx.beginPath(); ctx.arc(ax, ay, 30, 0, Math.PI*2); ctx.fillStyle = '#f5deb3'; ctx.fill();
        }
        if (this.pizzaOnTable.sauce) {
            ctx.beginPath(); ctx.arc(ax, ay, 25, 0, Math.PI*2); ctx.fillStyle = '#ff0000'; ctx.fill();
        }
        if (this.pizzaOnTable.cheese) {
            ctx.beginPath(); ctx.arc(ax, ay, 20, 0, Math.PI*2); ctx.fillStyle = '#ffd700'; ctx.fill();
        }
        if (this.pizzaOnTable.pepperoni) {
            ctx.fillStyle = '#a52a2a';
            ctx.beginPath(); ctx.arc(ax-10, ay-10, 5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ax+10, ay+10, 5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ax-10, ay+10, 5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ax+10, ay-10, 5, 0, Math.PI*2); ctx.fill();
        }
        
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        if (this.oven.active) {
            ctx.fillText(`Baking... ${Math.ceil(this.oven.maxTime - this.oven.timer)}s`, 660, 150 - 10);
            ctx.fillStyle = 'orange';
            ctx.fillRect(620, 190, 80, 20);
        } else if (this.oven.done) {
            ctx.fillText("DONE! Press Space", 660, 150 - 10);
        }
        
        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(user, this.player.x, this.player.y - 40);
        
        if (this.player.holding) {
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText(`Holding: ${this.player.holding}`, this.player.x, this.player.y + 45);
        }
        
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Tips: $${this.score}`, 20, 40);
        ctx.fillText(`Orders: ${this.pizzasDelivered} / 5`, 20, 70);
    }
}
