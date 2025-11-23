// ========== ELEMENTE ==========
const menuMusic = document.getElementById("menu-music");
const gameMusic = document.getElementById("game-music");
const transitionSound = document.getElementById("transition-sound");
const gameOverSound = document.getElementById("game-over-sound");
const transitionOverlay = document.getElementById("transition-overlay");
const transitionAnimCanvas = document.getElementById("transition-anim");
const musicGate = document.getElementById('music-gate');
const mainMenu = document.getElementById('main-menu');
const menuBg = document.getElementById('menu-bg');
const rulesOverlay = document.getElementById('rules-overlay');
const gameBg = document.getElementById('game-bg');
const rainCanvas = document.getElementById('rain-canvas');
let obstacles = [];

// ========== REGEN FÜR ALLE SCREENS ==========
function resizeRainCanvas() {
  if (!rainCanvas) return;
  rainCanvas.width = window.innerWidth;
  rainCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeRainCanvas);
resizeRainCanvas();

function drawRainFullScreen() {
  if (!rainCanvas) return;
  const ctx = rainCanvas.getContext('2d');
  const w = rainCanvas.width, h = rainCanvas.height;
  ctx.clearRect(0,0,w,h);

  const t = Date.now()/7;
  for (let i = 0; i < 130; i++) {
    const x = (i*67 + (t+i*9)%w) % w;
    const y = (i*251 + (t*1.6+i*11)%h) % h;
    ctx.save();
    ctx.globalAlpha = 0.15+Math.abs(Math.sin(x+.4*y)/2);
    ctx.strokeStyle = "#a4cde6";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+7, y+19);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}
setInterval(drawRainFullScreen, 38);

// ======= MENÜ-HINTERGRUND MIT REGEN UND GEISTERN =======
const menuBgImage = new Image();
menuBgImage.src = "castle_bg.png";

function drawMenuBackground() {
  if (!menuBg) return;
  const ctx = menuBg.getContext('2d');
  const w = menuBg.width, h = menuBg.height;
  ctx.clearRect(0, 0, w, h);

  // Schlossbild dezent im Hintergrund
  if (gameBg && gameBg.complete && gameBg.naturalWidth > 0) {
    ctx.globalAlpha = 0.65;
    ctx.drawImage(gameBg, 0, 0, w, h);
    ctx.globalAlpha = 1.0;
  }

  // Regen (eigener Layer im Menü für mehr Tiefe)
  const t = Date.now()/7;
  for (let i = 0; i < 130; i++) {
    const x = (i*67 + (t+i*9)%w) % w;
    const y = (i*251 + (t*1.6+i*11)%h) % h;
    ctx.save();
    ctx.globalAlpha = 0.16+Math.abs(Math.sin(x+.4*y)/2);
    ctx.strokeStyle = "#a4cde6";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+7, y+19);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }
  // Geister (animiert)
  const ghostT = Date.now()/1200;
  for (let i = 0; i < 4; i++) {
    const gx = 180+Math.sin(ghostT+i)*400 + i*200;
    const gy = 100 + 70*Math.cos(ghostT+2.6*i+(i*1.1));
    drawMenuGhost(ctx, gx, gy, 32+Math.sin(ghostT+i*3)*9);
  }
}
function drawMenuGhost(ctx, x, y, r) {
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 2 * Math.PI, false);
  ctx.lineTo(x + r, y + r * 0.65);
  for (let i = 3; i >= 1; i--) {
    const cx = x + r * Math.cos(Math.PI * (1 - i / 3));
    const cy = y + r * 0.65 + (i % 2 === 0 ? 8 : 0);
    ctx.quadraticCurveTo(cx, cy, cx, cy);
  }
  ctx.lineTo(x - r, y + r * 0.65);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x - r/3, y - r/7, r/5, 0, 2 * Math.PI);
  ctx.arc(x + r/3, y - r/7, r/5, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();
}
setInterval(drawMenuBackground, 38);

// ========== INITIAL SICHTBARKEIT ==========
function showOnlyMusicGate() {
  musicGate.style.display = 'flex';
  mainMenu.style.display = 'none';
  menuBg.style.display = '';
  gameBg.style.display = 'none';
  rainCanvas.style.display = ''; // Regen immer anzeigen!
  rulesOverlay.style.display = 'none';
  transitionOverlay.style.display = 'none';
}
showOnlyMusicGate();
showFooterBar();

if (menuMusic) { menuMusic.pause(); menuMusic.currentTime = 0; }
if (gameMusic) { gameMusic.pause(); gameMusic.currentTime = 0; }
if (transitionSound) { transitionSound.pause(); transitionSound.currentTime = 0; }

// ========= FADING REGELN =========
function fadeRulesOut(callback) {
  rulesOverlay.style.transition = "opacity 0.6s";
  rulesOverlay.style.opacity = 1;
  setTimeout(function(){
    rulesOverlay.style.opacity = 0;
    setTimeout(function() {
      rulesOverlay.style.display = "none";
      rulesOverlay.style.transition = "";
      rulesOverlay.style.opacity = 1;
      if (callback) callback();
    }, 600);
  }, 20);
}

