import { ImageResponse } from "next/og";

export const alt = "Portfolio — Windows 98";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#008080",
          position: "relative",
          fontFamily: "monospace",
        }}
      >
        {/* Desktop icons — left column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 16px",
            gap: "8px",
          }}
        >
          {["Readme.txt", "Projects.exe", "Mail.bat", "CV.txt"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "72px",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#c0c0c0",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                📄
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "9px",
                  textAlign: "center",
                  textShadow: "1px 1px 0 #000",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Main window */}
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "180px",
            right: "50px",
            height: "440px",
            backgroundColor: "#c0c0c0",
            border: "3px solid",
            borderColor: "#fff #808080 #808080 #fff",
            boxShadow: "4px 4px 0 #000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              background: "linear-gradient(90deg, #000080 0%, #1a5eff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              color: "#fff",
              fontSize: "15px",
            }}
          >
            <span>📄 Readme.txt — Notepad</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {["_", "[ ]", "X"].map((btn) => (
                <div
                  key={btn}
                  style={{
                    width: "22px",
                    height: "18px",
                    backgroundColor: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#fff #808080 #808080 #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    color: "#000",
                  }}
                >
                  {btn}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              padding: "36px 48px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              backgroundColor: "#fff",
              flex: 1,
            }}
          >
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#000080" }}>
              Hi, I&apos;m Attidmese 👋
            </div>
            <div style={{ fontSize: "26px", color: "#444" }}>
              Full-Stack Developer
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              {["Python", "TypeScript", "Vue.js", "FastAPI", "PyTorch"].map((skill) => (
                <div
                  key={skill}
                  style={{
                    padding: "4px 14px",
                    border: "2px solid",
                    borderColor: "#808080 #fff #fff #808080",
                    backgroundColor: "#c0c0c0",
                    fontSize: "15px",
                    color: "#000",
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "16px", color: "#666", marginTop: "4px" }}>
              🖥️  Interactive Windows 98 Portfolio — Double-click to explore
            </div>
          </div>
        </div>

        {/* Taskbar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "46px",
            backgroundColor: "#c0c0c0",
            borderTop: "3px solid #fff",
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            gap: "8px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c0c0c0",
              border: "2px solid",
              borderColor: "#fff #808080 #808080 #fff",
              padding: "4px 18px",
              fontSize: "17px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>Start</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
