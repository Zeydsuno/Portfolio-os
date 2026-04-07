"use client";

interface Project {
  name: string;
  description: string;
  tech: string;
}

const PROJECTS: Project[] = [
  {
    name: "Portfolio OS",
    description: "This Windows 98-style interactive portfolio",
    tech: "Next.js, TypeScript, 98.css",
  },
  {
    name: "Project Alpha",
    description: "A full-stack web application",
    tech: "React, Node.js, PostgreSQL",
  },
  {
    name: "Project Beta",
    description: "Mobile-first responsive dashboard",
    tech: "React Native, Firebase",
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
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