// ========== MENÜ-MUSIK ==========
function playMenuMusic() {
  if (!menuMusic) return;
  stopGameMusic();
  if (transitionSound) { transitionSound.pause(); transitionSound.currentTime = 0; }
  menuMusic.loop = true;
  menuMusic.volume = 0.5;
  menuMusic.currentTime = 0;
  menuMusic.play().catch(()=>{});
}
function stopMenuMusic() {
  if (!menuMusic) return;
  menuMusic.pause();
  menuMusic.currentTime = 0;
}
function fadeOutMenuMusic(duration = 800) {
  if (!menuMusic) return;
  const steps = 20;
  const stepTime = duration / steps;
  let vol = menuMusic.volume;
  let currentStep = 0;
  function fade() {
    currentStep++;
    menuMusic.volume = Math.max(0, vol * (1 - currentStep / steps));
    if (currentStep < steps) setTimeout(fade, stepTime);
    else { menuMusic.pause(); menuMusic.currentTime = 0; menuMusic.volume = vol; }
  }
  fade();
}
function playGameMusic() {
  if (!gameMusic) return;
  stopMenuMusic();
  if (transitionSound) { transitionSound.pause(); transitionSound.currentTime = 0; }
  gameMusic.pause();
  gameMusic.currentTime = 0;
  gameMusic.loop = true;
  gameMusic.volume = 0.45;
  gameMusic.play().catch(()=>{});
}
function fadeOutGameMusic(duration = 800) {
  if (!gameMusic) return;
  const steps = 20;
  const stepTime = duration / steps;
  let vol = gameMusic.volume, currentStep = 0;
  function fade() {
    currentStep++;
    gameMusic.volume = Math.max(0, vol * (1 - currentStep / steps));
    if (currentStep < steps) setTimeout(fade, stepTime);
    else { gameMusic.pause(); gameMusic.currentTime = 0; gameMusic.volume = vol; }
  } fade();
}
function stopGameMusic() {
  if (!gameMusic) return;
  gameMusic.pause(); gameMusic.currentTime = 0;
}
function showFooterBar() {
  const f = document.getElementById('footer-bar');
  if (f) f.style.display = "block";
}
function hideFooterBar() {
  const f = document.getElementById('footer-bar');
  if (f) f.style.display = "none";
}


// ========== NACHT-ÜBERGANG MIT REGEN, BLITZEN, GEISTERN, IRRLICHTERN ==========
let transitionAnimFrame;
function startTransitionOverlay(afterTransitionCallback) {
  transitionOverlay.style.opacity = "1";
  transitionOverlay.style.display = "block";
  transitionAnimCanvas.width = window.innerWidth;
  transitionAnimCanvas.height = window.innerHeight;
  let tStart = performance.now();
  let ghostStates = [];
  for (let i = 0; i < 3; i++) ghostStates.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.5,
    speedY: 1.5 + Math.random(),
    amp: 55 + Math.random()*30,
    freq: 2.5+Math.random(),
    t0: Math.random()*100
  });
  let wispCount = 7, wisps = [];
  for (let i=0; i<wispCount; i++) wisps.push({
    baseX: Math.random()*window.innerWidth,
    baseY: Math.random()*window.innerHeight*0.8+30,
    r: 16+Math.random()*14,
    phase: Math.random()*Math.PI*2,
    color: `rgba(${130+Math.random()*80},${200+Math.random()*55},255,0.18)`
  });

  let nextBlitz = 1.0 + Math.random() * 2.0;
  let blitzAlpha = 0;

  function animTransition(now) {
    let dt = (now-tStart)/1000;
    let ctx = transitionAnimCanvas.getContext('2d');
    let w = transitionAnimCanvas.width, h = transitionAnimCanvas.height;
    ctx.clearRect(0, 0, w, h);

    let isTransition = (dt <= 5.8);
    let isFadePhase  = (dt > 5.0 && dt <= 5.8);

    if (gameBg && gameBg.complete && gameBg.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.drawImage(gameBg, 0, 0, w, h);
      ctx.restore();
    }

    ctx.save();
    let grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,"#1a1933");
    grad.addColorStop(0.9,"#181a22");
    grad.addColorStop(1,"#16191d");
    ctx.fillStyle = grad;
    ctx.globalAlpha = isFadePhase ? 1 - (dt-5.0)/0.8 : 1.0;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    if (dt >= nextBlitz && !isFadePhase) {
      blitzAlpha = 1;
      nextBlitz = dt + 1.7 + Math.random()*1.6;
    }
    if (blitzAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = blitzAlpha * 0.8 * (isFadePhase ? 1-(dt-5.0)/0.8 : 1);
      ctx.fillStyle = "#eaefff";
      ctx.fillRect(0,0,w,h);
      ctx.restore();
      blitzAlpha -= 0.085;
    }
    if (Math.random() < 0.07 && blitzAlpha > 0.2) {
      ctx.save();
      ctx.globalAlpha = 0.16 + 0.19*Math.random();
      ctx.fillStyle = "#fff";
      let bx = Math.random() * w, bwidth = 14 + Math.random()*44;
      ctx.fillRect(bx, 0, bwidth, h);
      ctx.restore();
    }

    let tRain = Date.now()/8.3;
    for (let i = 0; i < 220; i++) {
      const x = (i*67 + (tRain+i*9)%w) % w;
      const y = (i*251 + (tRain*1.6+i*11)%h) % h;
      ctx.save();
      ctx.globalAlpha = 0.18 + Math.abs(Math.sin(x*.2+y*.15))/3;
      ctx.strokeStyle = "#a9d5f7";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x+7, y+19);
      ctx.lineWidth = 1.5 + 0.7*Math.abs(Math.sin(i+dt));
      ctx.stroke();
      ctx.restore();
    }
    ghostStates.forEach(gs => {
      gs.y += gs.speedY + Math.sin(dt*1.1 + gs.t0)*0.2;
      gs.x += Math.sin(dt*gs.freq + gs.t0)*1.2;
      drawOverlayGhost(ctx, gs.x, gs.y, 40 + Math.sin(dt*1.4+gs.t0)*8, 0.62 + 0.15*Math.sin(dt+gs.t0));
    });
    wisps.forEach((wp, i) => {
      let time = dt*0.6 + wp.phase;
      let angle = time + Math.sin(dt*0.2 + i)*2.1;
      let x = wp.baseX + Math.cos(angle)*40 + Math.sin(dt*0.3 + i*0.7)*17;
      let y = wp.baseY + Math.sin(angle)*30 + Math.sin(dt*0.4 + i*0.9)*9;
      ctx.save();
      ctx.globalAlpha = 0.16 + (blitzAlpha>0.5? 0.27*Math.random():0);
      ctx.beginPath();
      ctx.arc(x, y, wp.r*Math.abs(1+0.08*Math.sin(1.3*dt+i)),0,2*Math.PI);
      ctx.fillStyle = wp.color;
      ctx.shadowColor = "#38e8ff";
      ctx.shadowBlur = blitzAlpha>0.5 ? 40 : 16;
      ctx.fill();
      if (blitzAlpha>0.3) {
        ctx.globalAlpha = 0.20+0.35*Math.random();
        ctx.beginPath();
        ctx.arc(x, y, wp.r*0.6,0,2*Math.PI);
        ctx.fillStyle = "rgba(160,250,255,0.5)";
        ctx.shadowBlur = 40;
        ctx.fill();
      }
      ctx.restore();
    });

    if (!isTransition) {
      transitionOverlay.style.opacity = "0";
      transitionOverlay.style.display = "none";
      cancelAnimationFrame(transitionAnimFrame);
      if (afterTransitionCallback) afterTransitionCallback();
      return;
    }
    transitionAnimFrame = requestAnimationFrame(animTransition);
  }
  transitionAnimFrame = requestAnimationFrame(animTransition);
}

