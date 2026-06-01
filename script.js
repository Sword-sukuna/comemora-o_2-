const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hud = document.getElementById("hud");

const lifeText = document.getElementById("life");
const floorText = document.getElementById("floor");
const roomText = document.getElementById("room");
const scoreText = document.getElementById("score");

const finalText =
document.getElementById("finalText");

const menu =
document.getElementById("menu");

const gameOver =
document.getElementById("gameOver");

let gameStarted = false;

let keys = {};

let score = 0;

let floor = 1;
let room = 1;

let screenShake = 0;

let selectedClass = "samurai";

const player = {

  x:400,
  y:300,

  size:35,

  speed:5,

  color:"#00e5ff",

  damage:1,

  maxLife:10,
  life:10,

  attackCooldown:0,
  dashCooldown:0,
  skillCooldown:0,

  attacking:false
};

const dungeonRooms = [

  {
    type:"combat",

    theme:"lava",

    walls:[
      {x:300,y:100,width:40,height:500},
      {x:700,y:0,width:40,height:400},
      {x:1000,y:200,width:40,height:500},
    ],

    enemies:5
  },

  {
    type:"elite",

    theme:"cyber",

    walls:[
      {x:200,y:200,width:700,height:40},
      {x:200,y:500,width:700,height:40},
      {x:500,y:200,width:40,height:340},
    ],

    enemies:8
  },

  {
    type:"treasure",

    theme:"void",

    walls:[
      {x:150,y:150,width:40,height:600},
      {x:400,y:0,width:40,height:500},
      {x:700,y:250,width:40,height:500},
      {x:1000,y:100,width:40,height:600},
    ],

    enemies:0
  }

];

let currentRoom =
dungeonRooms[0];

let enemies = [];

document.addEventListener("keydown",e=>{

  keys[e.key.toLowerCase()] = true;

  if(!gameStarted) return;

  if(e.key.toLowerCase() === "e"){
    attack();
  }

  if(e.key.toLowerCase() === "q"){
    dash();
  }

  if(e.key === "1"){
    skill();
  }

});

document.addEventListener("keyup",e=>{

  keys[e.key.toLowerCase()] = false;

});

function chooseClass(type){

  selectedClass = type;

  if(type === "samurai"){

    player.damage = 2;
    player.speed = 5;

  }

  if(type === "rogue"){

    player.damage = 1;

    player.speed = 8;

  }

  if(type === "mage"){

    player.damage = 4;

    player.speed = 4;

  }

}

function startGame(){

  menu.style.display = "none";

  canvas.style.display = "block";

  hud.style.display = "flex";

  gameStarted = true;

  loadRoom();

}

function saveGame(){

  localStorage.setItem(
    "arenaSave",

    JSON.stringify({

      score,
      floor,
      room,
      selectedClass,
      life:player.life

    })

  );

}

function loadGame(){

  const save =
  JSON.parse(
    localStorage.getItem("arenaSave")
  );

  if(save){

    score = save.score;

    floor = save.floor;

    room = save.room;

    selectedClass =
    save.selectedClass;

    player.life = save.life;

  }

  startGame();

}

function loadRoom(){

  enemies = [];

  currentRoom =
  dungeonRooms[
    Math.floor(
      Math.random() *
      dungeonRooms.length
    )
  ];

  for(let i=0;i<currentRoom.enemies;i++){

    spawnEnemy();

  }

}

function nextRoom(){

  room++;

  if(room > 5){

    floor++;

    room = 1;

  }

  saveGame();

  loadRoom();

}

