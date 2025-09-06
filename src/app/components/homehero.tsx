"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Play } from "lucide-react";

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
    background:
      "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
  },
  {
    id: 3,
    title: "Dune",
    year: 2021,
    genre: "Sci-Fi • Drama",
    description:
      "A young noble must navigate politics, betrayal, and prophecy on a desert planet that holds the galaxy’s most valuable resource.",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    background:
      "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
  {
    id: 4,
    title: "The Batman",
    year: 2022,
    genre: "Action • Crime",
    description:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    background:
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Separate refs for mobile + desktop
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (current + 1) % movies.length;
      setCurrent(next);

      // Detect screen size → scroll correct carousel
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
  }, [current]);

  // Sync dots on manual scroll
  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    const scrollLeft = ref.current.scrollLeft;
    const width = ref.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== current) setCurrent(index);
  };

  const movie = movies[current];

  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.genre.split("•")[0].trim() ===
            selectedMovie.genre.split("•")[0].trim() &&
          m.id !== selectedMovie.id
      )
    : [];

  return (
    <section className="relative w-full px-5 py-16 flex flex-col items-center overflow-hidden">
      {/* Background */}
      {movie?.background && (
        <>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[95%] bg-cover bg-center opacity-40 blur-lg transition-all duration-700 rounded-2xl h-[50vh]"
            style={{ backgroundImage: `url(${movie.background})` }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] bg-gradient-to-b from-black/60 via-black/40 to-black/80 rounded-2xl h-[50vh]" />
        </>
      )}

      {/* Mobile Carousel */}
      <div
        ref={mobileScrollRef}
        onScroll={() => handleScroll(mobileScrollRef)}
        className="relative z-10 top-5 flex overflow-x-auto snap-x snap-mandatory w-full scrollbar-hide scroll-smooth md:hidden"
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            ref={index === current ? cardRef : null}
            className="w-full flex-shrink-0 snap-center flex justify-center px-2"
            onClick={() => setSelectedMovie(movie)}
          >
            <div className="flex gap-4 items-center bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer">
              <Image
                src={movie.poster}
                alt={movie.title}
                width={100}
                height={150}
                className="object-cover h-44 w-32"
              />
              <div className="p-4 flex flex-col">
                <h3 className="text-lg font-semibold text-white">
                  {movie.title}
                </h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                  {movie.description}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {movie.year} • {movie.genre}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Carousel */}
      <div
        ref={desktopScrollRef}
        onScroll={() => handleScroll(desktopScrollRef)}
        className="hidden md:flex relative z-10 top-5 overflow-x-auto snap-x snap-mandatory w-[80%] scrollbar-hide scroll-smooth"
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            ref={index === current ? cardRef : null}
            className="flex-shrink-0 snap-center w-full cursor-pointer hover:scale-105 transition"
            onClick={() => setSelectedMovie(movie)}
          >
            <div className="flex items-center bg-white/5 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
              <Image
                src={movie.poster}
                alt={movie.title}
                width={350}
                height={500}
                className="object-cover h-[45vh] w-[30vh]"
              />
              <div className="p-4 flex flex-col">
                <h3 className="text-xl font-semibold text-white">
                  {movie.title}
                </h3>
                <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                  {movie.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {movie.year} • {movie.genre}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
  {movies.map((_, index) => (
    <button
      key={index}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
          >
            <div className="bg-white/10 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
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
                        <div key={m.id} className="flex-shrink-0 snap-start">
                          <Image
                            src={m.poster}
                            alt={m.title}
                            width={120}
                            height={180}
                            className="rounded-lg object-cover cursor-pointer hover:scale-105 md:hover:scale-105 transition"
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
  );
};

export default HeroCarousel;
