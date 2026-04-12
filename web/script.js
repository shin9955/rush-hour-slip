const STORAGE_KEYS = {
  bestStage: "rush-hour-slip-best-stage",
  audioEnabled: "rush-hour-slip-audio-enabled"
};

const CONFIG = {
  laneCount: 5,
  renderDistance: 160,
  collisionDistance: 18,
  collisionFootRadius: 12,
  baseStageLength: 720,
  stageLengthStep: 144,
  baseSpeed: 36,
  speedStep: 4,
  columnSpacing: 36,
  playerGroundYRatio: 0.86,
  playerFootOffset: 22,
  goalApproachDistance: 82,
  goalSequenceDuration: 0.72
};

const UI_TEXT = {
  branchLeft: "\u5de6\u30eb\u30fc\u30c8",
  branchRight: "\u53f3\u30eb\u30fc\u30c8",
  nextSplit: "\u6b21\u306e\u5206\u5c90",
  commitNow: "\u3053\u3053\u3067\u9078\u629e",
  finalStraight: "\u6700\u7d42\u76f4\u7dda\u3002\u7a7a\u3044\u305f\u30ec\u30fc\u30f3\u3092\u7dad\u6301\u3002",
  routeLeadIn: "\u982d\u4e0a\u6848\u5185\u3092\u76ee\u5370\u306b",
  overheadLeft: "<< \u5de6\u3078",
  overheadRight: "\u53f3\u3078 >>",
  hudSweat: "\u767a\u6c57",
  hudNext: "\u9032\u8def",
  hudStraight: "\u76f4\u9032",
  sweatLow: "\u5f31",
  sweatMid: "\u4e2d",
  sweatHigh: "\u5f37",
  sweatMax: "\u9650\u754c",
  clear: "\u30af\u30ea\u30a2",
  retry: "\u3084\u308a\u76f4\u3057",
  goalDoorLeft: "\u5de6\u30c9\u30a2",
  goalDoorCenter: "\u4e2d\u592e\u30c9\u30a2",
  goalDoorRight: "\u53f3\u30c9\u30a2"
};

function branchLabel(direction) {
  return direction < 0 ? UI_TEXT.branchLeft : UI_TEXT.branchRight;
}

function branchArrowLabel(direction) {
  return direction < 0 ? UI_TEXT.overheadLeft : UI_TEXT.overheadRight;
}

function formatStageLabel(stageNumber) {
  return `\u30b9\u30c6\u30fc\u30b8 ${stageNumber}`;
}

function formatBranchHint(distance, label) {
  return distance > 20
    ? `${UI_TEXT.nextSplit} ${distance}m: ${label}`
    : `${UI_TEXT.commitNow}: ${label}`;
}

function formatRouteHint(distance, label) {
  return `${UI_TEXT.routeLeadIn}\u3001${distance}m\u5148\u3067${label}\u306b\u5bc4\u308b\u3002`;
}

function goalDoorLabel(lane) {
  if (lane <= 1) {
    return UI_TEXT.goalDoorLeft;
  }
  if (lane >= 3) {
    return UI_TEXT.goalDoorRight;
  }
  return UI_TEXT.goalDoorCenter;
}

function formatGoalDoorHint(lane) {
  return `\u30b4\u30fc\u30eb\u306f${goalDoorLabel(lane)}\u3002\u30c9\u30a2\u306b\u5408\u308f\u305b\u308d\u3002`;
}

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
  goal: {
    lane: 2,
    opening: false,
    openProgress: 0,
    resolveTimer: 0,
    pendingText: ""
  },
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
    if (kind === "door") {
      this.playDoorCue();
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

  playDoorCue() {
    if (!this.ctx || !this.enabled || !this.userActivated) {
      return;
    }
    const now = this.ctx.currentTime;
    const layers = [
      { wave: "square", start: 900, end: 690, duration: 0.1, volume: 0.016, delay: 0 },
      { wave: "triangle", start: 280, end: 186, duration: 0.3, volume: 0.022, delay: 0.02 }
    ];

    layers.forEach((layer) => {
      const oscillator = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startAt = now + layer.delay;
      oscillator.type = layer.wave;
      oscillator.frequency.setValueAtTime(layer.start, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(layer.end, startAt + layer.duration);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(layer.volume, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + layer.duration);
      oscillator.connect(gain);
      gain.connect(this.ctx.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + layer.duration + 0.03);
    });
  }
}

const music = new MusicController();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function smoothStep(value) {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - clamped * 2);
}