function spawnEnemy(){

  let x =
  Math.random() *
  canvas.width;

  let y =
  Math.random() *
  canvas.height;

  enemies.push({

    x,
    y,

    size:30,

    speed:2,

    life:3,

    damage:1,

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

  player.x += dx * 200;
  player.y += dy * 200;

  screenShake = 10;

}

function skill(){

  if(player.skillCooldown > 0)
  return;

  player.skillCooldown = 300;

  damageEnemies(220,6);

  screenShake = 20;

}

function damageEnemies(range,damage){

  enemies.forEach(enemy=>{

    const dx =
    enemy.x-player.x;

    const dy =
    enemy.y-player.y;

    const dist =
    Math.sqrt(dx*dx+dy*dy);

    if(dist < range){

      enemy.life -= damage;

      enemy.knockbackX = dx*0.2;
      enemy.knockbackY = dy*0.2;

      if(enemy.life <= 0){

        score += 10;

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

  if(keys["w"])
  player.y -= player.speed;

  if(keys["s"])
  player.y += player.speed;

  if(keys["a"])
  player.x -= player.speed;

  if(keys["d"])
  player.x += player.speed;

  currentRoom.walls.forEach(wall=>{

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

    const dx =
    player.x-enemy.x;

    const dy =
    player.y-enemy.y;

    const dist =
    Math.sqrt(dx*dx+dy*dy);

    let moveX =
    (dx/dist)*enemy.speed;

    let moveY =
    (dy/dist)*enemy.speed;

    enemy.x += moveX;
    enemy.y += moveY;

    currentRoom.walls.forEach(wall=>{

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

        enemy.x += Math.random()*8-4;
        enemy.y += Math.random()*8-4;

      }

    });

    enemy.x += enemy.knockbackX;
    enemy.y += enemy.knockbackY;

    enemy.knockbackX *= 0.9;
    enemy.knockbackY *= 0.9;

    if(dist < player.size){

      player.life -= enemy.damage;

      screenShake = 10;

    }

  });

  if(enemies.length <= 0){

    nextRoom();

  }

  if(player.attackCooldown > 0)
  player.attackCooldown--;

  if(player.dashCooldown > 0)
  player.dashCooldown--;

  if(player.skillCooldown > 0)
  player.skillCooldown--;

  lifeText.innerText =
  `❤️ ${player.life}/${player.maxLife}`;

  floorText.innerText =
  `🏰 Floor ${floor}`;

  roomText.innerText =
  `🚪 Room ${room}`;

  scoreText.innerText =
  `⭐ ${score}`;

  document.getElementById("barE").style.width =
  `${100-(player.attackCooldown/30)*100}%`;

  document.getElementById("barQ").style.width =
  `${100-(player.dashCooldown/120)*100}%`;

  document.getElementById("bar1").style.width =
  `${100-(player.skillCooldown/300)*100}%`;

  if(player.life <= 0){

    gameStarted = false;

    gameOver.style.display = "flex";

    finalText.innerText =
    `Floor ${floor} | Score ${score}`;

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

  // fundo
  if(currentRoom.theme === "lava"){

    ctx.fillStyle = "#2a0000";

  }

  if(currentRoom.theme === "cyber"){

    ctx.fillStyle = "#000a1f";

  }

  if(currentRoom.theme === "void"){

    ctx.fillStyle = "#160025";

  }

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // decoração cyber
  if(currentRoom.theme === "cyber"){

    ctx.strokeStyle =
    "rgba(0,150,255,0.15)";

    for(let x=0;x<canvas.width;x+=50){

      ctx.beginPath();

      ctx.moveTo(x,0);

      ctx.lineTo(x,canvas.height);

      ctx.stroke();

    }

  }

  // paredes
  currentRoom.walls.forEach(wall=>{

    ctx.shadowBlur = 20;

    ctx.shadowColor = "#555";

    ctx.fillStyle = "#333";

    ctx.fillRect(
      wall.x,
      wall.y,
      wall.width,
      wall.height
    );

  });

  // inimigos
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

  // player
  ctx.shadowBlur = 25;

  ctx.shadowColor = player.color;

  ctx.fillStyle = player.color;

  ctx.fillRect(
    player.x-player.size/2,
    player.y-player.size/2,
    player.size,
    player.size
  );

  // ataque
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