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
//new boss variables
let boss = null;
let isBossFight = false;
let nextBossScore = 1000;



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
        this.x = canvas.width / 2 - 150;
        this.y = 50;
        this.text = text;
        this.maxHealth = text.length;
        this.health = text.length;
        this.speed = 0.3; //makes it slower than enemies
    }

    draw(){
        ctx.font = '28px Courier New';
        ctx.fillStyle = '#ff3333';
        ctx.fillText(this.text, this.x, this.y);

        // health bar for boss words
        const barWidth = 300;
        const barHeight = 15;
        const healthRatio = this.health / this.maxHealth;

        ctx.fillStyle = '#555';
        ctx.fillRect(this.x, this.y - 30, barWidth, barHeight);

        ctx.fillStyle = '#ff3333';
        ctx.fillRect(this.x, this.y - 30, barWidth * healthRatio, barHeight);
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

function spawnBoss() { //spawns boss words
    isBossFight = true;
    enemies = []; 
    boss = new Boss("supercalifragilisticexpialidocious");
}


function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}


window.addEventListener('keydown', (e) => {
    if (isGameOver) return;

    const key = e.key.toLowerCase();

    //Boss typing specifications
    if (isBossFight && boss) {
        if (boss.text[0].toLowerCase() === key) {
            boss.text = boss.text.slice(1);
            boss.health--;

            if (boss.text.length === 0) {
                boss = null;
                isBossFight = false;
                nextBossScore += 1000;
            }
        }
        return;
    }

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0] && enemies[i].text[0].toLowerCase() === key) {
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

    //trigger boss at 1000 points
    if (score >= nextBossScore && !isBossFight) {
        spawnBoss();
    }

    //modified enemy spawning
    if (!isBossFight && timestamp - lastSpawnTime > spawnRate) {
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

    //update boss
    if (boss) {
        boss.update();
        boss.draw();

        if (boss.y > canvas.height) {
            gameOver();
        }
    }


    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);
