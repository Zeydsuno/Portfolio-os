// Snake scores +10 per apple, +50 per golden apple.
// At minimum tick (50ms) all-golden: 1000 pts/sec theoretical max.
// Generous ceiling of 300 pts/sec covers realistic play patterns.
const MAX_PTS_PER_SEC = 300;

function createSnakeState() {
  let _score        = 0;
  let _sessionStart = 0;
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
      if (finalScore / durationSec > MAX_PTS_PER_SEC * 1.1) return false;
      if (durationSec < (finalScore / MAX_PTS_PER_SEC) * 0.8) return false;
      if (finalScore > 10 && _inputCount < 1) return false;
      return true;
    },
  });
}

export const snakeState = createSnakeState();
