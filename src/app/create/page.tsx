"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function CreateAccount() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    // Must include @domain.com
    const regex = /^[^\s@]+@(gmail\.com|icloud\.com)$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    // Minimum 8 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleCreate = async () => {
    const emailTrimmed = email.trim();

    if (!username || !emailTrimmed || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateEmail(emailTrimmed)) {
      setError("Email must be in the format user@domain.com");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters and include at least one letter and one number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Check for existing username or email
      const { data: existingProfiles } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.eq.${username},email.eq.${emailTrimmed}`);

      if (existingProfiles && existingProfiles.length > 0) {
        setError("Username or email already exists.");
        setLoading(false);
        return;
      }

      // Insert new profile
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([{ username, email: emailTrimmed, password }])
        .select()
        .single();

      if (insertError || !insertedProfile) {
        setError(insertError?.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Store user in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: insertedProfile.id,
          username: insertedProfile.username,
          email: insertedProfile.email,
        })
      );

      router.replace("/setting");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
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
          Create Account
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          {/* Username */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <User className="text-gray-300 mr-3" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent w-full outline-none text-gray-300 placeholder-gray-300"
            />
          </div>

          {/* Email */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Mail className="text-gray-300 mr-3" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Confirm Password */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Lock className="text-gray-300 mr-3" size={20} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-gray-300 placeholder-gray-300"
            />
            <button
              type="button"
              className="ml-2 text-gray-300"
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg"
          >
            {loading ? "Creating..." : "Create Account"} <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