function drawOverlayGhost(ctx, x, y, r, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 2 * Math.PI, false);
  ctx.lineTo(x + r, y + r * 0.65);
  for (let i = 3; i >= 1; i--) {
    const cx = x + r * Math.cos(Math.PI * (1 - i / 3));
    const cy = y + r * 0.65 + (i % 2 === 0 ? 8 : 0);
    ctx.quadraticCurveTo(cx, cy, cx, cy);
  }
  ctx.lineTo(x - r, y + r * 0.65);
  ctx.closePath();
  ctx.fillStyle = "#e9f4fff5";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x - r/3, y - r/7, r/5, 0, 2 * Math.PI);
  ctx.arc(x + r/3, y - r/7, r/5, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();
}

// ========== SPIEL-LOGIK & FLUSS ==========
const TILE = 32;
const WIDTH = 28;
const HEIGHT = 20;
const FPS = 30;
const GAME_TIME = 90;

let player = {
  x: 2, y: 2, dir: 'right', name: 'Player', color: "#00ffea",
  cooldown: 0, invuln: 0, score: 0, trap: null, lives: 5, speedTimer: 0, shieldTimer: 0
};

function randomPositionInQuarter(quarter) {
  let xMin = 0, xMax = WIDTH-1, yMin = 0, yMax = HEIGHT-1;
  if (quarter === 2) { // rechts oben
    xMin = Math.floor(WIDTH/2); yMax = Math.floor(HEIGHT/2)-1;
  } else if (quarter === 3) { // links unten
    xMax = Math.floor(WIDTH/2)-1; yMin = Math.floor(HEIGHT/2);
  } else if (quarter === 4) { // rechts unten
    xMin = Math.floor(WIDTH/2); yMin = Math.floor(HEIGHT/2);
  }
  let tries = 0, x, y;
  do {
    x = xMin + Math.floor(Math.random() * (xMax - xMin + 1));
    y = yMin + Math.floor(Math.random() * (yMax - yMin + 1));
    tries++;
    if (tries > 1000) break;
  } while (obstacles[y][x] === 1);
  return {x, y};
}

