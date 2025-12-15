const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const livesElement = document.getElementById('lives');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let level = 1;
let lives = 3;
let isGameOver = false;
let isPaused = false;
let spawnRate = 2000;
let lastSpawnTime = 0;
let levelUpAlpha = 0;
let lockedEnemy = null;

const MIN_X_DISTANCE = 80;

const wordList = [
    "code", "bug", "fix", "git", "push", "pull", "merge",
    "java", "node", "html", "css", "react", "vue", "data",
    "loop", "if", "else", "var", "let", "const", "array"
];

let enemies = [];

class Enemy {
    constructor(x, y, text, speed) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.speed = speed;
        this.color = '#0f0';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.font = '20px Courier New';
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }
}

function isTooClose(x) {
    return enemies.some(enemy => Math.abs(enemy.x - x) < MIN_X_DISTANCE);
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    let x;
    let attempts = 0;

    do {
        x = Math.random() * (canvas.width - 100) + 50;
        attempts++;
    } while (isTooClose(x) && attempts < 10);

    const speed = 1 + level * 0.8;
    enemies.push(new Enemy(x, -20, text, speed));
}

function updateLivesUI() {
    livesElement.innerText = '❤️ '.repeat(lives).trim();
}

function loseLife() {
    lives--;
    updateLivesUI();
    lockedEnemy = null;
    if (lives <= 0) gameOver();
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelUpAlpha = 1;
        spawnRate = Math.max(500, spawnRate - 200);
    }
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'escape') {
        if (!isGameOver) isPaused = !isPaused;
        return;
    }

    if (isGameOver || isPaused) return;

    if (lockedEnemy) {
        if (lockedEnemy.text[0]?.toLowerCase() === key) {
            lockedEnemy.text = lockedEnemy.text.slice(1);

            if (lockedEnemy.text === "") {
                enemies.splice(enemies.indexOf(lockedEnemy), 1);
                lockedEnemy = null;
                score += 10;
                scoreElement.innerText = score;
                checkLevelUp();
            }
        }
        return;
    }

    for (let enemy of enemies) {
        if (enemy.text[0]?.toLowerCase() === key) {
            lockedEnemy = enemy;
            enemy.color = '#fff';
            enemy.text = enemy.text.slice(1);
            break;
        }
    }
});

function drawLevelUp() {
    if (levelUpAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = levelUpAlpha;
    ctx.fillStyle = '#0f0';
    ctx.font = '48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${level}!`, canvas.width / 2, canvas.height / 2);
    ctx.restore();

    levelUpAlpha -= 0.02;
}

function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isPaused) {
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Courier New';
        ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 40);
        requestAnimationFrame(gameLoop);
        return;
    }

    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        enemy.draw();

        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            loseLife();
        }
    }

    drawLevelUp();
    requestAnimationFrame(gameLoop);
}

updateLivesUI();
requestAnimationFrame(gameLoop);
