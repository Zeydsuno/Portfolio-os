"use client";

import { useState, useEffect } from "react";
import ReadmeContent from "@/features/portfolio/components/ReadmeContent";
import ProjectsContent from "@/features/portfolio/components/ProjectsContent";
import MailContent from "@/features/portfolio/components/MailContent";
import CVContent from "@/features/portfolio/components/CVContent";
import SnakeGame from "@/features/games/snake/SnakeGame";
import Minesweeper from "@/features/games/minesweeper/Minesweeper";

type SectionId = "about" | "cv" | "projects" | "contact" | "snake" | "minesweeper";

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  title: string;
  renderContent: () => React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "about",
    label: "About",
    icon: "📄",
    title: "README.TXT",
    renderContent: () => <ReadmeContent />,
  },
  {
    id: "cv",
    label: "CV",
    icon: "🗂️",
    title: "CV.TXT",
    renderContent: () => <CVContent />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: "💾",
    title: "Projects.exe",
    renderContent: () => <ProjectsContent />,
  },
  {
    id: "contact",
    label: "Mail",
    icon: "✉️",
    title: "Mail.bat",
    renderContent: () => <MailContent />,
  },
  {
    id: "snake",
    label: "Snake",
    icon: "🐍",
    title: "Snake.exe",
    renderContent: () => <SnakeGame />,
  },
  {
    id: "minesweeper",
    label: "Mines",
    icon: "💣",
    title: "Minesweeper.exe",
    renderContent: () => <Minesweeper />,
  },
];

const FONT: React.CSSProperties = { fontFamily: "var(--win98-font)" };

function MobileClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        ...FONT,
        fontSize: "7px",
        padding: "2px 6px",
        border: "1px solid",
        borderColor: "#808080 #fff #fff #808080",
        flexShrink: 0,
      }}
    >
      {time}
    </div>
  );
}

export default function MobileLayout() {
  const [active, setActive] = useState<SectionId>("about");
  const section = SECTIONS.find((s) => s.id === active)!;

  return (
    <div
      style={{
        ...FONT,
        backgroundColor: "#008080",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Desktop hint banner */}
      <div
        style={{
          background: "#ffff80",
          borderBottom: "1px solid #808000",
          padding: "4px 10px",
          fontSize: "8px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          ...FONT,
        }}
      >
        <span>🖥️</span>
        <span style={{ color: "#000" }}>Best viewed on desktop for full experience</span>
      </div>

      {/* Top bar — Win98 title bar style */}
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "16px" }}>🖥️</span>
        <span style={{ color: "#fff", fontSize: "9px" }}>
          Attidmese Bunsua — Zeyd-OS
        </span>
      </div>

      {/* Desktop area */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
          minHeight: 0,
        }}
      >
        {/* Icon row */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "6px",
                borderRadius: "0",
                outline: active === s.id ? "1px dotted #fff" : "none",
                backgroundColor:
                  active === s.id ? "rgba(0,0,128,0.5)" : "transparent",
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1 }}>{s.icon}</span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "7px",
                  textShadow: "1px 1px 0 #000",
                  textAlign: "center",
                  maxWidth: "60px",
                }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Window */}
        <div
          className="window"
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
          <div className="title-bar">
            <div className="title-bar-text" style={{ fontSize: "9px" }}>
              {section.icon} {section.title}
            </div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" style={{ cursor: "default" }} />
              <button aria-label="Maximize" style={{ cursor: "default" }} />
              <button aria-label="Close" style={{ cursor: "default" }} />
            </div>
          </div>
          <div
            className="window-body"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "4px",
              minHeight: 0,
              fontFamily: "Tahoma, sans-serif",
              fontSize: "12px",
            }}
          >
            {section.renderContent()}
          </div>
        </div>
      </div>

      {/* Bottom taskbar */}
      <div
        style={{
          backgroundColor: "#c0c0c0",
          borderTop: "2px solid #fff",
          borderBottom: "1px solid #808080",
          padding: "4px 6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        {/* Start button */}
        <button
          style={{
            ...FONT,
            fontSize: "8px",
            padding: "2px 8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          <span>⊞</span> Start
        </button>

        <div
          style={{
            width: "1px",
            height: "24px",
            background: "#808080",
            margin: "0 4px",
            flexShrink: 0,
          }}
        />

        {/* Section buttons — scroll hint via gradient, iOS Safari doesn't support ::-webkit-scrollbar */}
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <div className="taskbar-nav" style={{ display: "flex", gap: "2px", overflowX: "auto" }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                style={{
                  ...FONT,
                  fontSize: "7px",
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                  fontWeight: active === s.id ? "bold" : "normal",
                  boxShadow:
                    active === s.id
                      ? "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff"
                      : undefined,
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 20,
              background: "linear-gradient(to right, transparent, #c0c0c0)",
              pointerEvents: "none",
            }}
          />
        </div>

        <MobileClock />
      </div>
    </div>
  );
}
