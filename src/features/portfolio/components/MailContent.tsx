"use client";

import { useState } from "react";
import { useDesktopStore } from "@/features/desktop/store/desktop-store";
import { translations } from "@/features/i18n/dictionaries";

type SendStatus = "idle" | "sending" | "sent" | "error";

export default function MailContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [honeypot, setHoneypot] = useState("");

  const { language } = useDesktopStore();
  const t = translations[language].mail;

  async function handleSend() {
    if (!name.trim() || !email.trim() || !body.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message: body, website: honeypot }),
      });
      if (res.ok) { window.umami?.track("contact_sent"); setStatus("sent"); } else { setStatus("error"); }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ padding: "8px", fontSize: "10px", textAlign: "center", marginTop: "24px" }}>
        <div style={{ fontSize: "24px", marginBottom: "12px" }}>📨</div>
        <p style={{ marginBottom: "8px" }}>
          <strong>{t.sent}</strong>
        </p>
        <p style={{ color: "#808080" }}>{t.sentSubtext}</p>
        <div className="field-row" style={{ justifyContent: "center", marginTop: "16px" }}>
          <button onClick={() => { setName(""); setEmail(""); setSubject(""); setBody(""); setStatus("idle"); }}>
            {t.sendAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px", fontSize: "10px" }}>
      <p style={{ marginBottom: "12px" }}>
        <strong>{t.title}</strong>
      </p>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
      />
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-to">{t.labelTo}</label>
        <input id="mail-to" type="text" defaultValue="Attidmese B. (Portfolio)" readOnly />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-name">{t.labelName}</label>
        <input
          id="mail-name"
          type="text"
          placeholder={t.placeholderName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-email">{t.labelEmail}</label>
        <input
          id="mail-email"
          type="email"
          placeholder={t.placeholderEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-subject">{t.labelSubject}</label>
        <input
          id="mail-subject"
          type="text"
          placeholder={t.placeholderSubject}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-body">{t.labelMessage}</label>
        <textarea
          id="mail-body"
          rows={5}
          placeholder={t.placeholderMessage}
          style={{ width: "100%", resize: "vertical" }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      {status === "error" && (
        <p style={{ color: "#800000", marginBottom: "8px", fontSize: "9px" }}>
          {t.errorMessage}
        </p>
      )}
      <div className="field-row" style={{ justifyContent: "flex-end" }}>
        <button
          onClick={handleSend}
          disabled={status === "sending" || !name.trim() || !email.trim() || !body.trim()}
        >
          {status === "sending" ? t.sending : t.send}
        </button>
      </div>
    </div>
  );
}
