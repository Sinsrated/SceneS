"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  vj?: string;
  genres: string[];
  created_at?: string;
}

const LatestMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovering, setHovering] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .eq("type", "All")
          .order("created_at", { ascending: false });
        if (error) console.error(error.message);
        else setMovies(data as Movie[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Scroll function
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
  className="animate-presence-scroll w-full py-8 relative"
  onMouseEnter={() => setHovering(true)}
  onMouseLeave={() => setHovering(false)}
>
  <h2 className="text-2xl font-bold text-gray-500 mb-6">Latest Movies</h2>

  {/* Desktop scroll buttons with glass/fade 2035 vibe */}
  <button
    onClick={() => scroll("left")}
    className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full text-white transition-opacity duration-300
      bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105
      ${hovering ? "opacity-100" : "opacity-0"}`}
  >
    <ChevronLeft size={28} />
  </button>

  <button
    onClick={() => scroll("right")}
    className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full text-white transition-opacity duration-300
      bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105
      ${hovering ? "opacity-100" : "opacity-0"}`}
  >
    <ChevronRight size={28} />
  </button>

  {/* Scrollable movie list */}
  <div
    ref={scrollRef}
    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth relative"
  >
    {loading
      ? Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[180px] h-[260px] bg-white/10 rounded-2xl animate-pulse"
          ></div>
        ))
      : movies.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer relative"
            onClick={() => setSelectedMovie(m)}
          >
            <Image
              src={m.poster_url}
              alt={m.title}
              width={180}
              height={260}
              className="object-cover w-[180px] h-[260px]"
            />
            {m.vj && (
              <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                {m.vj}
              </p>
            )}
          </motion.div>
        ))}
  </div>
</section>

  );
};

export default LatestMovies;
