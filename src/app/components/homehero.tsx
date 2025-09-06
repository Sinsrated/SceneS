"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
  description: string;
  poster: string;
  background: string;
};

const movies: Movie[] = [
  {
    id: 1,
    title: "Power",
    year: 2014,
    genre: "Crime • Action",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "/movieposters/ghost.jpg",
    background: "/movieposters/powerbook.jpg",
  },
  {
    id: 2,
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi • Thriller",
    description:
      "A skilled thief is offered a chance to have his past crimes forgiven if he implants an idea into a target's subconscious.",
    poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    background: "https://www.ndtv.com/photos/entertainment/stills-inception-7704",
  },
  {
    id: 3,
    title: "Dune",
    year: 2021,
    genre: "Sci-Fi • Drama",
    description:
      "A young noble must navigate politics, betrayal, and prophecy on a desert planet that holds the galaxy’s most valuable resource.",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    background: "https://www.vanityfair.com/hollywood/2020/04/behold-dune-an-exclusive-look-at-timothee-chalamet-zendaya-oscar-isaac-and-more",
  },
  {
    id: 4,
    title: "The Batman",
    year: 2022,
    genre: "Action • Crime",
    description:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    background: "https://www.mpeppler.com/shop/the-batman-alternative-movie-poster",
  },
];


const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [bgHeight, setBgHeight] = useState<number>(0);

  // Update background height when the card changes
  useEffect(() => {
    if (cardRef.current) {
      setBgHeight(cardRef.current.offsetHeight);
    }
  }, [current]);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const movie = movies[current];

  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.genre.split("•")[0].trim() ===
            selectedMovie.genre.split("•")[0].trim() && m.id !== selectedMovie.id
      )
    : [];

  return (
    <section className="relative w-full px-8 py-20 flex flex-col items-center">
      {/* Background matches card height */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[95%] bg-cover bg-center opacity-40 blur-lg transition-all duration-700 rounded-2xl"
        style={{
          backgroundImage: `url(${movie.background})`,
          height: bgHeight,
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] bg-gradient-to-b from-black/60 via-black/40 to-black/80 rounded-2xl"
        style={{
          height: bgHeight,
        }}
      />

      {/* Carousel Content */}
      <div className="relative z-10 flex justify-center items-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="flex gap-6 items-center bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer max-w-3xl w-full"
            ref={cardRef}
            onClick={() => setSelectedMovie(movie)}
          >
            <Image
              src={movie.poster}
              alt={movie.title}
              width={140}
              height={200}
              className="object-cover h-56 w-36"
            />
            <div className="p-6 flex flex-col">
              <h3 className="text-2xl font-semibold text-white">
                {movie.title}
              </h3>
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                {movie.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {movie.year} • {movie.genre}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-3 mt-6 z-10 relative">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-red-500 scale-125" : "bg-gray-500/50"
            }`}
          />
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-6"
          >
            <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full p-6 flex flex-col md:flex-row gap-6 relative">
              <Image
                src={selectedMovie.poster}
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
                </div>
                <div className="flex gap-4 mb-6">
                  <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                    <Play size={18} /> Play
                  </button>
                  <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                    <Plus size={18} /> Add
                  </button>
                </div>
                {relatedMovies.length > 0 && (
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
  );
};

export default HeroCarousel;
