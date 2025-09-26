"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // adds `class="dark"` to <html>
      defaultTheme="system" // uses system preference by default
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
