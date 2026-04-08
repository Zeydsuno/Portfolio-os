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
