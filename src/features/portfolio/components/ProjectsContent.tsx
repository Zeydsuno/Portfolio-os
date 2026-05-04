"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface Screenshot {
  src: string;
  caption: string;
}

interface Project {
  id: string;
  name: string;
  icon: string;
  description: string;
  tech: string[];
  status: "Live" | "Deployed" | "MVP" | "In Progress";
  link?: string;
  screenshots?: Screenshot[];
}

const PROJECTS: Project[] = [
  {
    id: "euroscan",
    name: "EuroScan Warranty ERP",
    icon: "🏭",
    description: "QR-based warranty management ERP with PDF/QR generation, Google Calendar integration, deployed as Electron desktop app.",
    tech: ["Vue.js", "Node.js", "MySQL", "Electron"],
    status: "Deployed",
    screenshots: [
      { src: "/images/euroscan/warranty-table.png",   caption: "Warranty Table" },
      { src: "/images/euroscan/add-pm-dialog.png",    caption: "Add PM Dialog" },
      { src: "/images/euroscan/release-forms.png",    caption: "Release Forms" },
      { src: "/images/euroscan/warranty-card-pdf.png", caption: "Warranty Card PDF" },
    ],
  },
  {
    id: "family",
    name: "Family Business ERP",
    icon: "🏠",
    description: "Production ERP for family food business — inventory, BOM recipes, finance (business vs personal wallets), iPad Kiosk, and mobile app.",
    tech: ["Next.js", "React Native", "Supabase", "TypeScript", "Turborepo"],
    status: "Deployed",
    screenshots: [
      { src: "/images/family-system/web-dashboard-overview.png",         caption: "Web — Dashboard Overview" },
      { src: "/images/family-system/web-stock-all-list.png",             caption: "Web — Inventory" },
      { src: "/images/family-system/web-stock-ingredients-kiosk.png",    caption: "iPad Kiosk" },
      { src: "/images/family-system/web-finance-dashboard.png",          caption: "Web — Finance Dashboard" },
      { src: "/images/family-system/web-finance-chart-transactions.png", caption: "Web — Finance Chart" },
      { src: "/images/family-system/web-recipe-produce-confirm.png",     caption: "Web — BOM Recipe Production" },
      { src: "/images/family-system/mobile-stock-all-list.jpg",          caption: "Mobile — Stock" },
      { src: "/images/family-system/mobile-stock-ingredients.jpg",       caption: "Mobile — Low Stock Alert" },
      { src: "/images/family-system/mobile-finance-dashboard.jpg",       caption: "Mobile — Finance" },
      { src: "/images/family-system/mobile-transaction-add-income.jpg",  caption: "Mobile — Add Income" },
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio OS",
    icon: "🖥️",
    description: "Windows 98-style interactive portfolio built as a fake OS with draggable windows, games, and apps.",
    tech: ["Next.js", "TypeScript", "98.css", "Zustand"],
    status: "Live",
  },
  {
    id: "ai-job",
    name: "AI Job Matching",
    icon: "🤖",
    description: "AI-powered job matching for the Thailand market with NLP skill extraction and embeddings-based ranking.",
    tech: ["Python", "FastAPI", "E5/JobBERT", "Google Sheets"],
    status: "In Progress",
  },
  {
    id: "stock",
    name: "Stock News Dashboard",
    icon: "📈",
    description: "Real-time stock news analysis platform with AI impact scoring, delivered via LINE Mini App.",
    tech: ["Flask", "LIFF", "GLM-4.6", "NewsAPI", "Cloudflare Tunnel"],
    status: "MVP",
    link: "https://github.com/Zeydsuno/STOCKNEWS",
  },
];

const STATUS_STYLE: Record<Project["status"], React.CSSProperties> = {
  Live:        { background: "#008000", color: "#fff" },
  Deployed:    { background: "#000080", color: "#fff" },
  MVP:         { background: "#808000", color: "#fff" },
  "In Progress": { background: "#808080", color: "#fff" },
};

const FONT: React.CSSProperties = { fontFamily: "var(--win98-font)" };

export default function ProjectsContent() {
  const [selected, setSelected] = useState<string>(PROJECTS[0].id);
  const [activeShot, setActiveShot] = useState<number>(0);
  const [isNarrow, setIsNarrow] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const project = PROJECTS.find((p) => p.id === selected) ?? PROJECTS[0];
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.focus();
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const shots = project.screenshots ?? [];
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") setActiveShot((i) => Math.min(i + 1, shots.length - 1));
      else if (e.key === "ArrowLeft") setActiveShot((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, project.screenshots]);

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = PROJECTS.findIndex((p) => p.id === selected);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(PROJECTS[Math.min(idx + 1, PROJECTS.length - 1)].id);
      setActiveShot(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(PROJECTS[Math.max(idx - 1, 0)].id);
      setActiveShot(0);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", ...FONT }}>

      {/* Toolbar */}
      <div
        style={{
          padding: "2px 4px",
          borderBottom: "1px solid #808080",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "8px",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#808080" }}>Projects ({PROJECTS.length})</span>
      </div>

      {/* Main split */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: isNarrow ? "column" : "row" }}>

        {/* Left/Top — project list */}
        <div
          ref={listRef}
          className="sunken-panel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={isNarrow ? {
            width: "100%",
            flexShrink: 0,
            overflowX: "auto",
            overflowY: "hidden",
            display: "flex",
            flexDirection: "row",
            margin: "4px 4px 0 4px",
            padding: 0,
            outline: "none",
          } : {
            width: 160,
            flexShrink: 0,
            overflowY: "auto",
            margin: "4px 0 4px 4px",
            padding: 0,
            outline: "none",
          }}
        >
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              onClick={() => { setSelected(p.id); setActiveShot(0); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: isNarrow ? "6px 10px" : "5px 8px",
                cursor: "default",
                fontSize: "8px",
                background: selected === p.id ? "#000080" : "transparent",
                color: selected === p.id ? "#fff" : "#000",
                userSelect: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>{p.icon}</span>
              <span style={{ lineHeight: 1.5 }}>{p.name}</span>
            </div>
          ))}
        </div>

        {/* Right — detail panel */}
        <div
          className="sunken-panel"
          style={{
            flex: 1,
            margin: "4px",
            padding: "10px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "28px", lineHeight: 1 }}>{project.icon}</span>
            <div>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>{project.name}</div>
              <span
                style={{
                  ...STATUS_STYLE[project.status],
                  fontSize: "7px",
                  padding: "2px 6px",
                  display: "inline-block",
                }}
              >
                {project.status}
              </span>
            </div>
          </div>

          <hr style={{ margin: 0, borderColor: "#808080" }} />

          {/* Description */}
          <div>
            <div style={{ fontSize: "7px", color: "#808080", marginBottom: "4px" }}>
              DESCRIPTION
            </div>
            <div style={{ fontSize: "8px", lineHeight: 1.8 }}>
              {project.description}
            </div>
          </div>

          {/* Tech */}
          <div>
            <div style={{ fontSize: "7px", color: "#808080", marginBottom: "6px" }}>
              TECH STACK
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="status-bar-field"
                  style={{ fontSize: "7px", padding: "2px 6px" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Link */}
          <div>
            <div style={{ fontSize: "7px", color: "#808080", marginBottom: "4px" }}>
              REPOSITORY
            </div>
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "8px", color: "#000080" }}
              >
                View on GitHub ↗
              </a>
            ) : (
              <span style={{ fontSize: "8px", color: "#808080" }}>
                🔒 Private / Internal
              </span>
            )}
          </div>

          {/* Screenshots */}
          {project.screenshots && project.screenshots.length > 0 && (() => {
            const shots = project.screenshots!;
            const current = shots[activeShot];
            return (
              <div>
                <div style={{ fontSize: "7px", color: "#808080", marginBottom: "6px" }}>
                  SCREENSHOTS ({activeShot + 1}/{shots.length})
                </div>

                {/* Main preview */}
                <div
                  className="sunken-panel"
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/10",
                    overflow: "hidden",
                    background: "#000",
                    marginBottom: "4px",
                    cursor: "zoom-in",
                  }}
                  onClick={() => setLightboxOpen(true)}
                >
                  <Image
                    src={current.src}
                    alt={current.caption}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 900px) 80vw, 600px"
                    quality={95}
                  />
                  {/* Prev / Next arrows */}
                  {activeShot > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveShot((i) => i - 1); }}
                      style={{
                        position: "absolute", left: 4, top: "50%",
                        transform: "translateY(-50%)",
                        background: "#c0c0c0", border: "2px outset #fff",
                        fontSize: "10px", cursor: "pointer", padding: "2px 6px",
                        fontFamily: "var(--win98-font)",
                      }}
                    >◀</button>
                  )}
                  {activeShot < shots.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveShot((i) => i + 1); }}
                      style={{
                        position: "absolute", right: 4, top: "50%",
                        transform: "translateY(-50%)",
                        background: "#c0c0c0", border: "2px outset #fff",
                        fontSize: "10px", cursor: "pointer", padding: "2px 6px",
                        fontFamily: "var(--win98-font)",
                      }}
                    >▶</button>
                  )}
                </div>

                {/* Caption bar */}
                <div
                  className="status-bar-field"
                  style={{ fontSize: "8px", padding: "2px 6px", marginBottom: "6px", textAlign: "center" }}
                >
                  {current.caption}
                </div>

                {/* Thumbnail strip */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {shots.map((s, i) => (
                    <div
                      key={s.src}
                      onClick={() => setActiveShot(i)}
                      style={{
                        position: "relative",
                        flex: 1,
                        aspectRatio: "16/10",
                        overflow: "hidden",
                        border: i === activeShot ? "2px solid #000080" : "2px outset #fff",
                        cursor: "pointer",
                        background: "#000",
                        opacity: i === activeShot ? 1 : 0.65,
                      }}
                    >
                      <Image
                        src={s.src}
                        alt={s.caption}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="120px"
                        quality={80}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Status bar */}
      <div
        className="status-bar"
        style={{ display: "flex", gap: "4px", padding: "2px 4px", flexShrink: 0 }}
      >
        <div className="status-bar-field" style={{ flex: 1 }}>
          {PROJECTS.indexOf(project) + 1} of {PROJECTS.length} projects
        </div>
        <div className="status-bar-field">{project.status}</div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && project.screenshots && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="window"
            style={{ maxWidth: "90vw", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="title-bar">
              <div className="title-bar-text" style={{ fontSize: "9px" }}>
                🖼️ {project.screenshots[activeShot].caption} ({activeShot + 1}/{project.screenshots.length})
              </div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setLightboxOpen(false)} />
              </div>
            </div>
            <div
              className="window-body"
              style={{ padding: "4px", display: "flex", flexDirection: "column", gap: "4px", ...FONT }}
            >
              <div
                style={{
                  position: "relative",
                  width: "min(85vw, 1100px)",
                  height: "min(75vh, 700px)",
                  background: "#000",
                }}
              >
                <Image
                  src={project.screenshots[activeShot].src}
                  alt={project.screenshots[activeShot].caption}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="90vw"
                  quality={100}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <button
                  style={{ fontSize: "8px", padding: "2px 10px", ...FONT }}
                  onClick={() => setActiveShot((i) => Math.max(i - 1, 0))}
                  disabled={activeShot === 0}
                >◀ Prev</button>
                <span style={{ fontSize: "8px", color: "#808080" }}>
                  {project.screenshots[activeShot].caption}
                </span>
                <button
                  style={{ fontSize: "8px", padding: "2px 10px", ...FONT }}
                  onClick={() => setActiveShot((i) => Math.min(i + 1, project.screenshots!.length - 1))}
                  disabled={activeShot === project.screenshots.length - 1}
                >Next ▶</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", paddingTop: "2px" }}>
                <button
                  style={{ ...FONT, fontSize: "10px", padding: "4px 24px", cursor: "pointer" }}
                  onClick={() => setLightboxOpen(false)}
                >✕ Close</button>
                <span style={{ fontSize: "7px", color: "#808080" }}>or tap outside to close</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
