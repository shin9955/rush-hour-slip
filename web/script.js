const STORAGE_KEYS = {
  bestStage: "rush-hour-slip-best-stage",
  audioEnabled: "rush-hour-slip-audio-enabled"
};

const CONFIG = {
  laneCount: 5,
  renderDistance: 160,
  maxPixelRatio: 2,
  mobileInputMaxWidth: 960,
  mobileInputEdgeBleedMin: 24,
  mobileInputEdgeBleedMax: 60,
  laneVisualLerp: 14,
  collisionDistance: 15,
  collisionFootRadius: 10,
  baseStageLength: 500,
  stageLengthStep: 14,
  baseSpeed: 36,
  speedStep: 2,
  columnSpacing: 36,
  playerGroundYRatio: 0.86,
  playerFootOffset: 22,
  introSafeDistance: 110,
  finalObstacleBuffer: 18,
  hazardStageSpan: 2,
  maxHazardLevel: 5,
  goalApproachDistance: 82,
  goalSequenceDuration: 0.72,
  approachCueDistance: 120,
  finalCallCueDistance: 42
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
  hudTrain: "\u5217\u8eca",
  hudTarget: "\u4e57\u8eca\u53e3",
  sweatLow: "\u5f31",
  sweatMid: "\u4e2d",
  sweatHigh: "\u5f37",
  sweatMax: "\u9650\u754c",
  clear: "\u30af\u30ea\u30a2",
  retry: "\u3084\u308a\u76f4\u3057",
  goalDoorLabel: "\u505c\u8eca\u4f4d\u7f6e",
  rareTrain: "\u30ec\u30a2\u8eca"
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

function formatBoardingPosition(position) {
  return `${position.door}\u756a\u30c9\u30a2`;
}

function formatCompactBoardingPosition(position) {
  return `${position.door}\u756a\u30c9\u30a2`;
}

const STATION_THEMES = [
  {
    station: "東京",
    stationRoman: "TOKYO",
    line: "中央線快速",
    lineCode: "JC",
    platform: "3番線",
    routeTitle: "中央改札から3番線ホームへ",
    routeText: "柱と待機列の隙間を抜け、停車位置目標を見ながらホーム中央へ滑り込む。",
    transfers: ["山手線", "京浜東北線", "東海道線"],
    services: ["各駅停車", "快速", "通勤快速", "中央特快"],
    destinations: ["上野行き", "新宿行き", "高尾行き", "豊田行き"],
    timetable: { hour: 8, minuteBase: 6 },
    carCount: 12,
    carBase: 6,
    palette: {
      stripe: "#f98c1f",
      stripeSecondary: "#ffd26d",
      front: "#223446",
      led: "#89ffb6",
      window: "#183447",
      door: "#5a6c78",
      light: "#ffe7a6"
    }
  },
  {
    station: "品川",
    stationRoman: "SHINAGAWA",
    line: "京浜東北線",
    lineCode: "JK",
    platform: "5番線",
    routeTitle: "乗換通路を横切って5番線へ",
    routeText: "ベンチと案内板の間を抜ける。銀帯の編成と停車位置札が目印になる。",
    transfers: ["東海道線", "横須賀線", "京急線"],
    services: ["各駅停車", "快速", "急行"],
    destinations: ["上野行き", "大宮行き", "蒲田行き", "大船行き"],
    timetable: { hour: 8, minuteBase: 12 },
    carCount: 10,
    carBase: 5,
    palette: {
      stripe: "#28a0ff",
      stripeSecondary: "#71cfff",
      front: "#1c3950",
      led: "#94ffd1",
      window: "#163245",
      door: "#5c7382",
      light: "#dff6ff"
    }
  },
  {
    station: "新宿",
    stationRoman: "SHINJUKU",
    line: "埼京線",
    lineCode: "JA",
    platform: "11番線",
    routeTitle: "連絡通路の密集帯を突破する",
    routeText: "人の列が急に絞られる。早めに停車位置サインを拾い、狙いのドア位置へ寄せ切る。",
    transfers: ["山手線", "中央線", "湘南新宿ライン"],
    services: ["各駅停車", "快速", "通勤快速", "急行"],
    destinations: ["新宿行き", "大宮行き", "川越行き", "新木場行き"],
    timetable: { hour: 8, minuteBase: 19 },
    carCount: 10,
    carBase: 4,
    palette: {
      stripe: "#49bc5f",
      stripeSecondary: "#8de49a",
      front: "#203548",
      led: "#a3ffcf",
      window: "#1b3244",
      door: "#58707f",
      light: "#f0ffe2"
    }
  },
  {
    station: "渋谷",
    stationRoman: "SHIBUYA",
    line: "東横線",
    lineCode: "TY",
    platform: "2番線",
    routeTitle: "広いコンコースを縫ってホームへ滑り込む",
    routeText: "清掃カートと工事サインが増える。次発表示とドア番号を頼りに一直線で抜ける。",
    transfers: ["山手線", "銀座線", "副都心線"],
    services: ["各駅停車", "急行", "通勤特急", "Fライナー"],
    destinations: ["元町・中華街行き", "和光市行き", "森林公園行き", "新宿三丁目行き"],
    timetable: { hour: 8, minuteBase: 25 },
    carCount: 10,
    carBase: 5,
    palette: {
      stripe: "#e25555",
      stripeSecondary: "#ffc072",
      front: "#2b3048",
      led: "#ffdf8c",
      window: "#1f2e4b",
      door: "#616a84",
      light: "#ffe2b9"
    }
  }
];

const TRAIN_VARIANTS = [
  { face: "flat", stripeOffset: 0.52, stripeWidth: 0.055, doorInset: 0.13, doorGap: 0.085, ledInset: 0.1, windowHeight: 0.22 },
  { face: "bevel", stripeOffset: 0.57, stripeWidth: 0.06, doorInset: 0.145, doorGap: 0.08, ledInset: 0.12, windowHeight: 0.2 },
  { face: "rounded", stripeOffset: 0.55, stripeWidth: 0.05, doorInset: 0.12, doorGap: 0.092, ledInset: 0.11, windowHeight: 0.24 }
];

const RARE_TRAINS = [
  {
    id: "wrapping",
    label: "ラッピング車",
    ledText: "SPECIAL",
    note: "全面ラッピングの特別編成",
    accent: "#ff7ab6",
    pattern: "wrap"
  },
  {
    id: "test-run",
    label: "試運転",
    ledText: "試運転",
    note: "送り込みの試運転表示",
    accent: "#ffd66f",
    pattern: "test"
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
  lineBoardValue: document.querySelector("#lineBoardValue"),
  platformValue: document.querySelector("#platformValue"),
  serviceValue: document.querySelector("#serviceValue"),
  destinationValue: document.querySelector("#destinationValue"),
  boardingValue: document.querySelector("#boardingValue"),
  departureValue: document.querySelector("#departureValue"),
  formationValue: document.querySelector("#formationValue")
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
  audio: {
    approachPlayed: false,
    closingPlayed: false
  },
  goal: {
    lane: 2,
    opening: false,
    openProgress: 0,
    resolveTimer: 0,
    pendingText: ""
  },
  player: {
    lane: 2,
    renderLane: 2,
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
    if (kind === "approach") {
      this.playApproachCue();
      return;
    }
    if (kind === "closing") {
      this.playClosingCue();
      return;
    }
    if (kind === "departure") {
      this.playDepartureCue();
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

  playToneLayer(layer) {
    if (!this.ctx || !this.enabled || !this.userActivated) {
      return;
    }
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const startAt = this.ctx.currentTime + (layer.delay || 0);
    const endFrequency = layer.end || layer.start;
    filter.type = "lowpass";
    filter.frequency.value = layer.filter || 1800;
    oscillator.type = layer.wave;
    oscillator.frequency.setValueAtTime(layer.start, startAt);
    if (Math.abs(endFrequency - layer.start) > 1) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + layer.duration);
    }
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(layer.volume, startAt + Math.min(0.02, layer.duration * 0.35));
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + layer.duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + layer.duration + 0.04);
  }

  playApproachCue() {
    [
      { wave: "sine", start: 1320, duration: 0.11, volume: 0.016, delay: 0, filter: 2200 },
      { wave: "triangle", start: 880, duration: 0.18, volume: 0.012, delay: 0.02, filter: 1600 },
      { wave: "sine", start: 1568, duration: 0.11, volume: 0.018, delay: 0.18, filter: 2400 },
      { wave: "triangle", start: 1046.5, duration: 0.18, volume: 0.013, delay: 0.2, filter: 1700 }
    ].forEach((layer) => this.playToneLayer(layer));
  }

  playClosingCue() {
    [
      { wave: "square", start: 740, end: 700, duration: 0.08, volume: 0.012, delay: 0, filter: 1200 },
      { wave: "square", start: 659.25, end: 622.25, duration: 0.08, volume: 0.011, delay: 0.11, filter: 1200 },
      { wave: "square", start: 554.37, end: 523.25, duration: 0.09, volume: 0.011, delay: 0.22, filter: 1200 },
      { wave: "triangle", start: 392, end: 293.66, duration: 0.28, volume: 0.016, delay: 0.05, filter: 900 }
    ].forEach((layer) => this.playToneLayer(layer));
  }

  playDepartureCue() {
    [
      { wave: "triangle", start: 523.25, duration: 0.11, volume: 0.015, delay: 0, filter: 1500 },
      { wave: "triangle", start: 659.25, duration: 0.11, volume: 0.016, delay: 0.13, filter: 1500 },
      { wave: "triangle", start: 783.99, duration: 0.12, volume: 0.017, delay: 0.26, filter: 1500 },
      { wave: "sine", start: 1046.5, end: 987.77, duration: 0.24, volume: 0.018, delay: 0.39, filter: 2000 },
      { wave: "sine", start: 261.63, end: 329.63, duration: 0.44, volume: 0.01, delay: 0.05, filter: 900 }
    ].forEach((layer) => this.playToneLayer(layer));
  }

  playDoorCue() {
    if (!this.ctx || !this.enabled || !this.userActivated) {
      return;
    }
    const layers = [
      { wave: "square", start: 900, end: 690, duration: 0.1, volume: 0.016, delay: 0 },
      { wave: "triangle", start: 280, end: 186, duration: 0.3, volume: 0.022, delay: 0.02 }
    ];

    layers.forEach((layer) => this.playToneLayer({ ...layer, filter: 1200 }));
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

function stageCycleIndex(stageNumber, length, offset = 0) {
  return (stageNumber - 1 + offset) % length;
}

function formatTrainLabel(spec) {
  return `${spec.service} ${spec.destination}`;
}

function formatCompactTrainLabel(spec) {
  const destination = spec.destination.replace("行き", "");
  const compactDestination = destination.length > 6 ? `${destination.slice(0, 6)}…` : destination;
  return `${spec.service} ${compactDestination}`;
}

function buildDepartureTime(theme, stageNumber) {
  const totalMinutes = theme.timetable.minuteBase + stageNumber * 3;
  const hour = theme.timetable.hour + Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function pickRareTrain() {
  const roll = Math.random();
  if (roll < 0.04) {
    return RARE_TRAINS[0];
  }
  if (roll < 0.07) {
    return RARE_TRAINS[1];
  }
  return null;
}

function buildBoardingGuide(theme, stageNumber, service) {
  const serviceShift = service.includes("急") || service.includes("特") ? 1 : (service.includes("各") ? -1 : 0);
  const focusCar = clamp(
    theme.carBase + (stageNumber % 3) - 1 + serviceShift,
    2,
    Math.max(2, theme.carCount - 1)
  );

  return [
    { lane: 0, car: Math.max(1, focusCar - 1), door: 3 },
    { lane: 1, car: focusCar, door: 1 },
    { lane: 2, car: focusCar, door: 2 },
    { lane: 3, car: focusCar, door: 3 },
    { lane: 4, car: Math.min(theme.carCount, focusCar + 1), door: 1 }
  ];
}

function buildTrainAppearance(theme, stageNumber, service, rareTrain) {
  const variant = TRAIN_VARIANTS[stageCycleIndex(stageNumber, TRAIN_VARIANTS.length)];
  const fastService = service.includes("急") || service.includes("特") || service.includes("快");
  return {
    ...variant,
    body: "#b8c7d3",
    roof: "#e0e8ef",
    lower: "#7e8f9d",
    stripe: theme.palette.stripe,
    stripeSecondary: fastService ? theme.palette.stripeSecondary : "#f2f7fb",
    front: theme.palette.front,
    ledColor: rareTrain ? rareTrain.accent : theme.palette.led,
    ledText: rareTrain ? rareTrain.ledText : service,
    ledSubText: rareTrain ? rareTrain.label : theme.lineCode,
    window: theme.palette.window,
    door: theme.palette.door,
    light: theme.palette.light,
    pattern: rareTrain ? rareTrain.pattern : null
  };
}

function getLaneBoardingPosition(spec, lane) {
  return spec.boardingGuide[lane] || spec.boardingGuide[spec.goalLane] || { car: 0, door: 0 };
}

function getGoalBoardingPosition(spec = state.stageSpec) {
  if (!spec) {
    return { car: 0, door: 0 };
  }
  return getLaneBoardingPosition(spec, spec.goalLane);
}

function formatGoalDoorHint(spec = state.stageSpec) {
  return `${UI_TEXT.goalDoorLabel}は${formatBoardingPosition(getGoalBoardingPosition(spec))}。停車位置に合わせろ。`;
}

function pickObstacleType(stageNumber, rowIndex, lane) {
  const obstacleBag = [OBSTACLE_TYPES.crowd, OBSTACLE_TYPES.crowd, OBSTACLE_TYPES.bench, OBSTACLE_TYPES.sign];
  if (stageNumber >= 2) {
    obstacleBag.push(OBSTACLE_TYPES.cart);
  }
  if (stageNumber >= 3) {
    obstacleBag.push(OBSTACLE_TYPES.luggage);
  }
  return obstacleBag[(rowIndex + lane + stageNumber) % obstacleBag.length];
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
  const service = theme.services[stageCycleIndex(stageNumber, theme.services.length)];
  const destination = theme.destinations[stageCycleIndex(stageNumber, theme.destinations.length, 1)];
  const rareTrain = pickRareTrain();
  const boardingGuide = buildBoardingGuide(theme, stageNumber, service);
  const trainAppearance = buildTrainAppearance(theme, stageNumber, service, rareTrain);
  const departureTime = buildDepartureTime(theme, stageNumber);
  const length = CONFIG.baseStageLength + (stageNumber - 1) * CONFIG.stageLengthStep;
  const speed = CONFIG.baseSpeed + (stageNumber - 1) * CONFIG.speedStep;
  const hazard = clamp(
    1 + Math.floor((stageNumber - 1) / CONFIG.hazardStageSpan),
    1,
    CONFIG.maxHazardLevel
  );
  const spacingBase = Math.max(24, 30 - stageNumber);
  const extraOpenChance = Math.max(0.14 - stageNumber * 0.018, 0.04);
  const obstacles = [];
  const branches = [];
  let safeLane = 2;
  let z = CONFIG.introSafeDistance;
  let rowIndex = 0;

  while (z < length - CONFIG.finalObstacleBuffer) {
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
  const goalPosition = boardingGuide[goalLane];

  return {
    stageNumber,
    theme,
    service,
    destination,
    departureTime,
    formationLabel: `${theme.carCount}両編成`,
    rareTrain,
    boardingGuide,
    trainAppearance,
    length,
    speed,
    hazard,
    obstacles,
    branches,
    goalLane,
    goalPosition
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
  const currentPosition = getLaneBoardingPosition(spec, state.player.lane);
  ui.stageValue.textContent = String(state.stageNumber);
  ui.lineValue.textContent = `${spec.theme.line} ${spec.service}`;
  ui.remainingValue.textContent = `${remaining}m`;
  ui.hazardValue.textContent = `Lv.${spec.hazard}`;
  ui.bestValue.textContent = formatStageLabel(state.bestStage);
  if (state.scene === "play") {
    ui.hintText.textContent = remaining <= CONFIG.goalApproachDistance
      ? `${formatGoalDoorHint(spec)} 現在 ${formatCompactBoardingPosition(currentPosition)} 寄り。`
      : `次発 ${spec.departureTime} ${formatTrainLabel(spec)}。現在 ${formatCompactBoardingPosition(currentPosition)} 寄り。`;
  }
}

function updateRoutePanel() {
  const spec = state.stageSpec || buildStage(state.stageNumber);
  const goalPosition = getGoalBoardingPosition(spec);
  ui.routeTitle.textContent = `${spec.theme.platform} ${formatTrainLabel(spec)}`;
  ui.routeText.textContent = `${spec.theme.routeText} 次発は${spec.departureTime}発。狙いは${formatBoardingPosition(goalPosition)}、編成は${spec.formationLabel}。${spec.rareTrain ? `${spec.rareTrain.note}が混ざっている。` : `${spec.theme.transfers.join(" / ")}の案内が視界に入る。`}`;
  ui.stationValue.textContent = spec.theme.station;
  ui.lineBoardValue.textContent = `${spec.theme.line} (${spec.theme.lineCode})`;
  ui.platformValue.textContent = spec.theme.platform;
  ui.serviceValue.textContent = spec.service;
  ui.destinationValue.textContent = spec.destination;
  ui.boardingValue.textContent = formatBoardingPosition(goalPosition);
  ui.departureValue.textContent = `${spec.departureTime} 発`;
  ui.formationValue.textContent = spec.rareTrain ? `${spec.formationLabel} / ${spec.rareTrain.label}` : spec.formationLabel;
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
    ui.overlayText.textContent = "プレイヤーが前へ走り続け、障害物のないレーンへ自分で飛び込みます。種別・行先・停車位置を見て、狙いのドア位置へぴたりと合わせます。";
    ui.primaryButton.textContent = "出発する";
    renderOverlayFacts([
      { label: "視点", value: "三人称ラン" },
      { label: "操作", value: "画面タップ / 指スライド" },
      { label: "次の列車", value: `${spec.theme.line} ${formatTrainLabel(spec)}` },
      { label: "停車位置", value: formatBoardingPosition(getGoalBoardingPosition(spec)) }
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
      { label: "列車", value: `${spec.theme.line} ${formatTrainLabel(spec)}` },
      { label: "乗車口", value: formatBoardingPosition(getGoalBoardingPosition(spec)) },
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
    { label: "目標乗車口", value: formatBoardingPosition(getGoalBoardingPosition(spec)) },
    { label: "最高到達", value: formatStageLabel(state.bestStage) }
  ]);
  setOverlay(true);
  music.setTrack("fail");
}

function emitParticles(color, count) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const roadWidth = width * 0.84;
  const x = laneCenterAtWorldZ(getPlayerRenderLane(), state.distance + 6, roadWidth, width);
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
  state.audio.approachPlayed = false;
  state.audio.closingPlayed = false;
  state.player.lane = 2;
  state.player.renderLane = 2;
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
  music.playCue("departure");
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

function getPlayerRenderLane() {
  return state.player.renderLane;
}

function isMobileInputLayout() {
  return window.innerWidth <= CONFIG.mobileInputMaxWidth;
}

function getLaneInputRect() {
  const rect = canvas.getBoundingClientRect();
  if (!isMobileInputLayout()) {
    return rect;
  }

  const edgeBleed = clamp(
    window.innerWidth * 0.06,
    CONFIG.mobileInputEdgeBleedMin,
    CONFIG.mobileInputEdgeBleedMax
  );
  const left = Math.max(0, rect.left - edgeBleed);
  const right = Math.min(window.innerWidth, rect.right + edgeBleed);

  return {
    left,
    right,
    top: rect.top,
    bottom: rect.bottom,
    width: Math.max(1, right - left),
    height: rect.height
  };
}

function laneFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const inputRect = getLaneInputRect();
  const normalizedX = inputRect.width > 0
    ? clamp((clientX - inputRect.left) / inputRect.width, 0, 1)
    : 0.5;
  const pointerX = normalizedX * rect.width;
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

function isWithinLaneInputBand(clientX, clientY) {
  if (!isMobileInputLayout()) {
    return false;
  }

  const inputRect = getLaneInputRect();
  return (
    clientX >= inputRect.left &&
    clientX <= inputRect.right &&
    clientY >= inputRect.top &&
    clientY <= inputRect.bottom
  );
}

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest("button, a, input, textarea, select, label"));
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio);
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
  state.player.renderLane += (state.player.lane - state.player.renderLane) * Math.min(1, delta * CONFIG.laneVisualLerp);
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
  const remaining = state.stageSpec.length - state.distance;

  if (!state.audio.approachPlayed && remaining <= CONFIG.approachCueDistance) {
    state.audio.approachPlayed = true;
    music.playCue("approach");
  }
  if (!state.audio.closingPlayed && remaining <= CONFIG.finalCallCueDistance) {
    state.audio.closingPlayed = true;
    music.playCue("closing");
  }

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
    const goalPosition = getGoalBoardingPosition(state.stageSpec);
    if (state.player.lane === state.stageSpec.goalLane) {
      beginGoalSequence(`${formatBoardingPosition(goalPosition)}にぴたりと合わせて、${formatTrainLabel(state.stageSpec)}へ滑り込んだ。`);
    } else {
      finishStage(false, `${formatBoardingPosition(goalPosition)}へ合わせ切れず、${formatTrainLabel(state.stageSpec)}を見送った。`);
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

  if (projection.depth > 0.28) {
    const stickerWidth = columnWidth * 2.1;
    const stickerHeight = columnWidth * 1.1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(leftX - stickerWidth * 0.25, baseY - columnHeight * 0.72, stickerWidth, stickerHeight);
    ctx.fillRect(rightX - stickerWidth * 0.25, baseY - columnHeight * 0.72, stickerWidth, stickerHeight);
    ctx.fillStyle = state.stageSpec.trainAppearance.stripe;
    ctx.fillRect(leftX - stickerWidth * 0.25, baseY - columnHeight * 0.72, stickerWidth, stickerHeight * 0.22);
    ctx.fillRect(rightX - stickerWidth * 0.25, baseY - columnHeight * 0.72, stickerWidth, stickerHeight * 0.22);
  }
}

function drawOverheadSigns(width, height) {
  // Hide in-stage signage to keep the playfield visually clean on mobile.
  return;
  const spec = state.stageSpec;
  const accent = spec.rareTrain ? spec.rareTrain.accent : spec.trainAppearance.stripe;
  [
    { depth: 126, kind: "station" },
    { depth: 88, kind: "departure" },
    { depth: 46, kind: "boarding" }
  ].forEach((sign, index) => {
    const relativeZ = sign.depth + index * 8 - (state.distance % 6);
    if (relativeZ <= 6 || relativeZ >= CONFIG.renderDistance) {
      return;
    }

    const projection = projectDepth(relativeZ, width, height);
    const boardWidth = lerp(46, sign.kind === "boarding" ? 188 : 214, projection.depth);
    const boardHeight = lerp(14, sign.kind === "station" ? 56 : 62, projection.depth);
    const center = roadCenterAtWorldZ(state.distance + relativeZ, projection.width, width);
    const x = center - boardWidth * 0.5;
    const y = projection.y - lerp(52, 220, projection.depth);

    if (sign.kind === "station") {
      ctx.fillStyle = "rgba(232, 244, 247, 0.96)";
      ctx.fillRect(x, y, boardWidth, boardHeight);
      ctx.fillStyle = accent;
      ctx.fillRect(x, y + boardHeight * 0.63, boardWidth, boardHeight * 0.18);
      ctx.strokeStyle = "rgba(11, 27, 40, 0.22)";
      ctx.lineWidth = 1.6;
      ctx.strokeRect(x, y, boardWidth, boardHeight);
      ctx.fillStyle = "#142738";
      ctx.textAlign = "center";
      ctx.font = `${Math.round(lerp(8, 22, projection.depth))}px "Bahnschrift SemiCondensed", "Yu Gothic UI", sans-serif`;
      ctx.fillText(spec.theme.station, x + boardWidth * 0.5, y + boardHeight * 0.38);
      ctx.font = `${Math.round(lerp(5, 11, projection.depth))}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
      ctx.fillText(spec.theme.stationRoman, x + boardWidth * 0.5, y + boardHeight * 0.56);
      ctx.fillStyle = "#0f1f2f";
      ctx.fillText(`${spec.theme.lineCode} ${spec.theme.platform}`, x + boardWidth * 0.5, y + boardHeight * 0.88);
    }

    if (sign.kind === "departure") {
      ctx.fillStyle = "rgba(10, 22, 34, 0.96)";
      ctx.fillRect(x, y, boardWidth, boardHeight);
      ctx.strokeStyle = "rgba(255, 209, 102, 0.72)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boardWidth, boardHeight);
      ctx.fillStyle = "rgba(255, 209, 102, 0.16)";
      ctx.fillRect(x + 4, y + 4, boardWidth - 8, boardHeight * 0.28);
      ctx.fillStyle = "#ffd66f";
      ctx.textAlign = "left";
      ctx.font = `${Math.round(lerp(5, 11, projection.depth))}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
      ctx.fillText(`NEXT ${spec.departureTime}`, x + boardWidth * 0.07, y + boardHeight * 0.24);
      ctx.textAlign = "right";
      ctx.fillText(spec.theme.platform, x + boardWidth * 0.93, y + boardHeight * 0.24);
      ctx.textAlign = "left";
      ctx.fillStyle = accent;
      ctx.fillRect(x + boardWidth * 0.06, y + boardHeight * 0.42, boardWidth * 0.24, boardHeight * 0.24);
      ctx.fillStyle = "#0c1720";
      ctx.font = `${Math.round(lerp(6, 13, projection.depth))}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
      ctx.fillText(spec.service, x + boardWidth * 0.08, y + boardHeight * 0.58);
      ctx.fillStyle = "#dff9ff";
      ctx.font = `${Math.round(lerp(7, 15, projection.depth))}px "Yu Gothic UI", sans-serif`;
      ctx.fillText(spec.destination, x + boardWidth * 0.34, y + boardHeight * 0.58);
      ctx.font = `${Math.round(lerp(5, 10, projection.depth))}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
      ctx.fillText(spec.rareTrain ? spec.rareTrain.label : spec.theme.line, x + boardWidth * 0.07, y + boardHeight * 0.82);
    }

    if (sign.kind === "boarding") {
      const goalPosition = getGoalBoardingPosition(spec);
      ctx.fillStyle = "rgba(12, 28, 40, 0.98)";
      ctx.fillRect(x, y, boardWidth, boardHeight);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boardWidth, boardHeight);
      ctx.fillStyle = "#dff9ff";
      ctx.textAlign = "center";
      ctx.font = `${Math.round(lerp(6, 14, projection.depth))}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
      ctx.fillText("STOP POSITION", x + boardWidth * 0.5, y + boardHeight * 0.28);
      ctx.fillStyle = accent;
      ctx.font = `${Math.round(lerp(8, 18, projection.depth))}px "Yu Gothic UI", sans-serif`;
      ctx.fillText(formatBoardingPosition(goalPosition), x + boardWidth * 0.5, y + boardHeight * 0.65);
      ctx.fillStyle = "rgba(220, 244, 255, 0.72)";
      ctx.font = `${Math.round(lerp(5, 10, projection.depth))}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
      ctx.fillText(`${spec.formationLabel} / ${spec.theme.lineCode}`, x + boardWidth * 0.5, y + boardHeight * 0.86);
    }

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
  const spec = state.stageSpec;
  const appearance = spec.trainAppearance;
  const goalPosition = getGoalBoardingPosition(spec);
  const relativeZ = spec.length - state.distance + 18;
  if (relativeZ > CONFIG.renderDistance + 12) {
    return;
  }

  const projection = projectDepth(Math.max(relativeZ, 6), width, height);
  const trainWidth = lerp(width * 0.18, width * 0.96, projection.depth);
  const trainHeight = trainWidth * 0.72;
  const center = roadCenterAtWorldZ(spec.length + 18, projection.width, width);
  const x = center - trainWidth * 0.5;
  const y = projection.y - trainHeight * 0.78;

  const bodyGradient = ctx.createLinearGradient(x, y, x, y + trainHeight);
  bodyGradient.addColorStop(0, appearance.roof);
  bodyGradient.addColorStop(0.18, "#eef4f8");
  bodyGradient.addColorStop(0.55, appearance.body);
  bodyGradient.addColorStop(1, appearance.lower);
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, trainWidth, trainHeight);

  ctx.fillStyle = "rgba(255, 255, 255, 0.44)";
  ctx.fillRect(x + trainWidth * 0.03, y + trainHeight * 0.04, trainWidth * 0.94, trainHeight * 0.05);

  ctx.fillStyle = appearance.stripe;
  ctx.fillRect(x, y + trainHeight * appearance.stripeOffset, trainWidth, trainHeight * appearance.stripeWidth);
  ctx.fillStyle = appearance.stripeSecondary;
  ctx.fillRect(x, y + trainHeight * (appearance.stripeOffset + appearance.stripeWidth + 0.018), trainWidth, trainHeight * 0.028);

  if (appearance.pattern === "wrap") {
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#ff7ab6";
    for (let index = -1; index < 6; index += 1) {
      drawQuad(
        x + trainWidth * (index * 0.18), y + trainHeight,
        x + trainWidth * (index * 0.18 + 0.08), y + trainHeight,
        x + trainWidth * (index * 0.18 + 0.24), y,
        x + trainWidth * (index * 0.18 + 0.16), y
      );
      ctx.fill();
    }
    ctx.restore();
  }

  if (appearance.pattern === "test") {
    for (let index = 0; index < 7; index += 1) {
      ctx.fillStyle = index % 2 === 0 ? "#ffd66f" : "#0d1821";
      ctx.fillRect(x + trainWidth * (0.1 + index * 0.1), y + trainHeight * 0.84, trainWidth * 0.08, trainHeight * 0.05);
    }
  }

  if (appearance.face === "bevel") {
    ctx.fillStyle = appearance.front;
    drawQuad(
      x + trainWidth * 0.06, y + trainHeight * 0.12,
      x + trainWidth * 0.94, y + trainHeight * 0.12,
      x + trainWidth * 0.86, y + trainHeight * 0.4,
      x + trainWidth * 0.14, y + trainHeight * 0.4
    );
    ctx.fill();
  } else {
    ctx.fillStyle = appearance.front;
    ctx.fillRect(x + trainWidth * 0.08, y + trainHeight * 0.12, trainWidth * 0.84, trainHeight * appearance.windowHeight);
  }

  ctx.fillStyle = appearance.window;
  ctx.fillRect(x + trainWidth * 0.12, y + trainHeight * 0.16, trainWidth * 0.76, trainHeight * 0.16);
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.fillRect(x + trainWidth * 0.16, y + trainHeight * 0.17, trainWidth * 0.68, trainHeight * 0.04);

  const ledWidth = trainWidth * 0.28;
  const ledHeight = trainHeight * 0.11;
  const ledX = x + trainWidth * 0.5 - ledWidth * 0.5;
  const ledY = y + trainHeight * appearance.ledInset;
  ctx.fillStyle = "rgba(6, 16, 24, 0.94)";
  ctx.fillRect(ledX, ledY, ledWidth, ledHeight);
  ctx.strokeStyle = appearance.ledColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(ledX, ledY, ledWidth, ledHeight);
  ctx.fillStyle = appearance.ledColor;
  ctx.textAlign = "center";
  ctx.font = `${Math.round(trainHeight * 0.07)}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
  ctx.fillText(appearance.ledText, ledX + ledWidth * 0.5, ledY + ledHeight * 0.48);
  ctx.font = `${Math.round(trainHeight * 0.04)}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
  ctx.fillText(appearance.ledSubText, ledX + ledWidth * 0.5, ledY + ledHeight * 0.82);

  const headlightY = y + trainHeight * 0.36;
  ctx.fillStyle = appearance.light;
  ctx.fillRect(x + trainWidth * 0.14, headlightY, trainWidth * 0.06, trainHeight * 0.045);
  ctx.fillRect(x + trainWidth * 0.8, headlightY, trainWidth * 0.06, trainHeight * 0.045);

  const doorWidth = trainWidth * 0.16;
  const doorHeight = trainHeight * 0.48;
  const doorGap = trainWidth * appearance.doorGap;
  const doorStart = x + trainWidth * appearance.doorInset;
  const goalDoorIndex = clamp((spec.goalLane || 2) - 1, 0, 2);
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

    ctx.fillStyle = isGoalDoor ? "rgba(56, 93, 88, 0.9)" : appearance.door;
    ctx.fillRect(doorX + doorWidth * 0.02 - slide, doorY, panelWidth, doorHeight);
    ctx.fillRect(doorX + doorWidth * 0.52 + slide, doorY, panelWidth, doorHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fillRect(doorX + doorWidth * 0.1 - slide, doorY + doorHeight * 0.12, doorWidth * 0.18, doorHeight * 0.7);
    ctx.fillRect(doorX + doorWidth * 0.72 + slide, doorY + doorHeight * 0.12, doorWidth * 0.18, doorHeight * 0.7);

    ctx.fillStyle = isGoalDoor ? "#9dffb8" : "rgba(220, 244, 255, 0.76)";
    ctx.font = `${Math.round(trainHeight * 0.045)}px "Bahnschrift", "Yu Gothic UI", sans-serif`;
    ctx.fillText(`${index + 1}\u756a`, doorX + doorWidth * 0.5, doorY - trainHeight * 0.03);
  }

  ctx.fillStyle = "rgba(12, 24, 34, 0.94)";
  ctx.fillRect(x + trainWidth * 0.34, y + trainHeight * 0.34, trainWidth * 0.32, trainHeight * 0.06);
  ctx.fillStyle = appearance.ledColor;
  ctx.font = `${Math.round(trainHeight * 0.05)}px "Yu Gothic UI", sans-serif`;
  ctx.fillText(spec.destination, x + trainWidth * 0.5, y + trainHeight * 0.385);
  ctx.textAlign = "left";
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
  const x = laneCenterAtWorldZ(getPlayerRenderLane(), state.distance + 6, width * 0.9, width);
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
  const goalPosition = getGoalBoardingPosition(state.stageSpec);
  const chips = [
    { label: UI_TEXT.hudSweat, value: sweat.label, accent: "#79ddff", width: 92 },
    {
      label: UI_TEXT.hudTrain,
      value: formatCompactTrainLabel(state.stageSpec),
      accent: state.stageSpec.rareTrain ? state.stageSpec.rareTrain.accent : state.stageSpec.trainAppearance.stripe,
      width: 146
    },
    {
      label: UI_TEXT.hudTarget,
      value: formatCompactBoardingPosition(goalPosition),
      accent: "#7df0a1",
      width: 118
    }
  ];

  let cursorX = 16;
  chips.forEach((chip, index) => {
    const x = cursorX;
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
    ctx.font = chip.width > 130 ? '14px "Yu Gothic UI", sans-serif' : '16px "Yu Gothic UI", sans-serif';
    ctx.fillText(chip.value, x + 10, y + 30);
    cursorX += chip.width + 10;
  });

  if (state.stageSpec.rareTrain) {
    const badgeWidth = 76;
    const badgeX = width - badgeWidth - 16;
    ctx.fillStyle = "rgba(8, 16, 24, 0.88)";
    ctx.fillRect(badgeX, 64, badgeWidth, 26);
    ctx.strokeStyle = state.stageSpec.rareTrain.accent;
    ctx.strokeRect(badgeX, 64, badgeWidth, 26);
    ctx.fillStyle = state.stageSpec.rareTrain.accent;
    ctx.font = '11px "Bahnschrift", "Yu Gothic UI", sans-serif';
    ctx.fillText(UI_TEXT.rareTrain, badgeX + 9, 81);
  }
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
  for (let index = state.obstacles.length - 1; index >= 0; index -= 1) {
    drawObstacle(state.obstacles[index], width, height);
  }
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
  const handleLaneInput = (clientX) => {
    setPlayerLane(laneFromClientX(clientX));
  };
  const handleViewportLaneInput = (event) => {
    if (
      !state.running ||
      event.target === canvas ||
      isInteractiveTarget(event.target) ||
      !isWithinLaneInputBand(event.clientX, event.clientY)
    ) {
      return false;
    }

    event.preventDefault();
    music.activate();
    state.pointerId = event.pointerId;
    handleLaneInput(event.clientX);
    return true;
  };

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
    event.preventDefault();
    music.activate();
    state.pointerId = event.pointerId;
    handleLaneInput(event.clientX);
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.running || state.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    handleLaneInput(event.clientX);
  });

  canvas.addEventListener("pointerup", (event) => {
    if (state.pointerId === event.pointerId) {
      state.pointerId = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (state.pointerId === event.pointerId) {
      state.pointerId = null;
    }
  });

  canvas.addEventListener("lostpointercapture", () => {
    state.pointerId = null;
  });

  window.addEventListener("pointerdown", (event) => {
    handleViewportLaneInput(event);
  });

  window.addEventListener("pointermove", (event) => {
    if (
      !state.running ||
      state.pointerId !== event.pointerId ||
      canvas.hasPointerCapture(event.pointerId) ||
      !isWithinLaneInputBand(event.clientX, event.clientY)
    ) {
      return;
    }

    event.preventDefault();
    handleLaneInput(event.clientX);
  });

  window.addEventListener("pointerup", (event) => {
    if (state.pointerId === event.pointerId && !canvas.hasPointerCapture(event.pointerId)) {
      state.pointerId = null;
    }
  });

  window.addEventListener("pointercancel", (event) => {
    if (state.pointerId === event.pointerId && !canvas.hasPointerCapture(event.pointerId)) {
      state.pointerId = null;
    }
  });

  if (!("PointerEvent" in window)) {
    canvas.addEventListener("touchstart", (event) => {
      if (!state.running || event.touches.length === 0) {
        return;
      }
      event.preventDefault();
      music.activate();
      handleLaneInput(event.touches[0].clientX);
    }, { passive: false });

    canvas.addEventListener("touchmove", (event) => {
      if (!state.running || event.touches.length === 0) {
        return;
      }
      event.preventDefault();
      handleLaneInput(event.touches[0].clientX);
    }, { passive: false });
  }

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
