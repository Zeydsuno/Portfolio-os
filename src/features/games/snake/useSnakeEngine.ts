"use client";
// ─── useSnakeEngine — Job: game loop, state, and input handling ──────────────
import { useEffect, useRef, useCallback, useState } from "react";
import {
  TICK_MS, MIN_TICK_MS, SPEED_STEP,
  SCORE_APPLE, SCORE_GOLDEN_APPLE, GOLDEN_CHANCE, GOLDEN_TIMER,
  type Point, type Direction, type GameStatus,
  spawnFood, calcNextHead, isWallCollision, isSelfCollision, isEating,
} from "./constants";
import { renderFrame } from "./renderer";
import { snakeState }   from "./snakeState";
import { snakeStorage } from "./snakeStorage";
import { playSnakeEat, playSnakeDie, playDinoPoint, unlockAudio } from "@/features/desktop/utils/sounds";

export interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export function useSnakeEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  // ── React state (triggers re-renders for UI) ────────────────────────────
  const [score,     setScore]     = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status,    setStatus]    = useState<GameStatus>("waiting");
  const [popups,    setPopups]    = useState<Popup[]>([]);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [isTouchOrMobile,   setIsTouchOrMobile]   = useState(false);

  // ── Refs (updated every tick without re-render) ─────────────────────────
  const snakeRef      = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef        = useRef<Direction>("RIGHT");
  const nextDirRef    = useRef<Direction>("RIGHT");
  const foodRef       = useRef<Point>({ x: 15, y: 10 });
  const goldenFoodRef = useRef<{ x: number; y: number; timer: number } | null>(null);
  const popupIdRef    = useRef(0);
  const highScoreRef  = useRef(0);
  const statusRef     = useRef<GameStatus>("waiting");
  const speedRef      = useRef(TICK_MS);
  const loopRef       = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // ── Detect mobile / landscape ───────────────────────────────────────────
  useEffect(() => {
    const checkLayout = () => {
      const touch = window.innerWidth < 768 || window.innerHeight < 500
        || ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
      setIsTouchOrMobile(touch);
      setIsMobileLandscape(touch && window.innerHeight < 500);
    };
    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  // ── Load high score once ────────────────────────────────────────────────
  useEffect(() => {
    snakeStorage.load().then(v => {
      if (v > 0) { highScoreRef.current = v; setHighScore(v); }
    });
  }, []);

  // ── draw: render one frame ──────────────────────────────────────────────
  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    renderFrame(ctx, snakeRef.current, foodRef.current, goldenFoodRef.current);
  }, [canvasRef]);

  // ── Initial draw on mount ───────────────────────────────────────────────
  useEffect(() => { draw(); }, [draw]);

  // ── addPopup: show a floating score label ───────────────────────────────
  const addPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = ++popupIdRef.current;
    setPopups(p => [...p, { id, x, y, text, color }]);
    setTimeout(() => setPopups(p => p.filter(item => item.id !== id)), 1000);
  }, []);

  // ── reset: initialise all refs for a new game ───────────────────────────
  const reset = useCallback(() => {
    snakeRef.current      = [{ x: 10, y: 10 }];
    dirRef.current        = "RIGHT";
    nextDirRef.current    = "RIGHT";
    foodRef.current       = spawnFood(snakeRef.current);
    goldenFoodRef.current = null;
    speedRef.current      = TICK_MS;
    statusRef.current     = "playing";
    setPopups([]);
    setScore(0);
    setStatus("playing");
    snakeState.reset();
  }, []);

  // ── triggerGameOver: save score and flip status ─────────────────────────
  const triggerGameOver = useCallback(() => {
    playSnakeDie();
    const final = snakeState.getScore();
    window.umami?.track("game_over", { game: "snake", score: final, new_highscore: final > highScoreRef.current });
    if (final > highScoreRef.current && snakeState.isPlausible(final)) {
      highScoreRef.current = final;
      setHighScore(final);
      snakeStorage.save(final, snakeState.getSessionStart());
    }
    statusRef.current = "gameover";
    setStatus("gameover");
  }, []);

  // ── tick: advance the game by one step ─────────────────────────────────
  const tick = useCallback(function tickFn() {
    if (statusRef.current !== "playing") return;

    const snake   = snakeRef.current;
    dirRef.current = nextDirRef.current;
    const newHead  = calcNextHead(snake[0], dirRef.current);

    // Collisions → game over
    if (isWallCollision(newHead) || isSelfCollision(newHead, snake)) {
      snakeRef.current = [newHead, ...snake.slice(0, -1)];
      draw();
      triggerGameOver();
      return;
    }

    const newSnake = [newHead, ...snake];
    let ateFood    = false;

    // Eat golden apple
    if (goldenFoodRef.current && isEating(newHead, goldenFoodRef.current)) {
      playDinoPoint();
      snakeState.addScore(SCORE_GOLDEN_APPLE);
      setScore(snakeState.getScore());
      goldenFoodRef.current = null;
      ateFood = true;
      addPopup(newHead.x, newHead.y, `+${SCORE_GOLDEN_APPLE}`, "#ffd700");
    }
    // Eat regular apple
    else if (isEating(newHead, foodRef.current)) {
      playSnakeEat();
      snakeState.addScore(SCORE_APPLE);
      setScore(snakeState.getScore());
      foodRef.current = spawnFood(newSnake);
      ateFood = true;

      // Speed up
      speedRef.current = Math.max(MIN_TICK_MS, speedRef.current - SPEED_STEP);
      if (loopRef.current) clearInterval(loopRef.current);
      loopRef.current = setInterval(tickFn, speedRef.current);

      addPopup(newHead.x, newHead.y, `+${SCORE_APPLE}`, "#00ff00");

      // Possibly spawn golden apple
      if (!goldenFoodRef.current && Math.random() < GOLDEN_CHANCE) {
        goldenFoodRef.current = { ...spawnFood([...newSnake, foodRef.current]), timer: GOLDEN_TIMER };
      }
    } else {
      newSnake.pop();
    }

    // Tick down golden apple timer
    if (goldenFoodRef.current && !ateFood) {
      goldenFoodRef.current.timer--;
      if (goldenFoodRef.current.timer <= 0) goldenFoodRef.current = null;
    }

    snakeRef.current = newSnake;
    draw();
  }, [draw, triggerGameOver, addPopup]);

  // ── startGame: reset state then kick off the interval ──────────────────
  const startGame = useCallback(() => {
    unlockAudio();
    if (loopRef.current) clearInterval(loopRef.current);
    reset();
    draw();
    loopRef.current = setInterval(tick, speedRef.current);
  }, [reset, draw, tick]);

  // ── quitToMenu: stop loop, return to waiting screen ────────────────────
  const quitToMenu = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    statusRef.current = "waiting";
    setStatus("waiting");
    draw();
  }, [draw]);

  // ── Keyboard input ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (statusRef.current !== "playing") {
        if (e.key === "Enter" || e.key === " ") { startGame(); e.preventDefault(); return; }
      }
      const dir = dirRef.current;
      switch (e.key) {
        case "ArrowUp":    if (dir !== "DOWN")  { nextDirRef.current = "UP";    snakeState.countInput(); } break;
        case "ArrowDown":  if (dir !== "UP")    { nextDirRef.current = "DOWN";  snakeState.countInput(); } break;
        case "ArrowLeft":  if (dir !== "RIGHT") { nextDirRef.current = "LEFT";  snakeState.countInput(); } break;
        case "ArrowRight": if (dir !== "LEFT")  { nextDirRef.current = "RIGHT"; snakeState.countInput(); } break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [startGame]);

  // ── Touch / swipe input ─────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || statusRef.current !== "playing") return;
    const dx    = e.touches[0].clientX - touchStartRef.current.x;
    const dy    = e.touches[0].clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        if (dx > 0 && dirRef.current !== "LEFT")  { nextDirRef.current = "RIGHT"; snakeState.countInput(); }
        else if (dx < 0 && dirRef.current !== "RIGHT") { nextDirRef.current = "LEFT";  snakeState.countInput(); }
      } else {
        if (dy > 0 && dirRef.current !== "UP")    { nextDirRef.current = "DOWN";  snakeState.countInput(); }
        else if (dy < 0 && dirRef.current !== "DOWN")  { nextDirRef.current = "UP";    snakeState.countInput(); }
      }
      touchStartRef.current = null; // consumed — prevent continuous firing
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    touchStartRef.current = null;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 10 && statusRef.current !== "playing") {
      startGame();
    }
  }, [startGame]);

  const handleDPad = useCallback((d: Direction) => {
    if (statusRef.current === "waiting") { startGame(); return; }
    if (statusRef.current === "gameover") return;
    const cur = dirRef.current;
    if      (d === "UP"    && cur !== "DOWN")  { nextDirRef.current = "UP";    snakeState.countInput(); }
    else if (d === "DOWN"  && cur !== "UP")    { nextDirRef.current = "DOWN";  snakeState.countInput(); }
    else if (d === "LEFT"  && cur !== "RIGHT") { nextDirRef.current = "LEFT";  snakeState.countInput(); }
    else if (d === "RIGHT" && cur !== "LEFT")  { nextDirRef.current = "RIGHT"; snakeState.countInput(); }
  }, [startGame]);

  return {
    // UI state
    score, highScore, status, popups,
    isMobileLandscape, isTouchOrMobile,
    // Actions
    startGame, quitToMenu,
    // Input handlers
    handleTouchStart, handleTouchMove, handleTouchEnd, handleDPad,
  };
}
