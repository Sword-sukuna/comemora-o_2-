const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const lifeText = document.getElementById("life");
const waveText = document.getElementById("wave");
const scoreText = document.getElementById("score");
const skillText = document.getElementById("skill");

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,

  size: 35,
  speed: 5,

  color: "#00e5ff",

  life: 100,

  damage: 1,

  attackCooldown: 0,
  skillCooldown: 0,

  attacking: false,
  usingSkill: false
};

let keys = {};

let enemies = [];

let score = 0;
let wave = 1;

let screenShake = 0;

document.addEventListener("keydown", e => {

  keys[e.key.toLowerCase()] = true;

  if(e.key.toLowerCase() === "e"){
    attack();
  }

  if(e.key === "1"){
    skill();
  }

});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function spawnEnemy(){

  let side = Math.floor(Math.random() * 4);

  let x,y;

  if(side === 0){
    x = 0;
    y = Math.random() * canvas.height;
  }

  if(side === 1){
    x = canvas.width;
    y = Math.random() * canvas.height;
  }

  if(side === 2){
    x = Math.random() * canvas.width;
    y = 0;
  }

  if(side === 3){
    x = Math.random() * canvas.width;
    y = canvas.height;
  }

  enemies.push({
    x,
    y,

    size: 30,

    speed: 1 + wave * 0.15,

    life: 3,

    color:"#ff0044",

    knockbackX:0,
    knockbackY:0
  });
}

function attack(){

  if(player.attackCooldown > 0) return;

  player.attacking = true;

  player.attackCooldown = 25;

  screenShake = 5;

  enemies.forEach(enemy => {

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;

    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < 100){

      enemy.life -= player.damage;

      enemy.knockbackX = dx * 0.15;
      enemy.knockbackY = dy * 0.15;

      if(enemy.life <= 0){

        score += 10;

        enemies.splice(enemies.indexOf(enemy),1);
      }
    }
  });

  setTimeout(() => {
    player.attacking = false;
  },100);

}

function skill(){

  if(player.skillCooldown > 0) return;

  player.usingSkill = true;

  player.skillCooldown = 300;

  screenShake = 15;

  enemies.forEach(enemy => {

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;

    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < 180){

      enemy.life -= 5;

      enemy.knockbackX = dx * 0.4;
      enemy.knockbackY = dy * 0.4;

      if(enemy.life <= 0){

        score += 20;

        enemies.splice(enemies.indexOf(enemy),1);
      }
    }
  });

  setTimeout(() => {
    player.usingSkill = false;
  },300);
}

function update(){

  if(keys["w"]) player.y -= player.speed;
  if(keys["s"]) player.y += player.speed;
  if(keys["a"]) player.x -= player.speed;
  if(keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));

  if(player.attackCooldown > 0){
    player.attackCooldown--;
  }

  if(player.skillCooldown > 0){
    player.skillCooldown--;
  }

  enemies.forEach(enemy => {

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;

    const dist = Math.sqrt(dx*dx + dy*dy);

    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;

    enemy.x += enemy.knockbackX;
    enemy.y += enemy.knockbackY;

    enemy.knockbackX *= 0.9;
    enemy.knockbackY *= 0.9;

    if(dist < player.size){

      player.life -= 0.15;

      screenShake = 3;
    }

  });

  if(enemies.length === 0){

    wave++;

    for(let i=0;i<wave*3;i++){
      spawnEnemy();
    }
  }

  lifeText.innerText = `❤️ Vida: ${Math.floor(player.life)}`;
  waveText.innerText = `🌊 Wave: ${wave}`;
  scoreText.innerText = `⭐ Score: ${score}`;

  if(player.skillCooldown <= 0){
    skillText.innerText = `⚡ Skill: READY`;
  }else{
    skillText.innerText = `⚡ Skill: ${Math.floor(player.skillCooldown / 60)}s`;
  }

  if(player.life <= 0){

    alert(`GAME OVER\n\nWave: ${wave}\nScore: ${score}`);

    location.reload();
  }

  if(screenShake > 0){
    screenShake *= 0.9;
  }

}

function draw(){

  ctx.save();

  const shakeX = (Math.random() - 0.5) * screenShake;
  const shakeY = (Math.random() - 0.5) * screenShake;

  ctx.translate(shakeX, shakeY);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  enemies.forEach(enemy => {

    ctx.shadowBlur = 20;
    ctx.shadowColor = enemy.color;

    ctx.fillStyle = enemy.color;

    ctx.fillRect(
      enemy.x - enemy.size/2,
      enemy.y - enemy.size/2,
      enemy.size,
      enemy.size
    );

  });

  ctx.shadowBlur = 25;
  ctx.shadowColor = player.color;

  ctx.fillStyle = player.color;

  ctx.fillRect(
    player.x - player.size/2,
    player.y - player.size/2,
    player.size,
    player.size
  );

  // ATAQUE
  if(player.attacking){

    ctx.beginPath();

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 8;

    ctx.arc(
      player.x,
      player.y,
      70,
      0,
      Math.PI * 1.5
    );

    ctx.stroke();
  }

  // SKILL
  if(player.usingSkill){

    ctx.beginPath();

    ctx.strokeStyle = "#00ffff";

    ctx.lineWidth = 15;

    ctx.arc(
      player.x,
      player.y,
      150,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.restore();
}

function gameLoop(){

  update();

  draw();

  requestAnimationFrame(gameLoop);
}

for(let i=0;i<5;i++){
  spawnEnemy();
}

gameLoop();