"use client";

import { motion } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("money@gmail.com");
  const [password, setPassword] = useState("money");
   const handleCreate = () => {
    router.push("/home"); 
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
          Welcome Back 🎬
        </h1>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <User className="text-white mr-3" size={20} />
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-white placeholder-gray-300"
            />
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
             onClick={handleCreate} 
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg"
          >
            Login <ArrowRight size={20} />
          </motion.button>
        </div>

        <p className="text-center text-gray-300 mt-6">
          Don’t have an account?{" "}
          <Link href="/create" className="text-pink-400 hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </section>
  );
};


