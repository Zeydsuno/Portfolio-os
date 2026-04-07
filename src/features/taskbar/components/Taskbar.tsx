"use client";

import { useState } from "react";
import { useDesktopStore } from "@/features/desktop/store/desktop-store";
import { DESKTOP_ICONS } from "@/features/desktop/data/desktop-items";
import Clock from "./Clock";

/** Small inline icon renderer — scales SVG to 16x16 for taskbar/menu use */
function SmallIcon({ svg }: { svg: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        display: "inline-flex",
        width: "16px",
        height: "16px",
        flexShrink: 0,
        imageRendering: "pixelated",
      }}
      className="[&>svg]:w-full [&>svg]:h-full"
    />
  );
}

export default function Taskbar() {
  const { windows, focusWindow, openWindow } = useDesktopStore();
  const [startOpen, setStartOpen] = useState(false);

  // Lookup icon SVG by window id
  const getIconSvg = (id: string) =>
    DESKTOP_ICONS.find((i) => i.id === id)?.icon ?? "";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999]">
      {/* Start Menu */}
      {startOpen && (
        <div
          className="window absolute bottom-full left-0 mb-0"
          style={{ width: 220 }}
        >
          <div className="title-bar" style={{ background: "#000080" }}>
            <div className="title-bar-text" style={{ fontSize: "9px" }}>
              Portfolio 98
            </div>
          </div>
          <div className="window-body" style={{ padding: 0, margin: 0 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {DESKTOP_ICONS.map((icon) => (
                <li key={icon.id}>
                  <button
                    onClick={() => {
                      openWindow(icon);
                      setStartOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "6px 8px",
                      textAlign: "left",
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "9px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#000080";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#000";
                    }}
                  >
                    <SmallIcon svg={icon.icon} />
                    {icon.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Taskbar — classic Win98 layout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "silver",
          boxShadow: "inset 0 1px #dfdfdf, inset 0 2px #fff",
          padding: "2px 2px",
          height: "28px",
          gap: "2px",
        }}
      >
        {/* Start Button */}
        <button
          onClick={() => setStartOpen((prev) => !prev)}
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "10px",
            fontWeight: "bold",
            padding: "2px 6px",
            minWidth: "auto",
            height: "22px",
          }}
        >
          Start
        </button>

        {/* Divider */}
        <div
          style={{
            width: "2px",
            height: "20px",
            borderLeft: "1px solid #808080",
            borderRight: "1px solid #fff",
            margin: "0 1px",
          }}
        />

        {/* Window buttons — with icon + title */}
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => focusWindow(w.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "8px",
              padding: "2px 8px",
              minWidth: "120px",
              maxWidth: "160px",
              height: "22px",
              textAlign: "left",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <SmallIcon svg={getIconSvg(w.id)} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {w.title}
            </span>
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Clock — sunken panel style */}
        <div
          style={{
            boxShadow: "inset -1px -1px #dfdfdf, inset 1px 1px grey",
            padding: "2px 8px",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "9px",
            height: "18px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Clock />
        </div>
      </div>
    </div>
  );
}
