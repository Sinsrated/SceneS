"use client";

import { Play, Info, User } from "lucide-react";

const ProfileHero = () => {
  return (
    <section className="relative w-full h-[75vh] overflow-hidden">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover brightness-50 contrast-125 saturate-125"
      >
        <source src="/manbythesea.mp4" type="video/mp4" />
      </video>

      {/* 🌌 Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#1a1a1a]/50 to-[#0a0a0a]/90" />

      {/* 🚀 Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d6d] via-[#ffb86c] to-[#7f5af0] drop-shadow-[0_0_15px_rgba(255,77,109,0.7)] animate-fade-in">
          Welcome, <span className="text-white">Cinephile</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed drop-shadow-lg">
          Your 2028 cinematic hub — AI-powered recommendations, immersive trailers, holographic previews, and personalized watchlists.
        </p>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#ff4d6d] to-[#7f5af0] hover:from-[#ff2a4a] hover:to-[#5e3dd4] text-white font-semibold rounded-3xl shadow-[0_0_25px_rgba(255,77,109,0.6)] transition-all transform hover:scale-105">
            <Play size={20} /> Watch Trailer
          </button>
          <button className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-3xl border border-white/20 transition-all transform hover:scale-105">
            <Info size={20} /> More Info
          </button>
        </div>
      </div>

      {/* 🔮 Floating Neon Glass Cards */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex gap-6">
        <div className="w-44 h-28 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl flex flex-col items-center justify-center text-white text-sm animate-slide-up">
          <User size={24} className="mb-2 text-red-400" />
          <span>Your Watchlist</span>
        </div>
        <div className="w-44 h-28 bg-gradient-to-r from-[#ff4d6d]/30 to-[#7f5af0]/30 backdrop-blur-lg border border-white/20 rounded-3xl flex flex-col items-center justify-center text-white text-sm animate-slide-up delay-150">
          <span className="mb-2">Trending Now</span>
        </div>
        <div className="w-44 h-28 bg-gradient-to-r from-[#4df3ff]/20 to-[#7f5af0]/20 backdrop-blur-lg border border-white/20 rounded-3xl flex flex-col items-center justify-center text-white text-sm animate-slide-up delay-300">
          <span className="mb-2">Top Picks 2028</span>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
