const STORAGE_KEYS = {
  bestStage: "rush-hour-slip-best-stage",
  audioEnabled: "rush-hour-slip-audio-enabled"
};

const CONFIG = {
  laneCount: 5,
  renderDistance: 160,
  collisionDistance: 18,
  collisionFootRadius: 12,
  baseStageLength: 360,
  stageLengthStep: 72,
  baseSpeed: 34,
  speedStep: 4,
  columnSpacing: 36,
  playerGroundYRatio: 0.86,
  playerFootOffset: 22
};

const STATION_THEMES = [
  {
    station: "東京",
    line: "山手線",
    destination: "上野・池袋方面",
    platform: "3番線",
    routeTitle: "中央改札から3番線ホームへ",
    routeText: "柱と待機列の隙間を抜け、ホーム先頭寄りで停車中の列車へ飛び込む。"
  },
  {
    station: "品川",
    line: "京浜東北線",
    destination: "大宮方面",
    platform: "5番線",
    routeTitle: "乗換通路を横切って5番線へ",
    routeText: "ベンチと案内板の間を抜ける。視界の奥に見える銀色の編成がゴール。"
  },
  {
    station: "新宿",
    line: "中央線快速",
    destination: "東京方面",
    platform: "11番線",
    routeTitle: "連絡通路の密集帯を突破する",
    routeText: "人の列が急に絞られる。早めに空きレーンを読んでホーム中央へ寄せる。"
  },
  {
    station: "渋谷",
    line: "埼京線",
    destination: "大崎方面",
    platform: "2番線",
    routeTitle: "広いコンコースを縫ってホームへ滑り込む",
    routeText: "清掃カートと工事サインが増える。止まらず、一直線に停車列車まで走り切る。"
  }
];

const OBSTACLE_TYPES = {
  crowd: { id: "crowd" },
  bench: { id: "bench" },
  sign: { id: "sign" },
  luggage: { id: "luggage" },
  cart: { id: "cart" }
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
    tempo: 132,
    root: 164.81,
    length: 16,
    channels: [
      { wave: "square", volume: 0.018, sustain: 0.48, filter: 720, pattern: [0, null, 0, null, 3, null, 5, null, 0, null, 7, null, 5, null, 3, null] },
      { wave: "triangle", volume: 0.016, sustain: 0.54, root: 329.63, pattern: [7, 10, 12, 10, 7, 10, 14, 10, 7, 10, 15, 10, 7, 10, 14, 12] },
      { wave: "sine", volume: 0.011, sustain: 0.32, root: 659.25, pattern: [19, null, 17, null, 19, null, 22, null, 19, null, 17, null, 24, null, 22, null] }
    ]
  },
  clear: {
    label: "クリアBGM",
    tempo: 136,
    root: 196,
    length: 16,
    channels: [
      { wave: "triangle", volume: 0.024, sustain: 0.7, pattern: [0, 4, 7, 12, 7, 4, 12, 16, 12, 7, 16, 19, 16, 12, 7, 4] },
      { wave: "sine", volume: 0.014, sustain: 1.1, root: 392, pattern: [12, null, 16, null, 19, null, 24, null, 16, null, 19, null, 24, null, 28, null] }
    ]
  },
  fail: {
    label: "リザルトBGM",
    tempo: 82,
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
  stageValue: document.querySelector("#stageValue"),
  lineValue: document.querySelector("#lineValue"),
  remainingValue: document.querySelector("#remainingValue"),
  hazardValue: document.querySelector("#hazardValue"),
  bestValue: document.querySelector("#bestValue"),
  sceneLabel: document.querySelector("#sceneLabel"),
  hintText: document.querySelector("#hintText"),
  routeTitle: document.querySelector("#routeTitle"),
  routeText: document.querySelector("#routeText"),
  stationValue: document.querySelector("#stationValue"),
  platformValue: document.querySelector("#platformValue"),
  destinationValue: document.querySelector("#destinationValue")
};

const state = {
  scene: "title",
  running: false,
  lastTime: 0,
  stageNumber: 1,
  stageSpec: null,
  distance: 0,
  stageElapsed: 0,
  flashTimer: 0,
  bestStage: Number.parseInt(localStorage.getItem(STORAGE_KEYS.bestStage) || "1", 10),
  pointerId: null,
  obstacles: [],
  particles: [],
  player: {
    lane: 2,
    lean: 0
  }
};

class MusicController {
  constructor() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    this.ctx = AudioContextCtor ? new AudioContextCtor() : null;
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
      move: { wave: "triangle", start: 540, end: 700, duration: 0.05, volume: 0.024 },
      start: { wave: "square", start: 380, end: 520, duration: 0.1, volume: 0.03 },
      hit: { wave: "sawtooth", start: 170, end: 110, duration: 0.18, volume: 0.04 },
      clear: { wave: "sine", start: 640, end: 900, duration: 0.22, volume: 0.032 }
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
    oscillator.stop(now + cue.duration + 0.03);
  }
}