function randomEmptyPosition() {
  let x, y, tries = 0;
  do {
    x = Math.floor(Math.random() * WIDTH);
    y = Math.floor(Math.random() * HEIGHT);
    tries++;
    if (tries > 1000) break;
  } while (
    obstacles[y][x] === 1 ||
    (x === player?.x && y === player?.y) ||
    ghosts?.some?.(g => g.x === x && g.y === y)
  );
  return { x, y };
}
let ghosts = [], powerups = [];
let canvas, ctx; let gameInterval = null;
let gameTimer = GAME_TIME * FPS;
let gameActive = true;
let heldDirections = {}, moveTick = 0, playerMoveInterval = 4;
const MOVE_INTERVAL = 4;
const POWERUP_TYPES = ["speed", "life", "shield"];

// --- Punktemultiplikator für Serienfänge ---
let lastGhostCatchTime = 0;
let catchCombo = 0;
let floatingTexts = [];
function showFloatingText(px, py, text, color="#00ffea") {
  floatingTexts.push({
    x: px,
    y: py,
    t: Date.now(),
    text: text,
    color: color              // <--- NEU!
  });
}

window.onload = function () {
  document.getElementById('music-btn').onclick = function() {
    playMenuMusic();
    musicGate.style.display = 'none';
    mainMenu.style.display = '';
    menuBg.style.display = '';
    gameBg.style.display = 'none';  // <--- Bild ausblenden!
    rainCanvas.style.display = '';
  };

  document.getElementById('player-form').addEventListener('submit', function (e) {
    e.preventDefault();
    player.name = document.getElementById('player-name').value || 'Player';
    player.color = document.getElementById('player-color').value;
    mainMenu.style.display = 'none';
    menuBg.style.display = 'none';
    rulesOverlay.style.display = 'flex';
    rulesOverlay.style.opacity = 1;
    rulesOverlay.style.transition = "";
    hideFooterBar();
  });

  document.getElementById('start-btn').addEventListener('click', function () {
    fadeRulesOut(function() {
      fadeOutMenuMusic();
      transitionOverlay.style.display = "block";
      transitionOverlay.style.opacity = "0";
      hideFooterBar();
      setTimeout(function(){
        transitionOverlay.style.transition = "opacity 1s";
        transitionOverlay.style.opacity = "1";
        setTimeout(function() {
          startTransitionOverlay(function() {
            if (transitionSound) { transitionSound.pause(); transitionSound.currentTime = 0; }
            playGameMusic();
            initializeGame();
          });
          if (transitionSound) {
            transitionSound.pause();
            transitionSound.currentTime = 0;
            transitionSound.volume = 1.0;
            transitionSound.play().catch(()=>{});
          }
        }, 1000);
      }, 30);
      if (menuMusic) { menuMusic.pause(); menuMusic.currentTime = 0; }
      if (gameMusic) { gameMusic.pause(); gameMusic.currentTime = 0; }
    });
  });
};

function initializeGame() {
  // Alle Menüs/Layer sicher ausblenden
  mainMenu.style.display = 'none';
  menuBg.style.display = 'none';
  gameBg.style.display = '';
  rainCanvas.style.display = '';
  rulesOverlay.style.display = 'none';
  transitionOverlay.style.display = 'none';
  document.getElementById('hud').style.display = "flex";

  // Entferne ALLE alten Spielfeld-Canvas außer dem Regen und Menü-Hintergrund (rainCanvas, menuBg, transitionAnimCanvas)
document.querySelectorAll('canvas').forEach(c => {
  if (c !== rainCanvas && c !== menuBg && c !== transitionAnimCanvas) {
    c.parentNode.removeChild(c);
  }
});
canvas = null;


  // --- WICHTIG: obstacles für jedes Spiel neu generieren! ---
  obstacles = [];
for (let y = 0; y < HEIGHT; y++) {
  obstacles[y] = [];
  for (let x = 0; x < WIDTH; x++) {
    if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
      obstacles[y][x] = 1;
    } else if (
      Math.random() < 0.08 &&
      !(x < 4 && y < 4) &&
      !(x > WIDTH - 5 && y > HEIGHT - 5)
    ) {
      obstacles[y][x] = 1;
    } else {
      obstacles[y][x] = 0;
    }
  }
}


  // Neues Canvas anlegen und im DOM platzieren
  canvas = document.createElement('canvas');
  canvas.width = TILE * WIDTH;
  canvas.height = TILE * HEIGHT;
  canvas.style.position = "absolute";
  canvas.style.left = "50%";
  canvas.style.top = "50%";
  canvas.style.transform = "translate(-50%, -50%)";
  canvas.style.zIndex = "2";
  canvas.style.boxShadow = "0 0 32px 4px #111b, 0 2px 80px 0 #221b";
  canvas.style.borderRadius = "18px";
  ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  // Ghosts und Powerups neu befüllen
  const ghostQuarters = [2, 3, 4]; // Alle außer links oben (Spieler-Start)
  ghosts = [];
  let tempQuarters = ghostQuarters.slice();
  for (let i = 0; i < 2; i++) {
  // Jede Start-Geister in verschied. Viertel, falls möglich
  let idx = Math.floor(Math.random() * tempQuarters.length);
  let quarter = tempQuarters.splice(idx, 1)[0];
  let pos = randomPositionInQuarter(quarter);
  ghosts.push({
   ...pos,
   dx: i === 0 ? 1 : 0,
   dy: i === 0 ? 0 : -1,
   cooldown: 0,
   moveCooldown: 0
 });
}
  powerups = [];
  floatingTexts = [];
  catchCombo = 0;
  lastGhostCatchTime = 0;
  gameTimer = GAME_TIME * FPS;
  moveTick = 0;
  heldDirections = {};

  // Game-Loop Intervall aufräumen und neu starten
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / FPS);

  // Eventhandler (Sicherheit: ggf. doppelte vermeiden)
  document.removeEventListener('keydown', keyDownHandler);
  document.removeEventListener('keyup', keyUpHandler);
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  
  gameActive = true;
}


