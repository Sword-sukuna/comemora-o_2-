const canvas =
document.getElementById("game");

const ctx =
canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const minimap =
document.getElementById("minimap");

const mini =
minimap.getContext("2d");

minimap.width = 160;
minimap.height = 160;

const hud =
document.getElementById("hud");

const menu =
document.getElementById("menu");

const gameOver =
document.getElementById("gameOver");

const finalText =
document.getElementById("finalText");

const player = {

  x:500,
  y:400,

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

  attacking:false
};

let keys = {};

let gameStarted = false;

let currentRoomX = 1;
let currentRoomY = 1;

let floor = 1;

let transition = 0;

let screenShake = 0;

const ROOM_SIZE = 2200;

const rooms = [];

for(let y=0;y<3;y++){

  rooms[y] = [];

  for(let x=0;x<3;x++){

    rooms[y][x] = {

      visited:false,

      cleared:false,

      type:"combat",

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

function getCurrentRoom(){

  return rooms[currentRoomY][currentRoomX];

}

function generateEnemies(room){

  if(room.generated) return;

  room.generated = true;

  if(
    room.type === "spawn" ||
    room.type === "save" ||
    room.type === "upgrade"
  ) return;

  let amount = 5;

  if(room.type === "boss"){
    amount = 1;
  }

  for(let i=0;i<amount;i++){

    room.enemies.push({

      x:Math.random()*1600+300,
      y:Math.random()*1000+200,

      size:room.type === "boss"
      ? 100
      : 35,

      speed:room.type === "boss"
      ? 1.5
      : 2.2,

      damage:room.type === "boss"
      ? 2
      : 1,

      life:room.type === "boss"
      ? 30
      : 3,

      color:room.type === "boss"
      ? "#ff9900"
      : "#ff0044"

    });

  }

}

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

    let room = getCurrentRoom();

    if(room.type === "save"){

      saveGame();

    }

    if(room.type === "upgrade"){

      player.damage += 1;

      player.maxLife += 2;

      player.life =
      player.maxLife;

      room.used = true;

    }

  }

});

document.addEventListener("keyup",e=>{

  keys[e.key.toLowerCase()] = false;

});

function startGame(){

  menu.style.display = "none";

  canvas.style.display = "block";

  hud.style.display = "flex";

  gameStarted = true;

  generateEnemies(
    getCurrentRoom()
  );

}