const music = new MusicController();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function laneCenterAtWidth(lane, roadWidth, canvasWidth) {
  const centerIndex = (CONFIG.laneCount - 1) / 2;
  const normalized = (lane - centerIndex) / centerIndex;
  return canvasWidth * 0.5 + normalized * roadWidth * 0.43;
}

function projectDepth(relativeZ, width, height) {
  const clamped = clamp(relativeZ, 0, CONFIG.renderDistance);
  const ratio = 1 - clamped / CONFIG.renderDistance;
  const eased = Math.pow(ratio, 1.35);
  return {
    depth: eased,
    y: lerp(height * 0.2, height * 0.93, eased),
    width: lerp(width * 0.14, width * 0.9, eased)
  };
}

function currentTheme(stageNumber) {
  return STATION_THEMES[(stageNumber - 1) % STATION_THEMES.length];
}

function pickObstacleType(stageNumber, rowIndex, lane) {
  return OBSTACLE_TYPES.crowd;
}

function chooseLaneShift(stageNumber) {
  const bag = [0, 1, -1, 1, -1, 1, -1];
  return bag[Math.floor(Math.random() * bag.length)];
}

function buildStage(stageNumber) {
  const theme = currentTheme(stageNumber);
  const length = CONFIG.baseStageLength + (stageNumber - 1) * CONFIG.stageLengthStep;
  const speed = CONFIG.baseSpeed + (stageNumber - 1) * CONFIG.speedStep;
  const hazard = clamp(1 + Math.floor((stageNumber - 1) * 0.75), 1, 9);
  const spacingBase = Math.max(18, 31 - stageNumber);
  const extraSafeChance = Math.max(0.18 - stageNumber * 0.025, 0.04);
  const obstacles = [];
  const branches = [];
  const branchCount = clamp(1 + Math.floor((stageNumber - 1) / 2), 1, 3);
  const branchGap = (length - 170) / (branchCount + 1);
  let safeLane = 2;
  let z = 56;
  let rowIndex = 0;

  for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
    const direction = (stageNumber + branchIndex) % 2 === 0 ? -1 : 1;
    const targetLanes = direction < 0 ? [0, 1] : [3, 4];
    branches.push({
      z: Math.round(90 + branchGap * (branchIndex + 1)),
      signZ: Math.round(64 + branchGap * (branchIndex + 1)),
      direction,
      label: direction < 0 ? "LEFT ROUTE" : "RIGHT ROUTE",
      targetLanes,
      prepLanes: direction < 0 ? [0, 1, 2] : [2, 3, 4]
    });
  }

  while (z < length - 50) {
    const rowAdvance = spacingBase + Math.random() * 9 + (rowIndex % 4 === 0 ? 5 : 0);
    if (branches.some((branch) => z > branch.z - 28 && z < branch.z + 48)) {
      z += rowAdvance;
      rowIndex += 1;
      continue;
    }

    const forcedBranch = branches.find((branch) => z >= branch.z + 48 && z < branch.z + 96);
    if (forcedBranch) {
      safeLane = forcedBranch.direction < 0 ? 1 : 3;
    } else {
      safeLane = clamp(safeLane + chooseLaneShift(stageNumber), 0, CONFIG.laneCount - 1);
    }
    const freeLanes = new Set([safeLane]);
    const sideOptions = [];
    if (safeLane > 0) {
      sideOptions.push(-1);
    }
    if (safeLane < CONFIG.laneCount - 1) {
      sideOptions.push(1);
    }

    if (sideOptions.length > 0) {
      const primarySide = sideOptions[Math.floor(Math.random() * sideOptions.length)];
      freeLanes.add(safeLane + primarySide);
      if (Math.random() < extraSafeChance && sideOptions.length > 1) {
        freeLanes.add(safeLane - primarySide);
      }
    }

    const blockedCandidates = [];
    for (let lane = 0; lane < CONFIG.laneCount; lane += 1) {
      if (!freeLanes.has(lane)) {
        blockedCandidates.push(lane);
      }
    }

    const occupiedCount = clamp(
      1 + Math.floor(Math.random() * 2) + (Math.random() < 0.35 ? 1 : 0),
      1,
      blockedCandidates.length
    );
    const shuffledBlocked = [...blockedCandidates].sort(() => Math.random() - 0.5);

    for (let index = 0; index < occupiedCount; index += 1) {
      const lane = shuffledBlocked[index];
      const laneSpread = clamp((lane - safeLane) * 1.4, -3.2, 3.2);
      const stagger = ((rowIndex + lane) % 2 === 0 ? 0.9 : -0.9) + (Math.random() - 0.5) * 1.2;
      obstacles.push({
        lane,
        z: z + laneSpread + stagger,
        type: pickObstacleType(stageNumber, rowIndex, lane)
      });
    }

    z += rowAdvance;
    rowIndex += 1;
  }

  branches.forEach((branch) => {
    const branchRows = [
      { z: branch.z - 16, freeLanes: new Set(branch.prepLanes) },
      { z: branch.z - 4, freeLanes: new Set([2, ...branch.targetLanes]) },
      { z: branch.z + 10, freeLanes: new Set(branch.targetLanes) },
      { z: branch.z + 22, freeLanes: new Set(branch.targetLanes) },
      { z: branch.z + 34, freeLanes: new Set(branch.targetLanes) },
      { z: branch.z + 46, freeLanes: new Set(branch.targetLanes) }
    ];

    branchRows.forEach((row, branchRowIndex) => {
      for (let lane = 0; lane < CONFIG.laneCount; lane += 1) {
        if (row.freeLanes.has(lane)) {
          continue;
        }
        const laneSpread = clamp((lane - 2) * 1.15, -2.6, 2.6);
        const stagger = (branchRowIndex % 2 === 0 ? -0.8 : 0.8) + (lane % 2 === 0 ? 0.35 : -0.35);
        obstacles.push({
          lane,
          z: row.z + laneSpread + stagger,
          type: pickObstacleType(stageNumber, branchRowIndex, lane)
        });
      }
    });
  });

  obstacles.sort((left, right) => left.z - right.z);

  return {
    stageNumber,
    theme,
    length,
    speed,
    hazard,
    obstacles,
    branches
  };
}

