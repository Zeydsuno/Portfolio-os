interface DinoHelpModalProps {
  onClose: () => void;
}

export function DinoHelpModal({ onClose }: DinoHelpModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
      onClick={onClose}
    >
      <div className="window" style={{ minWidth: 260, maxWidth: 310 }} onClick={e => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Dino — How to Play</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
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
  );
}
