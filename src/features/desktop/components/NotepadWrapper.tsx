"use client";

import { useState } from "react";

interface NotepadWrapperProps {
  children: React.ReactNode;
}

const MENU_FONT: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "9px",
};

const FONTS = [
  { label: "Courier New",     value: "'Courier New', Courier, monospace" },
  { label: "Arial",           value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "MS Sans Serif",   value: "'MS Sans Serif', Tahoma, sans-serif" },
  { label: "Tahoma",          value: "Tahoma, sans-serif" },
  { label: "Verdana",         value: "Verdana, sans-serif" },
];

const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 24];

const SCALE_STEPS = [0.75, 0.85, 1, 1.15, 1.3, 1.5];

interface FontDialogProps {
  fontFamily: string;
  fontSize: number;
  onApply: (fontFamily: string, fontSize: number) => void;
  onClose: () => void;
}

function FontDialog({ fontFamily, fontSize, onApply, onClose }: FontDialogProps) {
  const [selectedFont, setSelectedFont] = useState(fontFamily);
  const [selectedSize, setSelectedSize] = useState(fontSize);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div className="window" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Font</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ padding: "12px", fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            {/* Font list */}
            <div style={{ flex: 2 }}>
              <div style={{ marginBottom: "4px" }}>Font:</div>
              <div className="sunken-panel" style={{ height: "140px", overflowY: "auto", padding: "2px" }}>
                {FONTS.map((f) => (
                  <div
                    key={f.value}
                    onClick={() => setSelectedFont(f.value)}
                    style={{
                      padding: "2px 4px",
                      cursor: "default",
                      background: selectedFont === f.value ? "#000080" : "transparent",
                      color: selectedFont === f.value ? "#fff" : "#000",
                      fontFamily: f.value,
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Size list */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "4px" }}>Size:</div>
              <div className="sunken-panel" style={{ height: "140px", overflowY: "auto", padding: "2px" }}>
                {SIZES.map((s) => (
                  <div
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: "2px 4px",
                      cursor: "default",
                      background: selectedSize === s ? "#000080" : "transparent",
                      color: selectedSize === s ? "#fff" : "#000",
                      fontFamily: "var(--win98-font)",
                      fontSize: "11px",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ marginBottom: "4px" }}>Sample:</div>
            <div
              className="sunken-panel"
              style={{
                padding: "8px",
                fontFamily: selectedFont,
                fontSize: `${selectedSize}px`,
                minHeight: "40px",
                background: "#fff",
                color: "#000",
              }}
            >
              AaBbCcDdEeFfGg 0123456789
            </div>
          </div>

          {/* Buttons */}
          <div className="field-row" style={{ justifyContent: "flex-end", gap: "8px" }}>
            <button style={{ minWidth: "60px" }} onClick={() => { onApply(selectedFont, selectedSize); onClose(); }}>
              OK
            </button>
            <button style={{ minWidth: "60px" }} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotepadWrapper({ children }: NotepadWrapperProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scaleIdx, setScaleIdx] = useState(2);
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [contentFont, setContentFont] = useState("Tahoma, sans-serif");
  const [contentSize, setContentSize] = useState(12);

  const scale = SCALE_STEPS[scaleIdx];

  const menus: Record<string, { label: string; action?: () => void }[]> = {
    File: [
      { label: "New" }, { label: "Open..." }, { label: "Save" }, { label: "Save As..." },
      { label: "---" }, { label: "Page Setup..." }, { label: "Print..." }, { label: "---" }, { label: "Exit" },
    ],
    Edit: [
      { label: "Undo" }, { label: "---" }, { label: "Cut" }, { label: "Copy" },
      { label: "Paste" }, { label: "Delete" }, { label: "---" },
      { label: "Find..." }, { label: "Find Next" }, { label: "Replace..." }, { label: "Go To..." },
      { label: "---" }, { label: "Select All" }, { label: "Time/Date" },
    ],
    Format: [
      { label: "Word Wrap" },
      { label: "Font...", action: () => setShowFontDialog(true) },
    ],
    Help: [
      { label: "Help Topics" }, { label: "---" }, { label: "About Notepad" },
    ],
  };

  return (
    <div style={{ position: "relative" }} onMouseLeave={() => setOpenMenu(null)}>
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
              onMouseEnter={() => { if (openMenu !== null) setOpenMenu(menuName); }}
              onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
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
                    <div key={i} style={{ margin: "2px 4px", borderTop: "1px solid #808080", borderBottom: "1px solid #fff" }} />
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => { item.action?.(); setOpenMenu(null); }}
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
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#000080"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#000"; }}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ width: 1, background: "#808080", margin: "3px 4px" }} />

        {/* A- / A+ */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "0 4px" }}>
          <button
            style={{ ...MENU_FONT, fontSize: "8px", padding: "1px 5px" }}
            onClick={() => setScaleIdx((i) => Math.max(0, i - 1))}
            disabled={scaleIdx === 0}
            title="Decrease font size"
          >A-</button>
          <span style={{ ...MENU_FONT, fontSize: "7px", color: "#555", minWidth: "26px", textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            style={{ ...MENU_FONT, fontSize: "8px", padding: "1px 5px" }}
            onClick={() => setScaleIdx((i) => Math.min(SCALE_STEPS.length - 1, i + 1))}
            disabled={scaleIdx === SCALE_STEPS.length - 1}
            title="Increase font size"
          >A+</button>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          backgroundColor: "#fff",
          zoom: scale,
          fontFamily: contentFont,
          fontSize: `${contentSize}px`,
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>

      {/* Font dialog */}
      {showFontDialog && (
        <FontDialog
          fontFamily={contentFont}
          fontSize={contentSize}
          onApply={(f, s) => { setContentFont(f); setContentSize(s); }}
          onClose={() => setShowFontDialog(false)}
        />
      )}
    </div>
  );
}
