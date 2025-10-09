"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import VideoModal from "../components/videoplayer";
import Description from "../components/description";
import Cast from "../components/cast";
import { ChevronRight, Download, PlayCircleIcon, SkipForward, SkipForwardIcon } from "lucide-react";

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
}

interface Item {
  id: number;
  type: "movie" | "tvshows";
  title: string;
  vj: string;
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
  status?: string;
  video_url?: string;
}

export default function Vjspage() {
  const [items, setItems] = useState<Item[]>([]);
  const [vjs, setVjs] = useState<string[]>([]);
  const [selectedVj, setSelectedVj] = useState("NON TRANSLATED");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [skipTimeout, setSkipTimeout] = useState<NodeJS.Timeout | null>(null);

  const relatedRef = useRef<HTMLDivElement>(null);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);

  // 🟢 Fetch all VJs
  useEffect(() => {
    const fetchVjs = async () => {
      const { data, error } = await supabase.from("translator").select("name");
      if (error) return console.error("Failed to fetch VJs:", error);
      const names = (data as { name: string }[] | null)?.map((t) => t.name) ?? [];
      setVjs(["NON TRANSLATED", ...names.filter((vj) => vj.toUpperCase() !== "NON TRANSLATED")]);
    };
    fetchVjs();
  }, []);

  // 🟢 Fetch all movies & tvshows
  const fetchItems = async (vjFilter: string) => {
    setLoading(true);
    const { data: moviesData, error: moviesError } = await supabase.from("movies").select("*");
    const { data: tvData, error: tvError } = await supabase.from("tvshows").select("*");

    if (moviesError || tvError) {
      console.error("Error fetching:", moviesError || tvError);
      setLoading(false);
      return;
    }

    const combined: Item[] = [
      ...(moviesData?.map((m) => ({
        id: m.id,
        type: "movie" as const,
        title: m.title,
        vj: m.vj,
        poster_url: m.poster_url,
        backdrop_url: m.backdrop_url,
        release_date: m.release_date,
        overview: m.overview,
        trailers: m.trailers,
        rating: m.rating,
        genres: m.genres,
        video_url: m.video_url,
        created_at: new Date(m.created_at).getTime(),
      })) ?? []),
     ...(tvData?.map((t) => {
  let parsedSeasons: Season[] | undefined = undefined;
  try {
    if (typeof t.seasons === "string") {
      parsedSeasons = JSON.parse(t.seasons);
    } else if (Array.isArray(t.seasons)) {
      parsedSeasons = t.seasons;
    }
  } catch (err) {
    console.error("Failed to parse seasons JSON for:", t.title, err);
  }

  return {
    id: t.id,
    type: "tvshows" as const,
    title: t.title,
    vj: t.vj,
    poster_url: t.poster_url,
    backdrop_url: t.backdrop_url,
    release_date: t.release_date,
    overview: t.overview,
    trailers: t.trailers,
    rating: t.rating,
    genres: t.genres,
    video_url: t.video_url,
    created_at: new Date(t.created_at).getTime(),
    episodes: t.episodes,
    seasons: parsedSeasons, // ✅ now properly parsed
  };
}) ?? []),

    ];

    const filtered = combined.filter((i) => i.vj?.toUpperCase() === vjFilter.toUpperCase());
    setItems(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems("NON TRANSLATED");
  }, []);

  const handleVjChange = (vj: string) => {
    setSelectedVj(vj);
    fetchItems(vj);
  };

  // 🟢 Trailer logic
  const youtubeKeys = useMemo(() => {
    if (!selectedItem?.trailers) return [];
    try {
      const parsed = typeof selectedItem.trailers === "string" ? JSON.parse(selectedItem.trailers) : selectedItem.trailers;
      const trailerArray: Trailer[] = parsed?.trailers ?? [];
      return trailerArray.filter((t) => t.site === "YouTube" && t.key).map((t) => t.key);
    } catch (err) {
      console.error("Failed to parse trailers:", err);
      return [];
    }
  }, [selectedItem]);

  const nextTrailer = () => {
    if (youtubeKeys.length === 0) return;
    setCurrentTrailerIndex((prev) => (prev + 1) % youtubeKeys.length);
  };

  // 🟢 Related items
  const relatedItems = selectedItem
    ? items.filter((i) => i.id !== selectedItem.id && i.type === selectedItem.type && i.vj === selectedItem.vj)
    : [];

  // 🟢 Skip button logic
  const handleInteraction = () => {
    setShowSkipButton(true);
    if (skipTimeout) clearTimeout(skipTimeout);
    const timeout = setTimeout(() => setShowSkipButton(false), 2000);
    setSkipTimeout(timeout);
  };

  return (
    <>
      <Header />
      <section className="w-full py-21 p-4">
        {/* VJ Selector */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <select
            value={selectedVj}
            onChange={(e) => handleVjChange(e.target.value)}
            className="animate-presence-scroll bg-black/50 border border-white/20 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-red-500"
          >
            {vjs.map((vj) => (
              <option key={vj} value={vj} className="bg-black text-white">
                {vj}
              </option>
            ))}
          </select>

          {selectedVj !== "NON TRANSLATED" && (
            <button
              onClick={() => handleVjChange("NON TRANSLATED")}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl"
            >
              Reset
            </button>
          )}
        </div>

        {/* ITEMS GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl h-[300px] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-400">No items found for {selectedVj}.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white/10 rounded-xl overflow-hidden shadow-lg relative cursor-pointer hover:scale-105 transition"
                onClick={() => {
                  setSelectedItem(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Image
                  src={item.poster_url}
                  alt={item.title}
                  width={200}
                  height={300}
                  className="object-cover w-full h-[260px]"
                />
                {item.vj && (
                  <p className="absolute top-1 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    {item.vj}
                  </p>
                )}
                <div className="p-2">
                  <p className="text-white text-sm font-bold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL SECTION */}
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
</section>
</>
);
}



