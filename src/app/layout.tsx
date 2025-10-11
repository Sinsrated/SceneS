import type { Metadata } from "next";
import Script from "next/script"; // ✅ Import next/script
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        {/* ✅ Load Google AdSense asynchronously and safely */}
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7832995803894398"
          crossOrigin="anonymous"
        />

        <main>{children}</main>
      </body>
    </html>
  );
}
