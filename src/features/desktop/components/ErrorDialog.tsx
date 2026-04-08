"use client";

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="window"
        style={{ width: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title-bar">
          <div className="title-bar-text" style={{ fontSize: "9px" }}>
            Error
          </div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ padding: "16px 12px 12px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
            {/* Win98 stop icon */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#cc0000",
                border: "3px solid #800000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#fff",
                fontFamily: "serif",
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              ✕
            </div>
            <p style={{ ...FONT, fontSize: "8px", lineHeight: 1.8, margin: 0 }}>
              {message}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              style={{ ...FONT, fontSize: "8px", minWidth: "64px" }}
              onClick={onClose}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
