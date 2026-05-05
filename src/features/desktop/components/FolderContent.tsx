"use client";

import { useRef, useState } from "react";
import { useDesktopStore } from "../store/desktop-store";
import { GAME_ICONS } from "../data/desktop-items";
import { playWindowOpen } from "../utils/sounds";

const F: React.CSSProperties = {
  fontFamily: "var(--win98-font)",
  fontSize: "11px",
};

const SMALL_BTN: React.CSSProperties = {
  ...F,
  minWidth: 0,
  minHeight: 0,
  padding: "1px 4px",
  cursor: "default",
  boxSizing: "border-box",
};

const MENU_ITEMS = ["File", "Edit", "View", "Go", "Favorites", "Help"];

const TOOLBAR: Array<{ icon: string; label: string } | null> = [
  { icon: "←", label: "Back" },
  { icon: "→", label: "Forward" },
  { icon: "↑", label: "Up" },
  null,
  { icon: "✂", label: "Cut" },
  { icon: "❐", label: "Copy" },
  { icon: "⎘", label: "Paste" },
  null,
  { icon: "↩", label: "Undo" },
  { icon: "✕", label: "Delete" },
  { icon: "☰", label: "Properties" },
];

export default function FolderContent() {
  const openWindow = useDesktopStore((s) => s.openWindow);
  const [selected, setSelected] = useState<string | null>(null);
  const lastClick = useRef<{ id: string; time: number }>({ id: "", time: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Menu bar ─────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid #808080" }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            style={{
              ...SMALL_BTN,
              background: "transparent",
              boxShadow: "none",
              border: "1px solid transparent",
              padding: "2px 6px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#000080";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#000";
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "2px 3px",
          borderBottom: "1px solid #808080",
        }}
      >
        {TOOLBAR.map((item, i) =>
          item === null ? (
            <div
              key={i}
              style={{
                width: 1,
                height: 22,
                margin: "0 3px",
                background: "#808080",
                boxShadow: "1px 0 0 #fff",
                flexShrink: 0,
              }}
            />
          ) : (
            <button
              key={item.label}
              title={item.label}
              disabled
              style={{
                ...SMALL_BTN,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                padding: "1px 5px",
                width: "auto",
              }}
            >
              <span style={{ fontSize: "12px", lineHeight: 1.1 }}>{item.icon}</span>
              <span style={{ fontSize: "8px", ...F }}>{item.label}</span>
            </button>
          )
        )}
        <div style={{ flex: 1 }} />
        <button
          disabled
          style={{ ...SMALL_BTN, padding: "1px 6px", fontSize: "9px" }}
        >
          Views ▼
        </button>
      </div>

      {/* ── Address bar ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "2px 4px",
          borderBottom: "1px solid #808080",
        }}
      >
        <span style={{ ...F, whiteSpace: "nowrap" }}>Address</span>
        <input
          type="text"
          readOnly
          defaultValue="C:\Games"
          tabIndex={-1}
          style={{ flex: 1, ...F, cursor: "default" }}
        />
      </div>

      {/* ── Icon grid ────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          padding: 8,
          overflowY: "auto",
          background: "#fff",
        }}
        onClick={() => setSelected(null)}
      >
        {GAME_ICONS.map((icon) => {
          const isSelected = selected === icon.id;
          return (
            <div
              key={icon.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                width: 80,
                padding: "6px 4px 4px",
                cursor: "default",
                userSelect: "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                const now = Date.now();
                if (lastClick.current.id === icon.id && now - lastClick.current.time < 400) {
                  playWindowOpen();
                  openWindow(icon);
                  setSelected(null);
                } else {
                  setSelected(icon.id);
                }
                lastClick.current = { id: icon.id, time: now };
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLDivElement).style.outline = "1px dotted #000080";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLDivElement).style.outline = "";
              }}
            >
              {/* Icon with selection highlight */}
              <div
                style={{
                  padding: 2,
                  background: isSelected ? "#000080" : "transparent",
                  outline: isSelected ? "1px dotted #fff" : "none",
                  outlineOffset: -1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    icon.photoIcon
                      ? icon.photoIcon
                      : `data:image/svg+xml;base64,${btoa(icon.icon)}`
                  }
                  width={32}
                  height={32}
                  alt={icon.label}
                  draggable={false}
                  style={{
                    imageRendering: icon.photoIcon ? "auto" : "pixelated",
                    objectFit: "cover",
                    borderRadius: icon.photoIcon ? "3px" : "0",
                    display: "block",
                    filter: isSelected
                      ? "brightness(0.6) sepia(1) hue-rotate(180deg) saturate(3)"
                      : "none",
                  }}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  ...F,
                  textAlign: "center",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                  width: "100%",
                  padding: "1px 2px",
                  color: isSelected ? "#fff" : "#000",
                  background: isSelected ? "#000080" : "transparent",
                }}
              >
                {icon.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Status bar ───────────────────────────────────────── */}
      <div className="status-bar" style={{ display: "flex", padding: "2px 4px" }}>
        <div className="status-bar-field" style={{ flex: 1 }}>
          {selected
            ? `1 object(s) selected`
            : `${GAME_ICONS.length} object(s)`}
        </div>
        <div className="status-bar-field">My Computer</div>
      </div>
    </div>
  );
}
