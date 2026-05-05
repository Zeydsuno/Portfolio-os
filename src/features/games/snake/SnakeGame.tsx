"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import DPad from "@/components/DPad";
import { playSnakeEat, playSnakeDie, playDinoPoint } from "@/features/desktop/utils/sounds";

const CELL_SIZE = 16;
const GRID_W = 20;
const GRID_H = 20;
const CANVAS_W = GRID_W * CELL_SIZE;
const CANVAS_H = GRID_H * CELL_SIZE;
const TICK_MS = 180;

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
  const [showHelp, setShowHelp] = useState(false);
  const [highScore, setHighScore] = useState(() =>
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("snake_high_score") ?? "0", 10)
      : 0
  );
  const [status, setStatus] = useState<GameStatus>("waiting");
  const [popups, setPopups] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Game state in refs to avoid re-renders each frame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Direction>("RIGHT");
  const nextDirRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const goldenFoodRef = useRef<{ x: number; y: number; timer: number } | null>(null);
  const popupIdRef = useRef(0);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("snake_high_score") ?? "0", 10)
      : 0
  );
  const statusRef = useRef<GameStatus>("waiting");
  const speedRef = useRef(TICK_MS);
  const loopRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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

    // Golden Food
    if (goldenFoodRef.current) {
      const gf = goldenFoodRef.current;
      if (gf.timer > 15 || Math.floor(Date.now() / 150) % 2 === 0) {
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
          gf.x * CELL_SIZE + 1,
          gf.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        );
      }
    }

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
    goldenFoodRef.current = null;
    setPopups([]);
    scoreRef.current = 0;
    speedRef.current = TICK_MS;
    setScore(0);
    statusRef.current = "playing";
    setStatus("playing");
  }, []);

  const triggerGameOver = useCallback(() => {
    playSnakeDie();
    if (scoreRef.current > highScoreRef.current) {
      highScoreRef.current = scoreRef.current;
      setHighScore(highScoreRef.current);
      localStorage.setItem("snake_high_score", String(highScoreRef.current));
    }
    statusRef.current = "gameover";
    setStatus("gameover");
  }, []);

  const tick = useCallback(function tickFn() {
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
      snakeRef.current = [newHead, ...snake.slice(0, -1)];
      draw();
      triggerGameOver();
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      snakeRef.current = [newHead, ...snake.slice(0, -1)];
      draw();
      triggerGameOver();
      return;
    }

    const newSnake = [newHead, ...snake];

    let ateFood = false;

    // Eat Golden Food
    if (
      goldenFoodRef.current &&
      newHead.x === goldenFoodRef.current.x &&
      newHead.y === goldenFoodRef.current.y
    ) {
      playDinoPoint();
      scoreRef.current += 50;
      setScore(scoreRef.current);
      goldenFoodRef.current = null;
      ateFood = true;

      const id = ++popupIdRef.current;
      setPopups((p) => [...p, { id, x: newHead.x, y: newHead.y, text: "+50", color: "#ffd700" }]);
      setTimeout(() => setPopups((p) => p.filter((x) => x.id !== id)), 1000);
    }
    // Eat regular food
    else if (
      newHead.x === foodRef.current.x &&
      newHead.y === foodRef.current.y
    ) {
      playSnakeEat();
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = spawnFood(newSnake);
      ateFood = true;

      // Speed up the game
      speedRef.current = Math.max(50, speedRef.current - 5);
      if (loopRef.current) clearInterval(loopRef.current);
      loopRef.current = setInterval(tickFn, speedRef.current);

      const id = ++popupIdRef.current;
      setPopups((p) => [...p, { id, x: newHead.x, y: newHead.y, text: "+10", color: "#00ff00" }]);
      setTimeout(() => setPopups((p) => p.filter((x) => x.id !== id)), 1000);

      // Spawn golden apple? (15% chance)
      if (!goldenFoodRef.current && Math.random() < 0.15) {
        goldenFoodRef.current = { ...spawnFood([...newSnake, foodRef.current]), timer: 50 };
      }
    } else {
      newSnake.pop();
    }

    // Golden apple timer
    if (goldenFoodRef.current && !ateFood) {
      goldenFoodRef.current.timer--;
      if (goldenFoodRef.current.timer <= 0) {
        goldenFoodRef.current = null;
      }
    }

    snakeRef.current = newSnake;
    draw();
  }, [draw, triggerGameOver]);

  const startGame = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    reset();
    draw();
    loopRef.current = setInterval(tick, speedRef.current);
  }, [reset, draw, tick]);

  const quitToMenu = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    statusRef.current = "waiting";
    setStatus("waiting");
    draw();
  }, [draw]);

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

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStartRef.current;
    if (!start) return;
    touchStartRef.current = null;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 20) {
      if (statusRef.current !== "playing") startGame();
      return;
    }
    if (absDx > absDy) {
      if (dx > 0 && dirRef.current !== "LEFT") nextDirRef.current = "RIGHT";
      else if (dx < 0 && dirRef.current !== "RIGHT") nextDirRef.current = "LEFT";
    } else {
      if (dy > 0 && dirRef.current !== "UP") nextDirRef.current = "DOWN";
      else if (dy < 0 && dirRef.current !== "DOWN") nextDirRef.current = "UP";
    }
  }

  function handleDPad(d: Direction) {
    if (statusRef.current === "waiting") {
      startGame();
      return;
    }
    if (statusRef.current === "gameover") return;
    const cur = dirRef.current;
    if (d === "UP" && cur !== "DOWN") nextDirRef.current = "UP";
    else if (d === "DOWN" && cur !== "UP") nextDirRef.current = "DOWN";
    else if (d === "LEFT" && cur !== "RIGHT") nextDirRef.current = "LEFT";
    else if (d === "RIGHT" && cur !== "LEFT") nextDirRef.current = "RIGHT";
  }


  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden">
      <style>{`
        @keyframes snakeFloatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
        }
      `}</style>
      
      <div className="flex-1 w-full flex items-center justify-center min-h-0 p-2">
        <div style={{ position: "relative", height: "100%", maxWidth: "100%", maxHeight: "100%", aspectRatio: "1/1" }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ width: "100%", height: "100%", imageRendering: "pixelated", border: "2px inset", touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
          {popups.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${(p.x / GRID_W) * 100}%`,
                top: `calc(${(p.y / GRID_H) * 100}% - 10px)`,
                color: p.color,
                fontWeight: "bold",
                fontSize: "14px",
                fontFamily: "'Press Start 2P', cursive",
                pointerEvents: "none",
                textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                animation: "snakeFloatUp 1s ease-out forwards",
                zIndex: 10,
              }}
            >
              {p.text}
            </div>
          ))}
        </div>
      </div>
      
      <div className="status-bar" style={{ width: "100%" }}>
        <p className="status-bar-field">Score: {score}</p>
        <p className="status-bar-field">
          {status === "waiting" && (
            <><span className="md:hidden">Tap to start</span><span className="hidden md:inline">Press Enter to start</span></>
          )}
          {status === "playing" && (
            <><span className="md:hidden">Swipe to steer</span><span className="hidden md:inline">Arrow keys to steer</span></>
          )}
          {status === "gameover" && (
            <><span className="md:hidden">Tap to retry</span><span className="hidden md:inline">Press Enter to retry</span></>
          )}
        </p>
        <p className="status-bar-field" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => setShowHelp(true)}>?</p>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
          onClick={() => setShowHelp(false)}
        >
          <div className="window" style={{ minWidth: 260, maxWidth: 310 }} onClick={e => e.stopPropagation()}>
            <div className="title-bar">
              <div className="title-bar-text">Snake — How to Play</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setShowHelp(false)} />
              </div>
            </div>
            <div className="window-body" style={{ padding: "12px 16px", fontSize: 11, lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Controls</p>
              <div style={{ display: "flex", gap: 16, margin: "0 0 12px", alignItems: "flex-start" }}>
                <div>
                  {/* Arrow key visual */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 26px)", gridTemplateRows: "repeat(2, 26px)", gap: 2, marginBottom: 4 }}>
                    {["", "▲", "", "◀", "▼", "▶"].map((k, i) => (
                      <div key={i} style={{ width: 26, height: 26, border: k ? "2px solid #808080" : "none", background: k ? "#c0c0c0" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, borderRadius: 2, boxShadow: k ? "1px 1px 0 #fff inset" : "none" }}>{k}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: "#555", textAlign: "center" }}>Arrow keys</div>
                </div>
                <div style={{ fontSize: 11, paddingTop: 4 }}>
                  <div>or <strong>W A S D</strong></div>
                  <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>Mobile: swipe</div>
                </div>
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Scoring</p>
              <div style={{ display: "flex", gap: 12, margin: "0 0 4px", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>🍎</span>
                <span>Normal apple — <strong>+10 pt</strong></span>
              </div>
              <div style={{ display: "flex", gap: 12, margin: "0 0 10px", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>✨</span>
                <span>Golden apple — <strong>+50 pts</strong>, limited time</span>
              </div>
              <p style={{ margin: 0 }}>• Don&apos;t hit the walls or your own tail</p>
            </div>
          </div>
        </div>
      )}

      {/* You Lose popup — Win98 dialog style */}
      {status === "gameover" && (
        <div
          style={{
            position: "fixed", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.45)", zIndex: 50,
            pointerEvents: "all",
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="window" style={{ minWidth: 280, maxWidth: 340 }}>
            <div className="title-bar">
              <div className="title-bar-text">Snake — Game Over</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onPointerDown={quitToMenu} />
              </div>
            </div>
            <div className="window-body" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>😵</span>
                <div>
                  <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>You lose!</p>
                  <p style={{ margin: "0 0 2px" }}>
                    Score: <strong>{score}</strong>
                  </p>
                  <p style={{ margin: 0, color: highScore > 0 && score >= highScore ? "green" : undefined }}>
                    Best: <strong>{highScore}</strong>
                    {highScore > 0 && score >= highScore && " 🏆"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onPointerDown={quitToMenu} style={{ minWidth: 88 }}>
                  Play Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DPad onDirection={handleDPad} />
    </div>
  );
}
