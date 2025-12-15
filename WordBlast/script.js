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

let enemies = [];
let boss = null;
let nextBossScore = 1000;

const wordList = [
    "code", "bug", "fix", "git", "push", "pull", "merge",
    "java", "node", "html", "css", "react", "vue", "data",
    "loop", "if", "else", "var", "let", "const", "array"
];

const BOSS_WORD = "supercalifragilistic";

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

class Boss {
    constructor() {
        this.x = 100;
        this.y = -40;
        this.text = BOSS_WORD;
        this.maxHealth = this.text.length;
        this.health = this.maxHealth;
        this.speed = 0.3; 
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.font = '26px Courier New';
        ctx.fillStyle = '#ff4444';
        ctx.fillText(this.text, this.x, this.y);

        ctx.fillStyle = '#333';
        ctx.fillRect(200, 20, 400, 12);

        ctx.fillStyle = '#ff4444';
        ctx.fillRect(
            200,
            20,
            (this.health / this.maxHealth) * 400,
            12
        );
    }
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    enemies.push(new Enemy(x, -20, text));
}

function spawnBoss() {
    boss = new Boss();
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();

    if (boss) {
        if (boss.text[0]?.toLowerCase() === key) {
            boss.text = boss.text.slice(1);
            boss.health--;

            if (boss.health <= 0) {
                boss = null;
                nextBossScore += 1000;
            }
        }
        return;
    }

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0]?.toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
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

    if (!boss && score >= nextBossScore) {
        enemies = [];
        spawnBoss();
    }

    if (!boss && timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
        if (spawnRate > 500) spawnRate -= 10;
    }

    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();
        if (enemy.y > canvas.height) gameOver();
    });

    if (boss) {
        boss.update();
        boss.draw();
        if (boss.y > canvas.height) gameOver();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
