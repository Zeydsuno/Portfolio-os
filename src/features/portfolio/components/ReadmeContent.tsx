"use client";

import { useDesktopStore } from "@/features/desktop/store/desktop-store";
import { translations } from "@/features/i18n/dictionaries";

export default function ReadmeContent() {
  const { language } = useDesktopStore();
  const t = translations[language as keyof typeof translations].readme;
  return (
    <div style={{ padding: "8px", fontSize: "10px", lineHeight: "1.8" }}>
      <p style={{ marginBottom: "12px" }}>
        <strong>{t.title}</strong>
      </p>
      <p style={{ marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: t.p1 }} />
      <p style={{ marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: t.p2 }} />
      <p style={{ marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: t.p3 }} />
      <hr style={{ margin: "12px 0" }} />
      <p style={{ marginBottom: "4px" }}>
        <strong>{t.languages}</strong> Python, TypeScript, JavaScript, SQL
      </p>
      <p style={{ marginBottom: "4px" }}>
        <strong>{t.frameworks}</strong> Next.js, FastAPI, Flask, Vue.js, Express.js, PyTorch, LangChain
      </p>
      <p style={{ marginBottom: "4px" }}>
        <strong>{t.tools}</strong> Git, Docker, Electron, GitLab CI, Jest, LINE API
      </p>
      <p style={{ marginBottom: "4px" }}>
        <strong>{t.platforms}</strong> MongoDB, MySQL, Supabase, Google Cloud
      </p>
      <hr style={{ margin: "12px 0" }} />
      <p style={{ marginBottom: "4px" }}>
        <strong>GitHub:</strong>{" "}
        <a href="https://github.com/Zeydsuno" target="_blank" rel="noreferrer" onClick={() => window.umami?.track("click_social", { platform: "github" })}>
          github.com/Zeydsuno
        </a>
      </p>
      <p>
        <strong>LinkedIn:</strong>{" "}
        <a href="https://www.linkedin.com/in/attidmese-bunsua-a7952623b" target="_blank" rel="noreferrer" onClick={() => window.umami?.track("click_social", { platform: "linkedin" })}>
          Attidmese Bunsua
        </a>
      </p>
    </div>
  );
}
