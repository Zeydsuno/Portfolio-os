"use client";

import { useState } from "react";

type SendStatus = "idle" | "sending" | "sent" | "error";

export default function MailContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");

  async function handleSend() {
    if (!name.trim() || !email.trim() || !body.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message: body }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ padding: "8px", fontSize: "10px", textAlign: "center", marginTop: "24px" }}>
        <div style={{ fontSize: "24px", marginBottom: "12px" }}>📨</div>
        <p style={{ marginBottom: "8px" }}>
          <strong>Message sent!</strong>
        </p>
        <p style={{ color: "#808080" }}>I&apos;ll get back to you soon.</p>
        <div className="field-row" style={{ justifyContent: "center", marginTop: "16px" }}>
          <button onClick={() => { setName(""); setEmail(""); setSubject(""); setBody(""); setStatus("idle"); }}>
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px", fontSize: "10px" }}>
      <p style={{ marginBottom: "12px" }}>
        <strong>Send me a message!</strong>
      </p>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-to">To:</label>
        <input id="mail-to" type="text" defaultValue="Attidmese.bunsua@gmail.com" readOnly />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-name">Your Name: *</label>
        <input
          id="mail-name"
          type="text"
          placeholder="Your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-email">Your Email: *</label>
        <input
          id="mail-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-subject">Subject:</label>
        <input
          id="mail-subject"
          type="text"
          placeholder="Your subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-body">Message: *</label>
        <textarea
          id="mail-body"
          rows={5}
          placeholder="Write your message here..."
          style={{ width: "100%", resize: "vertical" }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={status === "sending"}
        />
      </div>
      {status === "error" && (
        <p style={{ color: "#800000", marginBottom: "8px", fontSize: "9px" }}>
          ⚠ Failed to send. Please try again.
        </p>
      )}
      <div className="field-row" style={{ justifyContent: "flex-end" }}>
        <button
          onClick={handleSend}
          disabled={status === "sending" || !name.trim() || !email.trim() || !body.trim()}
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
