"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/loading");
    }, 1000); // wait a bit so user sees the video before redirect
    return () => clearTimeout(timer);
  }, [router]);

  // return (
    // <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Video */}
      {/* <video */}
        {/* autoPlay */}
        {/* muted */}
        {/* loop */}
        {/* playsInline */}
        {/* className="absolute inset-0 w-full h-full object-cover" */}
      {/* > */}
        {/* <source src="./web.mp4" type="video/mp4" /> */}
        {/* Your browser does not support the video tag. */}
      {/* </video> */}

      {/* Overlay (dark gradient for readability) */}
      // <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        // <h1 className="text-white text-3xl sm:text-5xl font-bold drop-shadow-lg animate-pulse">
          {/* SCENECS */}
        {/* </h1> */}
      // </div>
    // </div>
  // );
}