function getNextBranch(spec = state.stageSpec, distance = state.distance) {
  if (!spec || !spec.branches) {
    return null;
  }
  return spec.branches.find((branch) => branch.z + 24 >= distance) || null;
}

function getSweatState(spec = state.stageSpec) {
  if (!spec) {
    return { label: "LOW", count: 1, color: "rgba(121, 221, 255, 0.8)" };
  }

  const nextBranch = getNextBranch(spec);
  const strain = spec.hazard * 0.7 + Math.min(2.1, state.stageElapsed / 18) + (nextBranch ? 0.8 : 0.2);
  if (!state.running || strain < 2.2) {
    return { label: "LOW", count: 1, color: "rgba(121, 221, 255, 0.8)" };
  }
  if (strain < 3.4) {
    return { label: "MID", count: 2, color: "rgba(121, 221, 255, 0.86)" };
  }
  if (strain < 4.6) {
    return { label: "HIGH", count: 3, color: "rgba(143, 233, 255, 0.92)" };
  }
  return { label: "MAX", count: 4, color: "rgba(196, 244, 255, 0.96)" };
}

function updateAudioButton() {
  ui.audioToggle.setAttribute("aria-pressed", String(music.enabled));
  ui.audioToggle.textContent = music.enabled ? "BGM ON" : "BGM OFF";
}

function updateHud() {
  const spec = state.stageSpec || buildStage(state.stageNumber);
  const remaining = Math.max(0, Math.ceil(spec.length - state.distance));
  const nextBranch = getNextBranch(spec);
  ui.stageValue.textContent = String(state.stageNumber);
  ui.lineValue.textContent = spec.theme.line;
  ui.remainingValue.textContent = `${remaining}m`;
  ui.hazardValue.textContent = `Lv.${spec.hazard}`;
  ui.bestValue.textContent = `STAGE ${state.bestStage}`;
  if (state.scene === "play") {
    ui.hintText.textContent = nextBranch
      ? (nextBranch.z - state.distance > 20
        ? `NEXT SPLIT ${Math.max(0, Math.round(nextBranch.z - state.distance))}m: ${nextBranch.label}`
        : `COMMIT NOW: ${nextBranch.label}`)
      : "FINAL STRAIGHT. HOLD THE OPEN LANE.";
  }
}

function updateRoutePanel() {
  const spec = state.stageSpec || buildStage(state.stageNumber);
  const nextBranch = getNextBranch(spec);
  ui.routeTitle.textContent = spec.theme.routeTitle;
  ui.routeText.textContent = nextBranch
    ? `Follow the overhead sign. ${nextBranch.label} in ${Math.max(0, Math.round(nextBranch.z - state.distance))}m.`
    : spec.theme.routeText;
  ui.stationValue.textContent = spec.theme.station;
  ui.platformValue.textContent = spec.theme.platform;
  ui.destinationValue.textContent = spec.theme.destination;
}

function setOverlay(visible) {
  ui.overlay.classList.toggle("is-hidden", !visible);
}

function renderOverlayFacts(facts) {
  ui.overlayFacts.innerHTML = facts.map((fact) => `<div><dt>${fact.label}</dt><dd>${fact.value}</dd></div>`).join("");
}

