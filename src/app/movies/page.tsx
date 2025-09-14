"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

// Movie type
interface Movie {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  description: string;
  year: string;
  rating: number;
  genre: string[]; // assuming Postgres array
  trailer_url: string;
}

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase.from("movies").select("*");
      if (error) {
        console.error("Error fetching movies:", error.message);
      } else {
        setMovies(data as Movie[]);
      }
      setLoading(false);
    };

    fetchMovies();
  }, []);

  // ✅ Related movies (same genre, exclude current one)
  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.id !== selectedMovie.id &&
          m.genre.some((g) => selectedMovie.genre.includes(g))
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
                <div className="w-full h-72 bg-black/40"></div>

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
        {!loading && movies.length === 0 && (
          <p className="text-gray-400 text-center">No movies found.</p>
        )}

        {/* Grid of movies */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {movies.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedMovie(m)}
            >
              <Image
                src={m.poster_url}
                alt={m.title}
                width={300}
                height={450}
                className="object-cover w-full h-72"
              />
              <div className="p-3">
                <h3 className="text-white font-semibold truncate">{m.title}</h3>
                <p className="text-sm text-gray-400">{m.year}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded modal */}
        <AnimatePresence>
          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
            >
              <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
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
                  <div className="flex gap-4 mb-6">
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Play size={18} />
                      Play
                    </button>
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Bookmark size={18} />
                      Watchlist
                    </button>
                  </div>

                  {/* ✅ Related movies section */}
                  {relatedMovies.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like this
                      </h3>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                        {relatedMovies.map((m) => (
                          <div key={m.id} className="flex-shrink-0 snap-start">
                            <Image
                              src={m.poster_url}
                              alt={m.title}
                              width={120}
                              height={180}
                              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedMovie(m)}
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
