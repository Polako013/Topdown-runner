// =======================
// CANVAS
// =======================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

// =======================
// ESTADOS
// =======================
const MENU = 0;
const PLAY = 1;
const GAMEOVER = 2;
let state = MENU;

// =======================
// LANES (CARRILES)
// =======================
const lanes = [60, 165, 270];
let currentLane = 1;

// =======================
// JUGADOR
// =======================
const player = {
  size: 32,
  y: 520,
  lives: 3,
  shield: false
};

// =======================
// JUEGO
// =======================
let obstacles = [];
let powerUps = [];
let speed = 3;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

// =======================
// INPUT (TECLADO + TÁCTIL)
// =======================
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && currentLane > 0) currentLane--;
  if (e.key === "ArrowRight" && currentLane < 2) currentLane++;
  if (e.key === " " && state !== PLAY) startGame();
});

// TÁCTIL (MÓVIL)
canvas.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2 && currentLane > 0) currentLane--;
  if (x > window.innerWidth / 2 && currentLane < 2) currentLane++;
  if (state !== PLAY) startGame();
});

// =======================
// FUNCIONES
// =======================
function startGame() {
  obstacles = [];
  powerUps = [];
  speed = 3;
  score = 0;
  player.lives = 3;
  player.shield = false;
  currentLane = 1;
  state = PLAY;
}

function createObstacle() {
  obstacles.push({
    lane: Math.floor(Math.random() * 3),
    y: -40,
    size: 30
  });
}

function createPowerUp() {
  powerUps.push({
    lane: Math.floor(Math.random() * 3),
    y: -40,
    type: "shield"
  });
}

function collide(a, b) {
  return (
    Math.abs(a.y - b.y) < 30 &&
    a.lane === b.lane
  );
}

// =======================
// UPDATE
// =======================
function update() {
  if (state !== PLAY) return;

  score++;
  speed += 0.002;

  if (Math.random() < 0.03) createObstacle();
  if (Math.random() < 0.005) createPowerUp();

  obstacles.forEach(o => {
    o.y += speed;
    if (collide({ lane: currentLane, y: player.y }, o)) {
      if (player.shield) {
        player.shield = false;
        o.y = 1000;
      } else {
        player.lives--;
        o.y = 1000;
        if (player.lives <= 0) endGame();
      }
    }
  });

  powerUps.forEach(p => {
    p.y += speed;
    if (collide({ lane: currentLane, y: player.y }, p)) {
      player.shield = true;
      p.y = 1000;
    }
  });

  obstacles = obstacles.filter(o => o.y < canvas.height);
  powerUps = powerUps.filter(p => p.y < canvas.height);
}

function endGame() {
  state = GAMEOVER;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

// =======================
// DRAW
// =======================
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Carriles
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(120, canvas.height);
  ctx.moveTo(240, 0);
  ctx.lineTo(240, canvas.height);
  ctx.stroke();

  if (state === MENU) drawMenu();
  if (state === PLAY) drawGame();
  if (state === GAMEOVER) drawGameOver();
}

function drawGame() {
  // Jugador
  ctx.fillStyle = player.shield ? "gold" : "cyan";
  ctx.beginPath();
  ctx.arc(lanes[currentLane], player.y, player.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Obstáculos
  ctx.fillStyle = "red";
  obstacles.forEach(o => {
    ctx.fillRect(lanes[o.lane] - 15, o.y, 30, 30);
  });

  // PowerUps
  ctx.fillStyle = "lime";
  powerUps.forEach(p => {
    ctx.beginPath();
    ctx.arc(lanes[p.lane], p.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Puntos: " + score, 10, 25);
  ctx.fillText("Vidas: " + player.lives, 10, 45);
}

function drawMenu() {
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.textAlign = "center";
  ctx.fillText("TOP DOWN RUNNER", canvas.width / 2, 260);
  ctx.font = "16px Arial";
  ctx.fillText("Pulsa ESPACIO o toca la pantalla", canvas.width / 2, 300);
  ctx.fillText("Récord: " + highScore, canvas.width / 2, 340);
}

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, 260);
  ctx.font = "16px Arial";
  ctx.fillText("Puntos: " + score, canvas.width / 2, 300);
  ctx.fillText("Récord: " + highScore, canvas.width / 2, 330);
  ctx.fillText("Pulsa ESPACIO o toca", canvas.width / 2, 370);
}

// =======================
// LOOP
// =======================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
