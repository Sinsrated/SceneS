"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

interface AnimationType {
  id: number;
  title: string;
  poster_url: string;
  description: string;
  year: string;
  rating: number;
  trailer_url: string;
  genre?: string[];
}

const Animation = () => {
  const [animations, setAnimations] = useState<AnimationType[]>([]);
  const [selectedAnimation, setSelectedAnimation] =
    useState<AnimationType | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ Fetch from Supabase
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        const { data, error } = await supabase.from("animation").select("*");
        if (error) {
          console.error("Error fetching animations:", error.message);
        } else {
          setAnimations(data as AnimationType[]);
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimations();
  }, []);

  // ✅ Related animations (same genre overlap)
  const relatedAnimations = selectedAnimation
    ? animations.filter(
        (a) =>
          a.id !== selectedAnimation.id &&
          a.genre?.some((g) => selectedAnimation.genre?.includes(g))
      )
    : [];

  // ✅ Scroll function
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <>
      <Header />
      <section className="w-full py-8 relative">
        <h2 className="text-2xl font-bold text-gray-500 mb-6">Animation</h2>

        {/* Arrows for desktop only */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
        >
          <ChevronRight size={28} />
        </button>

        {/* ✅ Single scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[180px] bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="w-full h-[260px] bg-black/40"></div>
                </div>
              ))
            : animations.map((animation) => (
                <motion.div
                  key={animation.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedAnimation(animation)}
                >
                  <Image
                    src={animation.poster_url}
                    alt={animation.title}
                    width={180}
                    height={260}
                    className="object-cover h-[260px] w-[180px]"
                  />
                </motion.div>
              ))}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {selectedAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                <Image
                  src={selectedAnimation.poster_url}
                  alt={selectedAnimation.title}
                  width={300}
                  height={450}
                  className="rounded-xl object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedAnimation.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {selectedAnimation.description}
                    </p>
                    <p className="text-sm opacity-70">{selectedAnimation.year}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedAnimation.rating}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Play size={18} />
                    </button>
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Download size={18} />
                      Download
                    </button>
                    {selectedAnimation.trailer_url && (
                      <a
                        href={selectedAnimation.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
                      >
                        <Play size={18} /> Trailer
                      </a>
                    )}
                  </div>

                  {/* Related */}
                  {relatedAnimations.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like this
                      </h3>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                        {relatedAnimations.map((a) => (
                          <div
                            key={a.id}
                            className="flex-shrink-0 snap-start"
                          >
                            <Image
                              src={a.poster_url}
                              alt={a.title}
                              width={120}
                              height={180}
                              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedAnimation(a)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={() => setSelectedAnimation(null)}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Animation;