function checkTrapCatch() {
  if (!player.trap) return;
  const caught = [];
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const g = ghosts[i];
    if (Math.abs(g.x - player.trap.x) <= 1 && Math.abs(g.y - player.trap.y) <= 1) {
      caught.push(i);
    }
  }
  if (caught.length > 0) {
    let now = Date.now();
    if (now - lastGhostCatchTime < 3000) {
      catchCombo++;
    } else {
      catchCombo = 0;
    }
    lastGhostCatchTime = now;

    let points = caught.length;
    if (caught.length > 1) points += (caught.length * (caught.length - 1)) / 2;
    if (catchCombo > 0) { points += 10 * catchCombo * catchCombo;}


    player.score += points;

    if (caught.length > 1) {
      showFloatingText(player.x, player.y, `MULTI! +${points}`);
    } else if (catchCombo > 0) {
      showFloatingText(player.x, player.y, `COMBO +${points}`);
    } else {
      showFloatingText(player.x, player.y, `+${points}`);
    }

    for (let idx of caught) {
      ghosts.splice(idx, 1);
    }
    for (let i=0; i<caught.length*2; i++) {
      ghosts.push({ ...randomEmptyPosition(), dx: 1, dy: 0, cooldown: 0, moveCooldown: 0 });
    }
    player.trap = null;
  }
}

function keyDownHandler(e) {
  if (!gameActive) return;
  if ((e.key === " " || e.code === "Space") && !e.repeat) { placeTrap(); return; }
  switch (e.key) {
    case 'ArrowLeft':
    case 'a': heldDirections['left'] = true; player.dir = 'left'; break;
    case 'ArrowRight':
    case 'd': heldDirections['right'] = true; player.dir = 'right'; break;
    case 'ArrowUp':
    case 'w': heldDirections['up'] = true; player.dir = 'up'; break;
    case 'ArrowDown':
    case 's': heldDirections['down'] = true; player.dir = 'down'; break;
    case 'Shift': if (player.cooldown <= 0) dodge(); break;
  }
}
function keyUpHandler(e) {
  switch (e.key) {
    case 'ArrowLeft':
    case 'a': heldDirections['left'] = false; break;
    case 'ArrowRight':
    case 'd': heldDirections['right'] = false; break;
    case 'ArrowUp':
    case 'w': heldDirections['up'] = false; break;
    case 'ArrowDown':
    case 's': heldDirections['down'] = false; break;
  }
}
function movePlayer() {
  if (!gameActive) return;
  let dx = 0, dy = 0;
  if (heldDirections['left']) { dx = -1; player.dir = 'left'; }
  else if (heldDirections['right']) { dx = 1; player.dir = 'right'; }
  else if (heldDirections['up']) { dy = -1; player.dir = 'up'; }
  else if (heldDirections['down']) { dy = 1; player.dir = 'down'; }
  playerMoveInterval = player.speedTimer > 0 ? 2 : MOVE_INTERVAL;
  if ((dx !== 0 || dy !== 0) && moveTick % playerMoveInterval === 0) {
    let newx = player.x + dx, newy = player.y + dy;
    if (obstacles[newy] && obstacles[newy][newx] === 0) {
      player.x = newx; player.y = newy;
    }
  }
}
function placeTrap() {
  let tx = player.x, ty = player.y;
  switch (player.dir) { case 'right': tx++; break; case 'left': tx--; break; case 'up': ty--; break; case 'down': ty++; break; }
  if (obstacles[ty] && obstacles[ty][tx] === 0) {
    player.trap = { x: tx, y: ty };
  }
}
function dodge() {
  let dx = 0, dy = 0;
  switch (player.dir) { case 'right': dx = 1; break; case 'left': dx = -1; break; case 'up': dy = -1; break; case 'down': dy = 1; break; }
  for (let j = 0; j < 2; j++) {
    if (obstacles[player.y + dy] && obstacles[player.y + dy][player.x + dx] === 0) {
      player.x += dx; player.y += dy;
    }
  }
  player.cooldown = FPS * 2;
}
function maybeSpawnPowerup() {
  if (powerups.length < 2 && Math.random() < 0.012) {
    let t = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    let p = randomEmptyPosition();
    powerups.push({ type: t, x: p.x, y: p.y, timer: FPS * 20 });
  }
}
function checkPowerupPickup() {
  for (let i = 0; i < powerups.length; i++) {
    let p = powerups[i];
    if (p.x === player.x && p.y === player.y) {
      if (p.type === "speed") player.speedTimer = FPS * 8;
      if (p.type === "shield") player.shieldTimer = FPS * 4;
      if (p.type === "life" && player.lives < 9) {
        player.lives++;
        showFloatingText(player.x, player.y, "♥ +1", "#ff5555");
}
powerups.splice(i, 1);
break;

    }
  }
}
function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].timer--;
    if (powerups[i].timer <= 0) { powerups.splice(i, 1); }
  }
  if (player.speedTimer > 0) player.speedTimer--;
  if (player.shieldTimer > 0) player.shieldTimer--;
}
function updateGhosts() {
  ghosts.forEach(g => {
    if (g.cooldown > 0) { g.cooldown--; return; }
    if (g.moveCooldown > 0) { g.moveCooldown--; return; }
    g.moveCooldown = 12;
    if (Math.random() < 0.3) {
      let dx = 0, dy = 0;
      if (Math.abs(player.x - g.x) > Math.abs(player.y - g.y)) {
        dx = player.x > g.x ? 1 : -1;
      } else if (player.y !== g.y) {
        dy = player.y > g.y ? 1 : -1;
      }
      let nx = g.x + dx, ny = g.y + dy;
      if (obstacles[ny] && obstacles[ny][nx] === 0) { g.dx = dx; g.dy = dy; }
      else { [g.dx, g.dy] = [[1,0],[0,1],[-1,0],[0,-1]][Math.floor(Math.random() * 4)]; }
    } else {
      if (Math.random() < 0.15) {
        [g.dx, g.dy] = [[1,0],[0,1],[-1,0],[0,-1]][Math.floor(Math.random() * 4)];
      }
    }
    let nx = g.x + g.dx, ny = g.y + g.dy;
    if (obstacles[ny] && obstacles[ny][nx] === 0) { g.x = nx; g.y = ny; }
    if (Math.abs(g.x - player.x) < 2 && Math.abs(g.y - player.y) < 2 && (!player.shieldTimer) && player.invuln <= 0) {
      player.lives--;
      showFloatingText(player.x, player.y, "♥ -1", "#cfcfcf");
      catchCombo = 0;
      player.invuln = FPS;
      g.cooldown = FPS * 2;
      if (player.lives <= 0) { endGame(false); }
    }
  });
}
function gameLoop() {
  if (!gameActive) return;
  if (player.cooldown > 0) player.cooldown--;
  if (player.invuln > 0) player.invuln--;
  moveTick++;
  movePlayer();
  gameTimer--;
  maybeSpawnPowerup();
  updatePowerups();
  updateGhosts();
  checkTrapCatch();
  checkPowerupPickup();
  draw();
  if (gameTimer <= 0) { endGame(true); }
}
function endGame(timerEnd) {
  gameActive = false;
  fadeOutGameMusic();
  if (gameOverSound) {
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(()=>{});
  }
  setTimeout(() => {
    showHighscoreOverlay(
      player.name,
      player.score,
      timerEnd ? "timeout" : "lifeloss"
    );
  }, 200);
}

