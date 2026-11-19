import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CultureTrack - Cultural Diary",
  description: "Your mobile-first cultural journal to log movies, books, theater, and exhibitions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}