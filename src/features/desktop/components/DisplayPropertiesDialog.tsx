"use client";

import { useState } from "react";
import { useDesktopStore } from "../store/desktop-store";
import type { WallpaperEntry } from "@/types";

interface DisplayPropertiesDialogProps {
  onClose: () => void;
}

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

const WALLPAPER_PRESETS: WallpaperEntry[] = [
  {
    id: "bliss",
    label: "Bliss",
    type: "gradient",
    value: "linear-gradient(180deg, #1e6bb8 0%, #4399d5 28%, #90c8e8 48%, #7bc840 52%, #4a8a1a 100%)",
    thumb: "linear-gradient(180deg, #1e6bb8 0%, #90c8e8 48%, #7bc840 52%, #4a8a1a 100%)",
  },
  {
    id: "autumn",
    label: "Autumn",
    type: "gradient",
    value: "linear-gradient(180deg, #1a0a00 0%, #6b2d00 30%, #c85a00 60%, #e8a020 100%)",
    thumb: "linear-gradient(180deg, #1a0a00 0%, #c85a00 60%, #e8a020 100%)",
  },
  {
    id: "azul",
    label: "Azul",
    type: "gradient",
    value: "linear-gradient(180deg, #061428 0%, #0d2d5c 35%, #1a5fb4 65%, #2878d4 100%)",
    thumb: "linear-gradient(180deg, #061428 0%, #1a5fb4 65%, #2878d4 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    type: "gradient",
    value: "linear-gradient(180deg, #0a0020 0%, #4a0060 30%, #a02080 55%, #e06030 75%, #f0a020 100%)",
    thumb: "linear-gradient(180deg, #0a0020 0%, #a02080 55%, #f0a020 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    type: "gradient",
    value: "linear-gradient(180deg, #0a1a05 0%, #1a3a0a 30%, #2d6010 60%, #4a8a20 100%)",
    thumb: "linear-gradient(180deg, #0a1a05 0%, #2d6010 60%, #4a8a20 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    type: "gradient",
    value: "linear-gradient(180deg, #001020 0%, #003060 35%, #005090 65%, #0080c0 100%)",
    thumb: "linear-gradient(180deg, #001020 0%, #005090 65%, #0080c0 100%)",
  },
  {
    id: "luna",
    label: "Luna",
    type: "gradient",
    value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)",
    thumb: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 70%, #533483 100%)",
  },
  {
    id: "rose",
    label: "Rose",
    type: "gradient",
    value: "linear-gradient(180deg, #1a0010 0%, #5a0030 35%, #b02060 65%, #e05090 100%)",
    thumb: "linear-gradient(180deg, #1a0010 0%, #b02060 65%, #e05090 100%)",
  },
];

const COLOR_PRESETS: WallpaperEntry[] = [
  { id: "teal",      label: "Teal",       type: "color", value: "#008080", thumb: "#008080" },
  { id: "navy",      label: "Navy",       type: "color", value: "#000080", thumb: "#000080" },
  { id: "olive",     label: "Olive",      type: "color", value: "#808000", thumb: "#808000" },
  { id: "purple",    label: "Purple",     type: "color", value: "#800080", thumb: "#800080" },
  { id: "forest-c",  label: "Forest",     type: "color", value: "#006400", thumb: "#006400" },
  { id: "wine",      label: "Wine",       type: "color", value: "#800000", thumb: "#800000" },
  { id: "steel",     label: "Steel",      type: "color", value: "#4682b4", thumb: "#4682b4" },
  { id: "slate",     label: "Slate",      type: "color", value: "#2f4f4f", thumb: "#2f4f4f" },
  { id: "charcoal",  label: "Charcoal",   type: "color", value: "#333333", thumb: "#333333" },
  { id: "black",     label: "Black",      type: "color", value: "#000000", thumb: "#000000" },
  { id: "midnight",  label: "Midnight",   type: "color", value: "#191970", thumb: "#191970" },
  { id: "deepspace", label: "Deep Space", type: "color", value: "#0d0d1a", thumb: "#0d0d1a" },
];

interface ScaleOption {
  label: string;
  value: number;
}

const SCALE_OPTIONS: ScaleOption[] = [
  { label: "Small",   value: 0.8  },
  { label: "Normal",  value: 1.0  },
  { label: "Large",   value: 1.25 },
  { label: "X-Large", value: 1.5  },
];