function setScene(sceneName, detailText = "") {
  state.scene = sceneName;
  const spec = state.stageSpec || buildStage(state.stageNumber);

  if (sceneName === "title") {
    ui.sceneLabel.textContent = "始発前";
    ui.hintText.textContent = "画面の行きたい位置をタップすると、そのレーンへすぐ寄せます。";
    ui.overlayTag.textContent = "Stage Runner Prototype";
    ui.overlayTitle.textContent = "列車のドアまで駅構内を駆け抜けろ";
    ui.overlayText.textContent = "プレイヤーが前へ走り続け、障害物のないレーンへ自分で飛び込みます。停車中の列車に乗れたらクリア、次のステージでは通路密度と障害物のいやらしさが一段上がります。";
    ui.primaryButton.textContent = "出発する";
    renderOverlayFacts([
      { label: "視点", value: "三人称ラン" },
      { label: "操作", value: "画面タップ / 指スライド" },
      { label: "次の列車", value: `${spec.theme.line} ${spec.theme.destination}` }
    ]);
    setOverlay(true);
    music.setTrack("title");
    return;
  }

  if (sceneName === "play") {
    ui.sceneLabel.textContent = `STAGE ${state.stageNumber}`;
    ui.hintText.textContent = "タップしたレーンへ即座に移動。指を滑らせると連続で寄せられます。";
    setOverlay(false);
    music.setTrack("play");
    return;
  }

  if (sceneName === "clear") {
    ui.sceneLabel.textContent = "乗車成功";
    ui.hintText.textContent = "次の列車はさらに混雑します。ルートを早めに読みます。";
    ui.overlayTag.textContent = "Boarding Complete";
    ui.overlayTitle.textContent = `STAGE ${state.stageNumber} クリア`;
    ui.overlayText.textContent = detailText || "停車中の列車へ飛び込みました。次のステージではホームが長くなり、通路の詰まり方も厳しくなります。";
    ui.primaryButton.textContent = "次の列車へ";
    renderOverlayFacts([
      { label: "到達駅", value: spec.theme.station },
      { label: "列車", value: `${spec.theme.line} ${spec.theme.destination}` },
      { label: "最高到達", value: `STAGE ${state.bestStage}` }
    ]);
    setOverlay(true);
    music.setTrack("clear");
    return;
  }

  ui.sceneLabel.textContent = "接触";
  ui.hintText.textContent = "安全レーンを先に見つけるほど立て直しやすくなります。";
  ui.overlayTag.textContent = "Blocked";
  ui.overlayTitle.textContent = `STAGE ${state.stageNumber} やり直し`;
  ui.overlayText.textContent = detailText || "通路の障害物にぶつかりました。狭まるレーンを見て、早めに空きへ寄せ直します。";
  ui.primaryButton.textContent = "同じステージに再挑戦";
  renderOverlayFacts([
    { label: "現在地", value: spec.theme.station },
    { label: "目標ホーム", value: spec.theme.platform },
    { label: "最高到達", value: `STAGE ${state.bestStage}` }
  ]);
  setOverlay(true);
  music.setTrack("fail");
}

function emitParticles(color, count) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const roadWidth = width * 0.84;
  const x = laneCenterAtWidth(state.player.lane, roadWidth, width);
  const y = height * 0.86;

  for (let index = 0; index < count; index += 1) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 18,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 80,
      vy: -40 - Math.random() * 80,
      size: 2 + Math.random() * 3,
      life: 0.22 + Math.random() * 0.32,
      color
    });
  }
}

function updateParticles(delta) {
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.particles.forEach((particle) => {
    particle.life -= delta;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += 130 * delta;
  });
}

function startStage(stageNumber) {
  state.stageNumber = stageNumber;
  state.stageSpec = buildStage(stageNumber);
  state.obstacles = state.stageSpec.obstacles;
  state.distance = 0;
  state.stageElapsed = 0;
  state.flashTimer = 0;
  state.running = true;
  state.player.lane = 2;
  state.player.lean = 0;
  updateHud();
  updateRoutePanel();
  setScene("play");
  music.playCue("start");
}

function finishStage(cleared, detailText) {
  if (!state.running) {
    return;
  }
  state.running = false;
  state.flashTimer = 0.28;
  if (cleared) {
    state.bestStage = Math.max(state.bestStage, state.stageNumber);
    localStorage.setItem(STORAGE_KEYS.bestStage, String(state.bestStage));
    emitParticles("#9dffb8", 26);
    music.playCue("clear");
    updateHud();
    setScene("clear", detailText);
    return;
  }

  emitParticles("#ff7d98", 24);
  music.playCue("hit");
  updateHud();
  setScene("fail", detailText);
}

function setPlayerLane(nextLane) {
  const boundedLane = clamp(nextLane, 0, CONFIG.laneCount - 1);
  if (boundedLane === state.player.lane) {
    return;
  }
  const direction = boundedLane > state.player.lane ? 1 : -1;
  state.player.lane = boundedLane;
  state.player.lean = direction * 1.2;
  emitParticles("#7be8ff", 7);
  music.playCue("move");
}

function laneFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 0.9999);
  return Math.floor(ratio * CONFIG.laneCount);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function isObstacleInHitZone(relativeZ) {
  if (relativeZ <= 0 || relativeZ >= CONFIG.collisionDistance) {
    return false;
  }

  const viewWidth = canvas.clientWidth;
  const viewHeight = canvas.clientHeight;
  const projection = projectDepth(relativeZ, viewWidth, viewHeight);
  const obstacleFeetY = projection.y;
  const playerFeetY = viewHeight * CONFIG.playerGroundYRatio + CONFIG.playerFootOffset;

  // Center collision on the obstacle's feet and compare that point against the player's feet line.
  return Math.abs(obstacleFeetY - playerFeetY) <= CONFIG.collisionFootRadius;
}

