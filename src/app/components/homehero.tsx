"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { create } from "domain";

interface Item {
  id: number;
  type: "movie" | "series";
  title: string;
  poster_url: string;
  backdrop_url: string;
  year: string;
  description: string;
  watch_url?: string;
  trailer_url?: string;
  rating?: number;
  genre: string[];
  episodes?: number;
  seasons?: number;
  created_at: number;
}

// Define Supabase row types
interface MovieRow {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  year: string;
  description: string;
  watch_url?: string;
  trailer_url?: string;
  rating?: number;
  genre: string[];
  created_at: number;
}

interface SeriesRow extends MovieRow {
  episodes?: number;
  seasons?: number;
}

const HeroCarousel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch movies + series from Supabase
useEffect(() => {
  const fetchData = async () => {
    try {
      const { data: moviesData, error: movieErr } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (movieErr) console.error("Movies fetch error:", movieErr.message);

      const { data: seriesData, error: seriesErr } = await supabase
        .from("series")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (seriesErr) console.error("Series fetch error:", seriesErr.message);

      // Merge movies + series into ONE array
      const combined: Item[] = [
        ...(moviesData?.map((m) => ({
          id: m.id ?? 0,
          type: "movie" as const,
          title: m.title ?? "Untitled",
          poster_url: m.poster_url ?? "",
          backdrop_url: m.backdrop_url ?? "",
          year: m.year ?? "",
          description: m.description ?? "",
          watch_url: m.watch_url ?? undefined,
          trailer_url: m.trailer_url ?? undefined,
          rating: m.rating ?? undefined,
          genre: m.genre ?? [],
          created_at: new Date(m.created_at).getTime(), // ✅ convert to timestamp
        })) ?? []),
        ...(seriesData?.map((s) => ({
          id: s.id ?? 0,
          type: "series" as const,
          title: s.title ?? "Untitled",
          poster_url: s.poster_url ?? "",
          backdrop_url: s.backdrop_url ?? "",
          year: s.year ?? "",
          description: s.description ?? "",
          watch_url: s.watch_url ?? undefined,
          trailer_url: s.trailer_url ?? undefined,
          rating: s.rating ?? undefined,
          genre: s.genre ?? [],
          episodes: s.episodes ?? undefined,
          seasons: s.seasons ?? undefined,
          created_at: new Date(s.created_at).getTime(), // ✅ convert to timestamp
        })) ?? []),
      ];

      // ✅ Sort by date, newest first (mixed movies & series)
      const sorted = combined
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 10);

      setItems(sorted);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  // Related items based on overlapping genres AND same type
  const relatedItems = selectedItem
    ? items.filter(
        (i) =>
          i.id !== selectedItem.id &&
          i.type === selectedItem.type &&
          i.genre.some((g) => selectedItem.genre.includes(g))
      )
    : [];

  // Auto-carousel
  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      const next = (current + 1) % items.length;
      setCurrent(next);

      if (window.innerWidth < 768) {
        mobileScrollRef.current?.scrollTo({
          left: next * (mobileScrollRef.current?.clientWidth ?? 0),
          behavior: "smooth",
        });
      } else {
        desktopScrollRef.current?.scrollTo({
          left: next * (desktopScrollRef.current?.clientWidth ?? 0),
          behavior: "smooth",
        });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [current, items.length]);

  const handleScroll = (element: HTMLDivElement | null) => {
    if (!element) return;
    const index = Math.round(element.scrollLeft / element.clientWidth);
    if (index !== current) setCurrent(index);
  };

  // Skeleton card
  const SkeletonCard = () => (
    <div className="relative w-full h-44 flex-shrink-0 snap-center flex justify-center px-2 animate-pulse">
      <div className="absolute inset-0 bg-gray-700 rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 rounded-2xl" />
    </div>
  );

  if (loading) {
    return (
      <section className="w-full py-10 flex flex-col items-center">
        <div className="flex overflow-x-auto w-full gap-4 scrollbar-hide px-4 md:hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`mobile-${i}`} />
          ))}
        </div>
        <div className="hidden md:flex overflow-x-auto w-full gap-6 scrollbar-hide mt-4 px-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`desktop-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full px-5 py-4 flex flex-col items-center overflow-hidden">
      {/* Mobile Carousel */}
      <div
        ref={mobileScrollRef}
        onScroll={() => handleScroll(mobileScrollRef.current)}
        className="relative z-10 top-5 flex overflow-x-auto snap-x snap-mandatory w-full scrollbar-hide scroll-smooth md:hidden"
      >
        {items.map((i) => (
          <motion.div
            key={`${i.type}-${i.id}`}
            className="w-full flex-shrink-0 snap-center flex justify-center px-2"
            onClick={() => setSelectedItem(i)}
          >
            <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-2xl">
              {i.backdrop_url && (
                <>
                  <div
                    className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-40 blur-1g transition-all duration-500"
                    style={{ backgroundImage: `url(${i.backdrop_url})` }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/20 to-black/60 rounded-2xl" />
                </>
              )}
              <div className="flex gap-4 items-center relative z-10 bg-white/10 backdrop-blur-5g rounded-2xl shadow-lg overflow-hidden cursor-pointer p-2">
                <Image
                  src={i.poster_url}
                  alt={i.title}
                  width={100}
                  height={150}
                  className="object-cover h-44 w-32"
                />
                <div className="p-2 flex flex-col">
                  <h3 className="text-lg font-semibold text-white">{i.title}</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{i.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{i.year}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Carousel */}
      <div
        ref={desktopScrollRef}
        onScroll={() => handleScroll(desktopScrollRef.current)}
        className="hidden md:flex relative z-10 overflow-x-auto snap-x snap-mandatory w-full max-w-[95vw] mx-auto scrollbar-hide scroll-smooth gap-6"
      >
        {items.map((i) => (
          <motion.div
            key={`${i.type}-${i.id}`}
            className="flex-shrink-0 snap-center w-full cursor-pointer hover:scale-105 transition"
            onClick={() => setSelectedItem(i)}
          >
            <div className="relative w-full h-[75vh] overflow-hidden rounded-2xl">
              {i.backdrop_url && (
                <>
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center  transition-all duration-500 rounded-2xl"
                    style={{ backgroundImage: `url(${i.backdrop_url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 rounded-2xl" />
                </>
              )}
              <div className="absolute bottom-6 left-6 z-10 text-white max-w-[70%]">
                <h3 className="text-2xl font-bold">{i.title}</h3>
                <p className="text-sm text-gray-200 line-clamp-3">{i.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Carousel Dots */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {items.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => {
              setCurrent(index);
              if (window.innerWidth < 768) {
                mobileScrollRef.current?.scrollTo({
                  left: index * (mobileScrollRef.current?.clientWidth ?? 0),
                  behavior: "smooth",
                });
              } else {
                desktopScrollRef.current?.scrollTo({
                  left: index * (desktopScrollRef.current?.clientWidth ?? 0),
                  behavior: "smooth",
                });
              }
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index ? "bg-red-500 scale-125" : "bg-gray-500/50"
            }`}
          />
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="animate-presence-scroll fixed inset-0 bg-black/70 backdrop-blur-lg z-50  p-4 overflow-y-auto"
          >
            <div className="bg-white/10 rounded-2xl top-15 shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
              <Image
                src={selectedItem.poster_url}
                alt={selectedItem.title}
                width={300}
                height={450}
                className="rounded-xl object-cover"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedItem.title}</h2>
                  {selectedItem.watch_url && (
                    <button
                      onClick={() => window.open(selectedItem.watch_url, "_blank")}
                      className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition mb-4"
                    >
                      <Play size={18} /> Watch
                    </button>
                  )}
                  <p className="text-gray-300 mb-4">{selectedItem.description}</p>
                  <p className="text-sm text-gray-300 mb-2">
                    {selectedItem.year} • {selectedItem.genre.join(", ")}
                  </p>
                </div>

                <div className="flex gap-4 mb-6">
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
                  <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                    <Bookmark size={18} /> Save
                  </button>
                </div>

                {/* More like this */}
                {relatedItems.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">More like {selectedItem.title}</h3>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                      {relatedItems.map((i) => (
                        <div key={`${i.type}-${i.id}`} className="flex-shrink-0 snap-start">
                          <Image
                            src={i.poster_url}
                            alt={i.title}
                            width={120}
                            height={180}
                            className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() => setSelectedItem(i)}
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
  );
};

export default HeroCarousel;
