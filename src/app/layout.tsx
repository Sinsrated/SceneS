import type { Metadata } from "next";
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
      <body className="antialiased, font-sans">
       <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7832995803894398"
     crossorigin="anonymous"></script>
        <main>{children}</main>
      </body>
    </html>
  );
}
