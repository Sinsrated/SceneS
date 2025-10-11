import type { Metadata } from "next";
import Script from "next/script"; // ✅ This makes external scripts safe
import "./globals.css";

export const metadata: Metadata = {
  title: "Kyogobe Watch",
  description: "watch free movies and tv shows online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ This is the SAME AdSense code you pasted, just wrapped in Next's Script */}
        <Script
          async
          strategy="beforeInteractive" // ensures it loads before the app hydrates
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7832995803894398"
          crossOrigin="anonymous"
        />
      </head>

      <body className="antialiased font-sans">
        <main>{children}</main>
      </body>
    </html>
  );
}
