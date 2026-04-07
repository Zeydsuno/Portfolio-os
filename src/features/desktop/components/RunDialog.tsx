"use client";

import { useState } from "react";

interface RunDialogProps {
  onClose: () => void;
}

export default function RunDialog({ onClose }: RunDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleOk = () => {
    if (value.trim() === "") return;
    setError(true);
  };

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="window" style={{ width: 340 }}>
          <div className="title-bar">
            <div className="title-bar-text">Run</div>
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={onClose} />
            </div>
          </div>
          <div className="window-body" style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ fontSize: "28px" }}>⚠️</div>
              <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", lineHeight: 2 }}>
                Cannot find &apos;{value}&apos;. Make sure you<br />
                typed the name correctly, and then<br />
                try again.
              </p>
            </div>
            <div className="field-row" style={{ justifyContent: "flex-end" }}>
              <button
                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", minWidth: "60px" }}
                onClick={onClose}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="window" style={{ width: 360 }}>
        <div className="title-bar">
          <div className="title-bar-text">Run</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ padding: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "32px", lineHeight: 1 }}>🏃</div>
            <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", lineHeight: 2 }}>
              Type the name of a program, folder,<br />
              document, or Internet resource, and<br />
              Windows will open it for you.
            </p>
          </div>

          <div className="field-row-stacked" style={{ marginBottom: "16px" }}>
            <label
              htmlFor="run-open"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px" }}
            >
              Open:
            </label>
            <input
              id="run-open"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleOk(); }}
              autoFocus
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px" }}
            />
          </div>

          <div className="field-row" style={{ justifyContent: "flex-end", gap: "8px" }}>
            <button
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", minWidth: "60px" }}
              onClick={handleOk}
            >
              OK
            </button>
            <button
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", minWidth: "60px" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", minWidth: "70px" }}
            >
              Browse...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
