"use client";

import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Youtube, Film } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-12 backdrop-blur-xl bg-white/10 border-t border-white/20 text-red-500/20"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
     
          <span className="text-xl text-red-500 font-bold"> KYOGOOBE</span>
        </div>

      

        {/* Social Icons */}
        <div className="flex gap-4">
          <a href="#" className="p-2 rounded-full bg-black/10 hover:bg-cyan-500/30 transition">
            <Facebook size={18} />
          </a>
          <a href="#" className="p-2 rounded-full bg-black/10 hover:bg-cyan-500/30 transition">
            <Twitter size={18} />
          </a>
          <a href="#" className="p-2 rounded-full bg-black/10 hover:bg-cyan-500/30 transition">
            <Instagram size={18} />
          </a>
          <a href="#" className="p-2 rounded-full bg-black/10 hover:bg-cyan-500/30 transition">
            <Youtube size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-400 text-xs border-t border-white/10 py-4">
        © 2025 Scenecs. All rights reserved.
      </div>
    </motion.footer>
  );
}