function laneOffsetAtWidth(lane, roadWidth) {
  const centerIndex = (CONFIG.laneCount - 1) / 2;
  const normalized = (lane - centerIndex) / centerIndex;
  return normalized * roadWidth * 0.43;
}

function roadCenterAtWorldZ(worldZ, roadWidth, canvasWidth, spec = state.stageSpec) {
  return canvasWidth * 0.5;
}

function laneCenterAtWorldZ(lane, worldZ, roadWidth, canvasWidth, spec = state.stageSpec) {
  return roadCenterAtWorldZ(worldZ, roadWidth, canvasWidth, spec) + laneOffsetAtWidth(lane, roadWidth);
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

function chooseLaneShift(stageNumber, rowIndex = 0) {
  const bag = rowIndex < 3
    ? [0, 1, -1, 1, -1, 2, -2]
    : [1, -1, 1, -1, 1, -1, 2, -2];
  if (stageNumber >= 3) {
    bag.push(2, -2);
  }
  return bag[Math.floor(Math.random() * bag.length)];
}

function buildStage(stageNumber) {
  const theme = currentTheme(stageNumber);
  const length = CONFIG.baseStageLength + (stageNumber - 1) * CONFIG.stageLengthStep;
  const speed = CONFIG.baseSpeed + (stageNumber - 1) * CONFIG.speedStep;
  const hazard = clamp(2 + Math.floor((stageNumber - 1) * 0.9), 2, 9);
  const spacingBase = Math.max(24, 30 - stageNumber);
  const extraOpenChance = Math.max(0.14 - stageNumber * 0.018, 0.04);
  const obstacles = [];
  const branches = [];
  let safeLane = 2;
  let z = 50;
  let rowIndex = 0;

  while (z < length - CONFIG.goalApproachDistance) {
    const rowAdvance = spacingBase + Math.random() * 6 + (rowIndex % 3 === 0 ? 2 : 0);
    safeLane = clamp(safeLane + chooseLaneShift(stageNumber, rowIndex), 0, CONFIG.laneCount - 1);
    const freeLanes = new Set([safeLane]);
    const sideOptions = [];
    if (safeLane > 0) {
      sideOptions.push(-1);
    }
    if (safeLane < CONFIG.laneCount - 1) {
      sideOptions.push(1);
    }

    if (sideOptions.length > 0 && Math.random() < extraOpenChance + (rowIndex < 2 ? 0.1 : 0)) {
      const primarySide = sideOptions[Math.floor(Math.random() * sideOptions.length)];
      freeLanes.add(safeLane + primarySide);
    }

    const rowScatter = (Math.random() - 0.5) * 5.6;
    const blockedCandidates = [];
    for (let lane = 0; lane < CONFIG.laneCount; lane += 1) {
      if (!freeLanes.has(lane)) {
        blockedCandidates.push(lane);
      }
    }

    const shuffledBlocked = [...blockedCandidates].sort(() => Math.random() - 0.5);
    const rowStagger = 3.6 + Math.random() * 3.2;
    const rowCenter = (shuffledBlocked.length - 1) * 0.5;

    for (let index = 0; index < shuffledBlocked.length; index += 1) {
      const lane = shuffledBlocked[index];
      const laneSpread = clamp((lane - safeLane) * 1.8, -4.4, 4.4);
      const stagger = (index - rowCenter) * rowStagger + (Math.random() - 0.5) * 2.4;
      obstacles.push({
        lane,
        z: z + rowScatter + laneSpread + stagger,
        type: pickObstacleType(stageNumber, rowIndex, lane)
      });
    }

    z += rowAdvance;
    rowIndex += 1;
  }

  obstacles.sort((left, right) => left.z - right.z);
  const goalLaneDrift = Math.random() < 0.42 ? (Math.random() < 0.5 ? -1 : 1) : 0;
  const goalLane = clamp(safeLane + goalLaneDrift, 1, CONFIG.laneCount - 2);

  return {
    stageNumber,
    theme,
    length,
    speed,
    hazard,
    obstacles,
    branches,
    goalLane
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
    return { label: UI_TEXT.sweatLow, count: 1, color: "rgba(121, 221, 255, 0.8)" };
  }

  const nextBranch = getNextBranch(spec);
  const strain = spec.hazard * 0.7 + Math.min(2.1, state.stageElapsed / 18) + (nextBranch ? 0.8 : 0.2);
  if (!state.running || strain < 2.2) {
    return { label: UI_TEXT.sweatLow, count: 1, color: "rgba(121, 221, 255, 0.8)" };
  }
  if (strain < 3.4) {
    return { label: UI_TEXT.sweatMid, count: 2, color: "rgba(121, 221, 255, 0.86)" };
  }
  if (strain < 4.6) {
    return { label: UI_TEXT.sweatHigh, count: 3, color: "rgba(143, 233, 255, 0.92)" };
  }
  return { label: UI_TEXT.sweatMax, count: 4, color: "rgba(196, 244, 255, 0.96)" };
}

function updateAudioButton() {
  ui.audioToggle.setAttribute("aria-pressed", String(music.enabled));
  ui.audioToggle.textContent = music.enabled ? "BGM \u5165" : "BGM \u5207";
}

function updateHud() {
  const spec = state.stageSpec || buildStage(state.stageNumber);
  const remaining = Math.max(0, Math.ceil(spec.length - state.distance));
  const nextBranch = getNextBranch(spec);
  ui.stageValue.textContent = String(state.stageNumber);
  ui.lineValue.textContent = spec.theme.line;
  ui.remainingValue.textContent = `${remaining}m`;
  ui.hazardValue.textContent = `Lv.${spec.hazard}`;
  ui.bestValue.textContent = formatStageLabel(state.bestStage);
  if (state.scene === "play") {
    ui.hintText.textContent = remaining <= CONFIG.goalApproachDistance
      ? formatGoalDoorHint(spec.goalLane)
      : (nextBranch
        ? formatBranchHint(Math.max(0, Math.round(nextBranch.z - state.distance)), nextBranch.label)
        : UI_TEXT.finalStraight);
  }
}

function updateRoutePanel() {
  const spec = state.stageSpec || buildStage(state.stageNumber);
  const nextBranch = getNextBranch(spec);
  ui.routeTitle.textContent = spec.theme.routeTitle;
  ui.routeText.textContent = nextBranch
    ? formatRouteHint(Math.max(0, Math.round(nextBranch.z - state.distance)), nextBranch.label)
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
    ui.overlayTag.textContent = "\u99c5\u30c0\u30c3\u30b7\u30e5\u8a66\u4f5c";
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
    ui.sceneLabel.textContent = formatStageLabel(state.stageNumber);
    ui.hintText.textContent = "タップしたレーンへ即座に移動。指を滑らせると連続で寄せられます。";
    setOverlay(false);
    music.setTrack("play");
    return;
  }

  if (sceneName === "clear") {
    ui.sceneLabel.textContent = "乗車成功";
    ui.hintText.textContent = "次の列車はさらに混雑します。ルートを早めに読みます。";
    ui.overlayTag.textContent = "\u4e57\u8eca\u5b8c\u4e86";
    ui.overlayTitle.textContent = `${formatStageLabel(state.stageNumber)} ${UI_TEXT.clear}`;
    ui.overlayText.textContent = detailText || "停車中の列車へ飛び込みました。次のステージではホームが長くなり、通路の詰まり方も厳しくなります。";
    ui.primaryButton.textContent = "次の列車へ";
    renderOverlayFacts([
      { label: "到達駅", value: spec.theme.station },
      { label: "列車", value: `${spec.theme.line} ${spec.theme.destination}` },
      { label: "最高到達", value: formatStageLabel(state.bestStage) }
    ]);
    setOverlay(true);
    music.setTrack("clear");
    return;
  }

  ui.sceneLabel.textContent = "接触";
  ui.hintText.textContent = "安全レーンを先に見つけるほど立て直しやすくなります。";
  ui.overlayTag.textContent = "\u9032\u8def\u585e\u304c\u308a";
  ui.overlayTitle.textContent = `${formatStageLabel(state.stageNumber)} ${UI_TEXT.retry}`;
  ui.overlayText.textContent = detailText || "通路の障害物にぶつかりました。狭まるレーンを見て、早めに空きへ寄せ直します。";
  ui.primaryButton.textContent = "同じステージに再挑戦";
  renderOverlayFacts([
    { label: "現在地", value: spec.theme.station },
    { label: "目標ホーム", value: spec.theme.platform },
    { label: "最高到達", value: formatStageLabel(state.bestStage) }
  ]);
  setOverlay(true);
  music.setTrack("fail");
}

