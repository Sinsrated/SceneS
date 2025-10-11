"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, LogIn, X, Hexagon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfilePage from "../profile/page";
import ThemeToggle from "../components/ThemeToggle";

type UserType = {
  id: string;
  username: string;
  email: string;
  password?: string;
  pfp_url?: string;
};

export default function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [user, setUser] = useState<UserType | null>(null);
  const [accounts, setAccounts] = useState<UserType[]>([]);

  const handleLogout = () => {
    setUser(null);
    setAccounts([]);
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <section className=" w-screen h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0a0f13] via-[#10171d] to-[#0d1318] relative overflow-hidden">
      {/* Optional subtle glow behind */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />

      {/* Glass full-screen container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="animate-presence-scroll w-full h-full p-8 rounded-none
          backdrop-blur-xl border border-white/10 
          bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.2)] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/10 text-gray-300 z-10"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h1 className="text-4xl font-semibold text-center mb-10 text-gray-200">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-5 rounded-2xl 
            bg-white/5 border border-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <ProfilePage />
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-5 rounded-2xl 
            bg-white/5 border border-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-3 text-gray-300">
              <Bell size={20} />
              <span className="font-medium">Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-cyan-500/40 transition-all"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
            </label>
          </motion.div>

          {/* Privacy */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-5 rounded-2xl 
            bg-white/5 border border-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-3 text-gray-300">
              <Shield size={20} />
              <span className="font-medium">Privacy</span>
            </div>
            <button className="text-sm text-cyan-400 hover:underline">Configure</button>
          </motion.div>

          {/* Theme */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-5 rounded-2xl 
            bg-white/5 border border-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-4 text-gray-300">
              <Hexagon size={20} />
              <span className="font-medium">Theme</span>
            </div>
            <ThemeToggle />
          </motion.div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 mt-8 py-3 rounded-xl 
            bg-gradient-to-r from-cyan-500/20 to-blue-500/20 
            hover:from-cyan-400/30 hover:to-blue-400/30 
            text-gray-100 font-semibold transition-all duration-300"
          >
            <LogIn size={20} /> Log out
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
