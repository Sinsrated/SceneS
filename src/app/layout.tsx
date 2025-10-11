import type { Metadata } from "next";
import Script from "next/script"; // ✅ This makes external scripts safe
import "./globals.css";
import AdSenseScript from "./components/AdSenseScript";

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
     

      <body className="antialiased font-sans">
       {children}
       <AdSenseScript />
      </body>
    </html>
  );
}
