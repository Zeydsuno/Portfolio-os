"use client";

import { useState, useEffect } from "react";

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

const PAGES = [
  { url: "https://github.com/Zeydsuno", label: "GitHub" },
  { url: "https://www.linkedin.com/in/attidmese-bunsua-a7952623b", label: "LinkedIn" },
  { url: "about:portfolio", label: "Portfolio" },
];

export default function IEContent() {
  const [pageIdx, setPageIdx] = useState(0);
  const [addressBar, setAddressBar] = useState(PAGES[0].url);
  const [displayedUrl, setDisplayedUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Typewriter effect for address bar on page change
  useEffect(() => {
    const url = PAGES[pageIdx].url;
    setLoading(true);
    setDisplayedUrl("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedUrl(url.slice(0, i));
      if (i >= url.length) {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 400);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [pageIdx]);

  function navigate() {
    const idx = PAGES.findIndex((p) => p.url === addressBar);
    if (idx !== -1) setPageIdx(idx);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", ...FONT }}>
      {/* IE Toolbar */}
      <div style={{
        borderBottom: "1px solid #808080",
        background: "#c0c0c0",
        padding: "2px 4px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flexShrink: 0,
      }}>
        {/* Nav buttons */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <button
            style={{ fontSize: "7px", padding: "1px 6px" }}
            disabled={pageIdx === 0}
            onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
          >◀ Back</button>
          <button
            style={{ fontSize: "7px", padding: "1px 6px" }}
            disabled={pageIdx === PAGES.length - 1}
            onClick={() => setPageIdx((p) => Math.min(PAGES.length - 1, p + 1))}
          >Fwd ▶</button>
          <button style={{ fontSize: "7px", padding: "1px 6px" }} onClick={() => setPageIdx(0)}>
            🏠
          </button>
          <div style={{ width: "1px", height: "16px", background: "#808080", margin: "0 2px" }} />
          <span style={{ fontSize: "7px", color: loading ? "#800000" : "#008000" }}>
            {loading ? "⏳ Loading..." : "✓ Done"}
          </span>
        </div>

        {/* Address bar */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <span style={{ fontSize: "7px", whiteSpace: "nowrap" }}>Address:</span>
          <input
            type="text"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") navigate(); }}
            style={{ flex: 1, fontSize: "8px", ...FONT }}
          />
          <button style={{ fontSize: "7px", padding: "1px 6px" }} onClick={navigate}>Go</button>
        </div>
      </div>

      {/* Page content */}
      <div
        className="sunken-panel"
        style={{ flex: 1, margin: "4px", padding: "12px", overflowY: "auto", background: "#fff" }}
      >
        {loading ? (
          <div style={{ fontSize: "8px", color: "#808080", textAlign: "center", marginTop: "40px" }}>
            <div style={{ marginBottom: "12px" }}>🌐</div>
            <div>Connecting to {displayedUrl}</div>
          </div>
        ) : pageIdx === 0 ? (
          <GithubPage />
        ) : pageIdx === 1 ? (
          <LinkedInPage />
        ) : (
          <PortfolioPage />
        )}
      </div>

      {/* Status bar */}
      <div className="status-bar" style={{ padding: "2px 4px", flexShrink: 0 }}>
        <div className="status-bar-field" style={{ flex: 1, fontSize: "7px" }}>
          {PAGES[pageIdx].url}
        </div>
        <div className="status-bar-field" style={{ fontSize: "7px" }}>Internet zone</div>
      </div>
    </div>
  );
}

function GithubPage() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", borderBottom: "2px solid #ccc", paddingBottom: "12px" }}>
        <span style={{ fontSize: "40px" }}>🐙</span>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Zeydsuno</div>
          <div style={{ color: "#666", fontSize: "11px" }}>Attidmese Bunsua</div>
        </div>
      </div>
      <div style={{ marginBottom: "12px", fontSize: "11px", color: "#444" }}>
        Software Engineer · Full-stack + AI · Mae Fah Luang University
      </div>
      <hr style={{ marginBottom: "12px" }} />
      <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "8px" }}>📦 Repositories</div>
      {[
        { name: "Portfolio OS", desc: "Win98 interactive portfolio", lang: "TypeScript", url: "https://github.com/Zeydsuno/portfolio" },
        { name: "AI Job Matching", desc: "AI-powered job matching for Thailand market", lang: "Python", url: null },
        { name: "STOCKNEWS", desc: "Real-time stock news AI scoring via LINE", lang: "Python", url: "https://github.com/Zeydsuno/STOCKNEWS" },
        { name: "Family Business ERP", desc: "ERP for family food business — inventory, finance, kiosk & mobile", lang: "TypeScript", url: null },
      ].map((r) => {
        const inner = (
          <>
            <div style={{ color: r.url ? "#0000EE" : "#666", textDecoration: r.url ? "underline" : "none", fontWeight: "bold", fontSize: "11px" }}>{r.name}</div>
            <div style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>{r.desc}</div>
            <div style={{ fontSize: "10px", marginTop: "4px" }}>⬤ {r.lang}{!r.url && <span style={{ color: "#999", marginLeft: "8px" }}>🔒 Private</span>}</div>
          </>
        );
        return r.url ? (
          <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
            style={{ display: "block", marginBottom: "8px", padding: "6px", border: "1px solid #ddd", borderRadius: "4px", textDecoration: "none" }}>
            {inner}
          </a>
        ) : (
          <div key={r.name} style={{ display: "block", marginBottom: "8px", padding: "6px", border: "1px solid #ddd", borderRadius: "4px" }}>
            {inner}
          </div>
        );
      })}
      <div style={{ marginTop: "12px" }}>
        <a
          href="https://github.com/Zeydsuno"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#0000EE", fontSize: "11px" }}
        >
          → View full profile on GitHub ↗
        </a>
      </div>
    </div>
  );
}

function LinkedInPage() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", borderBottom: "2px solid #0077B5", paddingBottom: "12px" }}>
        <div style={{ width: "48px", height: "48px", background: "#0077B5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#fff" }}>
          in
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Attidmese Bunsua</div>
          <div style={{ color: "#666", fontSize: "11px" }}>Software Engineer</div>
        </div>
      </div>
      <div style={{ fontSize: "11px", marginBottom: "12px" }}>
        <strong>Summary:</strong> Full-stack developer specializing in AI integration, ERP systems, and chatbots. Graduated from Mae Fah Luang University (GPA 3.29).
      </div>
      <hr style={{ marginBottom: "12px" }} />
      <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "8px" }}>💼 Experience</div>
      {[
        { title: "Full-Stack Developer (Freelance)", company: "EuroScan Co., Ltd", period: "Jun – Dec 2025", desc: "QR-based warranty ERP · Vue.js, Node.js, MySQL, Electron" },
        { title: "AI Engineer (Intern)", company: "iBotNoi Company Limited", period: "Jan – Apr 2025", desc: "AI video/audio summarization platform · PyTorch, LangChain, FastAPI" },
        { title: "IT Support & LINE Developer", company: "EuroScan Co., Ltd", period: "Jun – Jul 2023", desc: "LINE Chatbot for medical equipment data retrieval" },
      ].map((exp) => (
        <div key={exp.title} style={{ fontSize: "10px", color: "#444", marginBottom: "10px", paddingLeft: "8px", borderLeft: "2px solid #0077B5" }}>
          <div style={{ fontWeight: "bold", color: "#000" }}>{exp.title}</div>
          <div style={{ color: "#0077B5" }}>{exp.company} · {exp.period}</div>
          <div style={{ color: "#666", marginTop: "2px" }}>{exp.desc}</div>
        </div>
      ))}
      <div style={{ marginTop: "12px" }}>
        <a
          href="https://www.linkedin.com/in/attidmese-bunsua-a7952623b"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#0000EE", fontSize: "11px" }}
        >
          → View full profile on LinkedIn ↗
        </a>
      </div>
    </div>
  );
}

