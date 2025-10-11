"use client";
import Script from "next/script";

export default function AdSenseScript() {
  return (
    <Script
      async
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7832995803894398"
      crossOrigin="anonymous"
    />
  );
}