function updateGame(delta) {
  state.player.lean += (0 - state.player.lean) * Math.min(1, delta * 14);

  if (!state.running) {
    state.flashTimer = Math.max(0, state.flashTimer - delta);
    updateParticles(delta);
    return;
  }

  state.stageElapsed += delta;
  state.distance = Math.min(state.stageSpec.length, state.distance + state.stageSpec.speed * delta);
  state.flashTimer = Math.max(0, state.flashTimer - delta);

  for (const obstacle of state.obstacles) {
    const relativeZ = obstacle.z - state.distance;
    if (!isObstacleInHitZone(relativeZ)) {
      continue;
    }
    if (obstacle.lane === state.player.lane) {
      finishStage(false, "目前の障害物を避け切れませんでした。早めに空きレーンへ寄せると読みやすくなります。");
      break;
    }
  }

  if (state.running && state.distance >= state.stageSpec.length) {
    finishStage(true, "停車中の列車へ滑り込みました。次のホームはさらに遠く、通路の詰まり方もきつくなります。");
  }

  updateParticles(delta);
  updateHud();
  updateRoutePanel();
}

function drawQuad(x1, y1, x2, y2, x3, y3, x4, y4) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
}

function drawStationBackground(width, height) {
  const ceilingGradient = ctx.createLinearGradient(0, 0, 0, height);
  ceilingGradient.addColorStop(0, "#304d69");
  ceilingGradient.addColorStop(0.28, "#1a3145");
  ceilingGradient.addColorStop(1, "#07111a");
  ctx.fillStyle = ceilingGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  drawQuad(width * 0.14, height * 0.18, width * 0.86, height * 0.18, width * 0.98, 0, width * 0.02, 0);
  ctx.fill();

  for (let z = CONFIG.renderDistance; z > 0; z -= 8) {
    const far = projectDepth(z, width, height);
    const near = projectDepth(z - 8, width, height);
    ctx.fillStyle = Math.floor(z / 8) % 2 === 0 ? "rgba(19, 32, 45, 0.88)" : "rgba(22, 37, 52, 0.92)";
    drawQuad(
      width * 0.5 - near.width * 0.5, near.y,
      width * 0.5 + near.width * 0.5, near.y,
      width * 0.5 + far.width * 0.5, far.y,
      width * 0.5 - far.width * 0.5, far.y
    );
    ctx.fill();

    ctx.fillStyle = "rgba(255, 214, 111, 0.26)";
    drawQuad(
      width * 0.5 - near.width * 0.11, near.y,
      width * 0.5 - near.width * 0.06, near.y,
      width * 0.5 - far.width * 0.06, far.y,
      width * 0.5 - far.width * 0.11, far.y
    );
    ctx.fill();
    drawQuad(
      width * 0.5 + near.width * 0.06, near.y,
      width * 0.5 + near.width * 0.11, near.y,
      width * 0.5 + far.width * 0.11, far.y,
      width * 0.5 + far.width * 0.06, far.y
    );
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  for (let lane = 1; lane < CONFIG.laneCount; lane += 1) {
    const nearX = laneCenterAtWidth(lane - 0.5, width * 0.9, width);
    const farX = laneCenterAtWidth(lane - 0.5, width * 0.14, width);
    ctx.beginPath();
    ctx.moveTo(nearX, height * 0.93);
    ctx.lineTo(farX, height * 0.2);
    ctx.stroke();
  }

  drawForkPaths(width, height);

  for (let z = CONFIG.columnSpacing; z < CONFIG.renderDistance; z += CONFIG.columnSpacing) {
    const offset = z - (state.distance % CONFIG.columnSpacing);
    if (offset <= 0 || offset > CONFIG.renderDistance) {
      continue;
    }
    drawColumns(offset, width, height);
  }

  drawOverheadSigns(width, height);
  drawArrivalTrain(width, height);
}

function drawForkPaths(width, height) {
  (state.stageSpec.branches || []).forEach((branch) => {
    const startZ = branch.z - state.distance - 30;
    const endZ = branch.z - state.distance + 26;
    if (endZ <= 12 || startZ >= CONFIG.renderDistance) {
      return;
    }

    const start = projectDepth(clamp(startZ, 8, CONFIG.renderDistance), width, height);
    const end = projectDepth(clamp(endZ, 8, CONFIG.renderDistance), width, height);
    const spread = lerp(width * 0.012, width * 0.12, end.depth);
    const center = width * 0.5;

    ctx.fillStyle = "rgba(27, 46, 63, 0.94)";
    drawQuad(
      center - start.width * 0.48, start.y,
      center - start.width * 0.08, start.y,
      center - end.width * 0.14 - spread, end.y,
      center - end.width * 0.5 - spread, end.y
    );
    ctx.fill();
    drawQuad(
      center + start.width * 0.08, start.y,
      center + start.width * 0.48, start.y,
      center + end.width * 0.5 + spread, end.y,
      center + end.width * 0.14 + spread, end.y
    );
    ctx.fill();

    ctx.fillStyle = "rgba(6, 12, 18, 0.92)";
    drawQuad(
      center - start.width * 0.06, start.y,
      center + start.width * 0.06, start.y,
      center + end.width * 0.06, end.y,
      center - end.width * 0.06, end.y
    );
    ctx.fill();

    ctx.strokeStyle = branch.direction < 0 ? "rgba(121, 221, 255, 0.55)" : "rgba(255, 214, 111, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center - start.width * 0.08, start.y);
    ctx.lineTo(center - end.width * 0.14 - spread, end.y);
    ctx.moveTo(center + start.width * 0.08, start.y);
    ctx.lineTo(center + end.width * 0.14 + spread, end.y);
    ctx.stroke();
  });
}

function drawColumns(relativeZ, width, height) {
  const projection = projectDepth(relativeZ, width, height);
  const baseY = projection.y;
  const columnHeight = lerp(18, 160, projection.depth);
  const columnWidth = lerp(4, 28, projection.depth);
  const leftX = width * 0.5 - projection.width * 0.62;
  const rightX = width * 0.5 + projection.width * 0.62 - columnWidth;

  ctx.fillStyle = "rgba(77, 96, 114, 0.95)";
  ctx.fillRect(leftX, baseY - columnHeight, columnWidth, columnHeight);
  ctx.fillRect(rightX, baseY - columnHeight, columnWidth, columnHeight);

  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.fillRect(leftX + 2, baseY - columnHeight, 2, columnHeight);
  ctx.fillRect(rightX + 2, baseY - columnHeight, 2, columnHeight);
}

function drawOverheadSigns(width, height) {
  [120, 78, 38].forEach((depth, index) => {
    const relativeZ = depth + index * 22 - (state.distance % 6);
    if (relativeZ <= 6 || relativeZ >= CONFIG.renderDistance) {
      return;
    }

    const projection = projectDepth(relativeZ, width, height);
    const boardWidth = lerp(40, 170, projection.depth);
    const boardHeight = lerp(12, 44, projection.depth);
    const x = width * 0.5 - boardWidth * 0.5;
    const y = projection.y - lerp(52, 220, projection.depth);

    ctx.fillStyle = "rgba(11, 27, 40, 0.94)";
    ctx.fillRect(x, y, boardWidth, boardHeight);
    ctx.strokeStyle = "rgba(125, 240, 161, 0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boardWidth, boardHeight);

    ctx.fillStyle = "#dff9ff";
    ctx.font = `${Math.round(lerp(8, 18, projection.depth))}px "Yu Gothic UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(state.stageSpec.theme.platform, x + boardWidth * 0.5, y + boardHeight * 0.46);
    ctx.fillStyle = "#7df0a1";
    ctx.font = `${Math.round(lerp(6, 14, projection.depth))}px "Yu Gothic UI", sans-serif`;
    ctx.fillText(state.stageSpec.theme.line, x + boardWidth * 0.5, y + boardHeight * 0.8);
    ctx.textAlign = "left";
  });

  (state.stageSpec.branches || []).forEach((branch) => {
    const relativeZ = branch.signZ - state.distance;
    if (relativeZ <= 12 || relativeZ >= CONFIG.renderDistance) {
      return;
    }

    const projection = projectDepth(relativeZ, width, height);
    const boardWidth = lerp(54, 210, projection.depth);
    const boardHeight = lerp(16, 58, projection.depth);
    const x = width * 0.5 - boardWidth * 0.5;
    const y = projection.y - lerp(84, 250, projection.depth);
    const accent = branch.direction < 0 ? "#79ddff" : "#ffd66f";

    ctx.fillStyle = "rgba(12, 28, 40, 0.96)";
    ctx.fillRect(x, y, boardWidth, boardHeight);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boardWidth, boardHeight);

    ctx.fillStyle = "#dff9ff";
    ctx.font = `${Math.round(lerp(7, 15, projection.depth))}px "Yu Gothic UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("NEXT SPLIT", x + boardWidth * 0.5, y + boardHeight * 0.34);
    ctx.fillStyle = accent;
    ctx.font = `${Math.round(lerp(9, 22, projection.depth))}px "Bahnschrift SemiCondensed", sans-serif`;
    ctx.fillText(branch.direction < 0 ? "<< LEFT" : "RIGHT >>", x + boardWidth * 0.5, y + boardHeight * 0.76);
    ctx.textAlign = "left";
  });
}

function drawArrivalTrain(width, height) {
  const relativeZ = state.stageSpec.length - state.distance + 18;
  if (relativeZ > CONFIG.renderDistance + 12) {
    return;
  }

  const projection = projectDepth(Math.max(relativeZ, 6), width, height);
  const trainWidth = lerp(width * 0.18, width * 0.96, projection.depth);
  const trainHeight = trainWidth * 0.7;
  const x = width * 0.5 - trainWidth * 0.5;
  const y = projection.y - trainHeight * 0.78;

  ctx.fillStyle = "#b9c9d7";
  ctx.fillRect(x, y, trainWidth, trainHeight);
  ctx.fillStyle = "#12314a";
  ctx.fillRect(x + trainWidth * 0.08, y + trainHeight * 0.12, trainWidth * 0.84, trainHeight * 0.22);

  const doorWidth = trainWidth * 0.18;
  const doorHeight = trainHeight * 0.48;
  const doorGap = trainWidth * 0.09;
  const doorStart = x + trainWidth * 0.14;
  for (let index = 0; index < 3; index += 1) {
    const doorX = doorStart + index * (doorWidth + doorGap);
    ctx.fillStyle = index === 1 ? "rgba(125, 240, 161, 0.82)" : "rgba(42, 62, 81, 0.9)";
    ctx.fillRect(doorX, y + trainHeight * 0.42, doorWidth, doorHeight);
    if (index === 1) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillRect(doorX + doorWidth * 0.14, y + trainHeight * 0.47, doorWidth * 0.72, doorHeight * 0.76);
    }
  }
}

