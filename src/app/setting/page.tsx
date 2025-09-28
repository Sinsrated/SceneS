"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {  Bell, Shield, LogIn, X,  Hexagon } from "lucide-react";
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
  const userId = searchParams.get("userId"); // Get userId from login/create redirect

  const [user, setUser] = useState<UserType | null>(null);
  const [accounts, setAccounts] = useState<UserType[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);

  // ✅ Load user from localStorage first, fallback to Supabase
  
    // If no localStorage, fetch from Supabase
   

  
  // ✅ Logout
  const handleLogout = () => {
    setUser(null);
    setAccounts([]);
    localStorage.removeItem("user"); // Clear localStorage
    router.replace("/login");
  };

  return (
    <section className="min-h-screen flex items-center gap-3 justify-center bg-[url('/futuristic-bg.jpg')] bg-cover bg-center relative p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl text-gray relative"
      >
        <button
          onClick={() => router.back()}
          className="absolute top-3 right-3 p-2 rounded-xl hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <h1 className="text-4xl font-bold text-center mb-8">⚙️ Settings</h1>

      
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/20 mb-4"
        >
          <div className="flex items-center gap-4"> 
            <ProfilePage />
          </div>
        </motion.div>

     

           
              

         

        {/* Notifications */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/20 mb-4"
        >
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <span className="font-medium">Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
          </label>
        </motion.div>

        {/* Privacy */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/20"
        >
          <div className="flex items-center gap-3">
            <Shield size={20} />
            <span className="font-medium">Privacy</span>
          </div>
          <button className="text-sm text-red-400 hover:underline">Configure</button>
        </motion.div>

         {/* Theme */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4  rounded-xl bg-white/5 border border-white/20"
        >
          <div className="flex items-center gap-4">
            <Hexagon size={20} />
            <span className="font-medium">Thems</span>
          </div>
          <ThemeToggle/>
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-8 py-3 rounded-xl bg-gradient-to-r from-[#0F6466] to-[#FFCB9A] text-gray-500 font-semibold shadow-lg"
        >
          <LogIn size={20} /> Log in
        </motion.button>
      </motion.div>
    </section>
  );
}
