"use client";

"use client";

import { motion } from "framer-motion";
import { Twitter, Youtube, Film } from "lucide-react";
import { FaTiktok } from "react-icons/fa"; // ✅ TikTok icon from react-icons


export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative mt-16 backdrop-blur-2xl bg-gradient-to-t from-white/5 via-white/10 to-transparent 
                 border-t border-cyan-400/20 text-white shadow-[0_0_25px_rgba(0,255,255,0.15)] overflow-hidden"
    >
      {/* Soft glow effect behind footer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Brand & Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md space-y-3">
          <div className="flex items-center gap-2">
           
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Kyogobe Watch
            </span>
          </div>
          <p className="text-sm text-gray-300/80 leading-relaxed">
            Stream your favorite movies, TV shows, and VJ cuts all in one place.  
            Designed with futuristic simplicity — immersive, fast, and totally free.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex gap-5 items-center">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full border border-cyan-400/30 bg-white/5 
                       hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] 
                       transition-all duration-300 ease-in-out"
          >
            <Twitter size={20} className="text-cyan-300" />
          </a>

          <a
            href="https://www.tiktok.com/@kyogobewatch" // ✅ replace with your real TikTok
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full border border-cyan-400/30 bg-white/5 
                       hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] 
                       transition-all duration-300 ease-in-out"
          >
            <FaTiktok size={20} className="text-cyan-300" />
          </a>

          <a
            href="https://youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full border border-cyan-400/30 bg-white/5 
                       hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] 
                       transition-all duration-300 ease-in-out"
          >
            <Youtube size={20} className="text-cyan-300" />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-400 text-xs border-t border-cyan-400/10 py-4 backdrop-blur-sm">
        © 2025 Kyogobe Watch • Crafted for the future • All rights reserved.
      </div>
    </motion.footer>
  );
}
