"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async () => {
  if (!emailOrUsername || !password) {
    setError("Please enter both email/username and password.");
    return;
  }

  try {
    // Check both email and username
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .eq("password", password)
      .single();

    if (error || !user) {
      setError("Invalid email/username or password.");
      return;
    }

    // ✅ Redirect to settings with user id
    router.replace(`/setting?userId=${user.id}`);
  } catch (err: unknown) {
    console.error(err);
    setError(err instanceof Error ? err.message : "Login failed.");
  }
};


  return (
    <section className="min-h-screen flex items-center justify-center bg-[url('/futuristic-bg.jpg')] bg-cover bg-center relative">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-gray-300 text-center mb-6">
          Welcome Back
        </h1>

        {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}

        <div className="space-y-4">
     {/* Email or Username */}
<div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
  <User className="text-gray-300 mr-3" size={20} />
  <input
    type="text"
    placeholder="Email or Username"
    value={emailOrUsername}
    onChange={(e) => setEmailOrUsername(e.target.value)}
    className="bg-transparent w-full outline-none text-gray-300 placeholder-gray-300"
  />
</div>

          {/* Password */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Lock className="text-gray-300 mr-3" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-gray-300 placeholder-gray-300"
            />
            <button
              type="button"
              className="ml-2 text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-gray-300 py-3 rounded-xl font-semibold shadow-lg"
          >
            Login <ArrowRight size={20} />
          </motion.button>
        </div>

        <p className="text-center text-gray-300 mt-6">
          Don’t have an account?{" "}
          <Link href="/create" className="text-red-400 hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
