"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircleIcon, Bookmark, SkipForward, Download, ChevronLeft, ChevronRight, SkipForwardIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Description from "./description";  
import VideoModal from "./videoplayer";
import Cast from "./cast";

interface Item {
  id: number;
  type: "movie" | "tvshows";
  title: string;
  poster_url: string;
  backdrop_url: string;
  release_date: string;
  overview: string;
  trailers?: string;
  rating?: number;
  genres: string[];
  episodes?: number;
  seasons?: Season[];
  created_at: number;
  vj?: string;
  status?: string;
  video_url?: string;
  cast?: string[]
}

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

// Define Supabase row types
interface MovieRow {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  realease_date: string;
  overview: string;
  trailers?: string;
  rating?: number;
  genres: string[];
  created_at: number;
  vj?: string;
  video_url?: string;
  
}

interface TvshowRow extends MovieRow {
  episodes?: number;
  seasons?: number;
}

const HeroCarousel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
   const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
    const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
   const relatedRef = useRef<HTMLDivElement>(null);
   const [hovering, setHovering] = useState(false);
   const [showSkipButton, setShowSkipButton] = useState(false);
  const [skipTimeout, setSkipTimeout] = useState<NodeJS.Timeout | null>(null);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);

  // Fetch movies + series from Supabase
