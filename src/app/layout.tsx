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
      <body className="antialiased">
        {/* Floating Apple-style toggle in the top-right */}
        {/* <div className="fixed top-2 left-22 z-50">
          <ThemeToggle />
        </div> */}
        <main>{children}</main>
      </body>
    </html>
  );
}
