const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hud = document.getElementById("hud");

const lifeText = document.getElementById("life");
const waveText = document.getElementById("wave");
const scoreText = document.getElementById("score");

const menu = document.getElementById("menu");
const gameOverScreen =
document.getElementById("gameOver");

const finalScore =
document.getElementById("finalScore");

const player = {

  x: canvas.width/2,
  y: canvas.height/2,

  size:35,

  speed:5,

  color:"#00e5ff",

  life:10,

  damage:1,

  attackCooldown:0,
  skillCooldown:0,
  explosionCooldown:0,
  berserkCooldown:0,
  dashCooldown:0,

  attacking:false,
  usingSkill:false
};

let keys = {};

let enemies = [];

let score = 0;
let wave = 1;

let screenShake = 0;

let gameStarted = false;

const maps = [

  {
    name:"LAVA",
    bg:"#2a0000",
    wall:"#3a3a3a",

    walls:[
      {x:300,y:100,width:40,height:500},
      {x:700,y:0,width:40,height:400},
      {x:1000,y:200,width:40,height:500},
    ]
  },

  {
    name:"CYBER",
    bg:"#000a1f",
    wall:"#0044ff",

    walls:[
      {x:200,y:200,width:700,height:40},
      {x:200,y:500,width:700,height:40},
      {x:500,y:200,width:40,height:340},
    ]
  },

  {
    name:"VOID",
    bg:"#12001f",
    wall:"#6f00ff",

    walls:[
      {x:150,y:150,width:40,height:600},
      {x:400,y:0,width:40,height:500},
      {x:700,y:250,width:40,height:500},
      {x:1000,y:100,width:40,height:600},
    ]
  }

];

const currentMap =
maps[Math.floor(Math.random()*maps.length)];

document.addEventListener("keydown", e => {

  keys[e.key.toLowerCase()] = true;

  if(!gameStarted) return;

  if(e.key.toLowerCase() === "e"){
    attack();
  }

  if(e.key === "1"){
    slash();
  }

  if(e.key === "2"){
    explosion();
  }

  if(e.key === "3"){
    berserk();
  }

  if(e.key.toLowerCase() === "q"){
    dash();
  }

});

document.addEventListener("keyup", e => {

  keys[e.key.toLowerCase()] = false;

});

function startGame(){

  menu.style.display = "none";

  canvas.style.display = "block";

  hud.style.display = "flex";

  gameStarted = true;

  spawnWave();
}

function restartGame(){
  location.reload();
}

function saveGame(){

  localStorage.setItem("arenaScore",score);

}

function loadGame(){

  const save =
  localStorage.getItem("arenaScore");

  if(save){

    score = parseInt(save);

  }

  startGame();
}

function spawnWave(){

  for(let i=0;i<wave*3;i++){

    spawnEnemy();

  }

  if(wave % 5 === 0){

    enemies.push({

      x:100,
      y:100,

      size:80,

      speed:1,

      life:20,

      damage:3,

      boss:true,

      color:"#ff9900",

      knockbackX:0,
      knockbackY:0
    });

  }

}

function spawnEnemy(){

  let side =
  Math.floor(Math.random()*4);

  let x;
  let y;

  if(side === 0){
    x = 0;
    y = Math.random()*canvas.height;
  }

  if(side === 1){
    x = canvas.width;
    y = Math.random()*canvas.height;
  }

  if(side === 2){
    x = Math.random()*canvas.width;
    y = 0;
  }

  if(side === 3){
    x = Math.random()*canvas.width;
    y = canvas.height;
  }

  enemies.push({

    x,
    y,

    size:30,

    speed:2,

    life:3,

    damage:1,

    boss:false,

    color:"#ff0044",

    knockbackX:0,
    knockbackY:0
  });
}

function attack(){

  if(player.attackCooldown > 0)
  return;

  player.attackCooldown = 30;

  player.attacking = true;

  damageEnemies(100,player.damage);

  setTimeout(()=>{
    player.attacking = false;
  },100);

}

function slash(){

  if(player.skillCooldown > 0)
  return;

  player.skillCooldown = 300;

  player.usingSkill = true;

  damageEnemies(180,5);

  setTimeout(()=>{
    player.usingSkill = false;
  },300);
}

function explosion(){

  if(player.explosionCooldown > 0)
  return;

  player.explosionCooldown = 500;

  damageEnemies(260,10);

  screenShake = 20;
}

function berserk(){

  if(player.berserkCooldown > 0)
  return;

  player.berserkCooldown = 900;

  player.damage = 4;

  player.speed = 8;

  player.color = "#ff2222";

  setTimeout(()=>{

    player.damage = 1;

    player.speed = 5;

    player.color = "#00e5ff";

  },5000);
}

function dash(){

  if(player.dashCooldown > 0)
  return;

  player.dashCooldown = 120;

  let dx = 0;
  let dy = 0;

  if(keys["w"]) dy = -1;
  if(keys["s"]) dy = 1;
  if(keys["a"]) dx = -1;
  if(keys["d"]) dx = 1;

  player.x += dx * 180;
  player.y += dy * 180;

  screenShake = 10;
}

function damageEnemies(range,damage){

  enemies.forEach(enemy=>{

    const dx = enemy.x-player.x;
    const dy = enemy.y-player.y;

    const dist =
    Math.sqrt(dx*dx+dy*dy);

    if(dist < range){

      enemy.life -= damage;

      enemy.knockbackX = dx*0.2;
      enemy.knockbackY = dy*0.2;

      if(enemy.life <= 0){

        score += enemy.boss ? 200 : 10;

        enemies.splice(
          enemies.indexOf(enemy),
          1
        );

      }

    }

  });

}

