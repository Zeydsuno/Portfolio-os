"use client";

import { useState } from "react";

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
  const [pressed, setPressed] = useState<DPadDirection | null>(null);

  function btnStyle(d: DPadDirection) {
    const isPressed = pressed === d;
    return {
      width: size,
      height: size,
      fontSize: size * 0.38,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      userSelect: "none" as const,
      touchAction: "none" as const,
      background: "#c0c0c0",
      border: "2px solid",
      borderColor: isPressed
        ? "#808080 #ffffff #ffffff #808080"
        : "#ffffff #808080 #808080 #ffffff",
      paddingTop: isPressed ? 2 : 0,
      paddingLeft: isPressed ? 2 : 0,
    };
  }

  function handleDown(d: DPadDirection) {
    setPressed(d);
    onDirection(d);
  }

  function handleUp() {
    setPressed(null);
  }

  return (
    <div
      className="grid md:hidden"
      style={{ gridTemplateColumns: `repeat(3, ${size}px)`, gap, marginTop: 16 }}
    >
      <div />
      <button style={btnStyle("UP")} onPointerDown={() => handleDown("UP")} onPointerUp={handleUp} onPointerLeave={handleUp}>{ICONS.UP}</button>
      <div />
      <button style={btnStyle("LEFT")} onPointerDown={() => handleDown("LEFT")} onPointerUp={handleUp} onPointerLeave={handleUp}>{ICONS.LEFT}</button>
      <button style={btnStyle("DOWN")} onPointerDown={() => handleDown("DOWN")} onPointerUp={handleUp} onPointerLeave={handleUp}>{ICONS.DOWN}</button>
      <button style={btnStyle("RIGHT")} onPointerDown={() => handleDown("RIGHT")} onPointerUp={handleUp} onPointerLeave={handleUp}>{ICONS.RIGHT}</button>
    </div>
  );
}
