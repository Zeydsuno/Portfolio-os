"use client";

import { useState } from "react";
import { useDesktopStore } from "@/features/desktop/store/desktop-store";
import { translations } from "@/features/i18n/dictionaries";

type Tab = "experience" | "education" | "skills" | "certificates";

const BASE_EXPERIENCES = [
  { company: "EuroScan Co., Ltd",          location: "Bangkok, Thailand", period: "Jun – Dec 2025" },
  { company: "iBotNoi Company Limited",     location: "Bangkok, Thailand", period: "Jan – Apr 2025" },
  { company: "EuroScan Co., Ltd",           location: "Bangkok, Thailand", period: "Jun – Jul 2023" },
];

export default function CVContent() {
  const [activeTab, setActiveTab] = useState<Tab>("experience");
  const { language } = useDesktopStore();
  const t = translations[language];
  const cv = t.cv;

  const TAB_LABELS: Record<Tab, string> = {
    experience:   cv.tabs.experience,
    education:    cv.tabs.education,
    skills:       cv.tabs.skills,
    certificates: cv.tabs.certificates,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "4px 8px 0", gap: "2px", flexWrap: "wrap" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { window.umami?.track("view_cv_tab", { tab }); setActiveTab(tab); }}
            style={{ fontSize: "9px", fontWeight: activeTab === tab ? "bold" : "normal" }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/file/Attidmese_Bunsua_CV.docx" download onClick={() => window.umami?.track("download_cv")} style={{ textDecoration: "none" }}>
          <button style={{ fontSize: "9px" }}>{cv.saveAs}</button>
        </a>
      </div>

      <hr style={{ margin: "4px 0 0" }} />

      {/* Content area */}
      <div style={{ padding: "8px", fontSize: "10px", lineHeight: "1.6", overflowY: "auto", flex: 1 }}>

        {activeTab === "experience" && (
          <div>
            {cv.experiences.map((exp, i) => {
              const base = BASE_EXPERIENCES[i];
              return (
                <div key={exp.title} style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <div style={{ width: "2px", backgroundColor: "#000080", flexShrink: 0, marginTop: "3px" }} />
                  <div>
                    <p><strong>{exp.title}</strong> — {base.company}</p>
                    <p style={{ color: "#555" }}>{base.location} | {base.period}</p>
                    <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                      {exp.bullets.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "education" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "2px", backgroundColor: "#000080", flexShrink: 0, marginTop: "3px" }} />
              <div>
                <p><strong>{cv.education.degree}</strong> — Mae Fah Luang University</p>
                <p style={{ color: "#555" }}>Bangkok, Thailand | Jun 2021 – Aug 2025</p>
                <p style={{ marginTop: "4px" }}>{cv.education.gpaLabel} <strong>3.29</strong></p>
              </div>
            </div>
            <hr style={{ margin: "8px 0" }} />
            <p style={{ marginBottom: "8px" }}><strong>{cv.education.langSection}</strong></p>
            <ul style={{ paddingLeft: "16px" }}>
              {cv.education.langList.map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "skills" && (
          <div>
            {cv.skills.map((group) => (
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
            {cv.certificates.map((cert) => (
              <li key={cert} style={{ marginBottom: "8px" }}>{cert}</li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}
