"use client";

import { useState } from "react";

type ShutdownOption = "shutdown" | "restart" | "msdos";

interface ShutdownDialogProps {
  onClose: () => void;
  onBSOD?: () => void;
}

export default function ShutdownDialog({ onClose, onBSOD }: ShutdownDialogProps) {
  const [selected, setSelected] = useState<ShutdownOption>("shutdown");
  const [turningOff, setTurningOff] = useState(false);

  const handleOk = () => {
    window.umami?.track("shutdown_confirm", { option: selected });
    if (selected === "shutdown") {
      setTurningOff(true);
      setTimeout(() => window.location.reload(), 2500);
    } else if (selected === "restart") {
      setTurningOff(true);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      onClose();
      onBSOD?.();
    }
  };

  if (turningOff) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "10px",
            color: "#fff",
            textAlign: "center",
            lineHeight: 2,
          }}
        >
          {selected === "restart"
            ? "Windows is restarting..."
            : "It is now safe to turn off\nyour computer."}
        </p>
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
      <div className="window" style={{ width: 380 }}>
        <div className="title-bar">
          <div className="title-bar-text">Shut Down Windows</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ padding: "16px" }}>
          {/* Top row: icon + question */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "40px", lineHeight: 1 }}>💻</div>
            <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", lineHeight: 1.8 }}>
              What do you want the<br />computer to do?
            </p>
          </div>

          {/* Options */}
          <div style={{ paddingLeft: "8px", marginBottom: "20px" }}>
            {(
              [
                { value: "shutdown", label: "Shut down" },
                { value: "restart", label: "Restart" },
                { value: "msdos", label: "Restart in MS-DOS mode" },
              ] as { value: ShutdownOption; label: string }[]
            ).map((opt) => (
              <div
                key={opt.value}
                className="field-row"
                style={{ marginBottom: "8px", cursor: "pointer" }}
                onClick={() => setSelected(opt.value)}
              >
                <input
                  type="radio"
                  id={`sd-${opt.value}`}
                  name="shutdown"
                  checked={selected === opt.value}
                  onChange={() => setSelected(opt.value)}
                />
                <label
                  htmlFor={`sd-${opt.value}`}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "9px",
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>

          {/* Buttons */}
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
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", minWidth: "60px" }}
            >
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
