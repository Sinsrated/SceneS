"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, LogOut, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
    const handleCreate = () => {
    router.push("/login"); 
  };


  return (
    <section className="min-h-screen flex items-center justify-center bg-[url('/futuristic-bg.jpg')] bg-cover bg-center relative p-6">
     
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl text-white"
      >
        {/* Header */}
         {/* Back Button */}
       
      <button
        onClick={() => router.back()}
        className="absolute top-3 right-1 flex items-center gap-2   px-4 py-2 rounded-xl  transition-all"
      >
        <X size={18} /> 
      </button>
      

        <h1 className="text-4xl font-bold text-center mb-8">⚙️ Settings</h1>

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/20 mb-6"
        >
          <img
            src="./sins.jpg"
            alt="User Avatar"
            className="w-16 h-16 rounded-full border-2 border-white/30"
          />
          <div>
            <h2 className="text-xl font-semibold">Sins</h2>
            <p className="text-gray-300 text-sm">money@email.com</p>
          </div>
        </motion.div>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Account */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
          >
            <div className="flex items-center gap-3">
              <User size={20} />
              <span className="font-medium">Account</span>
            </div>
            <button className="text-sm text-cyan-400 hover:underline">
              Manage
            </button>
          </motion.div>

          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
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
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
          >
            <div className="flex items-center gap-3">
              <Shield size={20} />
              <span className="font-medium">Privacy</span>
            </div>
            <button className="text-sm text-pink-400 hover:underline">
              Configure
            </button>
          </motion.div>

          {/* Theme */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
          >
            <div className="flex items-center gap-3">
              <Palette size={20} />
              <span className="font-medium">Theme</span>
            </div>
            <select className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none">
              <option className="bg-gray-900">Light</option>
              <option className="bg-gray-900">Dark</option>
              <option className="bg-gray-900">Neon</option>
            </select>
          </motion.div>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            onClick={handleCreate} 
          className="w-full flex items-center justify-center gap-2 mt-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg"
        >
          <LogOut size={20} /> Logout
        </motion.button>
      </motion.div>
    </section>
  );
}
