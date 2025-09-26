"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    [key: string]: unknown;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<unknown>(null); // ✅ replaced any with unknown
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);
        router.push("/setting"); // redirect logged-in users to settings
      } else {
        // fallback demo user
        setUser({
          id: "username",
          email: "@example.com",
          user_metadata: { username: "username" },
        });
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="text-gray-500 px-6 py-2 animate-pulse">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden p-4 flex flex-col md:flex-row items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="h-5 w-32 bg-gray-700 rounded mx-auto md:mx-0"></div>
              <div className="h-4 w-48 bg-gray-700 rounded mx-auto md:mx-0"></div>
              <div className="h-3 w-40 bg-gray-800 rounded mx-auto md:mx-0"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Narrow unknown to SupabaseUser
  const userData = user as SupabaseUser;

  const username = userData.user_metadata?.username || userData.email || "U";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="text-gray-500 px-6 py-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="rounded-2xl overflow-hidden p-4 flex flex-col md:flex-row items-center gap-2">
          {/* Avatar with Initial */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full ring-4 ring-[#0F6466] shadow-lg bg-gradient-to-r from-[#D2E8E3] to-[#D8B08C] text-white font-bold text-3xl">
            {initial}
          </div>

          <div className="flex-1 space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold">
              {userData.user_metadata?.username || "Anonymous"}
            </h2>
            <p className="text-gray-400">{userData.email}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
