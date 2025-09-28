"use client";

import { motion } from "framer-motion";

export default function SettingsLoading() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[url('/futuristic-bg.jpg')] bg-cover bg-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl"
      >
        {/* Title */}
        <div className="h-8 w-40 bg-white/20 rounded-lg mb-8 mx-auto animate-pulse"></div>

        {/* Profile skeleton */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/20 mb-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-white/20"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-white/20 rounded"></div>
            <div className="h-3 w-48 bg-white/20 rounded"></div>
          </div>
        </div>

        {/* Notifications skeleton */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/20 mb-4 animate-pulse">
          <div className="h-4 w-32 bg-white/20 rounded"></div>
          <div className="h-6 w-11 bg-white/20 rounded-full"></div>
        </div>

        {/* Privacy skeleton */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/20 mb-4 animate-pulse">
          <div className="h-4 w-28 bg-white/20 rounded"></div>
          <div className="h-4 w-16 bg-white/20 rounded"></div>
        </div>

        {/* Theme skeleton */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/20 mb-4 animate-pulse">
          <div className="h-4 w-28 bg-white/20 rounded"></div>
          <div className="h-6 w-12 bg-white/20 rounded"></div>
        </div>

        {/* Logout button skeleton */}
        <div className="w-full h-12 rounded-xl bg-gradient-to-r from-white/20 to-white/10 mt-8 animate-pulse"></div>
      </motion.div>
    </section>
  );
}