export default function DisplayPropertiesDialog({ onClose }: DisplayPropertiesDialogProps) {
  const { wallpaper, setWallpaper, fontScale, setFontScale } = useDesktopStore();
  const [selected, setSelected] = useState<WallpaperEntry>(wallpaper);
  const [selectedScale, setSelectedScale] = useState(fontScale);
  const [activeTab, setActiveTab] = useState<"background" | "appearance">("background");
  const [customUrl, setCustomUrl] = useState("");

  const handleApply = () => {
    setWallpaper(selected);
    setFontScale(selectedScale);
  };
  const handleOk = () => {
    setWallpaper(selected);
    setFontScale(selectedScale);
    onClose();
  };

  const handleCustomUrl = () => {
    const url = customUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return;
    setSelected({
      id: "custom",
      label: "Custom",
      type: "image",
      value: url,
      thumb: url,
    });
  };

  const previewStyle: React.CSSProperties =
    selected.type === "image"
      ? { backgroundImage: `url(${selected.value})`, backgroundSize: "cover", backgroundPosition: "center" }
      : selected.type === "gradient"
      ? { background: selected.value }
      : { backgroundColor: selected.value };

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
      <div className="window" style={{ width: 460 }}>
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
                <div style={{ position: "relative", width: 200, height: 130 }}>
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
                        width: "82%",
                        height: "82%",
                        border: "1px solid #000",
                        ...previewStyle,
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

              {/* Selected label */}
              <p style={{ ...FONT, fontSize: "8px", marginBottom: "10px" }}>
                Wallpaper:&nbsp;
                <span style={{ color: "#000080" }}>{selected.label}</span>
              </p>

              {/* Gradient presets */}
              <p style={{ ...FONT, fontSize: "7px", color: "#808080", marginBottom: "6px" }}>
                Scenes
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                {WALLPAPER_PRESETS.map((wp) => (
                  <div
                    key={wp.id}
                    title={wp.label}
                    onClick={() => setSelected(wp)}
                    style={{
                      width: 40,
                      height: 28,
                      background: wp.thumb,
                      border: selected.id === wp.id
                        ? "3px solid #fff"
                        : "2px solid #808080",
                      boxShadow: selected.id === wp.id ? "0 0 0 2px #000080" : "none",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {selected.id === wp.id && (
                      <div style={{
                        position: "absolute", bottom: 1, right: 2,
                        fontSize: "6px", color: "#fff",
                        textShadow: "0 0 2px #000",
                        fontFamily: "monospace",
                      }}>✓</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Solid color presets */}
              <p style={{ ...FONT, fontSize: "7px", color: "#808080", marginBottom: "6px" }}>
                Solid Color
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                {COLOR_PRESETS.map((wp) => (
                  <div
                    key={wp.id}
                    title={wp.label}
                    onClick={() => setSelected(wp)}
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: wp.value,
                      border: selected.id === wp.id
                        ? "3px solid #fff"
                        : "2px solid #808080",
                      boxShadow: selected.id === wp.id ? "0 0 0 2px #000080" : "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>

              {/* Custom image URL */}
              <p style={{ ...FONT, fontSize: "7px", color: "#808080", marginBottom: "6px" }}>
                Custom Image URL
              </p>
              <div style={{ display: "flex", gap: "4px" }}>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomUrl(); }}
                  placeholder="https://..."
                  style={{
                    flex: 1,
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "7px",
                    padding: "4px 6px",
                    border: "2px inset #808080",
                    background: "#fff",
                  }}
                />
                <button
                  onClick={handleCustomUrl}
                  style={{ ...FONT, fontSize: "7px", padding: "4px 8px" }}
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div style={{ padding: "12px" }}>
              <p style={{ ...FONT, fontSize: "8px", marginBottom: "12px" }}>Font Size:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {SCALE_OPTIONS.map(({ label, value }) => (
                  <label
                    key={value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      padding: "4px 8px",
                      background: selectedScale === value ? "#000080" : "transparent",
                      color: selectedScale === value ? "#fff" : "#000",
                    }}
                    onClick={() => setSelectedScale(value)}
                  >
                    <input
                      type="radio"
                      name="fontScale"
                      checked={selectedScale === value}
                      onChange={() => setSelectedScale(value)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ ...FONT, fontSize: "8px" }}>{label}</span>
                    <span style={{ ...FONT, fontSize: "7px", color: selectedScale === value ? "#ccc" : "#808080" }}>
                      ({Math.round(value * 100)}%)
                    </span>
                  </label>
                ))}
              </div>
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
