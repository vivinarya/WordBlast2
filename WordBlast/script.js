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
    "loop", "if", "else", "var", "let", "const", "array",
    "function", "object", "class", "method", "scope", "return",
    "string", "number", "boolean", "switch", "event", "listener",
    "react", "vue", "script", "style", "json", "api", "promise",
    "commit", "merge", "branch", "clone", "debug",
     "asynchronous", "synchronous", "polymorphism", "encapsulation",
    "inheritance", "abstraction", "multithreading", "concurrency",
    "serialization", "deserialization", "authentication",
    "authorization", "cryptography", "virtualization",
    "microservices", "containerization", "orchestration",
    "middleware", "architecture", "optimization",
    "recursion", "backtracking", "memoization",
    "normalization", "denormalization",
    "dependency", "immutability", "responsiveness",
];


let enemies = [];
let particle=[];

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
class Particle{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.radius=Math.random()*3+2;
        this.speedx=(Math.random()-0.5)*6;
        this.speedy=(Math.random()-0.5)*6;
        this.alpha=1;
        this.friction=0.98;
        this.fade=0.03;
    }

    update(){
        this.speedx*=this.friction;
        this.speedy*=this.friction;
        this.x+=this.speedx;
        this.y+=this.speedy;
        this.alpha-=this.fade;
    }

    draw(){
        ctx.save();
        ctx.globalAlpha=this.alpha;
        ctx.fillStyle="#00ff88";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = -20; 
    enemies.push(new Enemy(x, y, text));
}

function spawnparticles(x,y){
    for (let i=0;i<20;i++){
        particle.push(new Particle(x,y));
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

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0] && enemies[i].text[0].toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                spawnparticles(enemies[i].x,enemies[i].y);
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

    for (let i=particle.length-1;i>=0;i--){
        let p=particle[i];
        p.update();
        p.draw();
        if (p.alpha<=0){
            particle.splice(i,1);
        }
    }

    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);