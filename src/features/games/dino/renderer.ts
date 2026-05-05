import { Cactus, Cloud, Pterodactyl, Star, ShootingStar, Tumbleweed } from "./types";
import { GROUND_Y } from "./constants";

export function drawPterodactyl(
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

export function drawCactus(ctx: CanvasRenderingContext2D, c: Cactus) {
  ctx.fillStyle = "#2d6b1a";
  const x = c.x;
  if (c.variant === 0) {
    ctx.fillRect(x + 7, GROUND_Y - 40, 8, 40);
    ctx.fillRect(x,      GROUND_Y - 30, 7, 6);
    ctx.fillRect(x,      GROUND_Y - 36, 4, 6);
    ctx.fillRect(x + 15, GROUND_Y - 28, 7, 6);
    ctx.fillRect(x + 18, GROUND_Y - 34, 4, 6);
  } else if (c.variant === 1) {
    // 48px tall cactus
    ctx.fillRect(x + 7, GROUND_Y - 48, 8, 48);
    ctx.fillRect(x,      GROUND_Y - 36, 7, 6);
    ctx.fillRect(x,      GROUND_Y - 42, 4, 8);
    ctx.fillRect(x + 15, GROUND_Y - 32, 7, 6);
    ctx.fillRect(x + 18, GROUND_Y - 40, 4, 8);
  } else {
    ctx.fillRect(x + 5,  GROUND_Y - 38, 8, 38);
    ctx.fillRect(x,      GROUND_Y - 26, 5, 5);
    ctx.fillRect(x,      GROUND_Y - 32, 4, 6);
    ctx.fillRect(x + 22, GROUND_Y - 42, 8, 42);
    ctx.fillRect(x + 30, GROUND_Y - 26, 8, 5);
    ctx.fillRect(x + 33, GROUND_Y - 32, 5, 6);
  }
}

export function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud, nightPhase: number) {
  const alpha = 0.8 - nightPhase * 0.4;
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.fillRect(c.x, c.y, c.width, c.height);
  ctx.fillRect(c.x + c.width * 0.1, c.y - c.height * 0.5, c.width * 0.8, c.height * 0.5);
  ctx.fillRect(c.x + c.width * 0.2, c.y - c.height, c.width * 0.5, c.height * 0.5);
}

export function drawStar(ctx: CanvasRenderingContext2D, s: Star, nightPhase: number) {
  if (nightPhase < 0.1) return;
  ctx.fillStyle = `rgba(255, 240, 100, ${s.opacity * nightPhase})`; // Yellow stars
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
  ctx.fill();
}

export function drawMoon(ctx: CanvasRenderingContext2D, moon: {x: number, y: number}, nightPhase: number) {
  if (nightPhase < 0.1) return;
  ctx.save();
  ctx.globalAlpha = nightPhase;
  // Glowing yellow moon
  ctx.fillStyle = "#ffeb3b";
  ctx.shadowColor = "#ffeb3b";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // Moon crater details
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath(); ctx.arc(moon.x - 4, moon.y - 6, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(moon.x + 6, moon.y + 2, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(moon.x - 2, moon.y + 8, 2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}


export function drawShootingStar(ctx: CanvasRenderingContext2D, s: ShootingStar, nightPhase: number) {
  if (nightPhase <= 0) return;
  ctx.save();
  ctx.globalAlpha = nightPhase * s.opacity;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  // Trail length logic
  const dx = s.speedX !== 0 ? s.speedX / Math.abs(s.speedX) : -1;
  const dy = s.speedY !== 0 ? s.speedY / Math.abs(s.speedY) : 1;
  ctx.lineTo(s.x - s.length * dx, s.y - s.length * dy);
  ctx.stroke();
  ctx.restore();
}

let cachedTumbleweedCanvas: HTMLCanvasElement | null = null;

function getTumbleweedCanvas(): HTMLCanvasElement {
  if (cachedTumbleweedCanvas) return cachedTumbleweedCanvas;
  
  const canvas = document.createElement("canvas");
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  
  const map = [
    "  12213   ",
    " 2311221  ",
    " 11321131 ",
    "3211132121",
    "2132211132",
    "1211321211",
    " 31211321 ",
    "  132113  ",
    "   2131   ",
    "          "
  ];
  
  const colors: Record<string, string> = {
    "1": "#a87850",
    "2": "#8a5c38",
    "3": "#5e3a18"
  };

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char !== " ") {
        ctx.fillStyle = colors[char];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  
  cachedTumbleweedCanvas = canvas;
  return canvas;
}

export function drawTumbleweed(ctx: CanvasRenderingContext2D, t: Tumbleweed) {
  ctx.save();
  // Center of tumbleweed
  ctx.translate(t.x + t.size / 2, t.y + t.size / 2);
  
  // Snap rotation to 90-degree increments for retro pixel feel!
  const angle = Math.floor(t.rotation / (Math.PI / 2)) * (Math.PI / 2);
  ctx.rotate(angle);
  
  // Size of each "pixel" based on the tumbleweed size
  const pSize = Math.max(1, Math.floor(t.size / 10)); 
  
  // Fetch pre-rendered canvas (created only once)
  const twCanvas = getTumbleweedCanvas();
  
  // Ensure crisp pixel scaling
  ctx.imageSmoothingEnabled = false;
  
  // Draw the 10x10 pre-rendered canvas scaled up
  ctx.drawImage(twCanvas, 0, 0, 10, 10, -5 * pSize, -5 * pSize, 10 * pSize, 10 * pSize);

  ctx.restore();
}
