"use client";
// ─── SnakeGame — Job: render UI, nothing else ────────────────────────────────
import { useRef, useState } from "react";
import DPad from "@/components/DPad";
import { CANVAS_W, CANVAS_H, GRID_W, GRID_H } from "./constants";
import { useSnakeEngine } from "./useSnakeEngine";

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const {
    score, highScore, status, popups,
    isMobileLandscape, isTouchOrMobile,
    startGame, quitToMenu,
    handleTouchStart, handleTouchMove, handleTouchEnd, handleDPad,
  } = useSnakeEngine(canvasRef);

  return (
    <div className={`flex items-center justify-center w-full h-full flex-1 min-h-0 overflow-hidden ${isMobileLandscape ? "flex-row p-1" : "flex-col p-2"}`}>
      <style>{`
        @keyframes snakeFloatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 1; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* ── Canvas area ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 min-w-0 w-full h-full" style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, margin: "auto", maxWidth: "100%", maxHeight: "100%", aspectRatio: "1/1" }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated", border: "2px inset", touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Score popups */}
          {popups.map(p => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left:  `clamp(10px, ${(p.x / GRID_W) * 100}%, calc(100% - 40px))`,
                top:   `clamp(30px, calc(${(p.y / GRID_H) * 100}% - 10px), calc(100% - 20px))`,
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

      {/* ── Controls sidebar / bottom bar ────────────────────────────────── */}
      <div className={`flex flex-col justify-center items-center shrink-0 ${isMobileLandscape ? "w-[160px] ml-2" : "w-full"}`}>
        {/* Score bar */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px", background: "#c0c0c0", border: "2px inset", marginBottom: isMobileLandscape ? 4 : 8 }}>

          {/* LCD score */}
          <div translate="no" className="notranslate" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: "6px", fontFamily: "'Press Start 2P', cursive", color: "#555" }}>SCORE</span>
            <span
              key={score}
              translate="no"
              className="notranslate"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: isMobileLandscape ? "7px" : "9px", color: "#39ff14", background: "#000", padding: "2px 4px", minWidth: "36px", textAlign: "center", border: "1px inset #808080" }}
            >
              {String(score).padStart(3, "0")}
            </span>
          </div>

          {/* Start / Retry / Playing indicator */}
          {status !== "playing" ? (
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); startGame(); }}
              className="game-pixel-btn"
              style={{ padding: "2px 6px", fontSize: "7px", fontFamily: "'Press Start 2P', cursive", fontWeight: "bold", background: "#1155aa", color: "#fff", boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.4), 1px 1px 0 #000", height: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {status === "waiting" ? "START" : "RETRY"}
            </button>
          ) : (
            <div style={{ border: "1px inset #808080", background: "#dfdfdf", padding: "2px 4px", fontSize: "6px", fontFamily: "'Press Start 2P', cursive", color: "#555", height: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              STEER
            </div>
          )}

          {/* Help button */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowHelp(true); }}
            className="game-pixel-btn"
            style={{ padding: "2px 4px", fontSize: "10px", fontWeight: "bold", background: "#c0c0c0", color: "#000", boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080, 1px 1px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px", height: "22px", fontFamily: "'Press Start 2P', cursive" }}
          >
            ?
          </button>
        </div>

        {/* D-Pad (touch devices only) */}
        {isTouchOrMobile && (
          <DPad onDirection={handleDPad} size={isMobileLandscape ? 44 : 72} gap={isMobileLandscape ? 4 : 6} />
        )}
      </div>

      {/* ── Help overlay ─────────────────────────────────────────────────── */}
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

      {/* ── Game Over dialog ──────────────────────────────────────────────── */}
      {status === "gameover" && (
        <div
          style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", zIndex: 50, pointerEvents: "all" }}
          onPointerDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
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
                    Score: <strong key={score} translate="no" className="notranslate">{score}</strong>
                  </p>
                  <p style={{ margin: 0, color: highScore > 0 && score >= highScore ? "green" : undefined }}>
                    Best: <strong key={highScore} translate="no" className="notranslate">{highScore}</strong>
                    <span key={`trophy-${highScore}`} translate="no" className="notranslate">{highScore > 0 && score >= highScore && " 🏆"}</span>
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="game-pixel-btn" style={{ background: "#2a6e2a" }} onPointerDown={quitToMenu}>
                  Play Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
