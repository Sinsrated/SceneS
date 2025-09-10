"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient"; 

interface Movie {
  id: number;
  title: string;
  poster_url: string; 
  description: string;
  release_date: string;
  rating: number;
  
  genre?: string;
}

const Trending = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // ✅ Fetch from Supabase
  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase.from("movies").select("*");
      if (error) {
        console.error("Error fetching movies:", error.message);
      } else {
        setMovies(data as Movie[]);
      }
    };

    fetchMovies();
  }, []);

  // Related movies (same genre if available)
  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.genre === selectedMovie.genre && m.id !== selectedMovie.id
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-8">
         <h2 className="text-2xl font-bold text-white mb-6">Trending</h2>
        {/* Movie List (scrollable) */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              whileHover={{ scale: 1.02 }}
              className="w-[180px] flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedMovie(movie)}
            >
              <Image
                src={movie.poster_url}
                alt={movie.title}
                width={180}
                height={260}
                className="object-cover h-64 w-full"
              />
             
            </motion.div>
          ))}
        </div>

        {/* Expanded Details */}
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
                    <p className="text-sm opacity-70">{selectedMovie.release_date}</p>
            <p className="text-cyan-400 font-semibold">⭐ {selectedMovie.rating}</p>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Play size={18} />
                    </button>
                    <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                      <Bookmark size={18} />
                    </button>
                  </div>
                  {relatedMovies.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        More like this
                      </h3>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                        {relatedMovies.map((m) => (
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

export default Trending;
