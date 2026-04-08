import { NextRequest } from "next/server";

interface ContactBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ContactBody;
  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Mail service not configured" }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "Attidmese.bunsua@gmail.com",
      reply_to: email,
      subject: subject || `[Portfolio] Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
