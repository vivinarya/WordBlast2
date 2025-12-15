const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("final-score");
const gameOverScreen = document.getElementById("game-over");

canvas.width = 800;
canvas.height = 600;

let score = 0;
let isGameOver = false;
let startTime = null;
let wordsDestroyed = 0;
let spawnRate = 2000;
let lastSpawnTime = 0;

// --------------------
// Settings (localStorage)
// --------------------
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettings = document.getElementById("close-settings");
const soundToggle = document.getElementById("sound-toggle");
const themeSelect = document.getElementById("theme-select");
const difficultySelect = document.getElementById("difficulty-select");

const settings = JSON.parse(localStorage.getItem("wordblast-settings")) || {
    sound: true,
    theme: "dark",
    difficulty: "medium"
};

soundToggle.checked = settings.sound;
themeSelect.value = settings.theme;
difficultySelect.value = settings.difficulty;

function applySettings() {
    document.body.classList.toggle("light", settings.theme === "light");

    if (settings.difficulty === "easy") spawnRate = 2500;
    if (settings.difficulty === "medium") spawnRate = 2000;
    if (settings.difficulty === "hard") spawnRate = 1200;
}

function saveSettings() {
    localStorage.setItem("wordblast-settings", JSON.stringify(settings));
}

applySettings();

settingsBtn.onclick = () => settingsModal.classList.remove("hidden");
closeSettings.onclick = () => settingsModal.classList.add("hidden");

soundToggle.onchange = () => {
    settings.sound = soundToggle.checked;
    saveSettings();
};

themeSelect.onchange = () => {
    settings.theme = themeSelect.value;
    applySettings();
    saveSettings();
};

difficultySelect.onchange = () => {
    settings.difficulty = difficultySelect.value;
    applySettings();
    saveSettings();
};

// --------------------
// Game Logic
// --------------------
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
    }

    draw() {
        ctx.font = "20px Courier New";
        ctx.fillStyle = "#0f0";
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    enemies.push(new Enemy(x, -20, text));
}

function gameOver() {
    isGameOver = true;

    const elapsedMinutes = (performance.now() - startTime) / 60000;
    const wpm = elapsedMinutes > 0
        ? Math.round(wordsDestroyed / elapsedMinutes)
        : 0;

    finalScoreElement.innerText = score;

    const wpmElement = document.createElement("p");
    wpmElement.innerText = `Typing Speed: ${wpm} WPM`;
    gameOverScreen.appendChild(wpmElement);

    gameOverScreen.classList.remove("hidden");
}

window.addEventListener("keydown", (e) => {
    if (isGameOver) return;

    const key = e.key.toLowerCase();

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0]?.toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                enemies.splice(i, 1);
                score += 10;
                wordsDestroyed++;
                scoreElement.innerText = score;
            }
            break;
        }
    }
});

function gameLoop(timestamp) {
    if (isGameOver) return;
    if (!startTime) startTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
    }

    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();

        if (enemy.y > canvas.height) {
            gameOver();
        }
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
