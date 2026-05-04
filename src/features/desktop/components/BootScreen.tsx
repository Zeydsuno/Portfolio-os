"use client";

import { useEffect, useState } from "react";

type Phase = "booting" | "fading" | "done";

interface BootScreenProps {
  onComplete: () => void;
}

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  imageRendering: "pixelated",
};

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<Phase>("booting");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fading"), 2800);
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 0.7s ease",
      }}
    >
      {/* OS logo */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div
          style={{
            ...TEXT_STYLE,
            fontSize: "32px",
            letterSpacing: "2px",
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: "#fff" }}>Zeyd</span>
          <span
            style={{
              background: "linear-gradient(135deg, #ff6600 0%, #ffcc00 50%, #ff6600 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            OS
          </span>
        </div>
        <div
          style={{
            ...TEXT_STYLE,
            fontSize: "7px",
            color: "#808080",
            letterSpacing: "5px",
            marginTop: "10px",
          }}
        >
          Second Edition
        </div>
      </div>

      {/* Scrolling loading bar — authentic Win98 style */}
      <div
        style={{
          width: "320px",
          height: "14px",
          border: "1px solid #404040",
          backgroundColor: "#000",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="boot-scroll-bar" />
      </div>

      {/* Copyright line */}
      <div
        style={{
          ...TEXT_STYLE,
          fontSize: "7px",
          color: "#404040",
          marginTop: "48px",
          letterSpacing: "1px",
        }}
      >
        © 2025 Zeyd-OS
      </div>
    </div>
  );
}
