"use client";

import { useEffect, useState } from "react";

export type DPadDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface DPadProps {
  onDirection: (d: DPadDirection) => void;
  size?: number;
  gap?: number;
}

const ICONS: Record<DPadDirection, string> = {
  UP: "⬆︎",
  DOWN: "⬇︎",
  LEFT: "⬅︎",
  RIGHT: "➡︎",
};

export default function DPad({ onDirection, size = 72, gap = 6 }: DPadProps) {
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

  const btnStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: size * 0.38,
    padding: 0,
    background: "#2a2a3a",
  };

  if (!isTouchOrMobile) return null;

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(3, ${size}px)`, gap, marginTop: 16 }}
    >
      <div />
      <button className="game-pixel-btn" style={btnStyle} onPointerDown={() => onDirection("UP")}>{ICONS.UP}</button>
      <div />
      <button className="game-pixel-btn" style={btnStyle} onPointerDown={() => onDirection("LEFT")}>{ICONS.LEFT}</button>
      <button className="game-pixel-btn" style={btnStyle} onPointerDown={() => onDirection("DOWN")}>{ICONS.DOWN}</button>
      <button className="game-pixel-btn" style={btnStyle} onPointerDown={() => onDirection("RIGHT")}>{ICONS.RIGHT}</button>
    </div>
  );
}
