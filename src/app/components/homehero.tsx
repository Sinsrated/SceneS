"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
  poster: string;
};

const movies: Movie[] = [
  {
    id: 1,
    title: "American Pyscho",
    year: 2000,
    genre: "Sci-Fi • Action",
    poster: "/movieposters/americanpyscho.jpg",
  },
  {
    id: 2,
    title: "Ghost II",
    year: 2014,
    genre: "Crime • Action",
    poster: "/movieposters/powerbook.jpg",
  },
  {
    id: 3,
    title: "Manchester By The Sea",
    year: 2019,
    genre: "Thriller• Mystery",
    poster: "/movieposters/manbythesea.jpg",
  },
  {
    id: 4,
    title: "1917",
    year: 2023,
    genre: "War. History",
    poster: "/movieposters/1917.jpg",
  },
  {
    id: 5,
    title: "Breaking Bad",
    year: 2018,
    genre: "Crime. Comedy",
    poster: "/movieposters/breakingbad.jpg",
  },
  {
    id: 6,
    title: "Star Warz",
    year: 2020,
    genre: "Scifi. Action",
    poster: "/movieposters/starwarz.jpg",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const movie = movies[current];

  return (
    <section className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Poster */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover object-top brightness-70" 
        // 👆 keeps top aligned, trims bottom
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

      {/* Desktop Hero Content */}
      <div className="hidden md:flex relative z-10 text-left max-w-6xl px-4 mx-auto h-full flex-col justify-end pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-wide drop-shadow-lg">
          {movie.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">
          {movie.year} • {movie.genre}
        </p>
        <div className="mt-8">
          <button className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-2xl shadow-lg hover:bg-white/20 hover:scale-105 transition-all">
            <Play size={20} /> 
          </button>
        </div>
      </div>

      {/* Mobile Hero Content */}
      <div className="md:hidden relative z-10 text-center px-6 mx-auto h-full flex flex-col justify-end pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
          {movie.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300">
          {movie.year} • {movie.genre}
        </p>
        <div className="mt-4 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl shadow-md hover:bg-white/20 hover:scale-105 transition-all">
            <Play size={16} /> 
          </button>
        </div>
      </div>

      {/* Carousel Indicators - Right Side */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-3 z-10">
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
    </section>
  );
};

export default HeroCarousel;
