// ─── Renderer — Job: draw the game canvas, nothing else ─────────────────────
import {
  CELL_SIZE, GRID_W, GRID_H, CANVAS_W, CANVAS_H,
  type Point,
} from "./constants";

interface GoldenFood extends Point {
  timer: number;
}

/** Draw the dark grid background */
function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= GRID_W; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y <= GRID_H; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(CANVAS_W, y * CELL_SIZE);
    ctx.stroke();
  }
}

/** Draw the regular red apple */
function drawFood(ctx: CanvasRenderingContext2D, food: Point): void {
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(
    food.x * CELL_SIZE + 2,
    food.y * CELL_SIZE + 2,
    CELL_SIZE - 4,
    CELL_SIZE - 4,
  );
}

/** Draw the golden apple (blinking when about to expire) */
function drawGoldenFood(ctx: CanvasRenderingContext2D, gf: GoldenFood): void {
  if (gf.timer > 15 || Math.floor(Date.now() / 150) % 2 === 0) {
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(
      gf.x * CELL_SIZE + 1,
      gf.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2,
    );
  }
}

/** Draw every snake segment (head is brighter green) */
function drawSnake(ctx: CanvasRenderingContext2D, snake: Point[]): void {
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#00ff00" : "#00aa00";
    ctx.fillRect(
      seg.x * CELL_SIZE + 1,
      seg.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2,
    );
  });
}

/** Single entry-point: render one complete frame */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  snake: Point[],
  food: Point,
  goldenFood: GoldenFood | null,
): void {
  drawBackground(ctx);
  drawFood(ctx, food);
  if (goldenFood) drawGoldenFood(ctx, goldenFood);
  drawSnake(ctx, snake);
}
