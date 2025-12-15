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

// Boss encounter state
let isBossActive = false;
let nextBossAt = 1000; // trigger every 1000 points
let boss = null;
const bossWords = [
    "Supercalifragilisticexpialidocious",
    "Antidisestablishmentarianism",
    "Pseudopseudohypoparathyroidism",
    "Floccinaucinihilipilification"
];

const wordList = [
    "code", "bug", "fix", "git", "push", "pull", "merge", 
    "java", "node", "html", "css", "react", "vue", "data",
    "loop", "if", "else", "var", "let", "const", "array"
];

let enemies = [];

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

class Boss {
    constructor(text) {
        this.text = text;
        this.maxHP = text.length;
        this.hp = text.length;
        this.speed = 0.3; // slower than regular enemies
        this.color = '#ff4d4f';
        // Start near top center
        this.y = -40;
        this.x = canvas.width / 2; // will center text in draw
    }
    update() {
        this.y += this.speed;
    }
    draw() {
        ctx.font = '28px Courier New';
        ctx.fillStyle = this.color;
        const metrics = ctx.measureText(this.text);
        const textWidth = metrics.width;
        const drawX = Math.max(20, Math.min(canvas.width - textWidth - 20, this.x - textWidth / 2));
        ctx.fillText(this.text, drawX, this.y);
    }
    drawHealthBar() {
        const barWidth = 320;
        const barHeight = 14;
        const x = (canvas.width - barWidth) / 2;
        const y = 20;
        const ratio = Math.max(0, this.hp / this.maxHP);
        // background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        // foreground
        ctx.fillStyle = '#ff4d4f';
        ctx.fillRect(x, y, barWidth * ratio, barHeight);
        // border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        // label
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#fff';
        ctx.fillText('BOSS', x + 6, y + barHeight - 3);
    }
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = -20; 
    enemies.push(new Enemy(x, y, text));
}

function spawnBoss() {
    // Clear current enemies to focus on the boss fight
    enemies = [];
    const text = bossWords[Math.floor(Math.random() * bossWords.length)];
    boss = new Boss(text);
    isBossActive = true;
}

function maybeTriggerBoss() {
    if (!isBossActive && score >= nextBossAt) {
        spawnBoss();
    }
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (isGameOver) return;

    const key = e.key.toLowerCase();

    // Boss input handling first
    if (isBossActive && boss) {
        const expected = boss.text[0] ? boss.text[0].toLowerCase() : '';
        if (expected && expected === key) {
            boss.text = boss.text.slice(1);
            boss.hp = Math.max(0, boss.hp - 1);
            // Small score for each correct boss hit
            score += 1;
            scoreElement.innerText = score;
            if (boss.hp === 0) {
                // Boss defeated
                // Bonus for defeating boss
                score += 50;
                scoreElement.innerText = score;
                isBossActive = false;
                boss = null;
                // Schedule next boss
                nextBossAt += 1000;
            }
        }
        // Do not process normal enemies when boss is active
        return;
    }

    // Normal enemies processing when no boss
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0] && enemies[i].text[0].toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                enemies.splice(i, 1);
                score += 10;
                scoreElement.innerText = score;
                maybeTriggerBoss();
            }
            break;
        }
    }
});

function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn only if no boss active
    if (!isBossActive && (timestamp - lastSpawnTime > spawnRate)) {
        spawnEnemy();
        lastSpawnTime = timestamp;
        if (spawnRate > 500) spawnRate -= 10;
    }

    // Update & draw
    if (isBossActive && boss) {
        boss.update();
        boss.draw();
        boss.drawHealthBar();
        if (boss.y > canvas.height) {
            gameOver();
        }
    } else {
        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            enemy.update();
            enemy.draw();
            if (enemy.y > canvas.height) {
                gameOver();
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);