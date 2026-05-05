"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playDinoJump, playDinoDie, playDinoPoint } from "@/features/desktop/utils/sounds";

const CANVAS_W = 560;
const CANVAS_H = 190;
const GROUND_Y = 150;

const DINO_X = 60;
const DINO_W = 52;
const DINO_H = 64;
const FRAME_W = 928;
const FRAME_H = 928;

const GRAVITY = 0.35;
// Variable jump: tap = small hop, hold = full jump
// BOOST must be > GRAVITY so holding actually cancels the fall and extends rise
const JUMP_VY_INITIAL      = -6.5; // tap → ~60px peak, clears small cactus with room
const JUMP_BOOST_PER_FRAME = 0.55; // > GRAVITY(0.35) → net -0.2/frame upward
const JUMP_BOOST_MAX_FRAMES = 8;   // boost frames once hold threshold reached
const JUMP_HOLD_THRESHOLD  = 8;   // must hold ~133ms before boost activates
const BASE_SPEED = 3;
const MAX_SPEED = 9;

type Status = "waiting" | "playing" | "gameover";

interface Cactus {
  x: number;
  variant: 0 | 1 | 2;
}

interface Pterodactyl {
  x: number;
  y: number; // absolute canvas Y of top of pterodactyl
  frame: number; // wing animation frame
}

const PTERO_W = 40;
const PTERO_H = 24;
// Heights pterodactyl can fly at (canvas Y of top)
const PTERO_Y_OPTIONS = [
  GROUND_Y - 90, // high — need to duck
  GROUND_Y - 60, // mid  — need to duck
];

const CACTUS_DIMS: { w: number; h: number }[] = [
  { w: 22, h: 40 },
  { w: 22, h: 60 },
  { w: 40, h: 42 },
];

function drawPterodactyl(
  ctx: CanvasRenderingContext2D,
  p: Pterodactyl,
  bugSprite: HTMLImageElement | null,
) {
  const x = p.x;
  const y = p.y;
  // Bug sprite: 2912×1440 total, 2 frames side-by-side → each frame 1456×1440
  const BUG_FRAME_W = 1456;
  const BUG_FRAME_H = 1440;
  const wingUp = Math.floor(p.frame / 6) % 2 === 0;
  const fi = wingUp ? 0 : 1;
  if (bugSprite) {
    // The bug sprite is ~1:1 aspect ratio, so draw it 48x48
    // offset x and y so it matches the original PTERO hitbox (40x24)
    ctx.drawImage(
      bugSprite,
      fi * BUG_FRAME_W, 0, BUG_FRAME_W, BUG_FRAME_H,
      x - 4, y - 12, 48, 48,
    );
  } else {
    // Fallback canvas shapes
    ctx.fillStyle = "#555";
    ctx.fillRect(x + 12, y + 8, 16, 8);
    ctx.fillRect(x + 26, y + 6, 10, 6);
    ctx.fillRect(x + 36, y + 7, 6, 3);
    ctx.fillStyle = "#0f0";
    ctx.fillRect(x + 30, y + 7, 4, 4);
    ctx.fillStyle = "#555";
    if (wingUp) {
      ctx.fillRect(x + 4,  y,      8, 6);
      ctx.fillRect(x + 24, y,      8, 6);
    } else {
      ctx.fillRect(x + 4,  y + 12, 8, 6);
      ctx.fillRect(x + 24, y + 12, 8, 6);
    }
    ctx.fillRect(x + 8, y + 8, 6, 4);
    ctx.fillRect(x + 6, y + 6, 4, 4);
  }
}

