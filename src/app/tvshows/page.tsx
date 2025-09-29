"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import Description from "../components/description";

interface Episode {
  id: number;
  title: string;
  overview?: string;
  episode_number: number;
  runtime?: string;
  still_path?: string;
}

interface Season {
  name: string;
  overview?: string;
  created_at?: string;
  poster_path?: string;
  episode_count: number;
  season_number: number;
  episodes?: Episode[];
}
// Type for tvshows
interface Tvshows {
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
  vj?: string;
}

const TvshowsPage = () => {
  const [tvshowsList, setTvshowsList] = useState<Tvshows[]>([]);
  const [selectedTvshow, setSelectedTvshow] = useState<Tvshows | null>(null);
  const [loading, setLoading] = useState(true);
  const relatedRef = useRef<HTMLDivElement>(null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);

  // ✅ Fetch only tvshows
  useEffect(() => {
    const fetchTvshows = async () => {
      try {
        const { data, error } = await supabase
          .from("tvshows")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) console.error("Error fetching tvshows:", error.message);

        setTvshowsList(data || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTvshows();
  }, []);

  const scrollRelated = (direction: "left" | "right") => {
    if (relatedRef.current) {
      const scrollAmount = 200;
      relatedRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // ✅ Related tvshows (same genre, exclude current one)
  const relatedTvshows = selectedTvshow
    ? tvshowsList.filter(
        (t) =>
          t.id !== selectedTvshow.id &&
          t.genre?.some((g) => selectedTvshow.genre?.includes(g))
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-20 px-4 md:px-12">
        {/* Skeleton state */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 x2:grid-cols-12 gap-6">
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
        {!loading && tvshowsList.length === 0 && (
          <p className="text-gray-400 text-center">No tvshows found.</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 x2:grid-cols-12 gap-6">
          {tvshowsList.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedTvshow(t)}
            >
              <div className="relative">
                <Image
                  src={t.poster_url}
                  alt={t.title}
                  width={300}
                  height={450}
                  className="object-cover w-full h-55"
                />
                {t.vj && (
                  <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    {t.vj}
                  </p>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-gray-500 font-semibold truncate">{t.title}</h3>
                <p className="text-sm text-gray-400">{t.year}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded modal */}
        <AnimatePresence>
          {selectedTvshow && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="animate-presence-scroll fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                <Image
                  src={selectedTvshow.poster_url}
                  alt={selectedTvshow.title}
                  width={300}
                  height={450}
                  className="rounded-xl object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-1x3 font-bold text-white mb-2">
                      {selectedTvshow.title}
                      {selectedTvshow.vj && (
                        <span className="text-sm text-gray-400 ml-2">
                          {selectedTvshow.vj}
                        </span>
                      )}
                    </h2>

                    <p className="text-sm opacity-70">{selectedTvshow.year}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedTvshow.rating}
                    </p>
                   {/* Episodes */}
{selectedTvshow.episode && (
  <p className="text-sm opacity-70">
    Episodes: {selectedTvshow.episode}
  </p>
)}

{/* Seasons */}
{Array.isArray(selectedTvshow.seasons) && selectedTvshow.seasons.length > 0 && (
  <div className="mt-2 space-y-2">
    <p className="text-sm opacity-70 font-semibold">
      Seasons: {selectedTvshow.seasons.length}
    </p>

    <div className="space-y-2">
      {selectedTvshow.seasons.map((season, i) => (
        <div key={i} className="bg-white/5 rounded-lg p-2">
          {/* Season header */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-lg p-2"
            onClick={() =>
              setExpandedSeason(expandedSeason === i ? null : i)
            }
          >
            {season.poster_path && (
              <Image
                src={season.poster_path}
                alt={season.name}
                width={60}
                height={90}
                className="rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-white font-semibold">{season.name}</p>
              <p className="text-xs text-gray-400">
                {season.episode_count} episodes
              </p>
            </div>
            <span className="text-gray-400">
              {expandedSeason === i ? "−" : "+"}
            </span>
          </div>

          {/* Episodes list (expandable) */}
          {expandedSeason === i && episodes && (
            <div className="pl-4 mt-2 space-y-2">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-black/30 rounded-lg p-2 flex items-start gap-3"
                >
                  {ep.still_path && (
                    <Image
                      src={ep.still_path}
                      alt={ep.title}
                      width={100}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="text-white font-medium">
                      Ep {ep.episode_number}: {ep.title}
                    </p>
                    {ep.overview && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
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
                    {selectedTvshow.trailer_url && (
                      <a
                        href={selectedTvshow.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
                      >
                        <Play size={18} /> Trailer
                      </a>
                    )}
                  </div>

                  <div className="flex-1 justify-between">
                    <Description text={selectedTvshow.description} limit={180} />
                  </div>

                  {/* Related tvshows */}
                  {relatedTvshows.length > 0 && (
                    <div className="relative mt-4">
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like {selectedTvshow.title}
                      </h3>

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
                        {relatedTvshows.map((r) => (
                          <div key={r.id} className="flex-shrink-0 snap-start">
                            <Image
                              src={r.poster_url}
                              alt={r.title}
                              width={120}
                              height={180}
                              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedTvshow(r)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={() => setSelectedTvshow(null)}
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

export default TvshowsPage;
