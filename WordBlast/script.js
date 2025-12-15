const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const mobileInput = document.getElementById('mobileInput');

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

/* --------------------
   Enemy Class
-------------------- */
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

/* --------------------
   Helpers
-------------------- */
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

/* --------------------
   Unified Input Handler
-------------------- */
function handleInput(key) {
    if (isGameOver) return;

    key = key.toLowerCase();

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
}

/* --------------------
   Desktop Keyboard
-------------------- */
window.addEventListener('keydown', (e) => {
    handleInput(e.key);
});

/* --------------------
   Mobile Keyboard Support
-------------------- */
canvas.addEventListener('touchstart', () => {
    mobileInput.focus();
});

mobileInput.addEventListener('input', () => {
    const value = mobileInput.value;
    if (value.length > 0) {
        handleInput(value[value.length - 1]);
        mobileInput.value = "";
    }
});

/* --------------------
   Game Loop
-------------------- */
function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
        if (spawnRate > 500) spawnRate -= 10;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        enemy.draw();

        if (enemy.y > canvas.height) {
            gameOver();
        }
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
