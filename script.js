const canvas =
document.getElementById("game");

const ctx =
canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;


// minimapa

const minimap =
document.getElementById("minimap");

const mini =
minimap.getContext("2d");

minimap.width = 180;
minimap.height = 180;


// HUD

const lifeText =
document.getElementById("life");

const soulsText =
document.getElementById("souls");

const floorText =
document.getElementById("floor");

const roomText =
document.getElementById("room");

const barE =
document.getElementById("barE");

const barQ =
document.getElementById("barQ");

const bar1 =
document.getElementById("bar1");

const menu =
document.getElementById("menu");

const gameOver =
document.getElementById("gameOver");

const finalText =
document.getElementById("finalText");


// PLAYER

const player = {

  x: canvas.width / 2,
  y: canvas.height / 2,

  size:35,

  speed:5,

  color:"#00e5ff",

  life:10,
  maxLife:10,

  damage:1,

  souls:0,

  attackCooldown:0,
  dashCooldown:0,
  skillCooldown:0,

  attacking:false,
  usingSkill:false

};


// GAME

let keys = {};

let gameStarted = false;

let screenShake = 0;

let transitionAlpha = 0;

let currentRoomX = 1;
let currentRoomY = 1;

let floor = 1;


// ROOMS

const rooms = [];

for(let y=0;y<3;y++){

  rooms[y] = [];

  for(let x=0;x<3;x++){

    rooms[y][x] = {

      type:"combat",

      visited:false,

      cleared:false,

      generated:false,

      used:false,

      enemies:[],

      doors:{
        top:y > 0,
        bottom:y < 2,
        left:x > 0,
        right:x < 2
      }

    };

  }

}

rooms[1][1].type = "spawn";

rooms[0][2].type = "boss";

rooms[2][0].type = "save";

rooms[2][2].type = "upgrade";


// CONTROLES

document.addEventListener("keydown",e=>{

  keys[e.key.toLowerCase()] = true;

  if(e.key.toLowerCase() === "e"){
    attack();
  }

  if(e.key.toLowerCase() === "q"){
    dash();
  }

  if(e.key === "1"){
    skill();
  }

  if(e.key.toLowerCase() === "f"){
    interact();
  }

});

document.addEventListener("keyup",e=>{

  keys[e.key.toLowerCase()] = false;

});


// START

function startGame(){

  menu.style.display = "none";

  canvas.style.display = "block";

  document.getElementById("hud")
  .style.display = "flex";

  gameStarted = true;

  generateEnemies(getRoom());

}


// SAVE

function saveGame(){

  localStorage.setItem(
    "arenaSave",

    JSON.stringify({

      life:player.life,

      maxLife:player.maxLife,

      damage:player.damage,

      souls:player.souls,

      floor,

      currentRoomX,
      currentRoomY

    })

  );

}

function loadSave(){

  const save =
  JSON.parse(
    localStorage.getItem("arenaSave")
  );

  if(save){

    player.life = save.life;

    player.maxLife = save.maxLife;

    player.damage = save.damage;

    player.souls = save.souls;

    floor = save.floor;

    currentRoomX =
    save.currentRoomX;

    currentRoomY =
    save.currentRoomY;

  }

  startGame();

}


// ROOM

function getRoom(){

  return rooms[currentRoomY][currentRoomX];

}

function generateEnemies(room){

  if(room.generated) return;

  room.generated = true;

  if(
    room.type === "spawn" ||
    room.type === "save" ||
    room.type === "upgrade"
  ){
    return;
  }

  let amount = 6;

  if(room.type === "boss"){
    amount = 1;
  }

  for(let i=0;i<amount;i++){

    room.enemies.push({

      x:Math.random() *
      (canvas.width - 200) + 100,

      y:Math.random() *
      (canvas.height - 200) + 100,

      size:
      room.type === "boss"
      ? 100
      : 35,

      speed:
      room.type === "boss"
      ? 1.5
      : 2.2,

      damage:
      room.type === "boss"
      ? 2
      : 1,

      life:
      room.type === "boss"
      ? 25
      : 3,

      color:
      room.type === "boss"
      ? "#ff9900"
      : "#ff0044"

    });

  }

}


// ATAQUE

function attack(){

  if(player.attackCooldown > 0)
  return;

  player.attackCooldown = 20;

  player.attacking = true;

  damageEnemies(100,player.damage);

  screenShake = 5;

  setTimeout(()=>{

    player.attacking = false;

  },100);

}


// DASH

