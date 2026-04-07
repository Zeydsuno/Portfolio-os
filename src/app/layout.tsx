import type { Metadata } from "next";
import "98.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio — Windows 98",
  description: "Interactive portfolio with a Windows 98 desktop experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
