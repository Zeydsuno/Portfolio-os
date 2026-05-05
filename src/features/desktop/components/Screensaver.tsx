"use client";

import { useEffect, useRef } from "react";

interface ScreensaverProps {
  onDismiss: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

const COLORS = [
  "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#ffffff", "#ff8800",
  "#88ff00", "#0088ff",
];

export default function Screensaver({ onDismiss }: ScreensaverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.4),
      vy: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let animId: number;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        let bounced = false;
        if (p.x < 20) { p.x = 20; p.vx = Math.abs(p.vx); bounced = true; }
        if (p.x > w - 120) { p.x = w - 120; p.vx = -Math.abs(p.vx); bounced = true; }
        if (p.y < 16) { p.y = 16; p.vy = Math.abs(p.vy); bounced = true; }
        if (p.y > h - 16) { p.y = h - 16; p.vy = -Math.abs(p.vy); bounced = true; }
        if (bounced) p.color = COLORS[Math.floor(Math.random() * COLORS.length)];

        ctx.font = "bold 16px 'Press Start 2P', monospace";
        ctx.fillStyle = p.color;
        ctx.fillText("Zeyd-OS", p.x, p.y);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const dismiss = () => onDismiss();
    window.addEventListener("keydown", dismiss);
    window.addEventListener("mousemove", dismiss);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("mousemove", dismiss);
    };
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        cursor: "none",
        backgroundColor: "#000",
      }}
      onClick={onDismiss}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
