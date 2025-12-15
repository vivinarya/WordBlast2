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
let isBossActive = false;
let nextBossScore = 1000;

const bossWordList = [
    "Supercalifragilisticexpialidocious",
    "Pseudopseudohypoparathyroidism",
    "Floccinaucinihilipilification",
    "Antidisestablishmentarianism"
];


const wordList = [
    "code", "bug", "fix", "git", "push", "pull", "merge", 
    "java", "node", "html", "css", "react", "vue", "data",
    "loop", "if", "else", "var", "let", "const", "array"
];


let enemies = [];

class Enemy {
    constructor(x, y, text, isBoss = false) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.isBoss = isBoss;
        this.speed = isBoss ? 0.5 : 1 + Math.random(); 
        this.color = isBoss ? '#ff0000' : '#0f0';
        this.originalText = text;
    }

    draw() {
        ctx.font = this.isBoss ? 'bold 24px Courier New' : '20px Courier New';
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);

        if (this.isBoss) {
            const healthPercentage = this.text.length / this.originalText.length;
            const barWidth = 200;
            const barHeight = 10;
            
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.x, this.y - 30, barWidth, barHeight);
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 30, barWidth * healthPercentage, barHeight);
        }
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

function spawnBoss() {
    const text = bossWordList[Math.floor(Math.random() * bossWordList.length)];
    const x = 50; 
    const y = -50; 
    enemies.push(new Enemy(x, y, text, true));
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
                if (enemies[i].isBoss) {
                    isBossActive = false;
                    score += 100;
                } else {
                    score += 10;
                }
                enemies.splice(i, 1);
                scoreElement.innerText = score;
            }
            break;
        }
    }
});

function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (!isBossActive && score >= nextBossScore) {
        spawnBoss();
        isBossActive = true;
        nextBossScore += 1000;
    } else if (!isBossActive && timestamp - lastSpawnTime > spawnRate) {
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

    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);