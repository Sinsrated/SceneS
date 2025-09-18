"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

// Generic type for all series-like items
interface MediaItem {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  description: string;
  year: string;
  rating: number;
  episode?: number;
  seasons?: number;
  genre: string[];
  trailer_url?: string;
  created_at: string;
  type: "series" | "aniserie" | "drama"; // identify source
}

const CombinedSeriesPage = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const relatedRef = useRef<HTMLDivElement>(null);
 

  // ✅ Fetch from multiple tables
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: series, error: seriesError },
               { data: aniserie, error: aniserieError },
               { data: dramas, error: dramasError }] = await Promise.all([
          supabase.from("series").select("*"),
          supabase.from("aniserie").select("*"),
          supabase.from("dramas").select("*"),
        ]);

        if (seriesError) console.error("Error fetching series:", seriesError.message);
        if (aniserieError) console.error("Error fetching aniserie:", aniserieError.message);
        if (dramasError) console.error("Error fetching dramas:", dramasError.message);

        const formattedSeries = (series || []).map((s) => ({ ...s, type: "series" as const }));
        const formattedAniserie = (aniserie || []).map((a) => ({ ...a, type: "aniserie" as const }));
        const formattedDramas = (dramas || []).map((d) => ({ ...d, type: "drama" as const }));

        // ✅ Merge + sort by created_at (latest first)
        const combined = [...formattedSeries, ...formattedAniserie, ...formattedDramas].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setItems(combined);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollRelated = (direction: "left" | "right") => {
  if (relatedRef.current) {
    const scrollAmount = 200; // adjust how much it scrolls
    relatedRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }
};

  // ✅ Related items (same genre, exclude current one)
  const relatedItems = selectedItem
    ? items.filter(
        (m) =>
          m.id !== selectedItem.id &&
          m.genre?.some((g) => selectedItem.genre?.includes(g))
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
                <div className="w-full h-55 bg-black/40"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-black/40 rounded w-3/4"></div>
                  <div className="h-3 bg-black/40 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <p className="text-gray-400 text-center">No content found.</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {items.map((s) => (
            <motion.div
              key={`${s.type}-${s.id}`}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedItem(s)}
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
                <span className="text-xs text-gray-500 italic">
                  {s.type === "series"
                    ? "📺 Series"
                    : s.type === "aniserie"
                    ? "✨ Aniserie"
                    : "🎭 Drama"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                <Image
                  src={selectedItem.poster_url}
                  alt={selectedItem.title}
                  width={300}
                  height={450}
                  className="rounded-xl object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedItem.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {selectedItem.description}
                    </p>
                    <p className="text-sm opacity-70">{selectedItem.year}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedItem.rating}
                    </p>
                    {selectedItem.episode && (
                      <p className="text-sm opacity-70">
                        Episodes: {selectedItem.episode}
                      </p>
                    )}
                    {selectedItem.seasons && (
                      <p className="text-sm opacity-70">
                        Seasons: {selectedItem.seasons}
                      </p>
                    )}
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
                    {selectedItem.trailer_url && (
                      <a
                        href={selectedItem.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
                      >
                        <Play size={18} /> Trailer
                      </a>
                    )}
                  </div>

                  
                 {/* Related items */}
{relatedItems.length > 0 && (
  <div className="relative mt-4">
    <h3 className="text-xl font-bold text-white mb-3">More like this</h3>

    {/* Scroll buttons for desktop */}
    <button
      onClick={() => scrollRelated("left")}
      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
    >
      <ChevronLeft size={28} />
    </button>
    <button
      onClick={() => scrollRelated("right")}
      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
    >
      <ChevronRight size={28} />
    </button>

    <div
      ref={relatedRef}
      className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
    >
      {relatedItems.map((r) => (
        <div key={`${r.type}-${r.id}`} className="flex-shrink-0 snap-start">
          <Image
            src={r.poster_url}
            alt={r.title}
            width={120}
            height={180}
            className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
            onClick={() => setSelectedItem(r)}
          />
        </div>
      ))}
    </div>
  </div>
)}

                </div>
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={() => setSelectedItem(null)}
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

export default CombinedSeriesPage;
