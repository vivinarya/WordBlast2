const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');


canvas.width = 800;
canvas.height = 600;


let score = 0;
let isGameOver = false;
let spawnRate = 2000; 
let lastSpawnTime = 0;


const wordList = [
    "code", "bug", "fix", "git", "push", "pull", "merge", 
    "java", "node", "html", "css", "react", "vue", "data",
    "loop", "if", "else", "var", "let", "const", "array"
];


let enemies = [];
let explosions = [];

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.duration = 60; // milliseconds (doubled)
        this.elapsed = 0;
        this.maxRadius = 80; // doubled
        
        // Create multiple layers for more dramatic effect
        this.rings = [
            { delay: 0, maxRadius: 30, color: '#ffff00', lineWidth: 4 },
            { delay: 5, maxRadius: 60, color: '#00ff00', lineWidth: 3 },
            { delay: 10, maxRadius: 90, color: '#00ddff', lineWidth: 2 }
        ];
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
    }

    draw() {
        const progress = this.elapsed / this.duration;
        
        if (progress >= 1) {
            return false; // Explosion is done
        }

        // Center bright flash (strongest at start)
        const centerAlpha = Math.max(0, 1 - progress * 1.5);
        ctx.save();
        ctx.globalAlpha = centerAlpha * 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Multiple expanding rings for dramatic effect
        this.rings.forEach(ring => {
            const ringProgress = Math.max(0, progress - ring.delay / this.duration);
            
            if (ringProgress > 0) {
                const ringAlpha = Math.max(0, 1 - ringProgress * 1.2);
                const radius = ring.maxRadius * ringProgress;
                
                // Outer glow
                ctx.save();
                ctx.globalAlpha = ringAlpha * 0.4;
                ctx.strokeStyle = ring.color;
                ctx.lineWidth = ring.lineWidth + 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                
                // Main ring
                ctx.save();
                ctx.globalAlpha = ringAlpha * 0.8;
                ctx.strokeStyle = ring.color;
                ctx.lineWidth = ring.lineWidth;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        });

        // Secondary rays/spikes for extra pop
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const rayLength = this.maxRadius * progress;
            const rayAlpha = Math.max(0, 1 - progress * 1.3);
            
            const x1 = this.x + Math.cos(angle) * rayLength * 0.3;
            const y1 = this.y + Math.sin(angle) * rayLength * 0.3;
            const x2 = this.x + Math.cos(angle) * rayLength;
            const y2 = this.y + Math.sin(angle) * rayLength;
            
            ctx.save();
            ctx.globalAlpha = rayAlpha * 0.6;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }

        return true; // Explosion still active
    }

    isDone() {
        return this.elapsed >= this.duration;
    }
}

class Enemy {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.speed = 1 + Math.random(); 
        this.color = '#0f0';
    }

    draw() {
        ctx.font = '20px Courier New';
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = -20; 
    enemies.push(new Enemy(x, y, text));
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}


window.addEventListener('keydown', (e) => {
    if (isGameOver) return;

    const key = e.key.toLowerCase();

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0] && enemies[i].text[0].toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                // Create explosion effect at enemy position
                explosions.push(new Explosion(enemies[i].x, enemies[i].y));
                
                enemies.splice(i, 1);
                score += 10;
                scoreElement.innerText = score;
            }
            break;
        }
    }
});

function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;

        if (spawnRate > 500) spawnRate -= 10;
    }


    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.update();
        enemy.draw();

        if (enemy.y > canvas.height) {
            gameOver();
        }
    }

    // Update and draw explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update(16); // Assume ~60fps, ~16ms per frame
        explosions[i].draw();
        
        if (explosions[i].isDone()) {
            explosions.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);