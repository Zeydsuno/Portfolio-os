"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playDinoJump, playDinoDie, playDinoPoint, startDinoBgm, stopDinoBgm } from "@/features/desktop/utils/sounds";

import { Status, Cactus, Pterodactyl, Cloud, Star, ShootingStar, Tumbleweed } from "./types";
import {
  CANVAS_W, CANVAS_H, GROUND_Y, DINO_X, DINO_W, DINO_H,
  FRAME_W, FRAME_H, GRAVITY, JUMP_VY_INITIAL, JUMP_BOOST_PER_FRAME,
  JUMP_BOOST_MAX_FRAMES, JUMP_HOLD_THRESHOLD, BASE_SPEED, MAX_SPEED,
  PTERO_W, PTERO_H, PTERO_Y_OPTIONS, CACTUS_DIMS
} from "./constants";
import { drawPterodactyl, drawCactus, drawCloud, drawStar, drawMoon, drawShootingStar, drawTumbleweed } from "./renderer";
import { DinoHelpModal } from "./DinoHelpModal";
import { saveHighScore, loadHighScore } from "./scoreStorage";
import { gameState } from "./gameState";

const FIXED_STEP = 1000 / 120; // ~8.33ms per physics tick — keeps gameplay fast and identical on 60/144/240Hz

