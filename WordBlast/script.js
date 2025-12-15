//  BASIC GAME STATE
let score = 0;
let enemies = [];
let boss = null;
let isBossFight = false;

const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");

const bossContainer = document.getElementById("bossContainer");
const bossHealthBar = document.getElementById("bossHealth");

//  NORMAL ENEMY 
function spawnEnemy() {
    if (isBossFight) return;

    const word = getRandomWord();
    const enemy = {
        text: word,
        x: Math.random() * (gameArea.clientWidth - 100),
        y: 0,
        speed: 2
    };

    enemies.push(enemy);
}

//  BOSS LOGIC 
function spawnBoss() {
    isBossFight = true;
    enemies = [];

    boss = {
        text: "Supercalifragilisticexpialidocious",
        x: gameArea.clientWidth / 2 - 120,
        y: 0,
        speed: 0.6,
        health: 100,
        maxHealth: 100
    };

    bossContainer.style.display = "block";
    updateBossHealth();
}

function updateBossHealth() {
    const percent = (boss.health / boss.maxHealth) * 100;
    bossHealthBar.style.width = percent + "%";
}

//  GAME UPDATE 
function updateGame() {
    // Move normal enemies
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
    });

    // Move boss
    if (boss) {
        boss.y += boss.speed;
    }

    checkBossTrigger();
}

//  SCORE CHECK 
function checkBossTrigger() {
    if (score > 0 && score % 1000 === 0 && !isBossFight) {
        spawnBoss();
    }
}

// TYPING INPUT
document.addEventListener("keydown", e => {
    const key = e.key;

    // Boss typing
    if (boss) {
        if (boss.text.startsWith(key)) {
            boss.text = boss.text.slice(1);
            boss.health -= 5;
            updateBossHealth();

            if (boss.health <= 0) {
                boss = null;
                isBossFight = false;
                bossContainer.style.display = "none";
                score += 100;
            }
        }
        return;
    }

    // Normal enemies typing
    enemies.forEach((enemy, index) => {
        if (enemy.text.startsWith(key)) {
            enemy.text = enemy.text.slice(1);

            if (enemy.text.length === 0) {
                enemies.splice(index, 1);
                score += 100;
            }
        }
    });

    scoreDisplay.innerText = score;
});

//  DRAW function added 
function draw() {
    gameArea.innerHTML = "";

    enemies.forEach(enemy => {
        const el = document.createElement("div");
        el.innerText = enemy.text;
        el.style.position = "absolute";
        el.style.left = enemy.x + "px";
        el.style.top = enemy.y + "px";
        gameArea.appendChild(el);
    });

    if (boss) {
        const bossEl = document.createElement("div");
        bossEl.innerText = boss.text;
        bossEl.style.position = "absolute";
        bossEl.style.left = boss.x + "px";
        bossEl.style.top = boss.y + "px";
        bossEl.style.fontSize = "22px";
        bossEl.style.fontWeight = "bold";
        gameArea.appendChild(bossEl);
    }
}

//HELPERS i added 
function getRandomWord() {
    const words = ["code", "game", "fast", "logic", "type", "play"];
    return words[Math.floor(Math.random() * words.length)];
}

// GAME LOOP I ADDED
setInterval(() => {
    spawnEnemy();
}, 1200);

setInterval(() => {
    updateGame();
    draw();
    scoreDisplay.innerText = score;
}, 30);
