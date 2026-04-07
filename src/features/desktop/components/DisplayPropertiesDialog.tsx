"use client";

import { useState } from "react";
import { useDesktopStore } from "../store/desktop-store";

interface DisplayPropertiesDialogProps {
  onClose: () => void;
}

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

const WALLPAPER_COLORS: Array<{ label: string; color: string }> = [
  { label: "Teal",        color: "#008080" },
  { label: "Navy",        color: "#000080" },
  { label: "Olive",       color: "#808000" },
  { label: "Purple",      color: "#800080" },
  { label: "Forest",      color: "#006400" },
  { label: "Wine",        color: "#800000" },
  { label: "Steel",       color: "#4682b4" },
  { label: "Slate",       color: "#2f4f4f" },
  { label: "Charcoal",    color: "#333333" },
  { label: "Black",       color: "#000000" },
  { label: "Midnight",    color: "#191970" },
  { label: "Deep Space",  color: "#0d0d1a" },
];

export default function DisplayPropertiesDialog({ onClose }: DisplayPropertiesDialogProps) {
  const { wallpaperColor, setWallpaperColor } = useDesktopStore();
  const [selected, setSelected] = useState(wallpaperColor);
  const [activeTab, setActiveTab] = useState<"background" | "appearance">("background");

  const handleApply = () => setWallpaperColor(selected);
  const handleOk = () => { setWallpaperColor(selected); onClose(); };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="window" style={{ width: 420 }}>
        <div className="title-bar">
          <div className="title-bar-text">Display Properties</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>

        <div className="window-body" style={{ padding: "8px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #808080", marginBottom: "8px" }}>
            {(["background", "appearance"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...FONT,
                  fontSize: "8px",
                  padding: "4px 12px",
                  border: "2px solid",
                  borderColor: activeTab === tab
                    ? "#fff #808080 #c0c0c0 #fff"
                    : "#808080 #fff #808080 #808080",
                  borderBottom: activeTab === tab ? "2px solid #c0c0c0" : "2px solid #808080",
                  marginBottom: activeTab === tab ? "-2px" : "0",
                  background: "#c0c0c0",
                  zIndex: activeTab === tab ? 1 : 0,
                  position: "relative",
                  cursor: "default",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "background" && (
            <div style={{ padding: "8px" }}>
              {/* Preview monitor */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{ position: "relative", width: 180, height: 120 }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#c0c0c0",
                      border: "3px solid #808080",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "80%",
                        height: "80%",
                        backgroundColor: selected,
                        border: "1px solid #000",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 60,
                      height: 8,
                      backgroundColor: "#c0c0c0",
                      border: "1px solid #808080",
                    }}
                  />
                </div>
              </div>

              {/* Color label */}
              <p style={{ ...FONT, fontSize: "8px", marginBottom: "8px" }}>
                Wallpaper Color:&nbsp;
                <span style={{ color: "#000080" }}>
                  {WALLPAPER_COLORS.find((c) => c.color === selected)?.label ?? "Custom"}
                </span>
              </p>

              {/* Color grid */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                {WALLPAPER_COLORS.map(({ label, color }) => (
                  <div
                    key={color}
                    title={label}
                    onClick={() => setSelected(color)}
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: color,
                      border: selected === color
                        ? "3px solid #fff"
                        : "2px solid #808080",
                      boxShadow: selected === color ? "0 0 0 2px #000080" : "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div style={{ ...FONT, fontSize: "8px", padding: "16px", color: "#808080" }}>
              Appearance settings are managed<br />by Windows 98 system defaults.
            </div>
          )}

          {/* Buttons */}
          <div className="field-row" style={{ justifyContent: "flex-end", gap: "8px", padding: "8px 8px 4px" }}>
            <button style={{ ...FONT, fontSize: "8px", minWidth: "60px" }} onClick={handleOk}>OK</button>
            <button style={{ ...FONT, fontSize: "8px", minWidth: "60px" }} onClick={onClose}>Cancel</button>
            <button style={{ ...FONT, fontSize: "8px", minWidth: "60px" }} onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
