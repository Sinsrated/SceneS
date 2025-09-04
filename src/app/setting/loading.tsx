"use client";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <section className="h-screen flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        className="text-white text-3xl font-bold"
      >
        Welcome!
      </motion.div>
    </section>
  );
}
