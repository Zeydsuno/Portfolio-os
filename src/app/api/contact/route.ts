import { NextRequest } from "next/server";

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

interface ContactBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Body size check
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10_000) {
    return Response.json({ error: "Request too large" }, { status: 413 });
  }

  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    (subject !== undefined && typeof subject !== "string")
  ) {
    return Response.json({ error: "Invalid field types" }, { status: 400 });
  }

  if (name.length > MAX_LENGTHS.name) {
    return Response.json(
      { error: `Name must be ${MAX_LENGTHS.name} characters or fewer` },
      { status: 400 }
    );
  }
  if (email.length > MAX_LENGTHS.email) {
    return Response.json(
      { error: `Email must be ${MAX_LENGTHS.email} characters or fewer` },
      { status: 400 }
    );
  }
  if (subject && subject.length > MAX_LENGTHS.subject) {
    return Response.json(
      { error: `Subject must be ${MAX_LENGTHS.subject} characters or fewer` },
      { status: 400 }
    );
  }
  if (message.length > MAX_LENGTHS.message) {
    return Response.json(
      { error: `Message must be ${MAX_LENGTHS.message} characters or fewer` },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;
  if (!apiKey || !contactEmail) {
    return Response.json(
      { error: "Mail service not configured" },
      { status: 503 }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: contactEmail,
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
