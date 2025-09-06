"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  poster: string;
  description: string;
  genre: string;
};

const movies: Movie[] = [
  
  {
    id: 2,
    title: "Inception",
    poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    description:
      "A skilled thief is offered a chance to have his past crimes forgiven if he implants an idea into a target's subconscious.",
    genre: "Sci-Fi",
  },
  {
    id: 3,
    title: "Dune",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    description:
      "A young noble must navigate politics, betrayal, and prophecy on a desert planet that holds the galaxy’s most valuable resource.",
    genre: "Sci-Fi",
  },
  {
    id: 4,
    title: "The Batman",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    description:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
    genre: "Action",
  },
];

const LatestMovies = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) => m.genre === selectedMovie.genre && m.id !== selectedMovie.id
      )
    : [];

  return (
    <section className="w-full px-6 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Latest Movies</h2>

      {/* Movie List */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {movies.map((movie) => (
          <motion.div
            key={movie.id}
            whileHover={{ scale: 1.02 }}
            className="min-w-{180px} bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedMovie(movie)}
          >
            <Image
              src={movie.poster}
              alt={movie.title}
              width={180}
              height={260}
              className="object-cover h-64 w-full"
            />
            <div className="p-3">
              <h3 className="text-sm font-semibold text-white truncate">
                {movie.title}
              </h3>
              
              
            </div>
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
            className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-6"
          >
            <div className="bg-white/10 rounded-2xl shadow-2xl max-w-4xl w-full p-6 flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <Image
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                width={300}
                height={450}
                className="rounded-xl object-cover"
              />

              {/* Details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedMovie.title}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    {selectedMovie.description}
                  </p>
                </div>

                <div className="flex gap-4 mb-6">
                  <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                    <Play size={18} /> Play
                  </button>
                  <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                    <Plus size={18} /> Add
                  </button>
                </div>

                {/* More Like This */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    More like this
                  </h3>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                    {relatedMovies.map((m) => (
                      <Image
                        key={m.id}
                        src={m.poster}
                        alt={m.title}
                        width={120}
                        height={180}
                        className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedMovie(m)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Close overlay */}
            <button
              className="absolute top-6 right-6 text-white text-2xl"
              onClick={() => setSelectedMovie(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LatestMovies;
