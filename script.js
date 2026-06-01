const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const lifeText = document.getElementById("life");
const waveText = document.getElementById("wave");
const scoreText = document.getElementById("score");

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 30,
  speed: 5,
  life: 100,
  color: "#00f0ff"
};

let keys = {};
let enemies = [];
let bullets = [];
let score = 0;
let wave = 1;

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

document.addEventListener("click", shoot);

function shoot() {
  bullets.push({
    x: player.x,
    y: player.y,
    size: 8,
    speed: 10
  });
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 25,
    speed: 1 + wave * 0.2,
    life: 3
  });
}

function update() {

  // Movimento
  if(keys["w"]) player.y -= player.speed;
  if(keys["s"]) player.y += player.speed;
  if(keys["a"]) player.x -= player.speed;
  if(keys["d"]) player.x += player.speed;

  // Bullets
  bullets.forEach((b, i) => {
    b.y -= b.speed;

    if(b.y < 0){
      bullets.splice(i,1);
    }
  });

  // Inimigos
  enemies.forEach((enemy, ei) => {

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    enemy.x += dx/dist * enemy.speed;
    enemy.y += dy/dist * enemy.speed;

    // Dano player
    if(dist < player.size){
      player.life -= 0.2;
    }

    // Colisão bala
    bullets.forEach((b, bi) => {

      const bdx = b.x - enemy.x;
      const bdy = b.y - enemy.y;
      const bdist = Math.sqrt(bdx*bdx + bdy*bdy);

      if(bdist < enemy.size){
        enemy.life--;

        bullets.splice(bi,1);

        if(enemy.life <= 0){
          enemies.splice(ei,1);
          score += 10;
        }
      }
    });
  });

  // Nova wave
  if(enemies.length === 0){
    wave++;

    for(let i=0;i<wave*3;i++){
      spawnEnemy();
    }
  }

  // HUD
  lifeText.innerText = `❤️ Vida: ${Math.floor(player.life)}`;
  waveText.innerText = `🌊 Wave: ${wave}`;
  scoreText.innerText = `⭐ Score: ${score}`;

  // Game Over
  if(player.life <= 0){
    alert(`Game Over!\nScore: ${score}`);
    location.reload();
  }
}

function draw() {

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.x - player.size/2,
    player.y - player.size/2,
    player.size,
    player.size
  );

  // Bullets
  ctx.fillStyle = "#ffff00";

  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
    ctx.fill();
  });

  // Enemies
  ctx.fillStyle = "#ff0033";

  enemies.forEach(enemy => {
    ctx.fillRect(
      enemy.x - enemy.size/2,
      enemy.y - enemy.size/2,
      enemy.size,
      enemy.size
    );
  });
}

function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start
for(let i=0;i<3;i++){
  spawnEnemy();
}

gameLoop();