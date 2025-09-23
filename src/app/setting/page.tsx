"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, LogIn, X, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

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
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAccounts([parsedUser]);
      return;
    }

    // If no localStorage, fetch from Supabase
    const fetchAccount = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching account:", error);
        return;
      }

      if (data) {
        setUser(data);
        setAccounts([data]);
        localStorage.setItem("user", JSON.stringify(data));
      }
    };

    fetchAccount();
  }, [userId]);

  // ✅ Switch account in session
  const handleSwitch = (acc: UserType) => {
    setUser(acc);
    localStorage.setItem("user", JSON.stringify(acc)); // Sync localStorage
  };

  // ✅ Logout
  const handleLogout = () => {
    setUser(null);
    setAccounts([]);
    localStorage.removeItem("user"); // Clear localStorage
    router.replace("/login");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[url('/futuristic-bg.jpg')] bg-cover bg-center relative p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl text-gray relative"
      >
        <button
          onClick={() => router.replace("/home")}
          className="absolute top-3 right-3 p-2 rounded-xl hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <h1 className="text-4xl font-bold text-center mb-8">⚙️ Settings</h1>

        {/* Active User */}
        {user && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col gap-1 p-4 rounded-xl bg-white/10 border border-white/20 mb-6"
          >
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-gray-300 text-sm">{user.email}</p>
          </motion.div>
        )}

        {/* Manage Accounts */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/10 border border-white/20 mb-4"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowAccounts(!showAccounts)}
          >
            <div className="flex items-center gap-3">
              <User size={20} />
              <span className="font-medium">Manage Accounts</span>
            </div>
            <span className="text-sm text-cyan-400">{showAccounts ? "x" : "+"}</span>
          </div>

          {showAccounts && (
            <div className="mt-4 space-y-3">
              {accounts.length === 0 && (
                <p className="text-gray-400 text-sm">No accounts logged in yet.</p>
              )}

              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    acc.email === user?.email
                      ? "bg-cyan-500/30 border border-cyan-400/50"
                      : "bg-white/5 border border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium">{acc.username}</p>
                    <p className="text-sm text-gray-300">{acc.email}</p>
                  </div>
                  {acc.email !== user?.email && (
                    <button
                      onClick={() => handleSwitch(acc)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Switch
                    </button>
                  )}
                </div>
              ))}

              {/* Add Account Button */}
              <button
                onClick={() => router.push("/login")}
                className="w-full flex items-center justify-center gap-2 mt-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-500 font-semibold shadow-lg"
              >
                <Plus size={18} /> Add 
              </button>
            </div>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 mb-4"
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
          <button className="text-sm text-red-400 hover:underline">Configure</button>
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-purple-600 text-gray-500 font-semibold shadow-lg"
        >
          <LogIn size={20} /> Log in
        </motion.button>
      </motion.div>
    </section>
  );
}