function update(){

  let oldX = player.x;
  let oldY = player.y;

  if(keys["w"]) player.y -= player.speed;
  if(keys["s"]) player.y += player.speed;
  if(keys["a"]) player.x -= player.speed;
  if(keys["d"]) player.x += player.speed;

  currentMap.walls.forEach(wall=>{

    if(
      player.x + player.size/2 > wall.x &&
      player.x - player.size/2 <
      wall.x + wall.width &&
      player.y + player.size/2 > wall.y &&
      player.y - player.size/2 <
      wall.y + wall.height
    ){

      player.x = oldX;
      player.y = oldY;

    }

  });

  enemies.forEach(enemy=>{

    const dx = player.x-enemy.x;
    const dy = player.y-enemy.y;

    const dist =
    Math.sqrt(dx*dx+dy*dy);

    let moveX =
    (dx/dist)*enemy.speed;

    let moveY =
    (dy/dist)*enemy.speed;

    enemy.x += moveX;
    enemy.y += moveY;

    currentMap.walls.forEach(wall=>{

      if(
        enemy.x + enemy.size/2 > wall.x &&
        enemy.x - enemy.size/2 <
        wall.x + wall.width &&
        enemy.y + enemy.size/2 > wall.y &&
        enemy.y - enemy.size/2 <
        wall.y + wall.height
      ){

        enemy.x -= moveX*2;

        enemy.y -= moveY*2;

        enemy.x += Math.random()*6-3;
        enemy.y += Math.random()*6-3;
      }

    });

    enemy.x += enemy.knockbackX;
    enemy.y += enemy.knockbackY;

    enemy.knockbackX *= 0.9;
    enemy.knockbackY *= 0.9;

    if(dist < player.size){

      player.life -= enemy.damage;

      screenShake = 8;

    }

  });

  for(let i=0;i<enemies.length;i++){

    for(let j=i+1;j<enemies.length;j++){

      let a = enemies[i];
      let b = enemies[j];

      let dx = b.x-a.x;
      let dy = b.y-a.y;

      let dist =
      Math.sqrt(dx*dx+dy*dy);

      let minDist = a.size;

      if(dist < minDist){

        let angle =
        Math.atan2(dy,dx);

        let force =
        (minDist-dist)*0.1;

        a.x -= Math.cos(angle)*force;
        a.y -= Math.sin(angle)*force;

        b.x += Math.cos(angle)*force;
        b.y += Math.sin(angle)*force;
      }

    }

  }

  if(enemies.length <= 0){

    wave++;

    saveGame();

    spawnWave();

  }

  if(player.attackCooldown>0)
  player.attackCooldown--;

  if(player.skillCooldown>0)
  player.skillCooldown--;

  if(player.explosionCooldown>0)
  player.explosionCooldown--;

  if(player.berserkCooldown>0)
  player.berserkCooldown--;

  if(player.dashCooldown>0)
  player.dashCooldown--;

  lifeText.innerText =
  `❤️ ${player.life}`;

  waveText.innerText =
  `🌊 ${wave}`;

  scoreText.innerText =
  `⭐ ${score}`;

  document.getElementById("barE").style.width =
  `${100-(player.attackCooldown/30)*100}%`;

  document.getElementById("barQ").style.width =
  `${100-(player.dashCooldown/120)*100}%`;

  document.getElementById("bar1").style.width =
  `${100-(player.skillCooldown/300)*100}%`;

  document.getElementById("bar2").style.width =
  `${100-(player.explosionCooldown/500)*100}%`;

  document.getElementById("bar3").style.width =
  `${100-(player.berserkCooldown/900)*100}%`;

  if(player.life <= 0){

    gameStarted = false;

    gameOverScreen.style.display =
    "flex";

    finalScore.innerText =
    `Wave ${wave} | Score ${score}`;

  }

  if(screenShake > 0){

    screenShake *= 0.9;

  }

}

function draw(){

  ctx.save();

  const shakeX =
  (Math.random()-0.5)*screenShake;

  const shakeY =
  (Math.random()-0.5)*screenShake;

  ctx.translate(shakeX,shakeY);

  ctx.fillStyle = currentMap.bg;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  currentMap.walls.forEach(wall=>{

    ctx.shadowBlur = 20;

    ctx.shadowColor = currentMap.wall;

    ctx.fillStyle = currentMap.wall;

    ctx.fillRect(
      wall.x,
      wall.y,
      wall.width,
      wall.height
    );

  });

  enemies.forEach(enemy=>{

    ctx.shadowBlur = 20;

    ctx.shadowColor = enemy.color;

    ctx.fillStyle = enemy.color;

    ctx.fillRect(
      enemy.x-enemy.size/2,
      enemy.y-enemy.size/2,
      enemy.size,
      enemy.size
    );

  });

  ctx.shadowBlur = 25;

  ctx.shadowColor = player.color;

  ctx.fillStyle = player.color;

  ctx.fillRect(
    player.x-player.size/2,
    player.y-player.size/2,
    player.size,
    player.size
  );

  if(player.attacking){

    ctx.beginPath();

    ctx.strokeStyle = "white";

    ctx.lineWidth = 8;

    ctx.arc(
      player.x,
      player.y,
      70,
      0,
      Math.PI*1.5
    );

    ctx.stroke();

  }

  if(player.usingSkill){

    ctx.beginPath();

    ctx.strokeStyle = "#00ffff";

    ctx.lineWidth = 15;

    ctx.arc(
      player.x,
      player.y,
      150,
      0,
      Math.PI*2
    );

    ctx.stroke();

  }

  ctx.restore();

}

function gameLoop(){

  if(gameStarted){

    update();

    draw();

  }

  requestAnimationFrame(gameLoop);

}

gameLoop();