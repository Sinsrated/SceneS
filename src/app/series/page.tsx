"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark, Download } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

// Series type
interface Series {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  description: string;
  year: string;
  rating: number;
  episode: number;
  seasons: number;
  genre: string[];
  trailer_url: string;
}

const SeriesPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSerie, setSelectedSerie] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch series
  useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase.from("series").select("*");
      if (error) {
        console.error("Error fetching series:", error.message);
      } else {
        setSeries(data as Series[]);
      }
      setLoading(false);
    };

    fetchSeries();
  }, []);

  // ✅ Related series (same genre, exclude current one)
  const relatedSeries = selectedSerie
    ? series.filter(
        (s) =>
          s.id !== selectedSerie.id &&
        s.genre.some((g) => selectedSerie.genre?.includes(g))
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-20 px-4 md:px-12">
       {/* Skeleton state */}
{loading && (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse"
      >
        {/* Poster skeleton */}
        <div className="w-full h-55 bg-black/40"></div>

        {/* Text skeleton */}
        <div className="p-3 space-y-2">
          <div className="h-4 bg-black/40 rounded w-3/4"></div>
          <div className="h-3 bg-black/40 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
)}

        {/* Empty state */}
        {!loading && series.length === 0 && (
          <p className="text-gray-400 text-center">No series found.</p>
        )}

        {/* Grid of series */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {series.map((s) => (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedSerie(s)}
            >
              <Image
                src={s.poster_url}
                alt={s.title}
                width={300}
                height={450}
                className="object-cover w-full h-55" 
              />
              <div className="p-3">
                <h3 className="text-white font-semibold truncate">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.year}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded modal */}
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
                      Episodes: {selectedSerie.episode}
                    </p>
                    <p className="text-sm opacity-70">
                      Seasons: {selectedSerie.seasons}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
  {/* Play button */}
  <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
    <Play size={18} />
  
  </button>

  {/* Watchlist button */}
  <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
    <Download size={18} />
    Download
  </button>

  {/* Trailer button (only shows if trailer_url exists) */}
  {selectedSerie.trailer_url && (
    <a
      href={selectedSerie.trailer_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
    >
      <Play size={18} /> Trailer
    </a>
  )}
</div>

   

                  {/* ✅ Related series section */}
                  {relatedSeries.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like this
                      </h3>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                        {relatedSeries.map((s) => (
                          <div key={s.id} className="flex-shrink-0 snap-start">
                            <Image
                              src={s.poster_url}
                              alt={s.title}
                              width={120}
                              height={180}
                              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedSerie(s)}
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

export default SeriesPage;