function dash(){

  if(player.dashCooldown > 0)
  return;

  player.dashCooldown = 80;

  let dx = 0;
  let dy = 0;

  if(keys["w"]) dy = -1;
  if(keys["s"]) dy = 1;
  if(keys["a"]) dx = -1;
  if(keys["d"]) dx = 1;

  player.x += dx * 140;
  player.y += dy * 140;

  screenShake = 10;

}


// SKILL

function skill(){

  if(player.skillCooldown > 0)
  return;

  player.skillCooldown = 240;

  player.usingSkill = true;

  damageEnemies(220,5);

  screenShake = 15;

  setTimeout(()=>{

    player.usingSkill = false;

  },300);

}


// DAMAGE

function damageEnemies(range,damage){

  const room = getRoom();

  room.enemies.forEach(enemy=>{

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;

    const dist =
    Math.sqrt(dx*dx + dy*dy);

    if(dist < range){

      enemy.life -= damage;

      if(enemy.life <= 0){

        player.souls +=
        enemy.size > 50
        ? 50
        : 10;

        room.enemies.splice(
          room.enemies.indexOf(enemy),
          1
        );

      }

    }

  });

}


// INTERAÇÃO

function interact(){

  const room = getRoom();

  if(room.type === "save"){

    saveGame();

  }

  if(
    room.type === "upgrade" &&
    !room.used
  ){

    room.used = true;

    player.damage += 1;

    player.maxLife += 2;

    player.life =
    player.maxLife;

  }

}


// ROOM CHANGE

function changeRoom(direction){

  transitionAlpha = 1;

  setTimeout(()=>{

    if(direction === "right"){

      currentRoomX++;

      player.x = 80;

    }

    if(direction === "left"){

      currentRoomX--;

      player.x =
      canvas.width - 120;

    }

    if(direction === "top"){

      currentRoomY--;

      player.y =
      canvas.height - 120;

    }

    if(direction === "bottom"){

      currentRoomY++;

      player.y = 80;

    }

    generateEnemies(getRoom());

    transitionAlpha = 0;

  },250);

}


// UPDATE

function update(){

  const room = getRoom();

  room.visited = true;

  // MOVIMENTO

  if(keys["w"])
  player.y -= player.speed;

  if(keys["s"])
  player.y += player.speed;

  if(keys["a"])
  player.x -= player.speed;

  if(keys["d"])
  player.x += player.speed;

  // LIMITES

  player.x = Math.max(
    20,
    Math.min(
      canvas.width - 55,
      player.x
    )
  );

  player.y = Math.max(
    20,
    Math.min(
      canvas.height - 55,
      player.y
    )
  );

  // PORTAS

  if(room.enemies.length <= 0){

    room.cleared = true;

    if(
      player.x >= canvas.width - 60 &&
      room.doors.right
    ){
      changeRoom("right");
    }

    if(
      player.x <= 20 &&
      room.doors.left
    ){
      changeRoom("left");
    }

    if(
      player.y <= 20 &&
      room.doors.top
    ){
      changeRoom("top");
    }

    if(
      player.y >= canvas.height - 60 &&
      room.doors.bottom
    ){
      changeRoom("bottom");
    }

  }

  // ENEMIES

  room.enemies.forEach(enemy=>{

    const dx =
    player.x - enemy.x;

    const dy =
    player.y - enemy.y;

    const dist =
    Math.sqrt(dx*dx + dy*dy);

    enemy.x +=
    (dx/dist) * enemy.speed;

    enemy.y +=
    (dy/dist) * enemy.speed;

    if(dist < enemy.size){

      player.life -=
      enemy.damage * 0.02;

      screenShake = 5;

    }

  });

  // COOLDOWNS

  if(player.attackCooldown > 0)
  player.attackCooldown--;

  if(player.dashCooldown > 0)
  player.dashCooldown--;

  if(player.skillCooldown > 0)
  player.skillCooldown--;

  // GAME OVER

  if(player.life <= 0){

    gameStarted = false;

    gameOver.style.display = "flex";

    finalText.innerText =
    `Floor ${floor}
    | Souls ${player.souls}`;

  }

  updateHUD();

}


// HUD

function updateHUD(){

  lifeText.innerText =
  `❤️ ${Math.floor(player.life)}
  /${player.maxLife}`;

  soulsText.innerText =
  `💎 ${player.souls}`;

  floorText.innerText =
  `🏰 Floor ${floor}`;

  roomText.innerText =
  `🚪 ${currentRoomX},
  ${currentRoomY}`;

  barE.style.width =
  `${100-(player.attackCooldown/20)*100}%`;

  barQ.style.width =
  `${100-(player.dashCooldown/80)*100}%`;

  bar1.style.width =
  `${100-(player.skillCooldown/240)*100}%`;

}


