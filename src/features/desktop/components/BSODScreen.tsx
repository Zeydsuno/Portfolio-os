"use client";

import { useEffect } from "react";

interface BSODScreenProps {
  onDismiss: () => void;
}

const MONO: React.CSSProperties = {
  fontFamily: "monospace",
  imageRendering: "pixelated",
};

export default function BSODScreen({ onDismiss }: BSODScreenProps) {
  useEffect(() => {
    const handler = () => onDismiss();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "#0000aa",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        userSelect: "none",
        padding: "40px",
      }}
      onClick={onDismiss}
    >
      <div style={{ maxWidth: "640px", width: "100%" }}>
        {/* Header highlight bar */}
        <div
          style={{
            ...MONO,
            backgroundColor: "#aaaaaa",
            color: "#0000aa",
            fontSize: "14px",
            padding: "2px 8px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Windows
        </div>

        <p style={{ ...MONO, fontSize: "14px", lineHeight: 1.8, marginBottom: "24px" }}>
          A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
          00010E36. The current application will be terminated.
        </p>

        <p style={{ ...MONO, fontSize: "14px", lineHeight: 1.8, marginBottom: "24px" }}>
          * Press any key to terminate the current application.
          <br />
          * Press CTRL+ALT+DEL again to restart your computer. You will
          <br />
          &nbsp;&nbsp;lose any unsaved information in all applications.
        </p>

        <p style={{ ...MONO, fontSize: "14px", lineHeight: 1.8, marginBottom: "32px" }}>
          Press any key to continue _
        </p>

        <p
          style={{
            ...MONO,
            fontSize: "11px",
            color: "#aaaaaa",
            borderTop: "1px solid #aaaaaa",
            paddingTop: "12px",
          }}
        >
          ─── Windows 98 ─── Error Code: MS-DOS_MODE_TRIGGERED ─── Build 1998 ───
        </p>
      </div>
    </div>
  );
}
