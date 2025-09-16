"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark, Download } from "lucide-react";
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
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType | null>(null);

  // ✅ Fetch from Supabase
  useEffect(() => {
    const fetchAnimations = async () => {
      const { data, error } = await supabase.from("animation").select("*");
      if (error) {
        console.error("Error fetching animations:", error.message);
      } else {
        setAnimations(data as AnimationType[]);
      }
    };

    fetchAnimations();
  }, []);

  // Related animations (same genre if available)
 const relatedAnimations = selectedAnimation
    ? animations.filter(
        (a) =>
          a.id !== selectedAnimation.id &&
          a.genre?.some((g) => selectedAnimation.genre?.includes(g)) // ✅ overlap check
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-8">
         <h2 className="text-2xl font-bold text-white mb-6">Animation</h2>
        {/* Animation List (scrollable) */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {animations.map((animation) => (
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
                className="object-cover h-55 w-35"
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
                    <p className="text-cyan-400 font-semibold">⭐ {selectedAnimation.rating}</p>
                  </div>

                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    {/* Play button */}
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Play size={18} />
                    </button>

                    {/* Download button */}
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Download size={18} />
                      Download
                    </button>

                    {/* Trailer button (only shows if trailer_url exists) */}
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
