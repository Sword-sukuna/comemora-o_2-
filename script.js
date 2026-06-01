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

// VIDA PLAYER

ctx.fillStyle = "#111";

ctx.fillRect(
  player.x - 10,
  player.y - 20,
  60,
  8
);

ctx.fillStyle = "#00ff88";

ctx.fillRect(
  player.x - 10,
  player.y - 20,
  (player.life / player.maxLife) * 60,
  8
);


// GAME

let keys = {};

let gameStarted = false;

let screenShake = 0;

let transitionAlpha = 0;

let currentRoomX = 1;
let currentRoomY = 1;

let floor = 1;

let isTransitioning = false;

let walls = [];

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

rooms[0][0].type = "shop";


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

  generateWalls();

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

  if(
    !rooms[currentRoomY] ||
    !rooms[currentRoomY][currentRoomX]
  ){
    return null;
  }

  return rooms[currentRoomY][currentRoomX];

}

function generateEnemies(room){

  if(room.generated) return;

  room.generated = true;

  if(
    room.type === "spawn" ||
    room.type === "save" ||
    room.type === "upgrade"||
    room.type === "shop"
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

      maxLife:
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

  walls.forEach(wall=>{

  if(

    player.x < wall.x + wall.width &&
    player.x + player.size > wall.x &&
    player.y < wall.y + wall.height &&
    player.y + player.size > wall.y

  ){

    player.x -= dx * 140;
    player.y -= dy * 140;

  }

});

  screenShake = 10;

  player.x = Math.max(
  20,
  Math.min(canvas.width-55,player.x)
);

player.y = Math.max(
  20,
  Math.min(canvas.height-55,player.y)
);

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

if(!room) return;

for(let i = room.enemies.length - 1; i >= 0; i--){

  const enemy =
  room.enemies[i];

  const dx =
  enemy.x - player.x;

  const dy =
  enemy.y - player.y;

  const dist =
  Math.max(
    1,
    Math.sqrt(dx*dx + dy*dy)
  );

  if(dist < range){

    enemy.life -= damage;

    if(enemy.life <= 0){

      player.souls +=
      enemy.size > 50
      ? 50
      : 10;

      room.enemies.splice(i,1);

    }

  }

}

}


// INTERAÇÃO

function interact(){

  const room = getRoom();

  if(!room) return;

  //SHOP

  if(room.type === "shop"){

  if(player.souls >= 50){

    player.souls -= 50;

    player.maxLife += 2;

    player.life =
    player.maxLife;

    alert("+ VIDA");

  }

}

  // SAVE

  if(room.type === "save"){

    const dx =
    player.x - canvas.width/2;

    const dy =
    player.y - canvas.height/2;

    const dist =
    Math.sqrt(dx*dx + dy*dy);

    if(dist < 120){

      saveGame();

      alert("JOGO SALVO");

    }

  }

  // UPGRADE

  if(
    room.type === "upgrade" &&
    !room.used
  ){

    const dx =
    player.x - canvas.width/2;

    const dy =
    player.y - canvas.height/2;

    const dist =
    Math.sqrt(dx*dx + dy*dy);

    if(dist < 120){

      room.used = true;

      player.damage += 1;

      player.maxLife += 2;

      player.life =
      player.maxLife;

      alert("UPGRADE PEGO");

    }

  }

}


// ROOM CHANGE

function changeRoom(direction){

  if(isTransitioning) return;

  isTransitioning = true;

  transitionAlpha = 1;

  screenShake = 0;

  setTimeout(()=>{

    // RIGHT
    if(direction === "right"){

      if(currentRoomX < 2){

        currentRoomX++;

        player.x = 120;

      }

    }

    // LEFT
    if(direction === "left"){

      if(currentRoomX > 0){

        currentRoomX--;

        player.x = canvas.width - 160;

      }

    }

    // TOP
    if(direction === "top"){

      if(currentRoomY > 0){

        currentRoomY--;

        player.y = canvas.height - 160;

      }

    }

    // BOTTOM
    if(direction === "bottom"){

      if(currentRoomY < 2){

        currentRoomY++;

        player.y = 120;

      }

    }

    const room = getRoom();

    if(room){

      generateEnemies(room);

      generateWalls();

    }

    transitionAlpha = 0;

    setTimeout(()=>{

      isTransitioning = false;

    },300);

  },250);

}


// UPDATE

function update(){

  const room = getRoom();

if(!room) return;

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

  //paredes

  walls.forEach(wall=>{

  if(

    player.x < wall.x + wall.width &&
    player.x + player.size > wall.x &&
    player.y < wall.y + wall.height &&
    player.y + player.size > wall.y

  ){

    if(keys["w"]) player.y += player.speed;
    if(keys["s"]) player.y -= player.speed;
    if(keys["a"]) player.x += player.speed;
    if(keys["d"]) player.x -= player.speed;

  }

});

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
Math.max(
  1,
  Math.sqrt(dx*dx + dy*dy)
);

  enemy.x +=
  (dx/dist) * enemy.speed;

  enemy.y +=
  (dy/dist) * enemy.speed;

  // colisão parede inimigo

  walls.forEach(wall=>{

    if(

      enemy.x < wall.x + wall.width &&
      enemy.x + enemy.size > wall.x &&
      enemy.y < wall.y + wall.height &&
      enemy.y + enemy.size > wall.y

    ){

      enemy.x -=
      (dx/dist) * enemy.speed;

      enemy.y -=
      (dy/dist) * enemy.speed;

    }

  });

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

  if(screenShake > 0){

  screenShake *= 0.85;

}

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

  ctx.translate(
  isTransitioning ? 0 : shakeX,
  isTransitioning ? 0 : shakeY
);

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


   // SHOP
  if(room.type === "shop"){

  ctx.fillStyle = "#332200";

  ctx.fillRect(
    canvas.width/2 - 70,
    canvas.height/2 - 70,
    140,
    140
  );

}

  // partículas ambiente

for(let i=0;i<40;i++){

  ctx.fillStyle =
  "rgba(255,255,255,0.03)";

  ctx.beginPath();

  ctx.arc(
    (i * 53) % canvas.width,
    (i * 97) % canvas.height,
    2,
    0,
    Math.PI*2
  );

  ctx.fill();

}

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

    ctx.shadowBlur = 60;

    ctx.shadowColor = "#00ff88";

    ctx.fillStyle = "#00ff88";

    ctx.beginPath();

ctx.fillStyle = "#00ff88";

ctx.arc(
  canvas.width/2,
  canvas.height/2,
  80,
  0,
  Math.PI*2
);

ctx.fill();

ctx.fillStyle =
"rgba(0,255,120,0.15)";

ctx.beginPath();

ctx.arc(
  canvas.width/2,
  canvas.height/2,
  110,
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

  //DESENHAR PAREDES

  walls.forEach(wall=>{

  ctx.fillStyle = "#2b2b2b";

  ctx.fillRect(
    wall.x,
    wall.y,
    wall.width,
    wall.height
  );

});

  // ENEMIES

  room.enemies.forEach(enemy=>{

    ctx.shadowBlur = 20;

    ctx.shadowColor = enemy.color;

    ctx.fillStyle = enemy.color;

    ctx.beginPath();

ctx.arc(
  enemy.x + enemy.size/2,
  enemy.y + enemy.size/2,
  enemy.size/2,
  0,
  Math.PI*2
);

ctx.fill();

    // VIDA FUNDO

ctx.fillStyle = "#111";

ctx.fillRect(
  enemy.x,
  enemy.y - 14,
  enemy.size,
  8
);

// VIDA

ctx.fillStyle = "#00ff66";

ctx.fillRect(
  enemy.x,
  enemy.y - 14,
  (enemy.life / enemy.maxLife) * enemy.size,
  8
);

  });

  

  // PLAYER

  ctx.shadowBlur = 25;

  ctx.shadowColor = player.color;

  ctx.fillStyle = player.color;

  ctx.beginPath();

ctx.arc(
  player.x + player.size/2,
  player.y + player.size/2,
  player.size/2,
  0,
  Math.PI*2
);

ctx.fill();

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

//paredes

function generateWalls(){

  walls = [];

  const room = getRoom();

  if(room.type === "combat"){

    walls.push({
      x:300,
      y:200,
      width:100,
      height:400
    });

    walls.push({
      x:700,
      y:500,
      width:350,
      height:80
    });

  }

  if(room.type === "boss"){

    walls.push({
      x:450,
      y:250,
      width:250,
      height:250
    });

  }

}