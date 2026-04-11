const STORAGE_KEYS = {
  bestDistance: "rush-hour-slip-best-distance",
  audioEnabled: "rush-hour-slip-audio-enabled"
};

const CONFIG = {
  laneCount: 5,
  targetDistance: 1250,
  baseSpeed: 30,
  speedRamp: 0.78,
  spawnBase: 0.84,
  spawnMin: 0.28,
  obstacleBaseSpeed: 300,
  obstacleRamp: 36,
  maxCrowdLevel: 8
};

const TRACKS = {
  title: {
    label: "タイトルBGM",
    tempo: 92,
    root: 174.61,
    length: 16,
    channels: [
      { wave: "triangle", volume: 0.028, sustain: 1.4, pattern: [0, null, 7, null, 3, null, 10, null, 0, null, 7, null, 5, null, 10, null] },
      { wave: "sine", volume: 0.016, sustain: 0.8, root: 349.23, pattern: [12, null, 14, null, 15, null, 12, null, 10, null, 12, null, 14, null, 10, null] }
    ]
  },
  play: {
    label: "走行BGM",
    tempo: 126,
    root: 164.81,
    length: 16,
    channels: [
      { wave: "square", volume: 0.02, sustain: 0.5, filter: 620, pattern: [0, null, 0, null, 3, null, 5, null, 0, null, 0, null, 7, null, 5, null] },
      { wave: "triangle", volume: 0.018, sustain: 0.55, root: 329.63, pattern: [7, 10, 12, 10, 7, 10, 14, 10, 7, 10, 15, 10, 7, 10, 14, 12] },
      { wave: "sine", volume: 0.012, sustain: 0.35, root: 659.25, pattern: [19, null, 17, null, 19, null, 22, null, 19, null, 17, null, 24, null, 22, null] }
    ]
  },
  clear: {
    label: "クリアBGM",
    tempo: 134,
    root: 196,
    length: 16,
    channels: [
      { wave: "triangle", volume: 0.024, sustain: 0.7, pattern: [0, 4, 7, 12, 7, 4, 12, 16, 12, 7, 16, 19, 16, 12, 7, 4] },
      { wave: "sine", volume: 0.014, sustain: 1.1, root: 392, pattern: [12, null, 16, null, 19, null, 24, null, 16, null, 19, null, 24, null, 28, null] }
    ]
  },
  fail: {
    label: "リザルトBGM",
    tempo: 80,
    root: 146.83,
    length: 16,
    channels: [
      { wave: "sawtooth", volume: 0.015, sustain: 0.95, filter: 760, pattern: [0, null, 3, null, 2, null, -2, null, 0, null, 3, null, 2, null, -4, null] },
      { wave: "triangle", volume: 0.012, sustain: 0.65, root: 293.66, pattern: [7, null, 10, null, 8, null, 5, null, 7, null, 10, null, 8, null, 3, null] }
    ]
  }
};

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  overlay: document.querySelector("#overlay"),
  overlayTag: document.querySelector("#overlayTag"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayText: document.querySelector("#overlayText"),
  overlayFacts: document.querySelector("#overlayFacts"),
  primaryButton: document.querySelector("#primaryButton"),
  audioToggle: document.querySelector("#audioToggle"),
  remainingValue: document.querySelector("#remainingValue"),
  crowdValue: document.querySelector("#crowdValue"),
  bestValue: document.querySelector("#bestValue"),
  trackValue: document.querySelector("#trackValue"),
  sceneLabel: document.querySelector("#sceneLabel"),
  hintText: document.querySelector("#hintText"),
  leftButton: document.querySelector("#leftButton"),
  rightButton: document.querySelector("#rightButton")
};

