"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateAccount() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Handle account creation
  const handleCreate = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    // ✅ Save user data to localStorage
    const user = { username, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to cinematic loading screen
    router.replace("/setting");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[url('/futuristic-bg.jpg')] bg-cover bg-center relative">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account 🚀
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          {/* Username */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <User className="text-white mr-3" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent w-full outline-none text-white placeholder-gray-300"
            />
          </div>

          {/* Email */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Mail className="text-white mr-3" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full outline-none text-white placeholder-gray-300"
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Lock className="text-white mr-3" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-white placeholder-gray-300"
            />
            <button
              type="button"
              className="ml-2 text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Lock className="text-white mr-3" size={20} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-white placeholder-gray-300"
            />
            <button
              type="button"
              className="ml-2 text-white"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Create Account Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg"
          >
            Create Account <ArrowRight size={20} />
          </motion.button>
        </div>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
