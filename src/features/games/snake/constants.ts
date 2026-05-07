// ─── Grid / Canvas ─────────────────────────────────────────────────────────
export const CELL_SIZE = 16;
export const GRID_W    = 20;
export const GRID_H    = 20;
export const CANVAS_W  = GRID_W * CELL_SIZE;
export const CANVAS_H  = GRID_H * CELL_SIZE;

// ─── Timing ─────────────────────────────────────────────────────────────────
export const TICK_MS      = 180;  // initial ms per tick
export const MIN_TICK_MS  = 50;   // fastest possible tick
export const SPEED_STEP   = 5;    // ms removed per apple eaten

// ─── Scoring ────────────────────────────────────────────────────────────────
export const SCORE_APPLE        = 10;
export const SCORE_GOLDEN_APPLE = 50;
export const GOLDEN_CHANCE      = 0.15; // 15% spawn chance
export const GOLDEN_TIMER       = 50;   // ticks before golden apple expires

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
}

export type Direction  = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameStatus = "waiting" | "playing" | "gameover";

// ─── Pure helpers (1 job each, no side-effects) ─────────────────────────────

/** Spawn food at a random cell not occupied by the snake */
export function spawnFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
  return food;
}

/** Calculate the next head position given current head and direction */
export function calcNextHead(head: Point, dir: Direction): Point {
  return {
    x: head.x + (dir === "RIGHT" ? 1 : dir === "LEFT" ? -1 : 0),
    y: head.y + (dir === "DOWN"  ? 1 : dir === "UP"   ? -1 : 0),
  };
}

/** True if the point is outside the grid */
export function isWallCollision(p: Point): boolean {
  return p.x < 0 || p.x >= GRID_W || p.y < 0 || p.y >= GRID_H;
}

/** True if the point overlaps any segment of the snake */
export function isSelfCollision(head: Point, snake: Point[]): boolean {
  return snake.some(s => s.x === head.x && s.y === head.y);
}

/** True if the point matches the target food */
export function isEating(head: Point, food: Point): boolean {
  return head.x === food.x && head.y === food.y;
}