useEffect(() => {
  const fetchData = async () => {
    try {
      const { data: moviesData, error: movieErr } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (movieErr) console.error("Movies fetch error:", movieErr.message);

      const { data: seriesData, error: seriesErr } = await supabase
        .from("tvshows")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (seriesErr) console.error("Tvshows fetch error:", seriesErr.message);

      // Merge movies + series into ONE array
      const combined: Item[] = [
        ...(moviesData?.map((m) => ({
          id: m.id ?? 0,
          type: "movie" as const,
          title: m.title ?? "Untitled",
          poster_url: m.poster_url ?? "",
          backdrop_url: m.backdrop_url ?? "",
          release_date: m.release_date ?? "",
          vj: m.vj ?? "",
          overview: m.overview ?? "",  
          trailers: m.trailers ?? undefined,
          rating: m.rating ?? undefined,
          genres: m.genres ?? [],
          video_url: m.video_url ?? undefined,
          created_at: new Date(m.created_at).getTime(), // ✅ convert to timestamp
        })) ?? []),
        ...(seriesData?.map((s) => ({
          id: s.id ?? 0,
          type: "tvshows" as const,
          title: s.title ?? "Untitled",
          poster_url: s.poster_url ?? "",
          backdrop_url: s.backdrop_url ?? "",
          release_date: s.release_date ?? "",
          vj: s.vj ?? "",
          overview: s.overview ?? "",
          trailers: s.trailers ?? undefined,
          rating: s.rating ?? undefined,
          genres: s.genres ?? [],
          status: s.status ?? "",
          episodes: s.episodes ?? undefined,
          seasons: s.seasons ?? undefined,
          created_at: new Date(s.created_at).getTime(), // ✅ convert to timestamp
        })) ?? []),
      ];

      // ✅ Sort by date, newest first (mixed movies & series)
      const sorted = combined
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 10);

      setItems(sorted);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

const handleInteraction = () => {
  setShowSkipButton(true);
  if (skipTimeout) clearTimeout(skipTimeout);

  const timeout = setTimeout(() => setShowSkipButton(false), 2000);
  setSkipTimeout(timeout);
};
  // Related items based on overlapping genres AND same type
  const relatedItems = selectedItem
    ? items.filter(
        (i) =>
          i.id !== selectedItem.id &&
          i.type === selectedItem.type &&
          i.genres.some((g) => selectedItem.genres.includes(g))
      )
    : [];

    const youtubeKeys: string[] = React.useMemo(() => {
          if (!selectedItem?.trailers) return [];
      
          try {
            let trailersObj;
      
            if (typeof selectedItem.trailers === "string") {
              trailersObj = JSON.parse(selectedItem.trailers);
            } else {
              trailersObj = selectedItem.trailers;
            }
      
            const trailerArray: Trailer[] = trailersObj?.trailers ?? [];
      
            return trailerArray
              .filter((t) => t.site === "YouTube" && t.key)
              .map((t) => t.key);
          } catch (err) {
            console.error("Failed to parse trailers JSON:", err);
            return [];
          }
        }, [selectedItem]);
      
    
        
    
      const nextTrailer = () => {
        if (youtubeKeys.length === 0) return;
        setCurrentTrailerIndex((prev) => (prev + 1) % youtubeKeys.length);
      };
      
    
      useEffect(() => {
  if (selectedItem?.type === "movie") {
    console.log("Selected movie video_url:", selectedItem.video_url);
  }
}, [selectedItem]);

    

  // Auto-carousel
  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      const next = (current + 1) % items.length;
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
  }, [current, items.length]);

  const handleScroll = (element: HTMLDivElement | null) => {
    if (!element) return;
    const index = Math.round(element.scrollLeft / element.clientWidth);
    if (index !== current) setCurrent(index);
  };

  // Skeleton card
  const SkeletonCard = () => (
    <div className="relative w-full h-44 flex-shrink-0 snap-center flex justify-center px-2 animate-pulse">
      <div className="absolute inset-0 bg-gray-700 rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 rounded-2xl" />
    </div>
  );

  if (loading) {
    return (
      <section className="w-full py-10 flex flex-col items-center">
        <div className="flex overflow-x-auto w-full gap-4 scrollbar-hide px-4 md:hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`mobile-${i}`} />
          ))}
        </div>
        <div className="hidden md:flex overflow-x-auto w-full gap-6 scrollbar-hide mt-4 px-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`desktop-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full px-5 py-4 flex flex-col items-center overflow-hidden">
      {/* Mobile Carousel */}
      <div
        ref={mobileScrollRef}
        onScroll={() => handleScroll(mobileScrollRef.current)}
        className="relative z-10 top-5 flex overflow-x-auto snap-x snap-mandatory w-full scrollbar-hide scroll-smooth md:hidden"
      >
        {items.map((i) => (
          <motion.div
            key={`${i.type}-${i.id}`}
            className="w-full flex-shrink-0 snap-center flex justify-center px-2"
            onClick={() => setSelectedItem(i)}
          >
            <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-2xl">
              {i.backdrop_url && (
                <>
                  <div
                    className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-40 blur-1g transition-all duration-500"
                    style={{ backgroundImage: `url(${i.backdrop_url})` }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/20 to-black/60 rounded-2xl" />
                </>
              )}
              <div className="flex gap-4 items-center relative z-10 bg-white/10 backdrop-blur-5g rounded-2xl shadow-lg overflow-hidden cursor-pointer p-2">
                <Image
                  src={i.poster_url}
                  alt={i.title}
                  width={100}
                  height={150}
                  className="object-cover h-44 w-32"
                />
     
                <div className="p-2 flex flex-col">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">{i.title}</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{i.overview}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{i.release_date} </p>
                  <p className="text-[10px]   text-white text-xs font-semibold px-2 py-1 rounded-lg">{i.vj}</p>
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
        className="hidden md:flex relative z-10 overflow-x-auto snap-x snap-mandatory w-full max-w-[95vw] mx-auto scrollbar-hide scroll-smooth gap-6"
      >
        {items.map((i) => (
          <motion.div
            key={`${i.type}-${i.id}`}
            className="flex-shrink-0 snap-center w-full cursor-pointer hover:scale-105 transition"
            onClick={() => setSelectedItem(i)}
          >
            <div className="relative w-full h-[90vh] overflow-hidden rounded-2xl">
              {i.backdrop_url && (
                <>
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center  transition-all duration-500 rounded-2xl"
                    style={{ backgroundImage: `url(${i.backdrop_url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 rounded-2xl" />
                </>
              )}
              <div className="absolute bottom-6 left-10 z-10 text-white max-w-[70%]">
                
                <h3 className="text-2xl font-bold">{i.title}
                  < span className="text-sm text-gray-300 m1-2"> {i.vj}</span></h3>
                <h4 className="text-sm text-gray-300 mb-4">{i.release_date} • {i.genres.join(", ")}
                <span className="text-sm text-gray-400 ml-2">{i.status}</span></h4>
                <p className="text-sm text-gray-200 line-clamp-3">{i.overview}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Carousel Dots */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {items.map((_, index) => (
          <button
            key={`dot-${index}`}
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
  {selectedItem && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="animate-presence-scroll fixed inset-0 z-[9999] bg-black  overflow-y-auto p-4 md:p-8"
    >
     
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setSelectedItem(null)}
          className="absolute top-2 right-2 text-white text-2xl z-50   "
        >
          ✕
        </button>

{selectedItem?.type === "tvshows" && (
  <div className="flex flex-col md:flex-row gap-8 max-w-1xl mx-auto">
    {/* Left Side: Poster / Trailer */}
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
        {selectedItem.title}{" "}
        {selectedItem.vj && (
          <span className="text-sm text-gray-400 ml-2">{selectedItem.vj}</span>
        )}
      </h2>


      <Description text={selectedItem.overview} limit={180} />
     

      {/* Season Selector */}
      <div className="w-full max-w-md relative">
        <button
          className="w-full bg-white/5 text-white flex justify-between items-center p-2 rounded-lg hover:bg-white/10"
          onClick={() => setSeasonDropdownOpen((prev) => !prev)}
        >
          <span>
            {selectedItem.seasons?.find(
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
            {selectedItem.seasons?.map((season) => (
              <div
                key={season.season_number}
                className={`cursor-pointer p-2 hover:bg-white/30 ${
                  expandedSeason === season.season_number ? "bg-white/30" : ""
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
        {selectedItem.seasons
          ?.find((s) => s.season_number === expandedSeason)
          ?.episodes?.map((ep, i) => (
            <div key={i} className="bg-black/30 rounded-lg p-2 flex items-start gap-3 relative">
              {ep.still_path && (
                <div className="relative w-[100px] h-[60px] flex-shrink-0">
                  <Image
                    src={ep.still_path}
                    alt={ep.name}
                    fill
                    className="rounded-md object-cover"
                  />
                  {ep.video_url && (
                    <button
                      onClick={() => setVideoUrl(ep.video_url!)}
                      className="absolute inset-0 flex items-center justify-center rounded-md
                        bg-white/5 border border-white/20
                        hover:bg-white/20 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                    >
                      <PlayCircleIcon
                        size={20}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                      />
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

{ep.video_url && (
  <div className="absolute top-1 right-1">
    <a
      href={`/api/download-video?url=${encodeURIComponent(
        ep.video_url.replace(/^http:/, "https:")
      )}&name=${encodeURIComponent(ep.name || "episode")}`}
      className="text-xs text-cyan-400 px-2 py-1 bg-black/30 backdrop-blur-md rounded-md hover:bg-white/20 flex items-center gap-1 transition"
    >
      <Download size={14} /> Download
    </a>
  </div>
)}

              </div>
            </div>
          ))}
      </div>
    </div>

    {/* Right Side: Related */}
       {/* Related / More like this - desktop scroll */}
       <div className="md:w-1/3 flex flex-col gap-4">
        <Cast itemId={selectedItem.id} type={selectedItem.type} />
       {relatedItems.length > 0 && (
         <div className="relative mt-6">
           <h3 className="text-xl font-bold text-white mb-3">More like {selectedItem.title}</h3>
      {/* Desktop scroll */}
                       <div className="hidden md:block relative">
            
   
                         <div
                           ref={relatedRef}
                           className="animate-presence-scroll grid grid-cols-3 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth relative"
                         >
                           {relatedItems.map((r) => (
                             <Image
                               key={r.id}
                               src={r.poster_url}
                               alt={r.title}
                               width={130}
                               height={180}
                               className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                               onClick={() => {
                                 setSelectedItem(r);
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
           <span>More....</span>
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
           <div className="animate-presence-scroll absolute w-full mt-1 bg-white/5 rounded-lg max-h-60 overflow-y-auto z-50 shadow-lg grid grid-cols-2  p-2">
             {relatedItems.map((r) => (
               <div
                 key={r.id}
                 className="cursor-pointer p-2 hover:bg-white/10 rounded-lg flex items-center gap-2"
                 onClick={() => {
                   setSelectedItem(r);
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
  </div>
)}:

{selectedItem?.type === "movie" && (
          (
          /* ===================== MOVIE EXPANDED ===================== */
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
              {/* Info */}
              <h2 className="text-3xl font-bold text-white">
                {selectedItem.title}
                <span className="ml-2 text-gray-400 text-base">{selectedItem.vj}</span>
              </h2>
              <p className="text-gray-300 text-sm mb-3">
                {selectedItem.release_date} • {selectedItem.genres.join(", ")}
              </p>

                    <div className="flex flex-row items-center gap-4 mt-4">
                    {selectedItem.video_url && (
                      <button
                        onClick={() =>
                          setVideoUrl(selectedItem.video_url as string)
                        }
                        className="flex items-center gap-2   px-4 py-2 rounded-xl text-cyan-400 hover:bg-white/20 "
                      >
                        <PlayCircleIcon size={20} /> Play
                      </button>
                    )}

{/* Download button in top-right corner */}
{selectedItem?.video_url && (
  <a
    href={`/api/download-video?url=${encodeURIComponent(
      selectedItem.video_url.replace(/^http:/, "https:")
    )}&name=${encodeURIComponent(selectedItem.title || "movie")}`}
    className="text-xs text-cyan-400 px-2 py-1 bg-black/30 backdrop-blur-md rounded-md hover:bg-white/20 flex items-center gap-1 transition"
  >
    <Download size={14} /> Download
  </a>
)}

               </div>     

                    <Description
                      text={selectedItem.overview}
                      limit={180}
                    />
                    <Cast itemId={selectedItem.id} type={selectedItem.type} />
                    </div>
                  
                
            <div className="md:w-1/3 flex flex-col gap-4">
              {/* Related Movies */}
                {relatedItems.length > 0 && (
                  <div className="flex-1 mt-6">
                    <h3 className="text-xl font-bold text-white mb-3">
                      More like {selectedItem.title}
                    </h3>

                    {/* Desktop scroll */}
                    <div className="hidden md:block relative">
                     

                      <div
                        ref={relatedRef}
                        className="animate-presence-scroll grid grid-cols-3 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth relative"
                      >
                        {relatedItems.map((i) => (
                                                  <Image
                                                    key={i.id}
                                                    src={i.poster_url}
                                                    alt={i.title}
                                                    width={130}
                                                    height={180}
                                                    className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                                                    onClick={() => {
                                                      setSelectedItem(i);
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
                                                  {relatedItems.map((i) => (
                                                    <div key={i.id} className="flex justify-center">
                                                      <Image
                                                        src={i.poster_url}
                                                        alt={i.title}
                                                        width={120}
                                                        height={180}
                                                        className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                                                        onClick={() => setSelectedItem(i)}
                                                      />
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                              </div>
                                            
                                                            
              )}
            </div>
            
          </div>
          
        ))}
        
      
    </motion.div>
  )}
</AnimatePresence>

    </section>
  );
};

export default HeroCarousel;
