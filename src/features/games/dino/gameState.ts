import { MAX_SPEED } from "./constants";

// Score accumulates at speed * 0.1 per tick at 120 Hz
// Absolute ceiling = MAX_SPEED * 0.1 * 120 = 90 pts/sec
const MAX_PTS_PER_SEC = MAX_SPEED * 0.1 * 120;

function createGameState() {
  let _score        = 0;
  let _sessionStart = 0; // Date.now() at game start
  let _inputCount   = 0;

  return Object.freeze({
    reset() {
      _score        = 0;
      _sessionStart = Date.now();
      _inputCount   = 0;
    },

    getScore:        () => _score,
    getSessionStart: () => _sessionStart,

    addScore(delta: number) {
      _score += delta;
    },

    countInput() {
      _inputCount++;
    },

    isPlausible(finalScore: number): boolean {
      const durationSec = (Date.now() - _sessionStart) / 1000;
      if (durationSec <= 0) return false;

      // Rate check: must not exceed physics maximum
      if (finalScore / durationSec > MAX_PTS_PER_SEC * 1.05) return false;

      // Time check: minimum wall-clock time to reach this score at max speed
      if (durationSec < (finalScore / MAX_PTS_PER_SEC) * 0.85) return false;

      // Input check: non-trivial scores require real interaction
      if (finalScore > 200 && _inputCount < 2) return false;

      return true;
    },
  });
}

export const gameState = createGameState();