function drawGhost(ctx, x, y, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 2 * Math.PI, false);
  ctx.lineTo(x + r, y + r * 0.6);
  const segments = 4;
  for (let i = segments; i >= 1; i--) {
    const cx = x + r * Math.cos(Math.PI * (1 - i / segments));
    const cy = y + r * 0.6 + (i % 2 === 0 ? 6 : 0);
    ctx.quadraticCurveTo(cx, cy, cx, cy);
  }
  ctx.lineTo(x - r, y + r * 0.6);
  ctx.closePath();
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r/3.3, y - r/5, r/4, 0, 2 * Math.PI);
  ctx.arc(x + r/3.3, y - r/5, r/4, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r/3.3, y - r/5, r/7, 0, 2 * Math.PI);
  ctx.arc(x + r/3.3, y - r/5, r/7, 0, 2 * Math.PI);
  ctx.fillStyle = "#1358e8";
  ctx.fill();
  ctx.restore();
}
function drawPlayer(ctx, x, y, r, color, dir="down") {
  ctx.save();
  const bodyR = r * 1.10, headR = r * 0.48, legOff = r * 0.45;
  const legY = y + r * 1.05, armOffX = r * 0.93, armOffY = y + r * 0.15;
  const eyeDx = r * 0.20, eyeDy = r * 0.10, eyeR = r * 0.13;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.ellipse(x, y + r*0.13, bodyR*0.80, bodyR*0.95, 0, 0, 2*Math.PI);
  ctx.fillStyle = color;
  ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y - r*0.38, headR, 0, 2*Math.PI);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.97;
  ctx.fill(); ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.arc(x - eyeDx, y - r*0.38 - eyeDy, eyeR, 0, 2 * Math.PI);
  ctx.arc(x + eyeDx, y - r*0.38 - eyeDy, eyeR, 0, 2 * Math.PI);
  ctx.fillStyle = "#221a24";
  ctx.globalAlpha = 0.89; ctx.fill(); ctx.globalAlpha = 1.0;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x - armOffX, armOffY, r*0.17, r*0.21, -0.45, 0, 2*Math.PI);
  ctx.ellipse(x + armOffX, armOffY, r*0.17, r*0.21, 0.45, 0, 2*Math.PI);
  ctx.fillStyle = color; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1.0;
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x - legOff, legY, r*0.22, r*0.15, -0.08, 0, 2*Math.PI);
  ctx.ellipse(x + legOff, legY, r*0.22, r*0.15, 0.08, 0, 2*Math.PI);
  ctx.fillStyle = "#664a17"; ctx.globalAlpha = 0.82; ctx.fill(); ctx.globalAlpha = 1.0;
  ctx.restore(); ctx.restore();
}

