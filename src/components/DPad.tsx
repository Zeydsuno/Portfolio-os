"use client";

import { CSSProperties } from "react";

export type DPadDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface DPadProps {
  onDirection: (d: DPadDirection) => void;
  size?: number;
  gap?: number;
}

const ICONS: Record<DPadDirection, string> = {
  UP: "⬆",
  DOWN: "⬇",
  LEFT: "⬅",
  RIGHT: "➡",
};

export default function DPad({ onDirection, size = 64, gap = 8 }: DPadProps) {
  const btn: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    touchAction: "none",
  };

  return (
    <div
      className="grid md:hidden"
      style={{ gridTemplateColumns: `repeat(3, ${size}px)`, gap, marginTop: 12 }}
    >
      <div />
      <button style={btn} onPointerDown={() => onDirection("UP")}>{ICONS.UP}</button>
      <div />
      <button style={btn} onPointerDown={() => onDirection("LEFT")}>{ICONS.LEFT}</button>
      <button style={btn} onPointerDown={() => onDirection("DOWN")}>{ICONS.DOWN}</button>
      <button style={btn} onPointerDown={() => onDirection("RIGHT")}>{ICONS.RIGHT}</button>
    </div>
  );
}