function drawCactus(ctx: CanvasRenderingContext2D, c: Cactus) {
  ctx.fillStyle = "#2d6b1a";
  const x = c.x;
  if (c.variant === 0) {
    ctx.fillRect(x + 7, GROUND_Y - 40, 8, 40);
    ctx.fillRect(x,      GROUND_Y - 30, 7, 6);
    ctx.fillRect(x,      GROUND_Y - 36, 4, 6);
    ctx.fillRect(x + 15, GROUND_Y - 28, 7, 6);
    ctx.fillRect(x + 18, GROUND_Y - 34, 4, 6);
  } else if (c.variant === 1) {
    ctx.fillRect(x + 7, GROUND_Y - 60, 8, 60);
    ctx.fillRect(x,      GROUND_Y - 44, 7, 6);
    ctx.fillRect(x,      GROUND_Y - 52, 4, 8);
    ctx.fillRect(x + 15, GROUND_Y - 40, 7, 6);
    ctx.fillRect(x + 18, GROUND_Y - 48, 4, 8);
  } else {
    ctx.fillRect(x + 5,  GROUND_Y - 38, 8, 38);
    ctx.fillRect(x,      GROUND_Y - 26, 5, 5);
    ctx.fillRect(x,      GROUND_Y - 32, 4, 6);
    ctx.fillRect(x + 22, GROUND_Y - 42, 8, 42);
    ctx.fillRect(x + 30, GROUND_Y - 26, 8, 5);
    ctx.fillRect(x + 33, GROUND_Y - 32, 5, 6);
  }
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const statusRef   = useRef<Status>("waiting");
  const dinoYRef    = useRef(GROUND_Y - DINO_H);
  const dinoVYRef   = useRef(0);
  const onGroundRef = useRef(true);
  const isDuckRef       = useRef(false);
  const jumpHeldRef     = useRef(false);  // is jump button currently held
  const jumpBoostRef    = useRef(0);      // boost frames remaining
  const jumpHoldFrameRef = useRef(0);     // frames held so far (for threshold)
  const cactiRef        = useRef<Cactus[]>([]);
  const pterosRef       = useRef<Pterodactyl[]>([]);
  const scoreRef        = useRef(0);
  const hiRef           = useRef(
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("dino_high_score") ?? "0", 10)
      : 0
  );
  const speedRef        = useRef(BASE_SPEED);
  const animFrameRef    = useRef(0);
  const gndOffRef       = useRef(0);
  const spawnTsRef      = useRef(0);
  const pteroSpawnTsRef = useRef(0);
  const rafRef          = useRef(0);
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

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const st = statusRef.current;

    ctx.fillStyle = "#d0e8c8";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Ground
    ctx.fillStyle = "#555";
    ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);
    ctx.fillStyle = "#777";
    const gOff = gndOffRef.current % 30;
    for (let x = -gOff; x < CANVAS_W; x += 30) {
      ctx.fillRect(x, GROUND_Y + 4, 14, 3);
    }

    // Cacti
    for (const c of cactiRef.current) drawCactus(ctx, c);

    // Pterodactyls
    for (const p of pterosRef.current) drawPterodactyl(ctx, p, bugSpriteRef.current);

    // Dino sprite
    const sprite = spriteRef.current;
    let fi: number;
    if (st === "gameover") fi = 4;
    else if (!onGroundRef.current) fi = 2;
    else if (isDuckRef.current) fi = 3;
    else fi = Math.floor(animFrameRef.current / 12) % 2 === 0 ? 0 : 1;

    if (sprite) {
      ctx.drawImage(sprite, fi * FRAME_W, 0, FRAME_W, FRAME_H, DINO_X, dinoYRef.current, DINO_W, DINO_H);
    } else {
      ctx.fillStyle = "#000080";
      ctx.fillRect(DINO_X, dinoYRef.current, DINO_W, DINO_H);
    }

    // HUD
    ctx.fillStyle = "#333";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `HI ${String(hiRef.current).padStart(5, "0")}  ${String(Math.floor(scoreRef.current)).padStart(5, "0")}`,
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
    scoreRef.current   = 0;
    speedRef.current   = BASE_SPEED;
    animFrameRef.current = 0;
    gndOffRef.current  = 0;
    spawnTsRef.current = ts;
    pteroSpawnTsRef.current = ts + 4000; // first ptero after 4s
    statusRef.current  = "playing";
  }, []);

  // Called on press-down: start a jump with small initial velocity
  const jump = useCallback((ts: number) => {
    if (statusRef.current !== "playing") {
      startGame(ts);
      return;
    }
    if (onGroundRef.current) {
      dinoVYRef.current    = JUMP_VY_INITIAL;
      onGroundRef.current  = false;
      jumpHeldRef.current  = true;
      jumpBoostRef.current = JUMP_BOOST_MAX_FRAMES;
      jumpHoldFrameRef.current = 0;
      playDinoJump();
    }
  }, [startGame]);

  // Called on release: stop boosting
  const releaseJump = useCallback(() => {
    jumpHeldRef.current  = false;
    jumpBoostRef.current = 0;
  }, []);

  const setDuck = useCallback((active: boolean) => {
    isDuckRef.current = active;
  }, []);

  const gameLoop = useCallback(function loop(ts: number) {
    if (statusRef.current === "playing") {
      animFrameRef.current++;
      speedRef.current = Math.min(MAX_SPEED, speedRef.current + 0.001);
      gndOffRef.current += speedRef.current;

      // Physics
      if (!onGroundRef.current) {
        // Count how long jump is held; boost only activates after threshold
        if (jumpHeldRef.current) {
          jumpHoldFrameRef.current++;
          if (jumpHoldFrameRef.current >= JUMP_HOLD_THRESHOLD && jumpBoostRef.current > 0) {
            dinoVYRef.current -= JUMP_BOOST_PER_FRAME;
            jumpBoostRef.current--;
          }
        }
        dinoVYRef.current += GRAVITY;
        dinoYRef.current  += dinoVYRef.current;
        // Ceiling clamp — don't let dino exit top of canvas
        if (dinoYRef.current < 0) {
          dinoYRef.current  = 0;
          dinoVYRef.current = 0;
          jumpHeldRef.current   = false;
          jumpBoostRef.current  = 0;
          jumpHoldFrameRef.current = 0;
        }
        // Ground landing
        if (dinoYRef.current >= GROUND_Y - DINO_H) {
          dinoYRef.current  = GROUND_Y - DINO_H;
          dinoVYRef.current = 0;
          onGroundRef.current = true;
          jumpHeldRef.current   = false;
          jumpBoostRef.current  = 0;
          jumpHoldFrameRef.current = 0;
        }
      }

      // Spawn cactus — skip if a ptero is actively on screen
      const spawnInterval = Math.max(900, 1800 - Math.floor(scoreRef.current) * 0.5);
      if (ts - spawnTsRef.current > spawnInterval) {
        const noPteroOnScreen = pterosRef.current.every(
          p => p.x < DINO_X - 80 || p.x > CANVAS_W + 50,
        );
        if (noPteroOnScreen) {
          cactiRef.current.push({
            x: CANVAS_W + 10,
            variant: Math.floor(Math.random() * 3) as 0 | 1 | 2,
          });
          spawnTsRef.current = ts;
        }
      }

      // Spawn pterodactyl (only after score > 30)
      // Require 300px clearance from any cactus — prevents them traveling
      // together at the same speed and arriving on screen simultaneously.
      if (scoreRef.current > 30) {
        const pteroInterval = Math.max(3000, 6000 - Math.floor(scoreRef.current) * 5);
        const timerReady = ts - pteroSpawnTsRef.current > pteroInterval;
        const safeFromCacti = cactiRef.current.every(
          c => c.x < DINO_X - 80 || c.x > CANVAS_W + 300,
        );
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

      // Move & cull cacti
      cactiRef.current = cactiRef.current
        .map(c => ({ ...c, x: c.x - speedRef.current }))
        .filter(c => c.x + 50 > 0);

      // Move & cull pterodactyls
      pterosRef.current = pterosRef.current
        .map(p => ({ ...p, x: p.x - speedRef.current, frame: p.frame + 1 }))
        .filter(p => p.x + PTERO_W + 10 > 0);

      // Collision — inset hitbox for fairness
      const duck = isDuckRef.current && onGroundRef.current;
      const hitX = DINO_X + 10;
      const hitY = duck ? GROUND_Y - 32 : dinoYRef.current + 8;
      const hitW = DINO_W - 18;
      const hitH = duck ? 30 : DINO_H - 12;

      for (const c of cactiRef.current) {
        const dim = CACTUS_DIMS[c.variant];
        if (
          hitX < c.x + dim.w - 4 &&
          hitX + hitW > c.x + 4   &&
          hitY < GROUND_Y         &&
          hitY + hitH > GROUND_Y - dim.h + 2
        ) {
          window.umami?.track("game_over", { game: "dino", score: Math.floor(scoreRef.current), new_highscore: scoreRef.current > hiRef.current });
          if (scoreRef.current > hiRef.current) { hiRef.current = Math.floor(scoreRef.current); localStorage.setItem("dino_high_score", String(hiRef.current)); }
          statusRef.current = "gameover";
          playDinoDie();
          break;
        }
      }

      // Pterodactyl collision
      for (const p of pterosRef.current) {
        if (
          hitX < p.x + PTERO_W - 4 &&
          hitX + hitW > p.x + 4     &&
          hitY < p.y + PTERO_H - 4  &&
          hitY + hitH > p.y + 4
        ) {
          window.umami?.track("game_over", { game: "dino", score: Math.floor(scoreRef.current), new_highscore: scoreRef.current > hiRef.current });
          if (scoreRef.current > hiRef.current) { hiRef.current = Math.floor(scoreRef.current); localStorage.setItem("dino_high_score", String(hiRef.current)); }
          statusRef.current = "gameover";
          playDinoDie();
          break;
        }
      }

      scoreRef.current += speedRef.current * 0.1;
      // Milestone blip every 500 points
      const prevScore = Math.floor(scoreRef.current - speedRef.current * 0.1);
      if (Math.floor(scoreRef.current) % 500 === 0 && Math.floor(scoreRef.current) !== prevScore && Math.floor(scoreRef.current) > 0) {
        playDinoPoint();
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!e.repeat) jump(performance.now()); // ignore key-repeat events
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

  const btnStyle: React.CSSProperties = {
    padding: "10px 20px",
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 9,
    background: "#c0c0c0",
    border: "2px solid",
    borderColor: "#fff #808080 #808080 #fff",
    cursor: "pointer",
    userSelect: "none",
    touchAction: "none",
  };

  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden" style={{ background: "#c0c0c0", userSelect: "none", padding: 8 }}>
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <div style={{ position: "relative", height: "100%", maxWidth: "100%", maxHeight: "100%", aspectRatio: "600/150" }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ width: "100%", height: "100%", imageRendering: "pixelated", border: "2px inset #808080", cursor: "pointer", display: "block", touchAction: "none" }}
            onPointerDown={(e) => jump(e.timeStamp)}
            onPointerUp={releaseJump}
            onPointerLeave={releaseJump}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-3 shrink-0 justify-center">
        <button
          className="flex md:hidden"
          style={btnStyle}
          onPointerDown={() => setDuck(true)}
          onPointerUp={() => setDuck(false)}
          onPointerLeave={() => setDuck(false)}
        >⬇ DUCK</button>
        <button
          className="flex md:hidden"
          style={btnStyle}
          onPointerDown={(e) => jump(e.timeStamp)}
          onPointerUp={releaseJump}
          onPointerLeave={releaseJump}
        >⬆ JUMP</button>
        <button
          style={{ ...btnStyle, padding: "10px 14px" }}
          onClick={() => setShowHelp(true)}
        >?</button>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
          onClick={() => setShowHelp(false)}
        >
          <div className="window" style={{ minWidth: 260, maxWidth: 310 }} onClick={e => e.stopPropagation()}>
            <div className="title-bar">
              <div className="title-bar-text">Dino — How to Play</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setShowHelp(false)} />
              </div>
            </div>
            <div className="window-body" style={{ padding: "12px 16px", fontSize: 11, lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Controls</p>
              <div style={{ display: "flex", gap: 16, margin: "0 0 12px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ border: "2px solid #808080", background: "#c0c0c0", padding: "2px 8px", borderRadius: 2, fontSize: 9, boxShadow: "1px 1px 0 #fff inset" }}>SPACE</div>
                    <div style={{ fontSize: 9, color: "#555" }}>Jump</div>
                    <div style={{ fontSize: 9, color: "#555" }}>Hold = higher</div>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ border: "2px solid #808080", background: "#c0c0c0", width: 26, height: 26, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, boxShadow: "1px 1px 0 #fff inset" }}>▼</div>
                    <div style={{ fontSize: 9, color: "#555" }}>Duck</div>
                  </div>
                </div>
                <div style={{ textAlign: "center", fontSize: 9, color: "#555", paddingTop: 2 }}>
                  <div>Mobile:</div>
                  <div>tap = jump</div>
                  <div>DUCK button</div>
                </div>
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Obstacles</p>
              <div style={{ display: "flex", gap: 12, margin: "0 0 4px", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>🌵</span>
                <span>Cactus — <strong>jump over</strong></span>
              </div>
              <div style={{ display: "flex", gap: 12, margin: "0 0 10px", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>🐛</span>
                <span>Flying bug — <strong>jump or duck</strong></span>
              </div>
              <p style={{ margin: 0 }}>• Every 500 pts the game speeds up</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
