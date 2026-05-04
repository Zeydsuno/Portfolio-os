import type { Metadata } from "next";
import { headers } from "next/headers";
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
      <body>{children}</body>
    </html>
  );
}
