import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "98.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeyd-OS",
  description: "Interactive Windows 98-style OS portfolio by Attidmese Bunsua",
  openGraph: {
    title: "Zeyd-OS",
    description: "Interactive Windows 98-style OS portfolio by Attidmese Bunsua",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zeyd-OS",
    description: "Interactive Windows 98-style OS portfolio by Attidmese Bunsua",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await headers();
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <Script
          src={process.env.NEXT_PUBLIC_UMAMI_SRC!}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID!}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
