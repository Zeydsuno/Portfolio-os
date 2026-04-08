"use client";

import { useState } from "react";

interface MenuItem {
  label: string;
  action?: () => void;
}

interface NotepadWrapperProps {
  children: React.ReactNode;
}

const MENU_FONT: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "9px",
};

const SCALE_STEPS = [0.75, 0.85, 1, 1.15, 1.3, 1.5];

export default function NotepadWrapper({ children }: NotepadWrapperProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scaleIdx, setScaleIdx] = useState(2); // default = 1.0
  const scale = SCALE_STEPS[scaleIdx];

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: "New" },
      { label: "Open..." },
      { label: "Save" },
      { label: "Save As..." },
      { label: "---" },
      { label: "Page Setup..." },
      { label: "Print..." },
      { label: "---" },
      { label: "Exit" },
    ],
    Edit: [
      { label: "Undo" },
      { label: "---" },
      { label: "Cut" },
      { label: "Copy" },
      { label: "Paste" },
      { label: "Delete" },
      { label: "---" },
      { label: "Find..." },
      { label: "Find Next" },
      { label: "Replace..." },
      { label: "Go To..." },
      { label: "---" },
      { label: "Select All" },
      { label: "Time/Date" },
    ],
    Format: [
      { label: "Word Wrap" },
      { label: "Font..." },
    ],
    Help: [
      { label: "Help Topics" },
      { label: "---" },
      { label: "About Notepad" },
    ],
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseLeave={() => setOpenMenu(null)}
    >
      {/* Sticky menu bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          backgroundColor: "#c0c0c0",
          borderBottom: "1px solid #808080",
          padding: "1px 0",
        }}
      >
        {Object.entries(menus).map(([menuName, items]) => (
          <div key={menuName} style={{ position: "relative" }}>
            <button
              style={{
                ...MENU_FONT,
                padding: "2px 6px",
                border: "none",
                background: openMenu === menuName ? "#000080" : "transparent",
                color: openMenu === menuName ? "#fff" : "#000",
                cursor: "default",
              }}
              onMouseEnter={() => {
                if (openMenu !== null) setOpenMenu(menuName);
              }}
              onClick={() =>
                setOpenMenu(openMenu === menuName ? null : menuName)
              }
            >
              {menuName}
            </button>

            {openMenu === menuName && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 9999,
                  backgroundColor: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#fff #808080 #808080 #fff",
                  minWidth: "150px",
                  boxShadow: "2px 2px 0 #000",
                }}
              >
                {items.map((item, i) =>
                  item.label === "---" ? (
                    <div
                      key={i}
                      style={{
                        margin: "2px 4px",
                        borderTop: "1px solid #808080",
                        borderBottom: "1px solid #fff",
                      }}
                    />
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action?.();
                        setOpenMenu(null);
                      }}
                      style={{
                        ...MENU_FONT,
                        display: "block",
                        width: "100%",
                        padding: "3px 20px",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        color: "#000",
                        cursor: "default",
                        whiteSpace: "nowrap",
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
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Separator */}
        <div style={{ width: 1, background: "#808080", margin: "3px 4px" }} />

        {/* A- / A+ */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "0 4px" }}>
          <button
            style={{ ...MENU_FONT, fontSize: "8px", padding: "1px 5px" }}
            onClick={() => setScaleIdx((i) => Math.max(0, i - 1))}
            disabled={scaleIdx === 0}
            title="Decrease font size"
          >
            A-
          </button>
          <span style={{ ...MENU_FONT, fontSize: "7px", color: "#555", minWidth: "26px", textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            style={{ ...MENU_FONT, fontSize: "8px", padding: "1px 5px" }}
            onClick={() => setScaleIdx((i) => Math.min(SCALE_STEPS.length - 1, i + 1))}
            disabled={scaleIdx === SCALE_STEPS.length - 1}
            title="Increase font size"
          >
            A+
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{ backgroundColor: "#fff", zoom: scale }}>{children}</div>
    </div>
  );
}