const state = {
  scene: "title",
  running: false,
  lastTime: 0,
  elapsed: 0,
  distance: 0,
  crowdLevel: 1,
  spawnTimer: 0,
  flashTimer: 0,
  bestDistance: Number.parseInt(localStorage.getItem(STORAGE_KEYS.bestDistance) || "0", 10),
  laneWidth: 0,
  playerY: 0,
  pointerStartX: null,
  obstacles: [],
  particles: [],
  player: { lane: 2, x: 0, targetX: 0, width: 48, height: 74 }
};

class MusicController {
  constructor(onTrackChange) {
    this.ctx = window.AudioContext ? new AudioContext() : null;
    this.onTrackChange = onTrackChange;
    this.enabled = localStorage.getItem(STORAGE_KEYS.audioEnabled) !== "off";
    this.currentTrack = "title";
    this.timerId = null;
    this.step = 0;
    this.userActivated = false;
  }

  async activate() {
    this.userActivated = true;
    if (this.ctx && this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch (error) {
        return;
      }
    }
    if (this.enabled) {
      this.startLoop();
    }
  }

  setEnabled(nextEnabled) {
    this.enabled = nextEnabled;
    localStorage.setItem(STORAGE_KEYS.audioEnabled, nextEnabled ? "on" : "off");
    if (!nextEnabled) {
      this.stopLoop();
      return;
    }
    if (this.userActivated) {
      this.activate();
    }
  }

