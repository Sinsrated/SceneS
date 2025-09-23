"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import VideoModal from "../components/videoplayer";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  description: string;
  year: string;
  rating: number;
  genre: string[];
  trailer_url?: string;
  watch_url?: string; 
  created_at: string;
}

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const relatedRef = React.useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // ✅ Fetch only movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) console.error("Error fetching movies:", error.message);

        setMovies(data || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
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

  // ✅ Related movies (same genre overlap, exclude current one)
  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.id !== selectedMovie.id &&
          m.genre?.some((g) => selectedMovie.genre?.includes(g))
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-20 px-4 md:px-12">
        {/* Skeleton */}
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

        {/* Empty */}
        {!loading && movies.length === 0 && (
          <p className="text-gray-400 text-center">No releases found.</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedMovie(movie)}
            >
              <Image
                src={movie.poster_url}
                alt={movie.title}
                width={300}
                height={450}
                className="object-cover w-full h-55"
              />
              <div className="p-3">
                <h3 className="text-white font-semibold truncate">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.year}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded Modal */}
        <AnimatePresence>
          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="animate-presence-scroll fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/5 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                <Image
                  src={selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  width={300}
                  height={450}
                  className="rounded-xl object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedMovie.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {selectedMovie.description}
                    </p>
                    <p className="text-sm opacity-70">{selectedMovie.year}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedMovie.rating}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    {selectedMovie.trailer_url && (
                      <button
                        className="bg-cyan-500 px-4 py-2 rounded-xl"
                        onClick={() => setVideoUrl(selectedMovie.trailer_url!)}
                      >
                        Play Trailer
                      </button>
                    )}

                    {selectedMovie.watch_url && (
                      <button
                        className="bg-green-500 px-4 py-2 rounded-xl"
                        onClick={() => setVideoUrl(selectedMovie.watch_url!)}
                      >
                        Play Movie
                      </button>
                    )}

                    
                  </div>

                  {/* Related */}
                  {relatedMovies.length > 0 && (
                    <div className="relative mt-4">
                      <h3 className="text-xl font-bold text-white mb-3">More like {selectedMovie.title}</h3>

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
                        {relatedMovies.map((r) => (
                          <div key={r.id} className="flex-shrink-0 snap-start">
                            <Image
                              src={r.poster_url}
                              alt={r.title}
                              width={120}
                              height={180}
                              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedMovie(r)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={() => setSelectedMovie(null)}
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

export default MoviesPage;
