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
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* Background Poster */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover brightness-60"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

     {/* Hero Content */}
<div className="relative z-10 text-center max-w-4xl px-6 mx-auto h-full flex flex-col justify-end pb-12">
  <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-wide drop-shadow-lg">
    {movie.title}
  </h1>
  <p className="mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl text-gray-300">
    {movie.year} • {movie.genre}
  </p>
  <div className="mt-4 sm:mt-8 flex justify-center">
    <button className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-2xl shadow-lg hover:bg-white/20 hover:scale-105 transition-all">
      <Play size={18} /> Watch Trailer
    </button>
  </div>
</div>

      
{/* Carousel Indicators - Vertical Left */}
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
