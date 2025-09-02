"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  poster: string;
  year: string;
  description: string;
};

const movies: Movie[] = [
  {
    id: 1,
    title: "American Pyscho",
    poster: "/movieposters/americanpyscho.jpg",
    year: "2000",
    description:
      "Patrick Bateman, a wealthy investment banker in 1980s Manhattan, has a secret life as a serial killer.",
  },
  {
    id: 2,
    title: "Ghost II",
    poster: "/movieposters/conjuring.jpg",
    year: "2020 - 2024",
    description:
      "After his father's death, Tariq is thrust into a new world of crime, driven by the need to save his family.",
  },
  {
    id: 3,
    title: "Manchester By The Sea",
    poster: "/movieposters/manbythesea.jpg",
    year: "2016",
    description:
      "The film is a powerful exploration of grief, trauma, responsibility, and the struggle to move forward after profound loss.",
  },
  // ➕ Add more movie objects here
];

export default function MoviesPage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 pt-24">
     

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <button
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className="relative group overflow-hidden rounded-2xl shadow-lg transition transform hover:scale-105"
          >
            <Image
              src={movie.poster}
              alt={movie.title}
              width={300}
              height={450}
              className="w-auto h-[200px] object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <span className="text-red-400 font-bold text-lg">
                View Details
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal Preview */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-lg w-full shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition"
            >
              <X size={22} />
            </button>

            {/* Poster & Info */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Image
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                width={200}
                height={300}
                className="rounded-xl shadow-md"
              />
              <div className="flex flex-col justify-between">
                <h2 className="text-2xl font-bold text-red-400">
                  {selectedMovie.title}
                </h2>
                <p className="text-sm text-gray-300">{selectedMovie.year}</p>
                <p className="mt-2 text-gray-200 text-sm leading-relaxed">
                  {selectedMovie.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
