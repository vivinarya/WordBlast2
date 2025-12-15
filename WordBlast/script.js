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

/* ---------- Enemy ---------- */
class Enemy {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.speed = 1 + Math.random();
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.font = '20px Courier New';
        ctx.fillStyle = '#0f0';
        ctx.fillText(this.text, this.x, this.y);
    }
}

/* ---------- Explosion Effect ---------- */
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.alpha = 1;
    }

    update() {
        this.radius += 2;
        this.alpha -= 0.08;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

/* ---------- Helpers ---------- */
function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    enemies.push(new Enemy(x, -20, text));
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

/* ---------- Input ---------- */
window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0]?.toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                explosions.push(
                    new Explosion(enemies[i].x + 20, enemies[i].y - 10)
                );
                enemies.splice(i, 1);
                score += 10;
                scoreElement.innerText = score;
            }
            break;
        }
    }
});

/* ---------- Game Loop ---------- */
function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
        if (spawnRate > 500) spawnRate -= 10;
    }

    // Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        enemy.draw();
        if (enemy.y > canvas.height) gameOver();
    }

    // Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        ex.update();
        ex.draw();
        if (ex.alpha <= 0) explosions.splice(i, 1);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
