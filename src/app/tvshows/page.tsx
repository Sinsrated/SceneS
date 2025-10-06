"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipForward, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import Description from "../components/description";
import VideoModal from "../components/videoplayer";

interface Episode {
  name: string;
  overview?: string;
  episode_number: number;
  runtime?: number;
  still_path?: string;
  video_url?: string;
}

interface Season {
  name: string;
  overview?: string;
  created_at?: string;
  poster_path?: string;
  episode_count: number;
  season_number: number;
  episodes?: Episode[];
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

interface Tvshows {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  overview: string;
  release_date: string;
  rating: number;
  episode?: number;
  seasons?: Season[];
  genres: string[];
  trailers?: unknown;
  created_at: string;
  vj?: string;
}

const TvshowsPage = () => {
  const [tvshowsList, setTvshowsList] = useState<Tvshows[]>([]);
  const [selectedTvshow, setSelectedTvshow] = useState<Tvshows | null>(null);
  const [loading, setLoading] = useState(true);
  const relatedRef = useRef<HTMLDivElement>(null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);


 const [hovering, setHovering] = useState(false);
 const [showSkipButton, setShowSkipButton] = useState(false);
const [skipTimeout, setSkipTimeout] = useState<NodeJS.Timeout | null>(null);
const iframeWrapperRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch only tvshows
  useEffect(() => {
    const fetchTvshows = async () => {
      try {
        const { data, error } = await supabase
          .from("tvshows")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) console.error("Error fetching tvshows:", error.message);
        setTvshowsList(data || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTvshows();
  }, []);

  const handleInteraction = () => {
  setShowSkipButton(true);
  if (skipTimeout) clearTimeout(skipTimeout);


const timeout = setTimeout(() => setShowSkipButton(false), 2000);
  setSkipTimeout(timeout);
};

  const scroll = (direction: "left" | "right") => {
    if (relatedRef.current) {
      const scrollAmount = 200;
      relatedRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // ✅ Auto-expand season 1 when modal opens
  useEffect(() => {
    if (selectedTvshow?.seasons?.length) {
      setExpandedSeason(selectedTvshow.seasons[0].season_number);
    } else {
      setExpandedSeason(null);
    }
  }, [selectedTvshow]);

  const handleSeasonClick = (seasonNumber: number) => {
    setExpandedSeason(expandedSeason === seasonNumber ? null : seasonNumber);
  };

  // ✅ Related tvshows
  const relatedTvshows = selectedTvshow
    ? tvshowsList.filter(
        (t) =>
          t.id !== selectedTvshow.id &&
          t.genres?.some((g) => selectedTvshow.genres?.includes(g))
      )
    : [];
    const youtubeKeys: string[] = React.useMemo(() => {
          if (!selectedTvshow?.trailers) return [];
      
          try {
            let trailersObj;
      
            if (typeof selectedTvshow.trailers === "string") {
              trailersObj = JSON.parse(selectedTvshow.trailers);
            } else {
              trailersObj = selectedTvshow.trailers;
            }
      
            const trailerArray: Trailer[] = trailersObj?.trailers ?? [];
      
            return trailerArray
              .filter((t) => t.site === "YouTube" && t.key)
              .map((t) => t.key);
          } catch (err) {
            console.error("Failed to parse trailers JSON:", err);
            return [];
          }
        }, [selectedTvshow]);
      
    
        
    
      const nextTrailer = () => {
        if (youtubeKeys.length === 0) return;
        setCurrentTrailerIndex((prev) => (prev + 1) % youtubeKeys.length);
      };
  

    
  return (
    <>
      <Header />
      <section className="w-full py-20 px-4 md:px-12">
        {/* Skeleton state */}
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

        {/* Empty state */}
        {!loading && tvshowsList.length === 0 && (
          <p className="text-gray-400 text-center">No tvshows found.</p>
        )}

         {/* Grid of shows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 x2:grid-cols-12 gap-6">
          {tvshowsList.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-cyan-500/20 transition"
              onClick={() => setSelectedTvshow(t)}
            >
              <div className="relative">
                <Image
                  src={t.poster_url}
                  alt={t.title}
                  width={300}
                  height={450}
                  className="object-cover w-full h-55"
                />
                {t.vj && (
                  <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    {t.vj}
                  </p>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-gray-500 font-semibold truncate">{t.title}</h3>
                <p className="text-sm text-gray-400">{t.release_date}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded view */}
          <AnimatePresence>
            {selectedTvshow && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="animate-presence-scroll fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg overflow-y-auto p-4"
              >
    <div className="flex flex-col md:flex-row gap-8 max-w-1xl mx-auto">
      {/* Left Side */}
      <div className="md:w-2/3 space-y-6">
       <div
        ref={iframeWrapperRef}
        className="relative w-full top-5 aspect-video rounded-xl overflow-hidden shadow-lg"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {videoUrl ? (
          <VideoModal url={videoUrl} onClose={() => setVideoUrl(null)} />
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
          <p className="text-white text-center pt-10">No trailer available</p>
        )}
    
        {/* SkipForward button with 2035 glass vibes */}
        {youtubeKeys.length > 1 && (
          <button
            onClick={nextTrailer}
            className={`absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full text-white backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-opacity duration-300 ${
              showSkipButton ? "opacity-100" : "opacity-0"
            } hover:bg-white/20`}
          >
            <SkipForward size={26} />
          </button>
        )}
      </div>
         <h2 className="text-2xl font-bold text-white">
                      {selectedTvshow.title}{" "}
                      {selectedTvshow.vj && (
                        <span className="text-sm text-gray-400 ml-2">
                          {selectedTvshow.vj}
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-400 text-sm">{selectedTvshow.release_date}</p>
                    <p className="text-cyan-400 font-semibold">
                      ⭐ {selectedTvshow.rating}
                    </p>
                     {/* Description */} 
    
                    <Description text={selectedTvshow.overview} limit={180} />
    
        {/* Related / More like this - desktop scroll */}
        {relatedTvshows.length > 0 && (
          <div className="relative mt-6">
            <h3 className="text-xl font-bold text-white mb-3">More like {selectedTvshow.title}</h3>
    
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
                        {relatedTvshows.map((r) => (
                          <Image
                            key={r.id}
                            src={r.poster_url}
                            alt={r.title}
                            width={130}
                            height={180}
                            className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() => {
                              setSelectedTvshow(r);
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
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                relatedDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
    
          {relatedDropdownOpen && (
            <div className="absolute w-full mt-1 bg-white/5 rounded-lg max-h-60 overflow-y-auto z-50 shadow-lg flex flex-col gap-2 p-2">
              {relatedTvshows.map((r) => (
                <div
                  key={r.id}
                  className="cursor-pointer p-2 hover:bg-white/10 rounded-lg flex items-center gap-2"
                  onClick={() => {
                    setSelectedTvshow(r);
                    setVideoUrl(null);
                    setRelatedDropdownOpen(false);
                  }}
                >
                  <Image
                    src={r.poster_url}
                    alt={r.title}
                    width={60}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <span className="text-white">{r.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
      </div>
    
                  {/* Right Side */}
                  <div className="md:w-1/3 flex flex-col gap-4">
                     {/* Season Selector */}
                    <div className="w-full max-w-md relative">
                      <button
                        className="w-full bg-white/5 text-white flex justify-between items-center p-2 rounded-lg hover:bg-white/10"
                        onClick={() => setSeasonDropdownOpen((prev) => !prev)}
                      >
                        <span>
                          {selectedTvshow.seasons?.find(
                            (s) => s.season_number === expandedSeason
                          )?.name || "Select Season"}
                        </span>
                        <svg
                          className={`w-4 h-4 transform transition-transform duration-200 ${
                            seasonDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
    
                      {seasonDropdownOpen && (
                        <div className="absolute w-full mt-1 bg-white/5 rounded-lg max-h-60 overflow-y-auto z-50 shadow-lg">
                          {selectedTvshow.seasons?.map((season) => (
                            <div
                              key={season.season_number}
                              className={`cursor-pointer p-2 hover:bg-white/30 ${
                                expandedSeason === season.season_number
                                  ? "bg-white/30"
                                  : ""
                              }`}
                              onClick={() => {
                                setExpandedSeason(season.season_number);
                                setSeasonDropdownOpen(false);
                              }}
                            >
                              {season.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
    
                    {/* Episodes */}
                    <div className="space-y-3 mt-4">
                      {selectedTvshow.seasons
                        ?.find((s) => s.season_number === expandedSeason)
                        ?.episodes?.map((ep, i) => (
                          <div
                            key={i}
                            className="bg-black/30 rounded-lg p-2 flex items-start gap-3"
                          ><div className="bg-black/30 rounded-lg p-2 flex items-start gap-3 relative">
      {ep.still_path && (
     <div className="relative w-[100px] h-[60px] flex-shrink-0">
      <Image
        src={ep.still_path}
        alt={ep.name}
        fill
        className="rounded-md object-cover"
      />
      {/* Play button overlay */}
      {ep.video_url && (
        <button
          onClick={() => setVideoUrl(ep.video_url!)}
          className="absolute inset-0 flex items-center justify-center rounded-md
                     bg-white/5  border border-white/20
                     hover:bg-white/20 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
        >
          <Play size={20} className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200" />
        </button>
      )}
    </div>
    
      )}
    
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-white font-medium">
            Ep {ep.episode_number}: {ep.name}
          </p>
          {ep.runtime && (
            <p className="text-xs text-gray-400">{ep.runtime} min</p>
          )}
          {ep.overview && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {ep.overview}
            </p>
          )}
        </div>
      {/* Download button in top-right corner */}
      {ep.video_url && (
        <div className="absolute top-1 right-1">
       <button
    className="text-xs text-cyan-400 px-2 py-1 bg-black/30 backdrop-blur-md rounded-md hover:bg-white/20 flex items-center gap-1 transition"
    onClick={async () => {
      try {
        const videoUrl = ep?.video_url?.replace(/^http:/, "https:"); // force HTTPS

        if (!videoUrl) {
          alert("⚠️ No video URL found for this movie.");
          return;
        }

        const response = await fetch(videoUrl, { mode: "cors" });
        if (!response.ok) throw new Error(`Failed to fetch video. Status: ${response.status}`);

        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${ep?.name || "episode"}.mp4`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error("❌ Download failed:", error);
        alert("⚠️ Download failed. Check the video link or permissions.");
      }
    }}
  >
            <Download size={14} /> Download
          </button>
        </div>
      )}
    
    
        </div>
      </div>
    </div>
     ))}
                    </div>
    
                   
                  </div>
                </div>
    
                {/* Close */}
                <button
                  className="absolute top-2 right-2 text-white text-2xl"
                  onClick={() => setSelectedTvshow(null)}
                >
                  ✕
                </button>
                
              </motion.div>
            )}
          </AnimatePresence>
      </section>
    </>
  );
};

export default TvshowsPage;
