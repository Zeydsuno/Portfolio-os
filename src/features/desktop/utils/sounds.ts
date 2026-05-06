import { useDesktopStore } from "../store/desktop-store";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call during a user gesture (e.g. game start) to unlock AudioContext on iOS Safari */
export function unlockAudio() {
  const ac = getCtx();
  if (ac && ac.state === "suspended") ac.resume().catch(() => {});
}

function tone(
  ac: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  vol = 0.15,
  type: OscillatorType = "sine"
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + duration);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.02);
}

function isMuted(): boolean {
  return useDesktopStore.getState().muted;
}

/** Approximate Win98 startup fanfare */
export function playStartup() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  const notes: Array<{ freq: number; start: number; dur: number }> = [
    { freq: 392, start: 0.0,  dur: 0.22 }, // G4
    { freq: 523, start: 0.20, dur: 0.22 }, // C5
    { freq: 659, start: 0.40, dur: 0.22 }, // E5
    { freq: 784, start: 0.60, dur: 0.40 }, // G5
    { freq: 987, start: 0.95, dur: 0.65 }, // B5
  ];
  notes.forEach(({ freq, start, dur }) => tone(ac, freq, start, dur, 0.13));
}

export function playWindowOpen() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 880,  0.00, 0.08, 0.09, "square");
  tone(ac, 1108, 0.07, 0.12, 0.07, "square");
}

/** Win98 critical stop / error sound */
export function playError() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 220, 0.00, 0.18, 0.18, "sawtooth");
  tone(ac, 180, 0.16, 0.22, 0.16, "sawtooth");
}

export function playWindowClose() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 660, 0.00, 0.08, 0.09, "square");
  tone(ac, 523, 0.07, 0.12, 0.07, "square");
}

// ── Dino game sounds ──────────────────────────────────────────────────────────

/** Quick upward chirp when the dino jumps */
export function playDinoJump() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 440, 0.00, 0.06, 0.08, "square");
  tone(ac, 600, 0.05, 0.08, 0.06, "square");
}

/** Descending crash sound on death */
export function playDinoDie() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 300, 0.00, 0.12, 0.20, "sawtooth");
  tone(ac, 200, 0.10, 0.15, 0.18, "sawtooth");
  tone(ac, 120, 0.22, 0.20, 0.15, "sawtooth");
}

/** Short blip for reaching a score milestone */
export function playDinoPoint() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 880, 0.00, 0.04, 0.06, "square");
  tone(ac, 1100, 0.03, 0.05, 0.05, "square");
}


// ── Dino BGM file player (intro → loop) ──────────────────────────────────────

let bgmIntro: HTMLAudioElement | null = null;
let bgmLoop: HTMLAudioElement | null = null;
let bgmStopped = false;

export function startDinoBgm(introSrc: string, loopSrc: string, baseSpeed: number, currentSpeed: number) {
  if (typeof window === "undefined") return;
  bgmStopped = false;

  // Tear down any previous playback
  if (bgmIntro) { bgmIntro.pause(); bgmIntro = null; }
  if (bgmLoop)  { bgmLoop.pause();  bgmLoop  = null; }

  const rate = currentSpeed / baseSpeed;
  const vol  = isMuted() ? 0 : 0.45;

  const loop = new Audio(loopSrc);
  loop.loop   = true;
  loop.volume = vol;
  loop.playbackRate = rate;
  bgmLoop = loop;

  if (!introSrc) {
    loop.play().catch(() => {});
    return;
  }

  const intro = new Audio(introSrc);
  intro.loop   = false;
  intro.volume = vol;
  intro.playbackRate = rate;
  intro.addEventListener("ended", () => {
    bgmIntro = null;
    if (!bgmStopped) loop.play().catch(() => {});
  }, { once: true });
  bgmIntro = intro;
  intro.play().catch(() => {});
}

export function stopDinoBgm() {
  bgmStopped = true;
  if (bgmIntro) { bgmIntro.pause(); bgmIntro = null; }
  if (bgmLoop)  { bgmLoop.pause();  bgmLoop  = null; }
}

export function setDinoBgmRate(rate: number) {
  const clamped = Math.min(Math.max(rate, 0.5), 4.0);
  const vol = isMuted() ? 0 : 0.45;
  if (bgmIntro && !bgmIntro.paused) { bgmIntro.playbackRate = clamped; bgmIntro.volume = vol; }
  if (bgmLoop  && !bgmLoop.paused)  { bgmLoop.playbackRate  = clamped; bgmLoop.volume  = vol; }
}

// ── Snake game sounds ─────────────────────────────────────────────────────────

/** High-pitched blip when snake eats food */
export function playSnakeEat() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 600, 0.0, 0.05, 0.05, "square");
  tone(ac, 800, 0.05, 0.05, 0.05, "square");
}

/** Deep descending sound when snake hits a wall or itself */
export function playSnakeDie() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 250, 0.0, 0.1, 0.15, "sawtooth");
  tone(ac, 150, 0.1, 0.15, 0.2, "sawtooth");
  tone(ac, 80, 0.25, 0.2, 0.2, "sawtooth");
}

/** Low-frequency rumbling white-noise retro explosion sound for Minesweeper game over */
export function playMinesweeperExplosion() {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;

  const duration = 0.5; // seconds
  const currentTime = ac.currentTime;

  // 1. Crunchy 8-bit Bitcrushed Noise source (recreates lo-fi NES/GameBoy noise channel)
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  const bitReduction = 16; // Keep the same value for every 16 samples for a super crunchy 8-bit sound!
  let lastVal = Math.random() * 2 - 1;
  for (let i = 0; i < bufferSize; i++) {
    if (i % bitReduction === 0) {
      lastVal = Math.random() * 2 - 1;
    }
    data[i] = lastVal;
  }

  const noiseSource = ac.createBufferSource();
  noiseSource.buffer = buffer;

  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(1000, currentTime);
  noiseFilter.frequency.exponentialRampToValueAtTime(100, currentTime + duration - 0.1);

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0, currentTime);
  noiseGain.gain.linearRampToValueAtTime(0.35, currentTime + 0.01);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ac.destination);

  // 2. Heavy Sawtooth Tone Sweep (creates the explosive bass punch and "meat" of the rumble)
  const osc = ac.createOscillator();
  const oscGain = ac.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, currentTime);
  osc.frequency.linearRampToValueAtTime(30, currentTime + duration - 0.1);

  oscGain.gain.setValueAtTime(0, currentTime);
  oscGain.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
  oscGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration - 0.05);

  osc.connect(oscGain);
  oscGain.connect(ac.destination);

  // Start both sources simultaneously for the ultimate retro blast!
  noiseSource.start(currentTime);
  noiseSource.stop(currentTime + duration);

  osc.start(currentTime);
  osc.stop(currentTime + duration);
}
