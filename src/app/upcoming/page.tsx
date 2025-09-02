"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";

type Upcoming = {
  id: number;
  title: string;
  poster: string;
  release: string;
  description: string;
};

const upcoming: Upcoming[] = [
  {
    id: 1,
    title: "American Pyscho 2",
    poster: "/movieposters/americanpyscho.jpg",
    release: "March 15, 2035",
    description:
      "In a hyper-connected Tokyo, an AI gains sentience, blurring the line between human and machine.",
  },
  {
    id: 2,
    title: "Power Book II: season 6",
    poster: "/movieposters/powerbook.jpg",
    release: "June 3, 2035",
    description:
      "A team of rebels races against time to prevent a solar AI satellite from enslaving humanity.",
  },
  {
    id: 3,
    title: "The Conjuring",
    poster: "/movieposters/conjuring.jpg",
    release: "October 27, 2035",
    description:
      "After Earth collapses, survivors embark on a cosmic journey to settle among the stars.",
  },
];

export default function UpcomingPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0f1a]/20 to-black text-white p-6 pt-24">
     

      {/* Upcoming Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {upcoming.map((movie) => (
          <div
            key={movie.id}
            onMouseEnter={() => setHovered(movie.id)}
            onMouseLeave={() => setHovered(null)}
            className="relative group rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,0,200,0.4)] transition-all duration-500"
          >
            {/* Poster */}
            <Image
              src={movie.poster}
              alt={movie.title}
              width={400}
              height={600}
              className="w-full h-[500px] object-cover object-center"
            />

            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex flex-col justify-end p-6">
              <h2 className="text-2xl font-bold mb-2 text-cyan-300 tracking-wide drop-shadow">
                {movie.title}
              </h2>
              <p className="text-sm text-gray-200 line-clamp-2">
                {movie.description}
              </p>

              {/* Release Date */}
              <div className="flex items-center gap-2 mt-4 text-pink-400 text-sm">
                <Calendar size={16} />
                <span>{movie.release}</span>
              </div>
            </div>

            {/* Neon border pulse */}
            {hovered === movie.id && (
              <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/60 animate-pulse pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
