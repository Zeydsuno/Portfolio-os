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

/** Dynamic 8-bit BGM step tied to game speed */
export function playDinoBgmStep(beatIndex: number) {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;

  const step = beatIndex % 8;
  
  // Bass line notes (Square wave for retro feel)
  // A2 (110), C3 (130.81), G2 (98)
  const bassNotes = [110, 0, 110, 0, 130.81, 0, 98, 0];
  const freq = bassNotes[step];
  
  if (freq > 0) {
    tone(ac, freq, 0, 0.08, 0.08, "square"); // Snappy bass
  }
  
  // Hi-hats on off-beats (Triangle wave, very short decay for a percussive 'ts')
  if (step % 2 === 1) {
    tone(ac, 800, 0, 0.02, 0.02, "triangle");
  }
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
