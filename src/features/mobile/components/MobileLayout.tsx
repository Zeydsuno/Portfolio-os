"use client";

import ReadmeContent from "@/features/portfolio/components/ReadmeContent";
import ProjectsContent from "@/features/portfolio/components/ProjectsContent";
import MailContent from "@/features/portfolio/components/MailContent";

interface MobileSection {
  title: string;
  content: React.ReactNode;
}

const SECTIONS: MobileSection[] = [
  { title: "About Me", content: <ReadmeContent /> },
  { title: "Projects", content: <ProjectsContent /> },
  { title: "Contact", content: <MailContent /> },
];

export default function MobileLayout() {
  return (
    <div
      className="min-h-screen p-4 space-y-4"
      style={{ backgroundColor: "#008080" }}
    >
      <h1
        className="text-white text-center py-4"
        style={{ fontSize: "14px", textShadow: "2px 2px 0 #000" }}
      >
        My Portfolio
      </h1>
      {SECTIONS.map((section) => (
        <div key={section.title} className="window">
          <div className="title-bar">
            <div className="title-bar-text">{section.title}</div>
          </div>
          <div className="window-body">{section.content}</div>
        </div>
      ))}
    </div>
  );
}
