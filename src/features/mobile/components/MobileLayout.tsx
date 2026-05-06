"use client";

import { useState, useEffect } from "react";
import ReadmeContent from "@/features/portfolio/components/ReadmeContent";
import ProjectsContent from "@/features/portfolio/components/ProjectsContent";
import MailContent from "@/features/portfolio/components/MailContent";
import CVContent from "@/features/portfolio/components/CVContent";
import SnakeGame from "@/features/games/snake/SnakeGame";
import Minesweeper from "@/features/games/minesweeper/Minesweeper";
import DinoGame from "@/features/games/dino/DinoGame";
import SolitaireGame from "@/features/games/solitaire/SolitaireGame";
import {
  ICON_NOTEPAD, ICON_CV, ICON_COMPUTER, ICON_MAIL,
  ICON_SNAKE, ICON_MINE, ICON_DINO, ICON_SOLITAIRE,
} from "@/features/desktop/data/desktop-items";

type SectionId = "about" | "cv" | "projects" | "contact" | "snake" | "minesweeper" | "dino" | "solitaire";

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  emoji: string;
  title: string;
  renderContent: () => React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: "about",       label: "About",     icon: ICON_NOTEPAD,   emoji: "📄", title: "README.TXT",       renderContent: () => <ReadmeContent /> },
  { id: "cv",          label: "CV",         icon: ICON_CV,        emoji: "🗂️", title: "CV.TXT",            renderContent: () => <CVContent /> },
  { id: "projects",    label: "Projects",   icon: ICON_COMPUTER,  emoji: "💾", title: "Projects.exe",      renderContent: () => <ProjectsContent /> },
  { id: "contact",     label: "Mail",       icon: ICON_MAIL,      emoji: "✉️", title: "Mail.bat",           renderContent: () => <MailContent /> },
  { id: "snake",       label: "Snake",      icon: ICON_SNAKE,     emoji: "🐍", title: "Snake.exe",         renderContent: () => <SnakeGame /> },
  { id: "minesweeper", label: "Mines",      icon: ICON_MINE,      emoji: "💣", title: "Minesweeper.exe",   renderContent: () => <Minesweeper /> },
  { id: "dino",        label: "ZeydLost",   icon: ICON_DINO,      emoji: "🦖", title: "ZeydLost.exe",      renderContent: () => <DinoGame /> },
  { id: "solitaire",   label: "Solitaire",  icon: ICON_SOLITAIRE, emoji: "🃏", title: "Solitaire.exe",     renderContent: () => <SolitaireGame /> },
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
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
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
        className="mobile-landscape-hidden"
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
        className="mobile-desktop-area"
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
          className="mobile-icon-row"
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
              onClick={() => { window.umami?.track("open_app", { name: s.id }); setActive(s.id); }}
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
              <img
                src={`data:image/svg+xml,${encodeURIComponent(s.icon)}`}
                width={32}
                height={32}
                alt=""
                style={{ imageRendering: "pixelated" }}
              />
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
            <div className="title-bar-text" style={{ fontSize: "9px", display: "flex", alignItems: "center", gap: 4 }}>
              <img src={`data:image/svg+xml,${encodeURIComponent(section.icon)}`} width={12} height={12} alt="" style={{ imageRendering: "pixelated" }} />
              {section.title}
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
                onClick={() => { window.umami?.track("open_app", { name: s.id }); setActive(s.id); }}
                style={{
                  ...FONT,
                  fontSize: "7px",
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                  fontWeight: active === s.id ? "bold" : "normal",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  boxShadow:
                    active === s.id
                      ? "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff"
                      : undefined,
                }}
              >
                <img src={`data:image/svg+xml,${encodeURIComponent(s.icon)}`} width={12} height={12} alt="" style={{ imageRendering: "pixelated", flexShrink: 0 }} /> {s.label}
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