function draw() {
  ctx.fillStyle = '#181b25';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    if (obstacles[y][x] === 1) {
      ctx.fillStyle = '#44444c';
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }


  if (player.trap) {
  ctx.save();

  // Gelber Glow-Kreis (Transparenz)
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(
    player.trap.x * TILE + TILE / 2,
    player.trap.y * TILE + TILE / 2,
    TILE * 1.5,
    0, 2 * Math.PI
  );
  ctx.fillStyle = '#ffee58';
  ctx.fill();

  // Rechteck
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(player.trap.x * TILE + 6, player.trap.y * TILE + 12, TILE - 12, TILE - 24);

  // Rahmen
  ctx.strokeStyle = '#a67c00';
  ctx.strokeRect(player.trap.x * TILE + 6, player.trap.y * TILE + 12, TILE - 12, TILE - 24);

  // Symbol
  ctx.font = '20px monospace';
  ctx.strokeStyle = '#a67c00';
  ctx.strokeText('✪', player.trap.x * TILE + 10, player.trap.y * TILE + TILE - 10);

  ctx.restore();
}

  powerups.forEach(p => {
    ctx.save();
    if (p.type === "speed") {
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(p.x * TILE + TILE / 2, p.y * TILE + TILE / 2, TILE / 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '17px monospace';
      ctx.fillStyle = '#0ff';
      ctx.fillText('S', p.x * TILE + 12, p.y * TILE + TILE / 1.5);
    } else if (p.type === "life") {
      ctx.fillStyle = '#ff5555';
      ctx.beginPath();
      ctx.arc(p.x * TILE + TILE / 2, p.y * TILE + TILE / 2, TILE / 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '17px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('♥', p.x * TILE + 10, p.y * TILE + TILE / 1.5);
    } else if (p.type === "shield") {
      ctx.fillStyle = '#ffee58';
      ctx.beginPath();
      ctx.arc(p.x * TILE + TILE / 2, p.y * TILE + TILE / 2, TILE / 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '17px monospace';
      ctx.fillStyle = '#a67c00';
      ctx.fillText('U', p.x * TILE + 11, p.y * TILE + TILE / 1.5);
    }
    ctx.restore();
  });

  const PLAYER_RADIUS = TILE * 1.05;
  drawPlayer(
    ctx,
    player.x * TILE + TILE / 2,
    player.y * TILE + TILE / 2,
    PLAYER_RADIUS / 2,
    player.color,
    player.dir
  );
  if (player.shieldTimer > 0) {
    ctx.beginPath();
    ctx.arc(player.x*TILE+TILE/2, player.y*TILE+TILE/2, PLAYER_RADIUS/2+8+2*Math.sin(Date.now()/250), 0, 2*Math.PI);
    ctx.strokeStyle = "#ffee58";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
  }
  if (player.speedTimer > 0) {
    ctx.beginPath();
    ctx.arc(player.x*TILE+TILE/2, player.y*TILE+TILE/2, PLAYER_RADIUS/2+16+3*Math.cos(Date.now()/250), 0, 2*Math.PI);
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
  }
  ctx.restore();
  ghosts.forEach(g => {
    drawGhost(
      ctx,
      g.x*TILE + TILE/2,
      g.y*TILE + TILE/2,
      TILE*0.7/2
    );
  });
  floatingTexts = floatingTexts.filter(ft => Date.now()-ft.t < 1300);
  floatingTexts.forEach(ft => {
    let alpha = 1 - (Date.now()-ft.t)/1300;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color || "#00ffea";
    ctx.font = 'bold 20px monospace';
    ctx.shadowColor = "transparent";   // <-- Reset!
    ctx.shadowBlur = 0;                // <-- Reset!
    ctx.fillText(ft.text, ft.x*TILE+TILE/2, ft.y*TILE+TILE/2-20 - (1-alpha)*34);
    ctx.restore();
  });

  // ===== NEUES HUD IMMER AKTUELL HALTEN =====
  if (document.getElementById('game-life')) {
    document.getElementById('game-life').textContent = "♥".repeat(player.lives);
  }
  if (document.getElementById('game-score')) {
    document.getElementById('game-score').textContent = player.score;
  }
  if (document.getElementById('game-timer')) {
    document.getElementById('game-timer').textContent =
      Math.max(0, Math.ceil(gameTimer / FPS)) + " s";
  }
}
// Highscore-Tabelle (Top 5)
const staticHighscores = [
  { name: "ElliG0D", score: 49249 },
  { name: "MadMax", score: 44963 },
  { name: "Grady_the_Gr8", score: 37170 },
  { name: "XenoSlayer", score: 31921 },
  { name: "RaV3nX", score: 28287 }
];

// Anzeige-Funktion für das Highscore-Overlay
function showHighscoreOverlay(playerName, playerScore, gameOverReason) {
  const overlay = document.getElementById('highscore-overlay');
  let highscores = [...staticHighscores];
  let playerInTop = false;
  for (let i = 0; i < highscores.length; i++) {
    if (playerScore > highscores[i].score) {
      highscores.splice(i, 0, { name: playerName, score: playerScore });
      playerInTop = true;
      break;
    }
  }
  if (!playerInTop && !highscores.find(h => h.name === playerName)) {
    document.getElementById('player-score-row').innerHTML =
      `<div style="color:#ffeafd; margin-bottom:5px;">Dein Score: <b>${playerScore}</b></div>`;
  } else {
    document.getElementById('player-score-row').innerHTML = '';
  }
  highscores = highscores.slice(0, 5);
  const listHtml = highscores.map((h, idx) => {
  let style = (h.name === playerName && playerScore) 
    ? 'background:#322645;color:#ffea7b;' 
    : '';
  return `<tr style="${style}">
    <td style="padding:2px 16px 2px 8px; text-align:right;">${idx+1}.</td>
    <td style="padding:2px 10px; text-align:left; color:#ff5782;">${h.name}</td>
    <td style="padding:2px 10px; text-align:right;">${h.score}</td>
  </tr>`;
}).join("");
  document.getElementById('highscore-list').innerHTML = listHtml;
  let reasonText = '';
  if (gameOverReason === 'timeout') reasonText = '⏰ Zeit abgelaufen!';
  else if (gameOverReason === 'lifeloss') reasonText = '♥️  Alle Leben verloren!';
  else reasonText = 'Spiel beendet';
  document.getElementById('gameover-reason').textContent = reasonText;
  overlay.style.display = 'block';
}

// Highscore-Overlay-Buttons
document.getElementById('btn-retry').onclick = function() {
  document.getElementById('highscore-overlay').style.display = 'none';

  // Transition-Sound korrekt abspielen
  if (transitionSound) {
    transitionSound.pause();
    transitionSound.currentTime = 0;
    transitionSound.volume = 1.0;
    transitionSound.play().catch(()=>{});
  }

  // Vorheriges Canvas entfernen (falls vorhanden)
  if (canvas && canvas.parentNode) {
  canvas.parentNode.removeChild(canvas);
}
canvas = null;


  // Alte Eventhandler entfernen
  document.removeEventListener('keydown', keyDownHandler);
  document.removeEventListener('keyup', keyUpHandler);

  // Spielvariablen zurücksetzen, aber erst nach Transition gameActive setzen!
  ghosts = [];
  powerups = [];
  gameTimer = GAME_TIME * FPS;
  player.score = 0;
  player.lives = 5;
  player.x = 2; player.y = 2;
  player.trap = null;
  player.cooldown = 0;
  player.invuln = 0;
  player.speedTimer = 0;
  player.shieldTimer = 0;

  gameActive = false; // WICHTIG: Erst aktivieren, wenn Spiel auch sichtbar!

  // Transition starten, nach Abschluss: Musik und Spielstart aktivieren
  startTransitionOverlay(function() {
    playGameMusic();
    gameActive = true; // jetzt erst Spiel starten und Timer freigeben
    initializeGame();
  });
};

document.getElementById('btn-menu').onclick = function() {
  document.getElementById('highscore-overlay').style.display = 'none';

  // SPIEL-INTERVALL aufräumen!
  if (typeof gameInterval !== 'undefined' && gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  // Canvas entfernen!
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  canvas = null;

  // Eventhandler abmelden
  document.removeEventListener('keydown', keyDownHandler);
  document.removeEventListener('keyup', keyUpHandler);

  // Musik umschalten
  stopGameMusic();
  playMenuMusic();

  // HUD und Spielvariablen vollständig zurücksetzen
  if (document.getElementById('hud')) {
    document.getElementById('hud').style.display = 'none';
    document.getElementById('game-life').textContent = "♥♥♥♥♥";
    document.getElementById('game-score').textContent = "0";
    document.getElementById('game-timer').textContent = GAME_TIME + " s";
  }

  // **HIER JETZT DEN SPIELSTAND, GHOSTS, POWERUPS ETC. RESETTEN**
  ghosts = [];
  powerups = [];
  floatingTexts = [];
  catchCombo = 0;
  lastGhostCatchTime = 0;
  moveTick = 0;
  heldDirections = {};
  gameTimer = GAME_TIME * FPS;
  player.x = 2; player.y = 2;
  player.trap = null;
  player.cooldown = 0;
  player.invuln = 0;
  player.speedTimer = 0;
  player.shieldTimer = 0;
  player.score = 0;
  player.lives = 5;

  // Player-Name-Feld im Menü leeren (falls vorhanden)
  let playerNameField = document.getElementById('player-name');
  if (playerNameField) playerNameField.value = "";

  // Hauptmenü anzeigen, andere Layer ausblenden
  mainMenu.style.display = '';
  menuBg.style.display = '';
  gameBg.style.display = 'none';  // <--- Bild ausblenden!
  rainCanvas.style.display = '';
  rulesOverlay.style.display = 'none';
  transitionOverlay.style.display = 'none';

  // Footer wieder zeigen!
  showFooterBar();
};



