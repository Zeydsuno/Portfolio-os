"use client";

const FONT: React.CSSProperties = {
  fontFamily: "var(--win98-font)",
  fontSize: "11px",
};

interface InfoRow {
  label: string;
  value: string;
}

const SYSTEM_INFO: InfoRow[] = [
  { label: "OS",           value: "Microsoft Windows 98 SE" },
  { label: "Version",      value: "4.10.2222 A" },
  { label: "Computer",     value: "ATTIDMESE-PC" },
  { label: "Processor",    value: "Intel Pentium III 500MHz" },
  { label: "Memory (RAM)", value: "128 MB" },
  { label: "Display",      value: "1024×768 256 colors" },
  { label: "User",         value: "Attidmese Bunsua" },
];

const DRIVES: Array<{ letter: string; label: string; size: string; free: string }> = [
  { letter: "C:", label: "Local Disk",    size: "4.00 GB", free: "1.23 GB" },
  { letter: "D:", label: "CD-ROM Drive",  size: "—",       free: "—" },
  { letter: "A:", label: "3½ Floppy",     size: "1.44 MB", free: "1.44 MB" },
];

export default function MyComputerContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", ...FONT }}>
      {/* Drives section */}
      <div style={{ padding: "8px", borderBottom: "1px solid #808080" }}>
        <p style={{ marginBottom: "6px", fontWeight: "bold" }}>Drives</p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {DRIVES.map((d) => (
            <div
              key={d.letter}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                border: "1px solid transparent",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.border = "1px dotted #000080";
                (e.currentTarget as HTMLDivElement).style.background = "#cce";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.border = "1px solid transparent";
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1 }}>
                {d.letter === "D:" ? "💿" : d.letter === "A:" ? "💾" : "🖴"}
              </span>
              <span style={{ fontSize: "7px", textAlign: "center" }}>
                {d.label}
                <br />({d.letter})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System info */}
      <div style={{ padding: "8px", flex: 1, overflowY: "auto" }}>
        <p style={{ marginBottom: "8px", fontWeight: "bold" }}>System Information</p>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {SYSTEM_INFO.map((row) => (
              <tr key={row.label}>
                <td
                  style={{
                    padding: "4px 8px 4px 0",
                    color: "#000080",
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  {row.label}
                </td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div
        className="status-bar"
        style={{ display: "flex", gap: "8px", padding: "2px 4px", borderTop: "1px solid #808080" }}
      >
        <div className="status-bar-field" style={{ flex: 1 }}>3 object(s)</div>
        <div className="status-bar-field">My Computer</div>
      </div>
    </div>
  );
}
