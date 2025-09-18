"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

// ✅ Define Drama type
interface Drama {
  id: number;
  title: string;
  poster_url: string;
  description: string;
  year: string;
  trailer_url?: string;
  rating: number;
  episodes?: number;
  seasons?: number;
  genre?: string;
}

const LatestDrama = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  const [loading, setLoading] = useState(true); // ✅ added loading state
  const scrollRef = useRef<HTMLDivElement>(null); // ✅ added ref for scroll

  // ✅ Fetch from Supabase (dramas table)
  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const { data, error } = await supabase.from("dramas").select("*");
        if (error) {
          console.error("Error fetching dramas:", error.message);
        } else {
          setDramas(data as Drama[]);
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false); // ✅ stop skeleton
      }
    };

    fetchDramas();
  }, []);

  // ✅ scroll function for arrows
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Related dramas (same genre if available)
  const relatedDramas = selectedDrama
    ? dramas.filter(
        (d) => d.genre === selectedDrama.genre && d.id !== selectedDrama.id
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-8 relative">
        <h2 className="text-2xl font-bold text-gray-500 mb-6">Latest Dramas</h2>

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
                  {/* Poster skeleton */}
                  <div className="w-full h-[260px] bg-black/40"></div>
                </div>
              ))
            : dramas.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedDrama(d)}
                >
                  <Image
                    src={d.poster_url}
                    alt={d.title}
                    width={180}
                    height={260}
                    className="object-cover h-55 w-35"
                  />
                </motion.div>
              ))}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {selectedDrama && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                <Image
                  src={selectedDrama.poster_url}
                  alt={selectedDrama.title}
                  width={300}
                  height={450}
                  className="rounded-xl object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedDrama.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {selectedDrama.description}
                    </p>
                    <p className="text-sm opacity-70">{selectedDrama.year}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedDrama.rating}
                    </p>
                    <p className="text-sm opacity-70">
                      Episodes: {selectedDrama.episodes}
                    </p>
                    <p className="text-sm opacity-70">
                      Seasons: {selectedDrama.seasons}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    {/* Play button */}
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Play size={18} />
                      Play
                    </button>

                    {/* Download button */}
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Download size={18} />
                      Download
                    </button>

                    {/* Trailer button */}
                    {selectedDrama.trailer_url && (
                      <a
                        href={selectedDrama.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
                      >
                        <Play size={18} /> Trailer
                      </a>
                    )}
                  </div>

                  {relatedDramas.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like this
                      </h3>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                        {relatedDramas.map((m) => (
                          <div
                            key={m.id}
                            className="flex-shrink-0 snap-start"
                          >
                            <Image
                              src={m.poster_url}
                              alt={m.title}
                              width={120}
                              height={180}
                              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedDrama(m)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={() => setSelectedDrama(null)}
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

export default LatestDrama;
