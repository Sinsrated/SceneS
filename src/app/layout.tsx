import type { Metadata } from "next";
import Script from "next/script";
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
        {/* ✅ Put AdSense script in <head> */}
        <Script
          id="adsense-init"
          async
          strategy="beforeInteractive" // loads before hydration
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
