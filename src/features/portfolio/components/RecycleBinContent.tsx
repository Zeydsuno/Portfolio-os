"use client";

import { useDesktopStore } from "@/features/desktop/store/desktop-store";

const FONT: React.CSSProperties = {
  fontFamily: "var(--win98-font)",
  fontSize: "11px",
};

export default function RecycleBinContent() {
  const { recycleBinFull, emptyRecycleBin } = useDesktopStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", ...FONT }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px",
          borderBottom: "1px solid #808080",
        }}
      >
        <button
          onClick={emptyRecycleBin}
          disabled={!recycleBinFull}
          style={{ fontSize: "8px" }}
        >
          Empty Recycle Bin
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
        }}
      >
        <span style={{ fontSize: "48px", lineHeight: 1 }}>
          {recycleBinFull ? "🗑️" : "🗑️"}
        </span>
        <p style={{ textAlign: "center", lineHeight: 2, color: recycleBinFull ? "#000" : "#808080" }}>
          {recycleBinFull
            ? "The Recycle Bin contains items\nthat were deleted."
            : "The Recycle Bin is empty."}
        </p>
        {recycleBinFull && (
          <p style={{ fontSize: "8px", color: "#555", textAlign: "center", lineHeight: 2 }}>
            To permanently delete items,<br />click Empty Recycle Bin.
          </p>
        )}
      </div>

      {/* Status bar */}
      <div
        className="status-bar"
        style={{ display: "flex", padding: "2px 4px", borderTop: "1px solid #808080" }}
      >
        <div className="status-bar-field" style={{ flex: 1 }}>
          {recycleBinFull ? "Contains deleted items" : "Empty"}
        </div>
      </div>
    </div>
  );
}
