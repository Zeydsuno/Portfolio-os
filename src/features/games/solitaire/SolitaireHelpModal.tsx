import { useState } from "react";
import { MiniCard } from "./SolitaireGame";

interface SolitaireHelpModalProps {
  onClose: () => void;
}

export function SolitaireHelpModal({ onClose }: SolitaireHelpModalProps) {
  const [helpPage, setHelpPage] = useState(1);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
      onClick={onClose}
    >
      <div className="window" style={{ minWidth: 280, maxWidth: 320, width: "90%" }} onClick={e => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Solitaire — How to Play</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ padding: "12px 16px", fontSize: 11, lineHeight: 1.8 }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button 
              className="game-pixel-btn"
              onClick={() => setHelpPage(1)}
              style={{ 
                flex: 1, padding: "6px 2px", fontSize: "7px", letterSpacing: "0px", minWidth: 0,
                background: helpPage === 1 ? "#1155aa" : "#555",
                boxShadow: helpPage === 1 ? "inset 2px 2px 0 0 #000" : "2px 2px 0 0 #000",
                color: helpPage === 1 ? "#fff" : "#ccc",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              Tableau
            </button>
            <button 
              className="game-pixel-btn"
              onClick={() => setHelpPage(2)}
              style={{ 
                flex: 1, padding: "6px 2px", fontSize: "7px", letterSpacing: "0px", minWidth: 0,
                background: helpPage === 2 ? "#1155aa" : "#555",
                boxShadow: helpPage === 2 ? "inset 2px 2px 0 0 #000" : "2px 2px 0 0 #000",
                color: helpPage === 2 ? "#fff" : "#ccc",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              Foundation
            </button>
            <button 
              className="game-pixel-btn"
              onClick={() => setHelpPage(3)}
              style={{ 
                flex: 1, padding: "6px 2px", fontSize: "7px", letterSpacing: "0px", minWidth: 0,
                background: helpPage === 3 ? "#1155aa" : "#555",
                boxShadow: helpPage === 3 ? "inset 2px 2px 0 0 #000" : "2px 2px 0 0 #000",
                color: helpPage === 3 ? "#fff" : "#ccc",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              Controls
            </button>
          </div>

          <div style={{ minHeight: "220px" }}>
            {helpPage === 1 && (
              <>
                <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>Tableau (Bottom) — alternating colors, descending</p>
                <div style={{ display: "flex", gap: 16, margin: "0 0 10px", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <MiniCard label="Q" suit="spades" />
                    <MiniCard label="J" suit="hearts" />
                    <span style={{ fontSize: 9, color: "#006600" }}>✓ valid</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <MiniCard label="Q" suit="spades" />
                    <MiniCard label="J" suit="clubs" />
                    <span style={{ fontSize: 9, color: "#cc0000" }}>✗ same color</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <MiniCard label="Q" suit="spades" />
                    <MiniCard label="10" suit="hearts" />
                    <span style={{ fontSize: 9, color: "#cc0000" }}>✗ skip rank</span>
                  </div>
                </div>
                <ul style={{ margin: "0 0 12px", paddingLeft: 16 }}>
                  <li>Stack in descending order (K, Q, J... 2).</li>
                  <li>Must alternate colors (Red on Black).</li>
                  <li>Drag a valid face-up sequence together.</li>
                  <li>Empty column → <strong>King only</strong>.</li>
                </ul>
              </>
            )}

            {helpPage === 2 && (
              <>
                <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>Foundation (Top Right) — build A→K per suit</p>
                <div style={{ display: "flex", gap: 4, margin: "0 0 8px", alignItems: "center" }}>
                  {(["A","2","3","…","K"] as const).map((v, i) => (
                    <span key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <MiniCard label={v} suit="hearts" />
                    </span>
                  ))}
                </div>
                <ul style={{ margin: "0 0 12px", paddingLeft: 16 }}>
                  <li>4 slots, one for each suit (♠, ♥, ♣, ♦).</li>
                  <li>Empty slots must start with an <strong>Ace</strong>.</li>
                  <li>Build up in the <strong>same suit</strong> (A, 2, 3... K).</li>
                  <li><strong>Note:</strong> Cards stack completely; only the top card is visible.</li>
                </ul>
              </>
            )}

            {helpPage === 3 && (
              <>
                <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>Controls & Stock (Top Left)</p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li><strong>Double-click</strong> any card to auto-send to foundation.</li>
                  <li>Click the deck to draw a card.</li>
                  <li>Click <strong>↺</strong> to reset the empty deck.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
