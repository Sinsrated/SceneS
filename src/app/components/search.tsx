"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, ArrowLeft, Play, Bookmark, ChevronLeft, ChevronRight, SkipForward, PlayCircleIcon, Download, SkipForwardIcon } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabaseClient";
import Description from "./description";
import VideoModal from "./videoplayer";
import Cast from "./cast";

export interface Item {
   id: number;
  type: "movie" | "tvshows";
  title: string;
  poster_url: string;
  backdrop_url: string;
  release_date: string;
  overview: string;
  trailers?: string | Trailer[] | { trailers: Trailer[] }; // or whatever your real shape is
  rating?: number;
  genres: string[];
  episodes?: number;
  seasons?: Season[];
  created_at: number;
  vj?: string;
  status?: string;
  video_url?: string;
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
interface TrailerWrapper {
  trailers: Trailer[];
}

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

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
 
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const relatedRef = useRef<HTMLDivElement | null>(null);
  const [isSmall, setIsSmall] = useState(false);
const [tvshowsDetails, setTvshowsDetails] = useState<Season[]>([]);

     const [videoUrl, setVideoUrl] = useState<string | null>(null);
      const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
      const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
    const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
     const scrollRef = useRef<HTMLDivElement>(null);
     const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

     const [hovering, setHovering] = useState(false);
     const [showSkipButton, setShowSkipButton] = useState(false);
    const [skipTimeout, setSkipTimeout] = useState<NodeJS.Timeout | null>(null);
    const iframeWrapperRef = useRef<HTMLDivElement>(null);

