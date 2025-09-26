"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pass: string) => {
    // must have 8+ chars, 1 letter, 1 number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(pass);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and include letters and numbers."
      );
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // keep username
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Immediately log in the user if session exists
    if (data.session) {
      router.push("/profile");
    } else {
      // If session is null, force login manually
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.push("/profile"); // redirect after successful login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2C3532] text-white">
      <motion.form
        onSubmit={handleSignUp}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Username */}
        <div className="flex items-center bg-white/5 rounded-xl px-4 py-3">
          <User size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent outline-none flex-1"
            required
          />
        </div>

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
            placeholder="Password (min 8, letters + numbers)"
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

        {/* Confirm Password with toggle */}
        <div className="flex items-center bg-white/5 rounded-xl px-4 py-3">
          <Lock size={18} className="text-gray-400 mr-3" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-transparent outline-none flex-1"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="ml-2 text-gray-400 hover:text-gray-200"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit */}
        <button className="w-full bg-[#D8B08C] hover:bg-[#FFCB9A] py-3 rounded-xl flex items-center justify-center gap-2 transition">
          Sign Up <ArrowRight size={18} />
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-[#0F6466] hover:underline">
            Log in
          </a>
        </p>
      </motion.form>
    </div>
  );
}
