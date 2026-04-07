"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const CELL_SIZE = 16;
const GRID_W = 20;
const GRID_H = 20;
const CANVAS_W = GRID_W * CELL_SIZE;
const CANVAS_H = GRID_H * CELL_SIZE;
const TICK_MS = 120;

interface Point {
  x: number;
  y: number;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type GameStatus = "waiting" | "playing" | "gameover";

function spawnFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("waiting");

  // Game state in refs to avoid re-renders each frame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Direction>("RIGHT");
  const nextDirRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>("waiting");
  const loopRef = useRef<ReturnType<typeof setInterval>>();

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid lines (subtle)
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

    // Food
    const food = foodRef.current;
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#00ff00" : "#00aa00";
      ctx.fillRect(
        seg.x * CELL_SIZE + 1,
        seg.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    foodRef.current = spawnFood(snakeRef.current);
    scoreRef.current = 0;
    setScore(0);
    statusRef.current = "playing";
    setStatus("playing");
  }, []);

  const tick = useCallback(() => {
    if (statusRef.current !== "playing") return;

    const snake = snakeRef.current;
    dirRef.current = nextDirRef.current;
    const head = snake[0];
    const dir = dirRef.current;

    const newHead: Point = {
      x: head.x + (dir === "RIGHT" ? 1 : dir === "LEFT" ? -1 : 0),
      y: head.y + (dir === "DOWN" ? 1 : dir === "UP" ? -1 : 0),
    };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_W ||
      newHead.y < 0 ||
      newHead.y >= GRID_H
    ) {
      statusRef.current = "gameover";
      setStatus("gameover");
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      statusRef.current = "gameover";
      setStatus("gameover");
      return;
    }

    const newSnake = [newHead, ...snake];

    // Eat food
    if (
      newHead.x === foodRef.current.x &&
      newHead.y === foodRef.current.y
    ) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = spawnFood(newSnake);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  }, [draw]);

  const startGame = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    reset();
    draw();
    loopRef.current = setInterval(tick, TICK_MS);
  }, [reset, draw, tick]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (statusRef.current === "waiting" || statusRef.current === "gameover") {
        if (e.key === "Enter" || e.key === " ") {
          startGame();
          e.preventDefault();
          return;
        }
      }

      const dir = dirRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (dir !== "DOWN") nextDirRef.current = "UP";
          break;
        case "ArrowDown":
          if (dir !== "UP") nextDirRef.current = "DOWN";
          break;
        case "ArrowLeft":
          if (dir !== "RIGHT") nextDirRef.current = "LEFT";
          break;
        case "ArrowRight":
          if (dir !== "LEFT") nextDirRef.current = "RIGHT";
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [startGame]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ imageRendering: "pixelated", border: "2px inset" }}
      />
      <div className="status-bar" style={{ width: CANVAS_W }}>
        <p className="status-bar-field">Score: {score}</p>
        <p className="status-bar-field">
          {status === "waiting" && "Press Enter to start"}
          {status === "playing" && "Use arrow keys"}
          {status === "gameover" && "Game Over! Press Enter"}
        </p>
      </div>
    </div>
  );
}
