"use client";

interface Project {
  name: string;
  description: string;
  tech: string;
  status: string;
  link?: string;
}

const PROJECTS: Project[] = [
  {
    name: "Portfolio OS",
    description: "Windows 98-style interactive portfolio",
    tech: "Next.js, TypeScript, 98.css",
    status: "Live",
  },
  {
    name: "AI Job Matching System",
    description: "AI-powered job matching for Thailand market with NLP skill extraction and embeddings-based ranking",
    tech: "Python, FastAPI, E5/JobBERT, Google Sheets",
    status: "In Progress",
  },
  {
    name: "Stock News Dashboard",
    description: "Real-time stock news analysis platform with AI impact scoring via LINE Mini App",
    tech: "Flask, LIFF, GLM-4.6, NewsAPI, Cloudflare Tunnel",
    status: "MVP",
    link: "https://github.com/Zeydsuno/STOCKNEWS",
  },
  {
    name: "MyFidgeBot",
    description: "Smart home ingredient manager with Thai NLP, recipe suggestions, and LINE Bot integration",
    tech: "FastAPI, Supabase, LINE API, SCT-KD",
    status: "MVP",
    link: "https://github.com/Zeydsuno/MyFidgeBot",
  },
  {
    name: "EuroScan Warranty ERP",
    description: "QR-based warranty management system with PDF/QR generation and Google Calendar integration",
    tech: "Vue.js, Node.js, MySQL, Electron",
    status: "Deployed",
  },
];

export default function ProjectsContent() {
  return (
    <div style={{ padding: "8px", fontSize: "10px" }}>
      <div className="sunken-panel" style={{ width: "100%" }}>
        <table className="interactive" style={{ width: "100%", fontSize: "9px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Tech</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => (
              <tr key={p.name}>
                <td>
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer">{p.name}</a>
                  ) : (
                    p.name
                  )}
                </td>
                <td>{p.description}</td>
                <td>{p.tech}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
