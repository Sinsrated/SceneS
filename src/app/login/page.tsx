"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/profile"); // successful login
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Login failed");
    }
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2C3532]text-white">
      <motion.form
        onSubmit={handleLogin}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-center">Log In</h1>

        {error && <p className="text-cyan-400 text-sm">{error}</p>}

        {/* Email */}
        <div className="flex items-center bg-white/5 rounded-xl px-4 py-3">
          <Mail size={18} className="text-gray-400 mr-3" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent outline-none flex-1"
            required
          />
        </div>

        {/* Password with toggle */}
        <div className="flex items-center bg-white/5 rounded-xl px-4 py-3">
          <Lock size={18} className="text-gray-400 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent outline-none flex-1"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-gray-400 hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#D8B08C] hover:bg-[#FFCB9A] py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          Log In <ArrowRight size={18} />
        </button>

        <p className="text-sm text-gray-400 text-center mt-2">
          Don&apos;t have an account?{" "}
          <a href="/create" className="text-[#0F6466] hover:underline">
            Sign Up
          </a>
        </p>
      </motion.form>
    </div>
  );
}
