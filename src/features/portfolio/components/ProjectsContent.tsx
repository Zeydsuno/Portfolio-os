"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
  icon: string;
  description: string;
  tech: string[];
  status: "Live" | "Deployed" | "MVP" | "In Progress";
  link?: string;
}

const PROJECTS: Project[] = [
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
  {
    id: "fridge",
    name: "MyFidgeBot",
    icon: "🍱",
    description: "Smart home ingredient manager with Thai NLP, recipe suggestions, and LINE Bot integration.",
    tech: ["FastAPI", "Supabase", "LINE API", "SCT-KD"],
    status: "MVP",
    link: "https://github.com/Zeydsuno/MyFidgeBot",
  },
  {
    id: "euroscan",
    name: "EuroScan Warranty ERP",
    icon: "🏭",
    description: "QR-based warranty management ERP with PDF/QR generation, Google Calendar integration, deployed as Electron desktop app.",
    tech: ["Vue.js", "Node.js", "MySQL", "Electron"],
    status: "Deployed",
  },
];

const STATUS_STYLE: Record<Project["status"], React.CSSProperties> = {
  Live:        { background: "#008000", color: "#fff" },
  Deployed:    { background: "#000080", color: "#fff" },
  MVP:         { background: "#808000", color: "#fff" },
  "In Progress": { background: "#808080", color: "#fff" },
};

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

export default function ProjectsContent() {
  const [selected, setSelected] = useState<string>(PROJECTS[0].id);
  const project = PROJECTS.find((p) => p.id === selected) ?? PROJECTS[0];

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
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Left — project list */}
        <div
          className="sunken-panel"
          style={{
            width: 160,
            flexShrink: 0,
            overflowY: "auto",
            margin: "4px 0 4px 4px",
            padding: 0,
          }}
        >
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 8px",
                cursor: "default",
                fontSize: "8px",
                background: selected === p.id ? "#000080" : "transparent",
                color: selected === p.id ? "#fff" : "#000",
                userSelect: "none",
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
          {project.link && (
            <div>
              <div style={{ fontSize: "7px", color: "#808080", marginBottom: "4px" }}>
                REPOSITORY
              </div>
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "8px", color: "#000080" }}
              >
                View on GitHub ↗
              </a>
            </div>
          )}
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
    </div>
  );
}
