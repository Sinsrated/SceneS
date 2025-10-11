"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircleIcon, Download, SkipForwardIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import VideoModal from "../components/videoplayer";
import Description from "../components/description";
import Footer from "../components/footer";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  overview: string;
  year: string;
  rating: number;
  genres: string[];
  trailers?: string;
  watch_url?: string; 
  created_at: string;
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


const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const relatedRef = React.useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
  
    const [hovering, setHovering] = useState(false);
    const [showSkipButton, setShowSkipButton] = useState(false);
    const [skipTimeout, setSkipTimeout] = useState<NodeJS.Timeout | null>(null);
    const iframeWrapperRef = React.useRef<HTMLDivElement>(null);
    const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  

  // ✅ Fetch only movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) console.error("Error fetching movies:", error.message);

        setMovies(data || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
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

  // ✅ Related movies (same genre overlap, exclude current one)
  const relatedMovies = selectedMovie
    ? movies.filter(
        (m) =>
          m.id !== selectedMovie.id &&
          m.genres?.some((g) => selectedMovie.genres?.includes(g))
      )
    : [];

  return (
    <>
      <Header />
      <section className="w-full py-20 px-4 md:px-12">
        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 x2:grid-cols-12 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                 <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    
                  </p>
                <div className="w-full h-55 bg-black/40"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-black/40 rounded w-3/4"></div>
                  
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && movies.length === 0 && (
          <p className="text-gray-400 text-center">No releases found.</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 x2:grid-cols-12 gap-6">
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedMovie(movie)}
            >
              <Image
                src={movie.poster_url}
                alt={movie.title}
                width={300}
                height={450}
                className="object-cover w-full h-55"
              />
                                      <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
    {movie.vj}
  </p>
              <div className="p-3">
                <h3 className="text-gray-500 font-semibold truncate">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.year}</p>
              </div>
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
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedMovie.rating}
                    </p>

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
                {/* Related Movies */}
                {relatedMovies.length > 0 && (
                  <div className="flex-1 mt-6">
                    <h3 className="text-xl font-bold text-white mb-3">
                      More like {selectedMovie.title}
                    </h3>

                    {/* Desktop scroll */}
                    <div className="hidden md:block relative">
                      {/* <button
                        onClick={() => scrollRelated("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
                      >
                        <ChevronLeft size={28} />
                      </button>
                      <button
                        onClick={() => scrollRelated("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
                      >
                        <ChevronRight size={28} />
                      </button> */}

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
      <Footer />
    </>
  );
};

export default MoviesPage;
