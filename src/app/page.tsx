"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 1000); // wait a bit so user sees the video before redirect
    return () => clearTimeout(timer);
  }, [router]);

  
}
