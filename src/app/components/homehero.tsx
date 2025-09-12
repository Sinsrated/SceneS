"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Play } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  year: string;
  description: string;

  rating: number;
  genre: string[];       
  trailer_url: string;
}

const HeroCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [current, setCurrent] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ Fetch movies from Supabase
  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*"); // fetch all columns including genre jsonb and trailer_url

      if (error) {
        console.error("Error fetching movies:", error.message);
      } else if (data) {
        setMovies(data as Movie[]);
      }
    };

    fetchMovies();
  }, []);

  // Related movies based on overlapping genres
  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.id !== selectedMovie.id &&
          m.genre.some((g) => selectedMovie.genre.includes(g))
      )
    : [];

  // --- Auto-play carousel ---
  useEffect(() => {
    if (!movies.length) return;
    const interval = setInterval(() => {
      const next = (current + 1) % movies.length;
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
  }, [current, movies.length]);

  const handleScroll = (element: HTMLDivElement | null) => {
    if (!element) return;
    const scrollLeft = element.scrollLeft;
    const width = element.clientWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== current) setCurrent(index);
  };

  if (!movies.length) {
    return (
      <section className="w-full h-[50vh] flex items-center justify-center text-white">
        Loading movies...
      </section>
    );
  }

  const movie = movies[current];

  return (
    <section className="relative w-full px-5 py-4 flex flex-col items-center overflow-hidden">
    
     {/* Mobile Carousel */}
<div
  ref={mobileScrollRef}
  onScroll={() => handleScroll(mobileScrollRef.current)}
  className="relative z-10 top-5 flex overflow-x-auto snap-x snap-mandatory w-full scrollbar-hide scroll-smooth md:hidden"
>
  {movies.map((movie, index) => (
    <motion.div
      key={movie.id}
      ref={index === current ? cardRef : null}
      className="w-full flex-shrink-0 snap-center flex justify-center px-2"
      onClick={() => setSelectedMovie(movie)}
    >
      <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-2xl">
        {/* Background */}
        {movie.backdrop_url && (
          <>
            <div
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-40 blur-lg transition-all duration-500"
              style={{ backgroundImage: `url(${movie.backdrop_url})` }}
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/20 to-black/60 rounded-2xl" />
          </>
        )}

        {/* Poster or content (optional) */}
        <div className="flex gap-4 items-center relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer p-2">
          <Image
            src={movie.poster_url}
            alt={movie.title}
            width={100}
            height={150}
            className="object-cover h-44 w-32"
          />
          <div className="p-2 flex flex-col">
            <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{movie.description}</p>
            <p className="text-[10px] text-gray-400 mt-1">{movie.year} • {movie.genre.join(", ")}</p>
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
  className="hidden md:flex relative z-10 overflow-x-auto snap-x snap-mandatory w-full max-w-[95vw] mx-auto scrollbar-hide scroll-smooth"
>
  {movies.map((movie, index) => (
    <motion.div
      key={movie.id}
      ref={index === current ? cardRef : null}
      className="flex-shrink-0 snap-center w-full cursor-pointer hover:scale-105 transition"
      onClick={() => setSelectedMovie(movie)}
    >
      <div className="relative w-full h-[75vh] overflow-hidden rounded-2xl">
        {/* Background */}
        {movie.backdrop_url && (
          <>
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-bottom  transition-all duration-500 rounded-2xl"
              style={{ backgroundImage: `url(${movie.backdrop_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 rounded-2xl" />
          </>
        )}

        {/* Overlay Text */}
        <div className="absolute bottom-6 left-6 z-10 text-white max-w-[70%]">
          <h3 className="text-2xl font-bold">{movie.title}</h3>
          <p className="text-sm text-gray-200 line-clamp-3">{movie.description}</p>
        </div>
      </div>
    </motion.div>
  ))}
</div>



      {/* Vertical Dots */}
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
            className={`w-2 h-2 rounded-full transition-all ${
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
            animate={{ opacity: 1, y: 50 }}
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
                  <p className="text-sm text-gray-300 mb-2">
                    {selectedMovie.year} • {selectedMovie.genre.join(", ")}
                  </p>
                </div>
                <div className="flex gap-4 mb-6">
                  {selectedMovie.trailer_url && (
                    <a
                      href={selectedMovie.trailer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
                    >
                      <Play size={18} /> Watch Trailer
                    </a>
                  )}
                  <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                    <Bookmark size={18} /> Save
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
  );
};

export default HeroCarousel;