function saveGame(){

  localStorage.setItem(
    "arenaSave",

    JSON.stringify({

      life:player.life,

      souls:player.souls,

      damage:player.damage,

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

    player.souls = save.souls;

    player.damage = save.damage;

    floor = save.floor;

    currentRoomX =
    save.currentRoomX;

    currentRoomY =
    save.currentRoomY;

  }

  startGame();

}

function attack(){

  if(player.attackCooldown > 0)
  return;

  player.attackCooldown = 25;

  player.attacking = true;

  damageEnemies(100,player.damage);

  setTimeout(()=>{

    player.attacking = false;

  },100);

}

function dash(){

  if(player.dashCooldown > 0)
  return;

  player.dashCooldown = 100;

  let dx = 0;
  let dy = 0;

  if(keys["w"]) dy = -1;
  if(keys["s"]) dy = 1;
  if(keys["a"]) dx = -1;
  if(keys["d"]) dx = 1;

  player.x += dx * 220;
  player.y += dy * 220;

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

  const room =
  getCurrentRoom();

  room.enemies.forEach(enemy=>{

    const dx =
    enemy.x-player.x;

    const dy =
    enemy.y-player.y;

    const dist =
    Math.sqrt(dx*dx+dy*dy);

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

function changeRoom(dir){

  transition = 1;

  setTimeout(()=>{

    if(dir === "right")
    currentRoomX++;

    if(dir === "left")
    currentRoomX--;

    if(dir === "top")
    currentRoomY--;

    if(dir === "bottom")
    currentRoomY++;

    generateEnemies(
      getCurrentRoom()
    );

    if(dir === "right"){
      player.x = 100;
    }

    if(dir === "left"){
      player.x = ROOM_SIZE-100;
    }

    if(dir === "top"){
      player.y = ROOM_SIZE-100;
    }

    if(dir === "bottom"){
      player.y = 100;
    }

    transition = 0;

  },300);

}

function update(){

  const room =
  getCurrentRoom();

  room.visited = true;

  let moveX = 0;
  let moveY = 0;

  if(keys["w"]) moveY -= player.speed;
  if(keys["s"]) moveY += player.speed;
  if(keys["a"]) moveX -= player.speed;
  if(keys["d"]) moveX += player.speed;

  player.x += moveX;
  player.y += moveY;

  // PORTAS

  if(
    room.enemies.length <= 0
  ){

    room.cleared = true;

    if(
      player.x > ROOM_SIZE-30 &&
      room.doors.right
    ){

      changeRoom("right");

    }

    if(
      player.x < 30 &&
      room.doors.left
    ){

      changeRoom("left");

    }

    if(
      player.y < 30 &&
      room.doors.top
    ){

      changeRoom("top");

    }

    if(
      player.y > ROOM_SIZE-30 &&
      room.doors.bottom
    ){

      changeRoom("bottom");

    }

  }

  room.enemies.forEach(enemy=>{

    const dx =
    player.x-enemy.x;

    const dy =
    player.y-enemy.y;

    const dist =
    Math.sqrt(dx*dx+dy*dy);

    enemy.x +=
    (dx/dist) * enemy.speed;

    enemy.y +=
    (dy/dist) * enemy.speed;

    if(dist < 50){

      player.life -= enemy.damage;

      screenShake = 10;

    }

  });

  if(player.attackCooldown > 0)
  player.attackCooldown--;

  if(player.dashCooldown > 0)
  player.dashCooldown--;

  if(player.skillCooldown > 0)
  player.skillCooldown--;

  if(player.life <= 0){

    gameStarted = false;

    gameOver.style.display = "flex";

    finalText.innerText =
    `Floor ${floor}
    | Souls ${player.souls}`;

  }

  updateHUD();

}

function updateHUD(){

  document.getElementById("life")
  .innerText =
  `❤️ ${player.life}/${player.maxLife}`;

  document.getElementById("souls")
  .innerText =
  `💎 ${player.souls}`;

  document.getElementById("floor")
  .innerText =
  `🏰 Floor ${floor}`;

  document.getElementById("room")
  .innerText =
  `🚪 ${currentRoomX},
  ${currentRoomY}`;

  document.getElementById("barE")
  .style.width =
  `${100-(player.attackCooldown/25)*100}%`;

  document.getElementById("barQ")
  .style.width =
  `${100-(player.dashCooldown/100)*100}%`;

  document.getElementById("bar1")
  .style.width =
  `${100-(player.skillCooldown/300)*100}%`;

}

function drawMinimap(){

  mini.clearRect(0,0,160,160);

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
          x*50+10,
          y*50+10,
          40,
          40
        );

      }

    }

  }

  mini.fillStyle = "#00e5ff";

  mini.fillRect(
    currentRoomX*50+10,
    currentRoomY*50+10,
    40,
    40
  );

}

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

  const room =
  getCurrentRoom();

  // TEMAS

  if(room.type === "boss"){

    ctx.fillStyle = "#220000";

  }else if(room.type === "save"){

    ctx.fillStyle = "#001a0f";

  }else if(room.type === "upgrade"){

    ctx.fillStyle = "#1a1400";

  }else{

    ctx.fillStyle = "#0a0a15";

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
      40,
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
      canvas.width/2-40,
      canvas.height/2-40,
      80,
      80
    );

  }

  // inimigos

  room.enemies.forEach(enemy=>{

    ctx.shadowBlur = 20;

    ctx.shadowColor = enemy.color;

    ctx.fillStyle = enemy.color;

    ctx.fillRect(
      enemy.x-player.x+canvas.width/2,
      enemy.y-player.y+canvas.height/2,
      enemy.size,
      enemy.size
    );

  });

  // player

  ctx.shadowBlur = 25;

  ctx.shadowColor = player.color;

  ctx.fillStyle = player.color;

  ctx.fillRect(
    canvas.width/2-player.size/2,
    canvas.height/2-player.size/2,
    player.size,
    player.size
  );

  // ataque

  if(player.attacking){

    ctx.beginPath();

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 8;

    ctx.arc(
      canvas.width/2,
      canvas.height/2,
      70,
      0,
      Math.PI*1.5
    );

    ctx.stroke();

  }

  // fade transição

  if(transition > 0){

    ctx.fillStyle =
    `rgba(0,0,0,${transition})`;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

  }

  ctx.restore();

  drawMinimap();

}

function gameLoop(){

  if(gameStarted){

    update();

    draw();

  }

  requestAnimationFrame(gameLoop);

}

gameLoop();