function PortfolioPage() {
  const skills = ["Next.js", "TypeScript", "Python", "FastAPI", "Vue.js", "PyTorch", "LangChain", "Docker"];
  const projects = [
    { name: "Portfolio OS", desc: "Win98-style interactive portfolio", status: "Live" },
    { name: "AI Job Matching", desc: "NLP job matching for Thailand market", status: "In Progress" },
    { name: "Stock News Dashboard", desc: "AI-scored news via LINE Mini App", status: "MVP" },
    { name: "Family Business ERP", desc: "Production ERP — inventory, finance, kiosk & mobile", status: "Deployed" },
    { name: "EuroScan ERP", desc: "QR warranty management, Electron app", status: "Deployed" },
  ];
  const statusColor: Record<string, string> = {
    Live: "#008000", "In Progress": "#808080", MVP: "#808000", Deployed: "#000080",
  };
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: "12px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#000080,#1084d0)", color: "#fff", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "32px" }}>🖥️</span>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Attidmese Bunsua</div>
          <div style={{ fontSize: "11px", opacity: 0.85 }}>Software Engineer · Full-stack + AI</div>
        </div>
      </div>

      {/* About */}
      <div style={{ marginBottom: "14px", fontSize: "11px", color: "#444", lineHeight: "1.6" }}>
        Full-stack developer specializing in AI integration, ERP systems, and chatbots. Graduated from Mae Fah Luang University (GPA 3.29). Passionate about building things that work and look great.
      </div>

      <hr style={{ marginBottom: "12px" }} />

      {/* Skills */}
      <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "8px" }}>🛠 Skills</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {skills.map((s) => (
          <span key={s} style={{ background: "#e8e8e8", border: "1px solid #ccc", padding: "2px 8px", fontSize: "10px", borderRadius: "2px" }}>{s}</span>
        ))}
      </div>

      <hr style={{ marginBottom: "12px" }} />

      {/* Projects */}
      <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "8px" }}>📦 Projects</div>
      {projects.map((p) => (
        <div key={p.name} style={{ marginBottom: "8px", padding: "6px 8px", border: "1px solid #ddd", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "11px" }}>{p.name}</div>
            <div style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>{p.desc}</div>
          </div>
          <span style={{ background: statusColor[p.status] ?? "#808080", color: "#fff", fontSize: "9px", padding: "2px 6px", whiteSpace: "nowrap" }}>{p.status}</span>
        </div>
      ))}

      <hr style={{ margin: "12px 0" }} />

      {/* Links */}
      <div style={{ display: "flex", gap: "16px", fontSize: "11px" }}>
        <a href="https://github.com/Zeydsuno" target="_blank" rel="noreferrer" style={{ color: "#0000EE" }}>🐙 GitHub ↗</a>
        <a href="https://www.linkedin.com/in/attidmese-bunsua-a7952623b" target="_blank" rel="noreferrer" style={{ color: "#0000EE" }}>💼 LinkedIn ↗</a>
      </div>
    </div>
  );
}
