"use client";

export default function MailContent() {
  return (
    <div style={{ padding: "8px", fontSize: "10px" }}>
      <p style={{ marginBottom: "12px" }}>
        <strong>Send me a message!</strong>
      </p>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-to">To:</label>
        <input id="mail-to" type="text" defaultValue="hello@example.com" readOnly />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-subject">Subject:</label>
        <input id="mail-subject" type="text" placeholder="Your subject..." />
      </div>
      <div className="field-row-stacked" style={{ marginBottom: "8px" }}>
        <label htmlFor="mail-body">Message:</label>
        <textarea
          id="mail-body"
          rows={5}
          placeholder="Write your message here..."
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>
      <div className="field-row" style={{ justifyContent: "flex-end" }}>
        <button>Send</button>
      </div>
    </div>
  );
}
