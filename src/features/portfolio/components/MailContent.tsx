"use client";

import { useState } from "react";

export default function MailContent() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function handleSend() {
    const to = "Attidmese.bunsua@gmail.com";
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
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
        <label htmlFor="mail-subject">Subject:</label>
        <input
          id="mail-subject"
          type="text"
          placeholder="Your subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-body">Message:</label>
        <textarea
          id="mail-body"
          rows={5}
          placeholder="Write your message here..."
          style={{ width: "100%", resize: "vertical" }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="field-row" style={{ justifyContent: "flex-end" }}>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