// MINIMAPA

function drawMiniMap(){

  mini.clearRect(0,0,180,180);

  for(let y=0;y<3;y++){

    for(let x=0;x<3;x++){

      const room =
      rooms[y][x];

      if(room.visited){

        mini.fillStyle = "#444";

        if(room.type === "boss")
        mini.fillStyle = "#ff0000";

        if(room.type === "save")
        mini.fillStyle = "#00ff88";

        if(room.type === "upgrade")
        mini.fillStyle = "#ffff00";

        mini.fillRect(
          x*55+10,
          y*55+10,
          45,
          45
        );

      }

    }

  }

  mini.fillStyle = "#00e5ff";

  mini.fillRect(
    currentRoomX*55+10,
    currentRoomY*55+10,
    45,
    45
  );

}


// DRAW

function draw(){

  ctx.save();

  const shakeX =
  (Math.random()-0.5) *
  screenShake;

  const shakeY =
  (Math.random()-0.5) *
  screenShake;

  ctx.translate(shakeX,shakeY);

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const room = getRoom();

  // TEMA

  if(room.type === "boss"){

    ctx.fillStyle = "#220000";

  }else if(room.type === "save"){

    ctx.fillStyle = "#001a0f";

  }else if(room.type === "upgrade"){

    ctx.fillStyle = "#1a1400";

  }else{

    ctx.fillStyle = "#0a0a18";

  }

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // GRID

  ctx.strokeStyle =
  "rgba(255,255,255,0.03)";

  for(let x=0;x<canvas.width;x+=80){

    ctx.beginPath();

    ctx.moveTo(x,0);

    ctx.lineTo(x,canvas.height);

    ctx.stroke();

  }

  // PORTAS

  if(room.cleared){

    ctx.fillStyle = "#00e5ff";

    if(room.doors.right){

      ctx.fillRect(
        canvas.width-20,
        canvas.height/2-80,
        20,
        160
      );

    }

    if(room.doors.left){

      ctx.fillRect(
        0,
        canvas.height/2-80,
        20,
        160
      );

    }

    if(room.doors.top){

      ctx.fillRect(
        canvas.width/2-80,
        0,
        160,
        20
      );

    }

    if(room.doors.bottom){

      ctx.fillRect(
        canvas.width/2-80,
        canvas.height-20,
        160,
        20
      );

    }

  }

  // SAVE ROOM

  if(room.type === "save"){

    ctx.shadowBlur = 30;

    ctx.shadowColor = "#00ff88";

    ctx.fillStyle = "#00ff88";

    ctx.beginPath();

    ctx.arc(
      canvas.width/2,
      canvas.height/2,
      45,
      0,
      Math.PI*2
    );

    ctx.fill();

  }

  // UPGRADE ROOM

  if(
    room.type === "upgrade" &&
    !room.used
  ){

    ctx.shadowBlur = 30;

    ctx.shadowColor = "#ffff00";

    ctx.fillStyle = "#ffff00";

    ctx.fillRect(
      canvas.width/2 - 40,
      canvas.height/2 - 40,
      80,
      80
    );

  }

  // ENEMIES

  room.enemies.forEach(enemy=>{

    ctx.shadowBlur = 20;

    ctx.shadowColor = enemy.color;

    ctx.fillStyle = enemy.color;

    ctx.fillRect(
      enemy.x,
      enemy.y,
      enemy.size,
      enemy.size
    );

  });

  // PLAYER

  ctx.shadowBlur = 25;

  ctx.shadowColor = player.color;

  ctx.fillStyle = player.color;

  ctx.fillRect(
    player.x,
    player.y,
    player.size,
    player.size
  );

  // ATAQUE

  if(player.attacking){

    ctx.beginPath();

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 8;

    ctx.arc(
      player.x + player.size/2,
      player.y + player.size/2,
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
      player.x + player.size/2,
      player.y + player.size/2,
      160,
      0,
      Math.PI * 2
    );

    ctx.stroke();

  }

  // TRANSIÇÃO

  if(transitionAlpha > 0){

    ctx.fillStyle =
    `rgba(0,0,0,${transitionAlpha})`;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

  }

  ctx.restore();

  drawMiniMap();

}


// LOOP

function gameLoop(){

  if(gameStarted){

    update();

    draw();

  }

  requestAnimationFrame(gameLoop);

}

gameLoop();