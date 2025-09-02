"use client";

import { Play, Info } from "lucide-react";

const ProfileHero = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* 🎥 Fullscreen Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover brightness-70"
      >
        <source src="/manbythesea.mp4" type="video/mp4" />
      </video>

      {/* ✨ Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90"></div>

    

     
    </section>
  );
};

export default ProfileHero;