  setTrack(trackName) {
    this.currentTrack = trackName;
    this.step = 0;
    this.onTrackChange(TRACKS[trackName].label);
    if (this.enabled && this.userActivated) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  startLoop() {
    if (!this.ctx || !this.enabled || !this.userActivated) {
      return;
    }
    this.stopLoop();
    const track = TRACKS[this.currentTrack];
    const stepMs = 60000 / track.tempo / 2;
    const tick = () => {
      const liveTrack = TRACKS[this.currentTrack];
      const patternIndex = this.step % liveTrack.length;
      liveTrack.channels.forEach((channel) => {
        const note = channel.pattern[patternIndex];
        if (note == null) {
          return;
        }
        this.playNote(liveTrack, channel, note);
      });
      this.step += 1;
    };
    tick();
    this.timerId = window.setInterval(tick, stepMs);
  }

  stopLoop() {
    if (this.timerId != null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  playNote(track, channel, semitoneOffset) {
    if (!this.ctx || !this.enabled || !this.userActivated) {
      return;
    }
    const now = this.ctx.currentTime;
    const stepDuration = 60 / track.tempo / 2;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = channel.filter || 1400;
    oscillator.type = channel.wave;
    oscillator.frequency.value = (channel.root || track.root) * Math.pow(2, semitoneOffset / 12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(channel.volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + stepDuration * (channel.sustain || 0.8));
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + stepDuration * (channel.sustain || 0.8) + 0.04);
  }

  playCue(kind) {
    if (!this.ctx || !this.enabled || !this.userActivated) {
      return;
    }
    const cueMap = {
      move: { wave: "triangle", start: 520, end: 660, duration: 0.06, volume: 0.028 },
      start: { wave: "square", start: 420, end: 520, duration: 0.1, volume: 0.032 },
      hit: { wave: "sawtooth", start: 180, end: 120, duration: 0.16, volume: 0.04 },
      clear: { wave: "sine", start: 660, end: 880, duration: 0.22, volume: 0.035 }
    };
    const cue = cueMap[kind];
    if (!cue) {
      return;
    }
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    oscillator.type = cue.wave;
    oscillator.frequency.setValueAtTime(cue.start, now);
    oscillator.frequency.exponentialRampToValueAtTime(cue.end, now + cue.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(cue.volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + cue.duration + 0.02);
  }
}

const music = new MusicController((trackLabel) => {
  ui.trackValue.textContent = trackLabel;
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function laneCenter(lane) {
  return state.laneWidth * lane + state.laneWidth / 2;
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  state.laneWidth = rect.width / CONFIG.laneCount;
  state.playerY = rect.height - 132;
  state.player.targetX = laneCenter(state.player.lane);
  if (!state.running) {
    state.player.x = state.player.targetX;
  }
}

function updateAudioButton() {
  ui.audioToggle.setAttribute("aria-pressed", String(music.enabled));
  ui.audioToggle.textContent = music.enabled ? "BGM ON" : "BGM OFF";
}

function updateHud() {
  const remaining = Math.max(0, CONFIG.targetDistance - Math.floor(state.distance));
  ui.remainingValue.textContent = `${remaining}m`;
  ui.crowdValue.textContent = `Lv.${state.crowdLevel}`;
  ui.bestValue.textContent = `${state.bestDistance}m`;
}

function setOverlay(visible) {
  ui.overlay.classList.toggle("is-hidden", !visible);
}

function renderOverlayFacts(facts) {
  ui.overlayFacts.innerHTML = facts.map((fact) => `<div><dt>${fact.label}</dt><dd>${fact.value}</dd></div>`).join("");
}

function setScene(sceneName) {
  state.scene = sceneName;
  document.body.dataset.scene = sceneName;

  if (sceneName === "title") {
    ui.sceneLabel.textContent = "タイトル";
    ui.hintText.textContent = "左右ボタンかスワイプで人波を避けます。";
    ui.overlayTag.textContent = "Play Store Ready Prototype";
    ui.overlayTitle.textContent = "ホームまで、人波を抜けろ。";
    ui.overlayText.textContent = "左右にすり抜けて、停車前にホーム位置までたどり着く短時間ゲームです。日本語UI、オフライン前提、外部APIなしで構成しています。";
    ui.primaryButton.textContent = "プレイ開始";
    renderOverlayFacts([
      { label: "配布前提", value: "Play ストア / 縦持ち" },
      { label: "操作", value: "左右ボタン / スワイプ" },
      { label: "BGM", value: "タイトル / 走行 / 結果" }
    ]);
    setOverlay(true);
    music.setTrack("title");
    return;
  }

  if (sceneName === "play") {
    ui.sceneLabel.textContent = "走行中";
    ui.hintText.textContent = "ぶつからないよう、少し早めにレーンを切り替えます。";
    setOverlay(false);
    music.setTrack("play");
    return;
  }

  const reachedDistance = clamp(Math.floor(state.distance), 0, CONFIG.targetDistance);
  const elapsedText = `${state.elapsed.toFixed(1)}秒`;
  const isClear = sceneName === "clear";
  ui.sceneLabel.textContent = isClear ? "到着" : "失敗";
  ui.hintText.textContent = isClear ? "ホームに滑り込みました。" : "少し早めの回避で通しやすくなります。";
  ui.overlayTag.textContent = isClear ? "Platform Clear" : "Crushed";
  ui.overlayTitle.textContent = isClear ? "ホームに到着。" : "人波に飲まれた。";
  ui.overlayText.textContent = isClear
    ? `到達時間 ${elapsedText}。短いプレイでも達成感が出るように、最後までテンポを落とさない構成です。`
    : `到達距離 ${reachedDistance}m。混雑が上がる前に次の安全レーンを見つけると抜けやすくなります。`;
  ui.primaryButton.textContent = "もう一回";
  renderOverlayFacts([
    { label: "到達距離", value: `${reachedDistance}m` },
    { label: "ベスト", value: `${state.bestDistance}m` },
    { label: "BGM", value: TRACKS[sceneName].label }
  ]);
  setOverlay(true);
  music.setTrack(isClear ? "clear" : "fail");
}

function resetGame() {
  state.running = true;
  state.lastTime = 0;
  state.elapsed = 0;
  state.distance = 0;
  state.crowdLevel = 1;
  state.spawnTimer = 0;
  state.flashTimer = 0;
  state.obstacles = [];
  state.particles = [];
  state.player.lane = 2;
  state.player.targetX = laneCenter(state.player.lane);
  state.player.x = state.player.targetX;
  updateHud();
  setScene("play");
}

function startGame() {
  resetGame();
  music.playCue("start");
}

function finishGame(cleared) {
  if (!state.running) {
    return;
  }
  state.running = false;
  state.flashTimer = 0.26;
  const reachedDistance = clamp(Math.floor(state.distance), 0, CONFIG.targetDistance);
  if (reachedDistance > state.bestDistance) {
    state.bestDistance = reachedDistance;
    localStorage.setItem(STORAGE_KEYS.bestDistance, String(reachedDistance));
  }
  emitParticles(cleared ? "#abffb3" : "#ff6c8c", 24);
  music.playCue(cleared ? "clear" : "hit");
  updateHud();
  setScene(cleared ? "clear" : "fail");
}

function movePlayer(direction) {
  if (!state.running) {
    return;
  }
  const nextLane = clamp(state.player.lane + direction, 0, CONFIG.laneCount - 1);
  if (nextLane === state.player.lane) {
    return;
  }
  state.player.lane = nextLane;
  state.player.targetX = laneCenter(nextLane);
  emitParticles("#7be8ff", 8);
  music.playCue("move");
}

function emitParticles(color, count) {
  for (let index = 0; index < count; index += 1) {
    state.particles.push({
      x: state.player.x + (Math.random() - 0.5) * 28,
      y: state.playerY + state.player.height * 0.32,
      vx: (Math.random() - 0.5) * 90,
      vy: 20 + Math.random() * 120,
      size: 2 + Math.random() * 3.8,
      life: 0.28 + Math.random() * 0.4,
      color
    });
  }
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
}

function spawnRow() {
  const lanes = [0, 1, 2, 3, 4];
  shuffle(lanes);
  const maxBlocked = state.crowdLevel >= 5 ? 4 : 3;
  const blockedCount = clamp(
    1 + Math.floor(Math.random() * (1 + Math.min(maxBlocked, 1 + Math.floor(state.crowdLevel / 2)))),
    1,
    CONFIG.laneCount - 1
  );
  const blocked = lanes.slice(0, blockedCount);

  blocked.forEach((lane, index) => {
    state.obstacles.push({
      lane,
      x: laneCenter(lane),
      y: -100 - index * 10,
      width: state.laneWidth * (0.72 + Math.random() * 0.12),
      height: 82 + Math.random() * 18,
      speed: CONFIG.obstacleBaseSpeed + state.crowdLevel * CONFIG.obstacleRamp + Math.random() * 42,
      sway: Math.random() * Math.PI * 2,
      tint: Math.random() > 0.45 ? "#7bc8ff" : "#ff6c8c"
    });
  });
}

function checkCollision(obstacle) {
  const playerLeft = state.player.x - state.player.width / 2;
  const playerTop = state.playerY - state.player.height / 2;
  const obstacleLeft = obstacle.x - obstacle.width / 2;
  const obstacleTop = obstacle.y - obstacle.height / 2;

  return (
    playerLeft < obstacleLeft + obstacle.width &&
    playerLeft + state.player.width > obstacleLeft &&
    playerTop < obstacleTop + obstacle.height &&
    playerTop + state.player.height > obstacleTop
  );
}

function updateParticles(delta) {
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.particles.forEach((particle) => {
    particle.life -= delta;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
  });
}

function updateGame(delta) {
  state.player.x += (state.player.targetX - state.player.x) * Math.min(1, delta * 18);

  if (!state.running) {
    state.flashTimer = Math.max(0, state.flashTimer - delta);
    updateParticles(delta);
    return;
  }

  state.elapsed += delta;
  state.distance += (CONFIG.baseSpeed + state.elapsed * CONFIG.speedRamp) * delta;
  state.crowdLevel = 1 + Math.min(CONFIG.maxCrowdLevel - 1, Math.floor(state.distance / 170));
  state.flashTimer = Math.max(0, state.flashTimer - delta);

  if (state.distance >= CONFIG.targetDistance) {
    finishGame(true);
    return;
  }

  const spawnInterval = Math.max(CONFIG.spawnMin, CONFIG.spawnBase - state.crowdLevel * 0.062);
  state.spawnTimer += delta;
  if (state.spawnTimer >= spawnInterval) {
    spawnRow();
    state.spawnTimer = 0;
  }

  const stageHeight = canvas.clientHeight;
  state.obstacles = state.obstacles.filter((obstacle) => obstacle.y < stageHeight + 130);
  for (const obstacle of state.obstacles) {
    obstacle.y += obstacle.speed * delta;
    obstacle.x = laneCenter(obstacle.lane) + Math.sin(state.elapsed * 1.7 + obstacle.sway) * 5;
    if (checkCollision(obstacle)) {
      finishGame(false);
      break;
    }
  }

  updateParticles(delta);
  updateHud();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawBackground(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#35506d");
  gradient.addColorStop(0.26, "#1b2d40");
  gradient.addColorStop(1, "#06111b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 230, 180, 0.14)";
  ctx.fillRect(0, 64, width, 5);

  for (let index = 0; index < 5; index += 1) {
    const x = 24 + index * (width - 48) / 4;
    const sway = Math.sin(state.elapsed * 1.3 + index * 0.7) * 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 68);
    ctx.lineTo(x + sway, 136);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 211, 110, 0.25)";
    ctx.beginPath();
    ctx.arc(x + sway, 156, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.stroke();
  }

  const stripeOffset = (state.elapsed * 260) % 72;
  for (let index = -2; index < 16; index += 1) {
    const y = index * 72 + stripeOffset;
    ctx.fillStyle = index % 2 === 0 ? "rgba(255, 255, 255, 0.025)" : "rgba(255, 211, 110, 0.02)";
    ctx.fillRect(0, y, width, 30);
  }

  ctx.fillStyle = "rgba(255, 211, 110, 0.2)";
  ctx.fillRect(0, height - 78, width, 6);
}

function drawLanes(width, height) {
  for (let lane = 0; lane < CONFIG.laneCount; lane += 1) {
    const left = lane * state.laneWidth;
    ctx.fillStyle = lane === state.player.lane ? "rgba(123, 232, 255, 0.05)" : "rgba(255, 255, 255, 0.01)";
    ctx.fillRect(left, 0, state.laneWidth, height);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 18]);
  for (let lane = 1; lane < CONFIG.laneCount; lane += 1) {
    const x = lane * state.laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawRouteBar(width) {
  const barX = 18;
  const barY = 20;
  const barWidth = width - 36;
  const progress = clamp(state.distance / CONFIG.targetDistance, 0, 1);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  roundRect(barX, barY, barWidth, 12, 999);
  ctx.fill();
  const fillGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
  fillGradient.addColorStop(0, "#7be8ff");
  fillGradient.addColorStop(1, "#ffd36e");
  ctx.fillStyle = fillGradient;
  roundRect(barX, barY, barWidth * progress, 12, 999);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = '700 12px "BIZ UDPGothic", "Yu Gothic UI", sans-serif';
  ctx.fillText("Platform 3", barX, 54);
  ctx.textAlign = "right";
  ctx.fillText(`あと ${Math.max(0, CONFIG.targetDistance - Math.floor(state.distance))}m`, barX + barWidth, 54);
  ctx.textAlign = "left";
}

function drawCrowd(obstacle) {
  const left = obstacle.x - obstacle.width / 2;
  const top = obstacle.y - obstacle.height / 2;
  const headCount = clamp(Math.round(obstacle.width / 34), 2, 4);
  const gap = obstacle.width / (headCount + 1);

  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = obstacle.tint;
  ctx.fillStyle = obstacle.tint;
  roundRect(left, top + 18, obstacle.width, obstacle.height - 18, 18);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(7, 12, 20, 0.42)";
  roundRect(left + 8, top + 26, obstacle.width - 16, obstacle.height - 34, 12);
  ctx.fill();

  for (let index = 0; index < headCount; index += 1) {
    const headX = left + gap * (index + 1);
    const bob = Math.sin(state.elapsed * 4 + obstacle.sway + index) * 2.5;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(headX, top + 14 + bob, 7.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  const left = state.player.x - state.player.width / 2;
  const top = state.playerY - state.player.height / 2;
  const glow = ctx.createRadialGradient(state.player.x, top + 24, 0, state.player.x, top + 24, 56);
  glow.addColorStop(0, "rgba(255, 211, 110, 0.45)");
  glow.addColorStop(1, "rgba(255, 211, 110, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(state.player.x, top + 28, 58, 0, Math.PI * 2);
  ctx.fill();

  const bodyGradient = ctx.createLinearGradient(left, top, left, top + state.player.height);
  bodyGradient.addColorStop(0, "#ffe694");
  bodyGradient.addColorStop(1, "#ff9252");
  ctx.fillStyle = bodyGradient;
  roundRect(left, top + 16, state.player.width, state.player.height - 16, 16);
  ctx.fill();

  ctx.fillStyle = "rgba(7, 12, 20, 0.82)";
  roundRect(left + 9, top + 28, state.player.width - 18, state.player.height - 34, 10);
  ctx.fill();

  ctx.fillStyle = "#fff7d7";
  ctx.beginPath();
  ctx.arc(state.player.x, top + 10, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = clamp(particle.life * 1.8, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawFlash(width, height) {
  if (state.flashTimer <= 0) {
    return;
  }
  ctx.fillStyle = state.scene === "clear" ? "rgba(171, 255, 179, 0.16)" : "rgba(255, 108, 140, 0.16)";
  ctx.fillRect(0, 0, width, height);
}

function drawScene() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawLanes(width, height);
  drawRouteBar(width);
  state.obstacles.forEach(drawCrowd);
  drawParticles();
  drawPlayer();
  drawFlash(width, height);
}

function frame(time) {
  const delta = Math.min(0.032, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  updateGame(delta);
  drawScene();
  requestAnimationFrame(frame);
}

function registerInputs() {
  ui.primaryButton.addEventListener("click", () => {
    music.activate();
    startGame();
  });

  ui.audioToggle.addEventListener("click", () => {
    const nextEnabled = !music.enabled;
    music.setEnabled(nextEnabled);
    if (nextEnabled) {
      music.activate();
    }
    updateAudioButton();
  });

  ui.leftButton.addEventListener("click", () => movePlayer(-1));
  ui.rightButton.addEventListener("click", () => movePlayer(1));

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") {
      movePlayer(-1);
    }
    if (key === "arrowright" || key === "d") {
      movePlayer(1);
    }
    if ((key === "enter" || key === " ") && !state.running) {
      music.activate();
      startGame();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    state.pointerStartX = event.clientX;
  });

  canvas.addEventListener("pointerup", (event) => {
    if (state.pointerStartX == null) {
      return;
    }
    const deltaX = event.clientX - state.pointerStartX;
    if (Math.abs(deltaX) > 22) {
      movePlayer(deltaX > 0 ? 1 : -1);
    } else if (state.running) {
      const midpoint = canvas.getBoundingClientRect().left + canvas.clientWidth / 2;
      movePlayer(event.clientX > midpoint ? 1 : -1);
    }
    state.pointerStartX = null;
  });

  window.addEventListener("resize", resizeCanvas);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Ignore service worker registration errors in preview environments.
  });
}

function init() {
  document.body.dataset.boot = "ready";
  updateAudioButton();
  updateHud();
  resizeCanvas();
  registerInputs();
  registerServiceWorker();
  setScene("title");
  requestAnimationFrame(frame);
}

init();