export default function DinoGame() {
  const canvasRef     = useRef<HTMLCanvasElement>(null); // background: sky, stars, clouds, HUD
  const gameCanvasRef = useRef<HTMLCanvasElement>(null); // game elements: dino, obstacles, ground
  const [showHelp, setShowHelp] = useState(false);
  const [isTouchOrMobile, setIsTouchOrMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || window.innerHeight < 500 || ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
      setIsTouchOrMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const statusRef   = useRef<Status>("waiting");
  const dinoYRef    = useRef(GROUND_Y - DINO_H);
  const dinoVYRef   = useRef(0);
  const onGroundRef = useRef(true);
  const isDuckRef       = useRef(false);
  const jumpHeldRef     = useRef(false);
  const jumpBoostRef    = useRef(0);
  const jumpHoldFrameRef = useRef(0);
  const cactiRef        = useRef<Cactus[]>([]);
  const pterosRef       = useRef<Pterodactyl[]>([]);
  const cloudsRef       = useRef<Cloud[]>([]);
  const starsRef        = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const tumbleweedsRef  = useRef<Tumbleweed[]>([]);
  const moonRef         = useRef<{x: number, y: number, phase: number} | null>(null);
  const dustOverlayRef  = useRef<HTMLDivElement>(null);
  const dustOffsetRef   = useRef(0);
  const nightPhaseRef   = useRef(0);
  const isNightRef      = useRef(false);
  const nextPhaseScoreRef = useRef(1000 + Math.random() * 500);
  const hiRef           = useRef(0);
  const speedRef        = useRef(BASE_SPEED);
  const animFrameRef    = useRef(0);
  const gndOffRef       = useRef(0);
  const spawnTsRef      = useRef(0);
  const pteroSpawnTsRef = useRef(0);
  const rafRef          = useRef(0);
  const lastTsRef       = useRef<number>(-1);
  const accumRef        = useRef(0);
  const spriteRef       = useRef<HTMLImageElement | null>(null);
  const bugSpriteRef    = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/dino-sprite.png";
    img.onload = () => { spriteRef.current = img; };
    const bug = new Image();
    bug.src = "/images/bug-sprite.png";
    bug.onload = () => { bugSpriteRef.current = bug; };
  }, []);

  useEffect(() => {
    loadHighScore().then(score => { hiRef.current = score; });
  }, []);

  const draw = useCallback(() => {
    const ctx     = canvasRef.current?.getContext("2d");
    const gameCtx = gameCanvasRef.current?.getContext("2d");
    if (!ctx || !gameCtx) return;
    const st    = statusRef.current;
    const phase = nightPhaseRef.current;

    // === MAIN CANVAS: background + sky + HUD (never filtered) ===
    const bgR = Math.round(208 - (208 - 17) * phase);
    const bgG = Math.round(232 - (232 - 17) * phase);
    const bgB = Math.round(200 - (200 - 17) * phase);
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (const s of starsRef.current) drawStar(ctx, s, phase);
    for (const ss of shootingStarsRef.current) drawShootingStar(ctx, ss, phase);
    if (moonRef.current) drawMoon(ctx, moonRef.current, phase);
    for (const c of cloudsRef.current) drawCloud(ctx, c, phase);
    for (const t of tumbleweedsRef.current) drawTumbleweed(ctx, t);

    // Dust overlay
    if (dustOverlayRef.current) {
      dustOffsetRef.current -= speedRef.current * 1.2;
      dustOverlayRef.current.style.backgroundPosition = `${dustOffsetRef.current}px 0px`;
      dustOverlayRef.current.style.opacity = Math.max(0, 1 - phase).toString();
    }

    // === GAME CANVAS: ground + obstacles + dino ===
    // CSS filter applied to this canvas element — works on all browsers including iOS Safari
    gameCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Ground
    gameCtx.fillStyle = "#555";
    gameCtx.fillRect(0, GROUND_Y, CANVAS_W, 2);
    gameCtx.fillStyle = "#777";
    const gOff = gndOffRef.current % 30;
    for (let x = -gOff; x < CANVAS_W; x += 30) {
      gameCtx.fillRect(x, GROUND_Y + 4, 14, 3);
    }

    for (const c of cactiRef.current) drawCactus(gameCtx, c);
    for (const p of pterosRef.current) drawPterodactyl(gameCtx, p, bugSpriteRef.current);

    // Dino
    const sprite = spriteRef.current;
    let fi: number;
    if (st === "gameover") fi = 4;
    else if (!onGroundRef.current) fi = 2;
    else if (isDuckRef.current) fi = 3;
    else fi = Math.floor(animFrameRef.current / 12) % 2 === 0 ? 0 : 1;

    if (sprite) {
      gameCtx.drawImage(sprite, fi * FRAME_W, 0, FRAME_W, FRAME_H, DINO_X, dinoYRef.current, DINO_W, DINO_H);
    } else {
      gameCtx.fillStyle = "#000080";
      gameCtx.fillRect(DINO_X, dinoYRef.current, DINO_W, DINO_H);
    }

    // Apply CSS filter to canvas element — compatible with iOS Safari (unlike ctx.filter)
    if (gameCanvasRef.current) {
      gameCanvasRef.current.style.filter = phase > 0.5
        ? "invert(1) sepia(1) saturate(5) hue-rotate(150deg) brightness(1.2)"
        : "none";
    }

    // === HUD on main canvas (above game canvas, no cyan tint) ===
    const hudC = Math.round(51 + (255 - 51) * phase);
    ctx.fillStyle = `rgb(${hudC}, ${hudC}, ${hudC})`;
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `HI ${String(hiRef.current).padStart(5, "0")}  ${String(Math.floor(gameState.getScore())).padStart(5, "0")}`,
      CANVAS_W - 8, 20,
    );
    ctx.textAlign = "left";

    if (st !== "playing") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#fff";
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      if (st === "waiting") {
        ctx.fillText("PRESS SPACE / TAP TO START", CANVAS_W / 2, CANVAS_H / 2);
      } else {
        ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 10);
        ctx.fillText("SPACE / TAP TO RETRY", CANVAS_W / 2, CANVAS_H / 2 + 10);
      }
      ctx.textAlign = "left";
    }
  }, []);

  const startGame = useCallback((ts: number) => {
    dinoYRef.current   = GROUND_Y - DINO_H;
    dinoVYRef.current  = 0;
    onGroundRef.current = true;
    isDuckRef.current  = false;
    jumpHeldRef.current  = false;
    jumpBoostRef.current = 0;
    cactiRef.current   = [];
    pterosRef.current  = [];
    cloudsRef.current  = [];
    starsRef.current   = [];
    shootingStarsRef.current = [];
    tumbleweedsRef.current = [];
    nightPhaseRef.current = 0;
    isNightRef.current = false;
    nextPhaseScoreRef.current = 1000 + Math.random() * 500;
    gameState.reset();
    speedRef.current   = BASE_SPEED;
    animFrameRef.current = 0;
    gndOffRef.current  = 0;
    startDinoBgm("", "/music/High_Noon_Sprint.mp3", BASE_SPEED, BASE_SPEED);
    spawnTsRef.current = ts;
    pteroSpawnTsRef.current = ts + 4000;
    lastTsRef.current  = -1;
    accumRef.current   = 0;
    statusRef.current  = "playing";
  }, []);

  const jump = useCallback((ts: number) => {
    if (statusRef.current !== "playing") {
      startGame(ts);
      return;
    }
    if (onGroundRef.current) {
      gameState.countInput();
      dinoVYRef.current    = JUMP_VY_INITIAL;
      onGroundRef.current  = false;
      jumpHeldRef.current  = true;
      jumpBoostRef.current = JUMP_BOOST_MAX_FRAMES;
      jumpHoldFrameRef.current = 0;
      playDinoJump();
    }
  }, [startGame]);

  const releaseJump = useCallback(() => {
    jumpHeldRef.current  = false;
    jumpBoostRef.current = 0;
  }, []);

  const setDuck = useCallback((active: boolean) => {
    if (active && !isDuckRef.current) gameState.countInput();
    isDuckRef.current = active;
  }, []);

  const updatePhysics = useCallback(() => {
    if (onGroundRef.current) return;
    if (jumpHeldRef.current) {
      jumpHoldFrameRef.current++;
      if (jumpHoldFrameRef.current >= JUMP_HOLD_THRESHOLD && jumpBoostRef.current > 0) {
        dinoVYRef.current -= JUMP_BOOST_PER_FRAME;
        jumpBoostRef.current--;
      }
    }
    dinoVYRef.current += GRAVITY;
    dinoYRef.current  += dinoVYRef.current;

    if (dinoYRef.current < 0) {
      dinoYRef.current  = 0;
      dinoVYRef.current = 0;
      jumpHeldRef.current   = false;
      jumpBoostRef.current  = 0;
      jumpHoldFrameRef.current = 0;
    }

    if (dinoYRef.current >= GROUND_Y - DINO_H) {
      dinoYRef.current  = GROUND_Y - DINO_H;
      dinoVYRef.current = 0;
      onGroundRef.current = true;
      jumpHeldRef.current   = false;
      jumpBoostRef.current  = 0;
      jumpHoldFrameRef.current = 0;
    }
  }, []);

  const updateEnvironment = useCallback(() => {
    if (gameState.getScore() >= nextPhaseScoreRef.current) {
      isNightRef.current = !isNightRef.current;
      nextPhaseScoreRef.current = gameState.getScore() + 1000 + Math.random() * 500;
    }

    const targetNight = isNightRef.current ? 1 : 0;
    nightPhaseRef.current += (targetNight - nightPhaseRef.current) * 0.02;

    if (Math.random() < 0.01 && cloudsRef.current.length < 5) {
      cloudsRef.current.push({
        x: CANVAS_W + 10,
        y: Math.random() * (GROUND_Y - 80) + 10,
        speedMultiplier: 0.1 + Math.random() * 0.15,
        width: 30 + Math.random() * 30,
        height: 8 + Math.random() * 6,
      });
    }
    cloudsRef.current = cloudsRef.current
      .map(c => ({ ...c, x: c.x - speedRef.current * c.speedMultiplier }))
      .filter(c => c.x + c.width > 0);

    if (targetNight === 0 && Math.random() < 0.003 && tumbleweedsRef.current.length < 1) {
      const size = 6 + Math.random() * 4;
      tumbleweedsRef.current.push({
        x: CANVAS_W + 20,
        y: GROUND_Y - size - 10,
        size,
        rotation: 0,
        speed: 1.1 + Math.random() * 0.4,
        vy: 0
      });
    }

    tumbleweedsRef.current = tumbleweedsRef.current
      .map(t => {
        t.x -= speedRef.current * t.speed;
        t.rotation -= 0.1 * t.speed;
        t.vy += 0.4;
        t.y += t.vy;
        if (t.y >= GROUND_Y - t.size) {
          t.y = GROUND_Y - t.size;
          t.vy = - (2 + Math.random() * 2);
        }
        return t;
      })
      .filter(t => t.x + t.size > -10);

    if (targetNight === 1) {
      if (starsRef.current.length === 0) {
        for (let i = 0; i < 25; i++) {
          starsRef.current.push({
            x: Math.random() * CANVAS_W,
            y: Math.random() * (GROUND_Y - 40),
            size: 1 + Math.random() * 1.5,
            opacity: 0.3 + Math.random() * 0.7,
          });
        }
      }

      if (Math.random() < 0.02 && starsRef.current.length < 35) {
        starsRef.current.push({
          x: CANVAS_W + 10,
          y: Math.random() * (GROUND_Y - 40),
          size: 1 + Math.random() * 1.5,
          opacity: 0.3 + Math.random() * 0.7,
        });
      }

      if (Math.random() < 0.005 && shootingStarsRef.current.length < 2) {
        shootingStarsRef.current.push({
          x: CANVAS_W + 10,
          y: Math.random() * (GROUND_Y - 80),
          length: 15 + Math.random() * 20,
          speedX: -(4 + Math.random() * 4),
          speedY: 1 + Math.random() * 2,
          opacity: 0.5 + Math.random() * 0.5,
        });
      }

      if (!moonRef.current) moonRef.current = { x: CANVAS_W + 30, y: 30 + Math.random() * 20, phase: 0 };
    }

    if (targetNight === 0 && nightPhaseRef.current < 0.01) {
      moonRef.current = null;
      starsRef.current = [];
      shootingStarsRef.current = [];
    }

    starsRef.current = starsRef.current
      .map(s => ({ ...s, x: s.x - speedRef.current * 0.02 }))
      .filter(s => s.x + 10 > 0);

    shootingStarsRef.current = shootingStarsRef.current
      .map(s => ({ ...s, x: s.x + s.speedX, y: s.y + s.speedY }))
      .filter(s => s.x + s.length > 0 && s.y - s.length < GROUND_Y);

    if (moonRef.current) {
      moonRef.current.x -= speedRef.current * 0.01;
    }
  }, []);

  const updateObstacles = useCallback((ts: number) => {
    const spawnInterval = Math.max(900, 1800 - Math.floor(gameState.getScore()) * 0.5);
    if (ts - spawnTsRef.current > spawnInterval) {
      const noPteroOnScreen = pterosRef.current.every(p => p.x < DINO_X - 80 || p.x > CANVAS_W + 50);
      if (noPteroOnScreen) {
        cactiRef.current.push({
          x: CANVAS_W + 10,
          variant: Math.floor(Math.random() * 3) as 0 | 1 | 2,
        });
        spawnTsRef.current = ts;
      }
    }

    if (gameState.getScore() > 30) {
      const pteroInterval = Math.max(3000, 6000 - Math.floor(gameState.getScore()) * 5);
      const timerReady = ts - pteroSpawnTsRef.current > pteroInterval;
      const safeFromCacti = cactiRef.current.every(c => c.x < DINO_X - 80 || c.x > CANVAS_W + 300);
      if (timerReady && safeFromCacti) {
        const yIdx = Math.floor(Math.random() * PTERO_Y_OPTIONS.length);
        pterosRef.current.push({
          x: CANVAS_W + 10,
          y: PTERO_Y_OPTIONS[yIdx],
          frame: 0,
        });
        pteroSpawnTsRef.current = ts;
      }
    }

    cactiRef.current = cactiRef.current
      .map(c => ({ ...c, x: c.x - speedRef.current }))
      .filter(c => c.x + 50 > 0);

    pterosRef.current = pterosRef.current
      .map(p => ({ ...p, x: p.x - speedRef.current, frame: p.frame + 1 }))
      .filter(p => p.x + PTERO_W + 10 > 0);
  }, []);

  const checkCollisions = useCallback((): boolean => {
    const duck = isDuckRef.current && onGroundRef.current;
    const hitX = DINO_X + 14;
    const hitY = duck ? GROUND_Y - 30 : dinoYRef.current + 10;
    const hitW = DINO_W - 28;
    const hitH = duck ? 26 : DINO_H - 18;

    for (const c of cactiRef.current) {
      const dim = CACTUS_DIMS[c.variant];
      if (
        hitX < c.x + dim.w - 8 &&
        hitX + hitW > c.x + 8   &&
        hitY < GROUND_Y         &&
        hitY + hitH > GROUND_Y - dim.h + 8
      ) {
        return true;
      }
    }

    for (const p of pterosRef.current) {
      if (
        hitX < p.x + PTERO_W - 8 &&
        hitX + hitW > p.x + 8     &&
        hitY < p.y + PTERO_H - 6  &&
        hitY + hitH > p.y + 6
      ) {
        return true;
      }
    }
    return false;
  }, []);

  const updateScore = useCallback(() => {
    const prev = Math.floor(gameState.getScore());
    gameState.addScore(speedRef.current * 0.1);
    const curr = Math.floor(gameState.getScore());
    if (curr % 500 === 0 && curr !== prev && curr > 0) playDinoPoint();
  }, []);

  const gameLoop = useCallback(function loop(ts: number) {
    if (lastTsRef.current > 0) {
      const rawDelta = ts - lastTsRef.current;
      if (rawDelta < 0 || rawDelta > 3000) {
        accumRef.current  = 0;
        lastTsRef.current = ts;
        draw();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
    }
    if (lastTsRef.current < 0) lastTsRef.current = ts;
    const delta = Math.min(ts - lastTsRef.current, 100);
    lastTsRef.current = ts;
    accumRef.current += delta;

    while (accumRef.current >= FIXED_STEP) {
      if (statusRef.current === "playing") {
        animFrameRef.current++;
        speedRef.current = Math.min(MAX_SPEED, speedRef.current + 0.0006);
        gndOffRef.current += speedRef.current;

        updatePhysics();
        updateEnvironment();
        updateObstacles(ts);

        if (checkCollisions()) {
          const finalScore = Math.floor(gameState.getScore());
          window.umami?.track("game_over", { game: "dino", score: finalScore, new_highscore: finalScore > hiRef.current });
          if (finalScore > hiRef.current && gameState.isPlausible(finalScore)) {
            hiRef.current = finalScore;
            saveHighScore(finalScore, gameState.getSessionStart());
          }
          statusRef.current = "gameover";
          stopDinoBgm();
          playDinoDie();
        } else {
          updateScore();
        }
      }
      accumRef.current -= FIXED_STEP;
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, updatePhysics, updateEnvironment, updateObstacles, checkCollisions, updateScore]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopDinoBgm();
    };
  }, [gameLoop]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!e.repeat) jump(performance.now());
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setDuck(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") releaseJump();
      if (e.code === "ArrowDown") setDuck(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [jump, releaseJump, setDuck]);


  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden" style={{ background: "#c0c0c0", userSelect: "none", padding: 8 }}>
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <div style={{ position: "relative", width: "100%", maxWidth: "460px", aspectRatio: "560/190", boxSizing: "border-box", border: "2px inset #808080" }}>
          {/* Background canvas: sky, stars, moon, clouds, tumbleweeds, HUD */}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ width: "100%", height: "100%", imageRendering: "pixelated", display: "block" }}
          />
          {/* Game canvas: dino, obstacles, ground — CSS filter applied here for iOS Safari compatibility */}
          <canvas
            ref={gameCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: "pixelated", cursor: "pointer", touchAction: "none" }}
            onPointerDown={(e) => jump(e.timeStamp)}
            onPointerUp={releaseJump}
            onPointerLeave={releaseJump}
          />
          <div
            ref={dustOverlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect x='10' y='120' width='4' height='2' fill='%23777777' fill-opacity='0.8'/%3E%3Crect x='50' y='135' width='5' height='2' fill='%23777777' fill-opacity='0.6'/%3E%3Crect x='90' y='125' width='3' height='2' fill='%23777777' fill-opacity='0.9'/%3E%3Crect x='130' y='140' width='6' height='2' fill='%23777777' fill-opacity='0.5'/%3E%3Crect x='30' y='130' width='4' height='2' fill='%23777777' fill-opacity='0.7'/%3E%3Crect x='110' y='115' width='5' height='2' fill='%23777777' fill-opacity='0.6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "contain",
              opacity: 1
            }}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-2 pb-1 shrink-0 justify-center items-center w-full px-2">
        {isTouchOrMobile && (
          <>
            <button
              className="game-pixel-btn"
              style={{ flex: 1, maxWidth: "160px", padding: "8px", background: "#1155aa", touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
              onPointerDown={(e) => { e.preventDefault(); setDuck(true); }}
              onPointerUp={(e) => { e.preventDefault(); setDuck(false); }}
              onPointerLeave={(e) => { e.preventDefault(); setDuck(false); }}
            >⬇ DUCK</button>
            <button
              className="game-pixel-btn"
              style={{ flex: 1, maxWidth: "160px", padding: "8px", background: "#cc3322", touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
              onPointerDown={(e) => { e.preventDefault(); jump(e.timeStamp); }}
              onPointerUp={(e) => { e.preventDefault(); releaseJump(); }}
              onPointerLeave={(e) => { e.preventDefault(); releaseJump(); }}
            >⬆ JUMP</button>
          </>
        )}
        <button
          className="game-pixel-btn"
          style={{ background: "#555", minWidth: "40px", padding: "8px" }}
          onClick={() => setShowHelp(true)}
        >?</button>
      </div>

      {showHelp && <DinoHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