function emitParticles(color, count) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const roadWidth = width * 0.84;
  const x = laneCenterAtWorldZ(state.player.lane, state.distance + 6, roadWidth, width);
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
  state.goal.lane = state.stageSpec.goalLane;
  state.goal.opening = false;
  state.goal.openProgress = 0;
  state.goal.resolveTimer = 0;
  state.goal.pendingText = "";
  state.player.lane = 2;
  state.player.lean = 0;
  updateHud();
  updateRoutePanel();
  setScene("play");
  music.playCue("start");
}

function beginGoalSequence(detailText) {
  if (!state.running) {
    return;
  }
  state.running = false;
  state.flashTimer = 0.28;
  state.goal.opening = true;
  state.goal.openProgress = 0;
  state.goal.resolveTimer = CONFIG.goalSequenceDuration;
  state.goal.pendingText = detailText;
  emitParticles("#9dffb8", 20);
  music.playCue("door");
}

function completeGoalSequence() {
  if (!state.goal.opening) {
    return;
  }
  state.goal.opening = false;
  state.goal.openProgress = 1;
  state.bestStage = Math.max(state.bestStage, state.stageNumber);
  localStorage.setItem(STORAGE_KEYS.bestStage, String(state.bestStage));
  emitParticles("#9dffb8", 14);
  music.playCue("clear");
  updateHud();
  setScene("clear", state.goal.pendingText);
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
  if (!state.running) {
    return;
  }
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
  const pointerX = clamp(clientX - rect.left, 0, rect.width);
  const roadWidth = rect.width * 0.9;
  const worldZ = state.distance + 6;
  let bestLane = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let lane = 0; lane < CONFIG.laneCount; lane += 1) {
    const laneX = laneCenterAtWorldZ(lane, worldZ, roadWidth, rect.width);
    const distance = Math.abs(pointerX - laneX);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestLane = lane;
    }
  }

  return bestLane;
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
    if (state.goal.opening) {
      state.goal.openProgress = clamp(
        state.goal.openProgress + delta / (CONFIG.goalSequenceDuration * 0.7),
        0,
        1
      );
      state.goal.resolveTimer = Math.max(0, state.goal.resolveTimer - delta);
      if (state.goal.resolveTimer <= 0) {
        completeGoalSequence();
      }
    }
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
    if (state.player.lane === state.stageSpec.goalLane) {
      beginGoalSequence(`${goalDoorLabel(state.stageSpec.goalLane)}\u306b\u3074\u305f\u308a\u5408\u308f\u305b\u3066\u4e57\u308a\u8fbc\u3093\u3060\u3002`);
    } else {
      finishStage(false, `${goalDoorLabel(state.stageSpec.goalLane)}\u3078\u5408\u308f\u305b\u3089\u308c\u305a\u3001\u4e57\u308a\u640d\u306d\u305f\u3002`);
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
    const farCenter = roadCenterAtWorldZ(state.distance + z, far.width, width);
    const nearCenter = roadCenterAtWorldZ(state.distance + Math.max(0, z - 8), near.width, width);
    ctx.fillStyle = Math.floor(z / 8) % 2 === 0 ? "rgba(19, 32, 45, 0.88)" : "rgba(22, 37, 52, 0.92)";
    drawQuad(
      nearCenter - near.width * 0.5, near.y,
      nearCenter + near.width * 0.5, near.y,
      farCenter + far.width * 0.5, far.y,
      farCenter - far.width * 0.5, far.y
    );
    ctx.fill();

    ctx.fillStyle = "rgba(255, 214, 111, 0.26)";
    drawQuad(
      nearCenter - near.width * 0.11, near.y,
      nearCenter - near.width * 0.06, near.y,
      farCenter - far.width * 0.06, far.y,
      farCenter - far.width * 0.11, far.y
    );
    ctx.fill();
    drawQuad(
      nearCenter + near.width * 0.06, near.y,
      nearCenter + near.width * 0.11, near.y,
      farCenter + far.width * 0.11, far.y,
      farCenter + far.width * 0.06, far.y
    );
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  for (let lane = 1; lane < CONFIG.laneCount; lane += 1) {
    const nearX = laneCenterAtWorldZ(lane - 0.5, state.distance + 4, width * 0.9, width);
    const farX = laneCenterAtWorldZ(lane - 0.5, state.distance + CONFIG.renderDistance, width * 0.14, width);
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
  return;
}

function drawColumns(relativeZ, width, height) {
  const projection = projectDepth(relativeZ, width, height);
  const baseY = projection.y;
  const columnHeight = lerp(18, 160, projection.depth);
  const columnWidth = lerp(4, 28, projection.depth);
  const center = roadCenterAtWorldZ(state.distance + relativeZ, projection.width, width);
  const leftX = center - projection.width * 0.62;
  const rightX = center + projection.width * 0.62 - columnWidth;

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
    const center = roadCenterAtWorldZ(state.distance + relativeZ, projection.width, width);
    const x = center - boardWidth * 0.5;
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
    const center = roadCenterAtWorldZ(branch.signZ, projection.width, width);
    const x = center - boardWidth * 0.5;
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
    ctx.fillText(UI_TEXT.nextSplit, x + boardWidth * 0.5, y + boardHeight * 0.34);
    ctx.fillStyle = accent;
    ctx.font = `${Math.round(lerp(9, 22, projection.depth))}px "Yu Gothic UI", sans-serif`;
    ctx.fillText(branchArrowLabel(branch.direction), x + boardWidth * 0.5, y + boardHeight * 0.76);
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
  const center = roadCenterAtWorldZ(state.stageSpec.length + 18, projection.width, width);
  const x = center - trainWidth * 0.5;
  const y = projection.y - trainHeight * 0.78;

  ctx.fillStyle = "#b9c9d7";
  ctx.fillRect(x, y, trainWidth, trainHeight);
  ctx.fillStyle = "#12314a";
  ctx.fillRect(x + trainWidth * 0.08, y + trainHeight * 0.12, trainWidth * 0.84, trainHeight * 0.22);

  const doorWidth = trainWidth * 0.18;
  const doorHeight = trainHeight * 0.48;
  const doorGap = trainWidth * 0.09;
  const doorStart = x + trainWidth * 0.14;
  const goalDoorIndex = clamp((state.stageSpec.goalLane || 2) - 1, 0, 2);
  const openProgress = state.goal.openProgress;
  for (let index = 0; index < 3; index += 1) {
    const doorX = doorStart + index * (doorWidth + doorGap);
    const doorY = y + trainHeight * 0.42;
    const isGoalDoor = index === goalDoorIndex;
    const slide = isGoalDoor ? doorWidth * 0.18 * openProgress : 0;
    const panelWidth = doorWidth * 0.46;
    const openingWidth = isGoalDoor ? doorWidth * (0.1 + openProgress * 0.34) : doorWidth * 0.08;
    const accentAlpha = isGoalDoor ? 0.62 + openProgress * 0.2 : 0.14;

    ctx.fillStyle = "rgba(16, 28, 40, 0.92)";
    ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

    if (isGoalDoor) {
      ctx.fillStyle = `rgba(125, 240, 161, ${accentAlpha})`;
      ctx.fillRect(doorX - 2, doorY - 3, doorWidth + 4, doorHeight + 6);
      ctx.fillStyle = `rgba(220, 255, 229, ${0.16 + openProgress * 0.18})`;
      ctx.fillRect(doorX + doorWidth * 0.5 - openingWidth * 0.5, doorY + doorHeight * 0.06, openingWidth, doorHeight * 0.88);
    }

    ctx.fillStyle = isGoalDoor ? "rgba(56, 93, 88, 0.9)" : "rgba(42, 62, 81, 0.9)";
    ctx.fillRect(doorX + doorWidth * 0.02 - slide, doorY, panelWidth, doorHeight);
    ctx.fillRect(doorX + doorWidth * 0.52 + slide, doorY, panelWidth, doorHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fillRect(doorX + doorWidth * 0.1 - slide, doorY + doorHeight * 0.12, doorWidth * 0.18, doorHeight * 0.7);
    ctx.fillRect(doorX + doorWidth * 0.72 + slide, doorY + doorHeight * 0.12, doorWidth * 0.18, doorHeight * 0.7);
  }
}

function drawObstacle(obstacle, width, height) {
  const relativeZ = obstacle.z - state.distance;
  if (relativeZ <= 0 || relativeZ >= CONFIG.renderDistance) {
    return;
  }

  const projection = projectDepth(relativeZ, width, height);
  const x = laneCenterAtWorldZ(obstacle.lane, obstacle.z, projection.width, width);
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
  const x = laneCenterAtWorldZ(state.player.lane, state.distance + 6, width * 0.9, width);
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
  const goalDoorAhead = state.distance >= state.stageSpec.length - CONFIG.goalApproachDistance;
  const chips = [
    { label: UI_TEXT.hudSweat, value: sweat.label, accent: "#79ddff", width: 110 },
    {
      label: UI_TEXT.hudNext,
      value: goalDoorAhead ? goalDoorLabel(state.stageSpec.goalLane) : (nextBranch ? nextBranch.label : UI_TEXT.hudStraight),
      accent: goalDoorAhead ? "#7df0a1" : (nextBranch ? (nextBranch.direction < 0 ? "#79ddff" : "#ffd66f") : "#7df0a1"),
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
    ctx.font = '10px "Yu Gothic UI", sans-serif';
    ctx.fillText(chip.label, x + 10, y + 13);
    ctx.fillStyle = chip.accent;
    ctx.font = '16px "Yu Gothic UI", sans-serif';
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
  if (state.goal.opening) {
    return;
  }
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