function drawObstacle(obstacle, width, height) {
  const relativeZ = obstacle.z - state.distance;
  if (relativeZ <= 0 || relativeZ >= CONFIG.renderDistance) {
    return;
  }

  const projection = projectDepth(relativeZ, width, height);
  const x = laneCenterAtWidth(obstacle.lane, projection.width, width);
  const baseY = projection.y;
  const size = lerp(14, 104, projection.depth);

  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(x, baseY + 4, size * 0.7, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (obstacle.type.id === "crowd") {
    const bodyWidth = size * 0.26;
    const legColors = ["#f75c5c", "#2ec4b6", "#ffd166"];
    for (let index = -1; index <= 1; index += 1) {
      const px = x + index * bodyWidth * 0.95;
      ctx.fillStyle = index === 0 ? "#85d7ff" : "#ff9c7e";
      ctx.beginPath();
      ctx.arc(px, baseY - size * 0.88, size * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(225, 240, 255, 0.92)";
      ctx.fillRect(px - bodyWidth * 0.28, baseY - size * 0.82, bodyWidth * 0.56, size * 0.44);
      ctx.fillStyle = legColors[index + 1];
      ctx.fillRect(px - bodyWidth * 0.22, baseY - size * 0.38, bodyWidth * 0.44, size * 0.36);
    }
    return;
  }

  if (obstacle.type.id === "bench") {
    ctx.fillStyle = "#e2a363";
    ctx.fillRect(x - size * 0.32, baseY - size * 0.42, size * 0.64, size * 0.14);
    ctx.fillStyle = "#76889a";
    ctx.fillRect(x - size * 0.36, baseY - size * 0.28, size * 0.72, size * 0.12);
    ctx.fillRect(x - size * 0.3, baseY - size * 0.18, size * 0.08, size * 0.22);
    ctx.fillRect(x + size * 0.22, baseY - size * 0.18, size * 0.08, size * 0.22);
    return;
  }

  if (obstacle.type.id === "sign") {
    ctx.fillStyle = "#ffd66f";
    ctx.beginPath();
    ctx.moveTo(x, baseY - size * 0.82);
    ctx.lineTo(x - size * 0.26, baseY - size * 0.18);
    ctx.lineTo(x + size * 0.26, baseY - size * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#203447";
    ctx.fillRect(x - size * 0.04, baseY - size * 0.18, size * 0.08, size * 0.18);
    return;
  }

  if (obstacle.type.id === "cart") {
    ctx.fillStyle = "#64d3d1";
    ctx.fillRect(x - size * 0.34, baseY - size * 0.38, size * 0.68, size * 0.26);
    ctx.strokeStyle = "#d8f8ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - size * 0.34, baseY - size * 0.38, size * 0.68, size * 0.26);
    ctx.beginPath();
    ctx.arc(x - size * 0.2, baseY - size * 0.08, size * 0.06, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, baseY - size * 0.08, size * 0.06, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = "#d8a56f";
  ctx.fillRect(x - size * 0.22, baseY - size * 0.34, size * 0.44, size * 0.28);
  ctx.fillStyle = "#865f3b";
  ctx.fillRect(x - size * 0.26, baseY - size * 0.12, size * 0.52, size * 0.12);
}

function drawPlayer(width, height) {
  const x = laneCenterAtWidth(state.player.lane, width * 0.9, width);
  const y = height * CONFIG.playerGroundYRatio;
  const stride = state.running ? Math.sin(state.stageElapsed * 11) : 0;
  const sweat = getSweatState(state.stageSpec);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(state.player.lean * 0.1);

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-16 + stride * 4, 22);
  ctx.moveTo(8, -8);
  ctx.lineTo(16 - stride * 4, 22);
  ctx.stroke();

  ctx.fillStyle = "#ffab63";
  ctx.fillRect(-22, -58, 44, 40);
  ctx.fillStyle = "#22364a";
  ctx.fillRect(-18, -48, 36, 24);
  ctx.fillStyle = "#ffdca7";
  ctx.beginPath();
  ctx.arc(0, -68, 12, 0, Math.PI * 2);
  ctx.fill();

  if (state.running) {
    ctx.fillStyle = sweat.color;
    for (let index = 0; index < sweat.count; index += 1) {
      const side = index % 2 === 0 ? 1 : -1;
      const phase = state.stageElapsed * 6.5 + index * 1.8;
      const dropX = side * (15 + Math.sin(phase) * 2.5);
      const dropY = -82 + index * 7 + Math.cos(phase * 1.4) * 1.8;
      const dropSize = 3.2 + index * 0.65;
      ctx.beginPath();
      ctx.moveTo(dropX, dropY - dropSize);
      ctx.quadraticCurveTo(dropX + dropSize * 0.8, dropY - dropSize * 0.1, dropX, dropY + dropSize);
      ctx.quadraticCurveTo(dropX - dropSize * 0.8, dropY - dropSize * 0.1, dropX, dropY - dropSize);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#7be8ff";
  ctx.fillRect(-18, -32, 12, 10);
  ctx.fillRect(6, -32, 12, 10);

  ctx.fillStyle = "#2ec4b6";
  ctx.fillRect(-20, -52, 40, 22);
  ctx.restore();
}

function drawRaceHud(width, height) {
  if (state.scene !== "play" || !state.stageSpec) {
    return;
  }

  const sweat = getSweatState(state.stageSpec);
  const nextBranch = getNextBranch(state.stageSpec);
  const chips = [
    { label: "SWEAT", value: sweat.label, accent: "#79ddff", width: 110 },
    {
      label: "NEXT",
      value: nextBranch ? nextBranch.label : "STRAIGHT",
      accent: nextBranch ? (nextBranch.direction < 0 ? "#79ddff" : "#ffd66f") : "#7df0a1",
      width: 148
    }
  ];

  chips.forEach((chip, index) => {
    const x = 16 + index * 132;
    const y = 18;
    ctx.fillStyle = "rgba(10, 22, 34, 0.82)";
    ctx.fillRect(x, y, chip.width, 40);
    ctx.strokeStyle = chip.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, chip.width, 40);
    ctx.fillStyle = "rgba(220, 244, 255, 0.72)";
    ctx.font = '10px "Bahnschrift", sans-serif';
    ctx.fillText(chip.label, x + 10, y + 13);
    ctx.fillStyle = chip.accent;
    ctx.font = '16px "Bahnschrift SemiCondensed", sans-serif';
    ctx.fillText(chip.value, x + 10, y + 30);
  });
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = clamp(particle.life * 2.4, 0, 1);
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
  ctx.fillStyle = state.scene === "clear" ? "rgba(125, 240, 161, 0.14)" : "rgba(255, 125, 152, 0.16)";
  ctx.fillRect(0, 0, width, height);
}

function drawScene() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  if (!state.stageSpec) {
    return;
  }

  drawStationBackground(width, height);
  [...state.obstacles].sort((left, right) => right.z - left.z).forEach((obstacle) => drawObstacle(obstacle, width, height));
  drawParticles();
  drawPlayer(width, height);
  drawRaceHud(width, height);
  drawFlash(width, height);
}

function frame(time) {
  const delta = Math.min(0.032, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  updateGame(delta);
  drawScene();
  requestAnimationFrame(frame);
}

function handlePrimaryAction() {
  music.activate();
  if (state.scene === "title") {
    startStage(1);
    return;
  }
  if (state.scene === "clear") {
    startStage(state.stageNumber + 1);
    return;
  }
  startStage(state.stageNumber);
}

function registerInputs() {
  ui.primaryButton.addEventListener("click", handlePrimaryAction);

  ui.audioToggle.addEventListener("click", () => {
    const nextEnabled = !music.enabled;
    music.setEnabled(nextEnabled);
    if (nextEnabled) {
      music.activate();
    }
    updateAudioButton();
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") {
      setPlayerLane(state.player.lane - 1);
    }
    if (key === "arrowright" || key === "d") {
      setPlayerLane(state.player.lane + 1);
    }
    if (key >= "1" && key <= "5") {
      setPlayerLane(Number.parseInt(key, 10) - 1);
    }
    if ((key === "enter" || key === " ") && !state.running) {
      handlePrimaryAction();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.running) {
      return;
    }
    music.activate();
    state.pointerId = event.pointerId;
    setPlayerLane(laneFromClientX(event.clientX));
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.running || state.pointerId !== event.pointerId) {
      return;
    }
    setPlayerLane(laneFromClientX(event.clientX));
  });

  canvas.addEventListener("pointerup", (event) => {
    if (state.pointerId === event.pointerId) {
      state.pointerId = null;
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (state.pointerId === event.pointerId) {
      state.pointerId = null;
    }
  });

  window.addEventListener("resize", resizeCanvas);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Preview environments may block the registration.
  });
}

function init() {
  state.stageSpec = buildStage(state.stageNumber);
  updateAudioButton();
  updateHud();
  updateRoutePanel();
  resizeCanvas();
  registerInputs();
  registerServiceWorker();
  setScene("title");
  requestAnimationFrame(frame);
}

init();