  // create portal root on mount
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    el.setAttribute("id", "search-portal");
    document.body.appendChild(el);
    portalRef.current = el;
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, []);

  // track screen size
  useEffect(() => {
    const check = () => setIsSmall(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // normalize helper
 const normalize = (row: Record<string, unknown>, type: "movie" | "tvshows"): Item => {
  let parsedTrailers: TrailerWrapper | undefined = undefined;

  try {
    const rawTrailers = row.trailers;

    if (typeof rawTrailers === "string") {
      const parsed = JSON.parse(rawTrailers);
      if (parsed && typeof parsed === "object" && "trailers" in parsed) {
        parsedTrailers = parsed as TrailerWrapper;
      }
    } else if (typeof rawTrailers === "object" && rawTrailers !== null && "trailers" in rawTrailers) {
      parsedTrailers = rawTrailers as TrailerWrapper;
    }
  } catch (e) {
    console.error("Failed to parse trailers:", e);
  }

  return {
    id: Number.isFinite(Number(row.id)) ? Number(row.id) : Date.now() + Math.floor(Math.random() * 1000),
    title: String(row.title ?? "Untitled"),
    poster_url: String(row.poster_url ?? "/placeholder.png"),
    backdrop_url: String(row.backdrop_url ?? "/placeholder.png"),
    overview: String(row.overview ?? "No overview available"),
    release_date: String(row.release_date ?? "Unknown"),
    vj: row.vj ? String(row.vj) : undefined,
    genres: Array.isArray(row.genres) ? (row.genres as string[]) : [],
    video_url: row.video_url ? String(row.video_url) : undefined,
    trailers: parsedTrailers,
    rating: row.rating ? Number(row.rating) : undefined,
    episodes: row.episodes ? Number(row.episodes) : undefined,
    seasons: Array.isArray(row.seasons) ? (row.seasons as Season[]) : undefined,
    created_at: row.created_at ? Number(row.created_at) : Date.now(),
    status: row.status ? String(row.status) : undefined,
    type,
  };
};

  




  // fetch all
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        supabase.from("movies").select("*").order("title"),
        supabase.from("tvshows").select("*").order("title"),
      ]);

      const formatted: Item[] = [
        ...(moviesRes.data?.map((m) => normalize(m, "movie")) ?? []),
        ...(seriesRes.data?.map((s) => normalize(s, "tvshows")) ?? []),
      ];
      formatted.sort((a, b) => a.title.localeCompare(b.title));
      setResults(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

 

  // open suggestion (loads series details if needed)
const openSuggestion = useCallback(
  async (s: Item) => {
    setSelectedItem(s);
    setOpen(false);

    const related = results.filter((r) => r.type === s.type && r.id !== s.id).slice(0, 10);
    setRelatedItems(related);

    if (s.type === "tvshows") {
      const { data: seasonsData } = await supabase
        .from("seasons")
        .select("id, name, overview, poster_path, season_number")
        .eq("tvshows_id", s.id)
        .order("season_number");

      if (seasonsData) {
        const seasonsWithEpisodes: Season[] = [];
        for (const season of seasonsData) {
          const { data: episodesData } = await supabase
            .from("episodes")
            .select("id, name, episode_number, runtime, still_path, video_url")
            .eq("season_id", season.id)
            .order("episode_number");

          seasonsWithEpisodes.push({
            name: season.name ? String(season.name) : `Season ${season.season_number}`,
            overview: season.overview ? String(season.overview) : undefined,
            poster_path: season.poster_path ? String(season.poster_path) : undefined,
            season_number: Number(season.season_number),
            episode_count: episodesData?.length ?? 0,
            episodes:
              episodesData?.map((ep) => ({
                id: Number(ep.id),
                name: ep.name ? String(ep.name) : `Episode ${ep.episode_number}`,
                episode_number: Number(ep.episode_number),
                runtime: ep.runtime ? Number(ep.runtime) : undefined,
                still_path: ep.still_path ? String(ep.still_path) : undefined,
                video_url: ep.video_url ? String(ep.video_url) : undefined,
              })) ?? [],
          });
        }
        setTvshowsDetails(seasonsWithEpisodes);
      }
    } else {
      setTvshowsDetails([]);
    }
  },
  [results]
);


  
  const handleInteraction = () => {
  setShowSkipButton(true);
  if (skipTimeout) clearTimeout(skipTimeout);

  const timeout = setTimeout(() => setShowSkipButton(false), 2000);
  setSkipTimeout(timeout);
};
  // search effect (debounced)
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(async () => {
      if (!query.trim()) {
        await fetchAll();
        return;
      }
      setLoading(true);
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          supabase.from("movies").select("*").ilike("title", `%${query}%`).limit(10),
          supabase.from("tvshows").select("*").ilike("title", `%${query}%`).limit(10),
        ]);

        const formatted: Item[] = [
          ...(moviesRes.data?.map((m) => normalize(m, "movie")) ?? []),
          ...(seriesRes.data?.map((s) => normalize(s, "tvshows")) ?? []),
        ];
        if (mounted) {
          formatted.sort((a, b) => a.title.localeCompare(b.title));
          setResults(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [query, fetchAll]);

       useEffect(() => {
    if (selectedItem?.type === "movie") {
      console.log("Selected movie video_url:", selectedItem.video_url);
    }
  }, [selectedItem]);

  // keyboard shortcuts
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && results.length > 0) openSuggestion(results[0]);
      else if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, open, openSuggestion]);

  // helper: render overlay into portal if available (falls back to inline)
  const renderPortal = (content: React.ReactElement) => {
    if (portalRef.current) return createPortal(content, portalRef.current);
    return content;
  };

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
    
      
  // when opening, focus input
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  /* ----------------- UI ----------------- */
  const searchOverlay = (
    <AnimatePresence>
      {open && !selectedItem && (
        <motion.div
          key="search-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-lg p-4 overflow-y-auto scrollbar-hide"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <button
                className="p-2 rounded-md text-white"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                aria-label="Close search"
              >
                <ArrowLeft />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                  <SearchIcon className="text-cyan-400" size={20} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search movies, series..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl shadow-lg overflow-hidden">
              {loading && <div className="p-4 text-sm text-gray-300">Searching...</div>}
              {!loading && results.length === 0 && query.trim() !== "" && (
                <div className="p-4 text-sm text-gray-400">No results</div>
              )}
              {!loading && results.length === 0 && query.trim() === "" && (
                <div className="p-4 text-sm text-gray-400">Start typing to search</div>
              )}
              <div className="divide-y divide-white/10">
                {results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => openSuggestion(r)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition"
                  >
                    <span className="text-white">{r.title},   {r.vj}</span>
                    <span className="text-xs text-cyan-400 uppercase">{r.type}</span>
                    
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const selectedOverlay = (
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

                    <div className="flex flex-row items-center gap-2 mt-4">
                                                       {selectedItem.video_url && (
                                                         <button
                                                           onClick={() =>
                                                             setVideoUrl(selectedItem.video_url as string)
                                                           }
                                                           className="flex items-center gap-2 bg-cyan-300/10 backdrop-blur-md w-full left-1/2 px-4 py-2  text-black hover:bg-white/20 "
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
                                       className="text-xs text-cyan-400 px-4 py-2 w-full  bg-white/10 backdrop-blur-md  hover:bg-cyan-300/20 flex items-center gap-1 transition"
                                     >
                                       <Download size={14} /> Download
                                     </a>
                                   )}
                                   
                                                         </div>

                    <Description
                      text={selectedItem.overview}
                      limit={180}
                    />
                    </div>
                  
                
            <div className="md:w-1/3 flex flex-col gap-4">
             <Cast itemId={selectedItem.id} type={selectedItem.type} />
                               
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

  );

  return (
    <div className="relative w-full">
      {/* Desktop trigger */}
      {!open && !selectedItem && !isSmall && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center w-64 gap-2 px-2 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-gray-500"
        >
          <SearchIcon className="text-cyan-400" size={20} />
          <span>Search</span>
        </button>
      )}

      {/* Mobile trigger */}
      {!open && !selectedItem && isSmall && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center w-64 gap-2 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-x1 border border-white/5 text-gray-500"
        >
          <SearchIcon className="text-cyan-400" size={20} />
          <span>Search</span>
        </button>
      )}

      {/* Render overlays in portal (fallback to inline if portal not mounted yet) */}
      {renderPortal(searchOverlay)}
      {renderPortal(selectedOverlay)}
    </div>
  );
}
