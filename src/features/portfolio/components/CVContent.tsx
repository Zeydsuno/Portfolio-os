"use client";

import { useState } from "react";

type Tab = "experience" | "education" | "skills" | "certificates";

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

interface SkillGroup {
  category: string;
  items: string[];
}

const EXPERIENCES: Experience[] = [
  {
    title: "Full-Stack Developer (Freelance)",
    company: "EuroScan Co., Ltd",
    location: "Bangkok, Thailand",
    period: "Jun – Dec 2025",
    bullets: [
      "Built QR-based Warranty Management ERP using Vue.js, Node.js, MySQL",
      "Deployed as Electron desktop app — cut manual input by 50%",
      "PDF/QR generation and Google Calendar integration",
    ],
  },
  {
    title: "AI Engineer (Intern)",
    company: "iBotNoi Company Limited",
    location: "Bangkok, Thailand",
    period: "Jan – Apr 2025",
    bullets: [
      "Developed AI video/audio summarization platform using PyTorch, LangChain, FastAPI",
      "Built backend APIs and Vue.js dashboards with Supabase integration",
      "Enhanced UX with real-time previews, drag-drop uploads, and ASR benchmarking",
    ],
  },
  {
    title: "IT Support & LINE Developer",
    company: "EuroScan Co., Ltd",
    location: "Bangkok, Thailand",
    period: "Jun – Jul 2023",
    bullets: [
      "Built LINE Chatbot automating medical equipment data retrieval",
      "Reduced manual data lookup by 80%, response times by 40%",
    ],
  },
];

const SKILLS: SkillGroup[] = [
  { category: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL"] },
  { category: "Frameworks", items: ["FastAPI", "Flask", "Vue.js", "Express.js", "PyTorch", "LangChain"] },
  { category: "Tools", items: ["Git", "Docker", "Electron", "GitLab CI", "Jest", "LINE API", "Cloudflare Tunnel"] },
  { category: "Platforms", items: ["MySQL", "MongoDB", "Supabase", "Google Cloud"] },
  { category: "Soft Skills", items: ["Problem-Solving", "Communication", "Time Management", "Adaptability", "Team Collaboration"] },
];

const CERTIFICATES: string[] = [
  "Artificial Intelligence Summer Program — Taiwan",
  "Foundations of Cybersecurity — Google",
  "Google AI Essentials — Google",
  "Prompt Engineering for ChatGPT — Vanderbilt University",
];

const TAB_LABELS: Record<Tab, string> = {
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certificates: "Certificates",
};

export default function CVContent() {
  const [activeTab, setActiveTab] = useState<Tab>("experience");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "4px 8px 0", gap: "2px", flexWrap: "wrap" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ fontSize: "9px", fontWeight: activeTab === tab ? "bold" : "normal" }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/Attidmese_Bunsua_CV.pdf" download style={{ textDecoration: "none" }}>
          <button style={{ fontSize: "9px" }}>Save As...</button>
        </a>
      </div>

      <hr style={{ margin: "4px 0 0" }} />

      {/* Content area */}
      <div style={{ padding: "8px", fontSize: "10px", lineHeight: "1.6", overflowY: "auto", flex: 1 }}>

        {activeTab === "experience" && (
          <div>
            {EXPERIENCES.map((exp) => (
              <div key={exp.title} style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                <div style={{ width: "2px", backgroundColor: "#000080", flexShrink: 0, marginTop: "3px" }} />
                <div>
                  <p><strong>{exp.title}</strong> — {exp.company}</p>
                  <p style={{ color: "#555" }}>{exp.location} | {exp.period}</p>
                  <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                    {exp.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "education" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "2px", backgroundColor: "#000080", flexShrink: 0, marginTop: "3px" }} />
              <div>
                <p><strong>Bachelor of Software Engineering</strong> — Mae Fah Luang University</p>
                <p style={{ color: "#555" }}>Bangkok, Thailand | Jun 2021 – Aug 2025</p>
                <p style={{ marginTop: "4px" }}>GPA: <strong>3.29</strong></p>
              </div>
            </div>
            <hr style={{ margin: "8px 0" }} />
            <p style={{ marginBottom: "8px" }}><strong>LANGUAGES</strong></p>
            <ul style={{ paddingLeft: "16px" }}>
              <li>English — Intermediate (CEFR B1)</li>
              <li>Thai — Native</li>
            </ul>
          </div>
        )}

        {activeTab === "skills" && (
          <div>
            {SKILLS.map((group) => (
              <div key={group.category} style={{ marginBottom: "12px" }}>
                <p style={{ marginBottom: "4px" }}><strong>{group.category}</strong></p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="status-bar-field"
                      style={{ fontSize: "9px", padding: "1px 6px" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "certificates" && (
          <ul style={{ paddingLeft: "16px" }}>
            {CERTIFICATES.map((cert) => (
              <li key={cert} style={{ marginBottom: "8px" }}>{cert}</li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}
