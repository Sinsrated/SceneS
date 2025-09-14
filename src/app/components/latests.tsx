"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

// ✅ Define Series type
interface Series {
  id: number;
  title: string;
  poster_url: string;
  description: string;
  year: string;
  rating: number;
  episodes?: number;
  seasons?: number;
  genre?: string;
}

const Latestseries = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSerie, setSelectedSerie] = useState<Series | null>(null);

  // ✅ Fetch from Supabase
  useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase.from("series").select("*");
      if (error) {
        console.error("Error fetching series:", error.message);
      } else {
        setSeries(data as Series[]);
      }
    };

    fetchSeries();
  }, []);

  // Related series (same genre if available)
  const relatedSeries = selectedSerie
    ? series.filter(
        (s) => s.genre === selectedSerie.genre && s.id !== selectedSerie.id
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Latest Series</h2>

        {/* Series List (scrollable) */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {series.map((s) => (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedSerie(s)}
            >
              <Image
                src={s.poster_url}
                alt={s.title}
                width={180}
                height={260}
                className="object-cover h-60 w-40"
              />
            </motion.div>
          ))}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {selectedSerie && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                <Image
                  src={selectedSerie.poster_url}
                  alt={selectedSerie.title}
                  width={300}
                  height={450}
                  className="rounded-xl object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedSerie.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {selectedSerie.description}
                    </p>
                    <p className="text-sm opacity-70">{selectedSerie.year}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedSerie.rating}
                    </p>
                    <p className="text-sm opacity-70">
                      Episodes: {selectedSerie.episodes}
                    </p>
                    <p className="text-sm opacity-70">
                      Seasons: {selectedSerie.seasons}
                    </p>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Play size={18} />
                    </button>
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Bookmark size={18} />
                    </button>
                  </div>

                  {relatedSeries.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like this
                      </h3>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                        {relatedSeries.map((m) => (
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
                              onClick={() => setSelectedSerie(m)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={() => setSelectedSerie(null)}
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

export default Latestseries;
