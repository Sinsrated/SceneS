"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircleIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  SkipForwardIcon,
} from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import Description from "./description";
import VideoModal from "./videoplayer";
import Cast from "./cast";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  overview: string;
  year: string;
  trailers?: unknown;
  rating: number;
  watch_url?: string;
  genres: string[];
  type?: string;
  created_at?: string;
  vj?: string;
  video_url?: string;
  
}

interface Trailer {
  id: string;
  key: string;
  name: string;
  site: string;
  size?: number;
  type?: string;
  official?: boolean;
  published_at?: string;
}

const LatestMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [skipTimeout, setSkipTimeout] = useState<NodeJS.Timeout | null>(null);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);

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

  const handleInteraction = () => {
    setShowSkipButton(true);
    if (skipTimeout) clearTimeout(skipTimeout);
    const timeout = setTimeout(() => setShowSkipButton(false), 2000);
    setSkipTimeout(timeout);
  };

  const youtubeKeys: string[] = React.useMemo(() => {
    if (!selectedMovie?.trailers) return [];

    try {
      const trailersObj =
        typeof selectedMovie.trailers === "string"
          ? JSON.parse(selectedMovie.trailers)
          : selectedMovie.trailers;

      const trailerArray: Trailer[] = trailersObj?.trailers ?? [];

      return trailerArray
        .filter((t) => t.site === "YouTube" && t.key)
        .map((t) => t.key);
    } catch (err) {
      console.error("Failed to parse trailers JSON:", err);
      return [];
    }
  }, [selectedMovie]);

  const nextTrailer = () => {
    if (youtubeKeys.length === 0) return;
    setCurrentTrailerIndex((prev) => (prev + 1) % youtubeKeys.length);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

 

  const relatedMovies = React.useMemo(() => {
    if (!selectedMovie || !selectedMovie.genres?.length) return [];
    return movies.filter(
      (m) =>
        m.id !== selectedMovie.id &&
        m.genres?.some((g) => selectedMovie.genres.includes(g))
    );
  }, [selectedMovie, movies]);

  return (
    <>
      <Header />
      <section
        className="animate-presence-scroll w-full py-8 relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <h2 className="text-2xl font-bold text-gray-500 mb-6">Latest Movies</h2>

        {/* Scroll buttons */}
        <button
          onClick={() => scroll("left")}
          className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-opacity duration-300 ${
            hovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={() => scroll("right")}
          className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-opacity duration-300 ${
            hovering ? "opacity-100" : "opacity-0"
          }`}
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
                  className="flex-shrink-0 w-[180px] bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="w-full h-[260px] bg-black/40"></div>
                </div>
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
                    className="object-cover"
                  />
                  <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    {m.vj}
                  </p>
                </motion.div>
              ))}
        </div>

        {/* Selected movie modal */}
        <AnimatePresence>
          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-presence-scroll fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg overflow-y-auto p-4"
            >
              <div className="flex flex-col md:flex-row gap-8 max-w-1xl mx-auto ">
                {/* Video Section */}
                <div className="md:w-2/3 space-y-6">
                  <div
                    ref={iframeWrapperRef}
                    className="relative w-full top-5 aspect-video rounded-xl overflow-hidden shadow-lg"
                    onMouseMove={handleInteraction}
                    onTouchStart={handleInteraction}
                  >
                    {videoUrl ? (
                      <VideoModal
                        url={videoUrl}
                        onClose={() => setVideoUrl(null)}
                      />
                    ) : youtubeKeys.length > 0 ? (
                      <iframe
                        key={youtubeKeys[currentTrailerIndex]}
                        src={`https://www.youtube.com/embed/${youtubeKeys[currentTrailerIndex]}?autoplay=0&controls=1&rel=0&modestbranding=1`}
                        title="YouTube trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <p className="text-white text-center pt-10">
                        No trailer available
                      </p>
                    )}

                    {youtubeKeys.length > 1 && (
                      <button
                        onClick={nextTrailer}
                        className={`absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full text-white backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-opacity duration-300 ${
                          showSkipButton ? "opacity-100" : "opacity-0"
                        } hover:bg-white/20`}
                      >
                        <SkipForwardIcon size={26} />
                      </button>
                    )}
                  </div>

                  <div className="text-white space-y-2">
                    <h2 className="text-xl font-bold">
                      {selectedMovie.title}{" "}
                      <span className="text-sm text-gray-400 ml-2">
                        {selectedMovie.vj}
                      </span>
                    </h2>
                    <p className="text-sm opacity-70">{selectedMovie.year}</p>
                   

                    <div className="flex flex-row items-center gap-2 mt-4">
                    {selectedMovie.video_url && (
                      <button
                        onClick={() =>
                          setVideoUrl(selectedMovie.video_url as string)
                        }
                        className="flex items-center gap-2 bg-cyan-300/10 backdrop-blur-md w-full left-1/2 px-4 py-2  text-black hover:bg-white/20 "
                      >
                        <PlayCircleIcon size={20} /> Play
                      </button>
                    )}

{/* Download button in top-right corner */}
{selectedMovie?.video_url && (
  <a
    href={`/api/download-video?url=${encodeURIComponent(
      selectedMovie.video_url.replace(/^http:/, "https:")
    )}&name=${encodeURIComponent(selectedMovie.title || "movie")}`}
    className="text-xs text-cyan-400 px-4 py-2 w-full  bg-white/10 backdrop-blur-md  hover:bg-cyan-300/20 flex items-center gap-1 transition"
  >
    <Download size={14} /> Download
  </a>
)}

                      </div>

                    <Description
                      text={selectedMovie.overview}
                      limit={180}
                    />

                  </div>
                </div>

<div className="md:w-1/3 flex flex-col gap-4">
        <Cast itemId={selectedMovie.id} type="movie" />

               
                {/* Related Movies */}
                {relatedMovies.length > 0 && (
                  <div className="flex-1 mt-6">
                    <h3 className="text-xl font-bold text-white mb-3">
                      More like {selectedMovie.title}
                    </h3>

                    {/* Desktop scroll */}
                    <div className="hidden md:block relative">
                     

                      <div
                        ref={relatedRef}
                        className="animate-presence-scroll grid grid-cols-3 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth relative"
                      >
                        {relatedMovies.map((r) => (
                          <Image
                            key={r.id}
                            src={r.poster_url}
                            alt={r.title}
                            width={130}
                            height={180}
                            className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() => {
                              setSelectedMovie(r);
                              setVideoUrl(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mobile dropdown */}
                   <div className="md:hidden relative mt-2">
  <button
    className="w-full bg-white/5 text-white p-2 rounded-lg flex justify-between items-center hover:bg-white/10"
    onClick={() => setRelatedDropdownOpen((prev) => !prev)}
  >
    <span>More like this</span>
    <ChevronRight
      className={`w-4 h-4 transform transition-transform duration-200 ${
        relatedDropdownOpen ? "rotate-90" : ""
      }`}
    />
  </button>

  {relatedDropdownOpen && (
    <div className="animate-presence-scroll absolute w-full mt-1 bg-white/5 rounded-lg max-h-60 overflow-y-auto z-50 shadow-lg grid grid-cols-2 gap-2 p-2">
      {relatedMovies.map((m) => (
        <div key={m.id} className="flex justify-center">
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
  )}
</div>
  </div>
                )}
                </div>
                {/* Close Button */}
                <button
                  className="absolute top-2 right-2 text-white text-2xl"
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

export default LatestMovies;
