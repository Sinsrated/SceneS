"use client";
import  React,{ useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Description from "./description";
import { release } from "os";

interface Item {
  id: number;
  type: "movie" | "tvshows";
  title: string;
  vj: string;
  poster_url: string;
  backdrop_url: string;
  description: string;
  release_date: string;
  cast?: string[];
  genres: string[];
  trailer_url?: string;
  watch_url?: string;
  episodes?: number;
  seasons?: number;
  status?: string;
  created_at: number;
}

const Trending = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const relatedRef = React.useRef<HTMLDivElement>(null);

useEffect(() => {
  const fetchTrending = async () => {
    try {
      // ✅ Get date for "this week"
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // ✅ Get aggregated views count
      const { data: viewsData, error: viewsError } = await supabase
        .from("views")
        .select("item_id, item_type")
        .gte("created_at", weekAgo.toISOString());

      if (viewsError) {
        console.error("Views fetch error:", viewsError.message);
        return;
      }

      // Group by item_id & item_type in JS since Supabase doesn’t yet aggregate well
      const viewCountMap: Record<string, { item_id: number; item_type: string; count: number }> = {};
      (viewsData ?? []).forEach((v) => {
        const key = `${v.item_type}-${v.item_id}`;
        if (!viewCountMap[key]) {
          viewCountMap[key] = { ...v, count: 0 };
        }
        viewCountMap[key].count++;
      });

      // Sort trending by count (descending) & take top 20
      const trending = Object.values(viewCountMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      const items: Item[] = [];

      // Fetch details for each item
      for (const v of trending) {
        if (v.item_type === "movie") {
          const { data: movie } = await supabase
            .from("movies")
            .select("*")
            .eq("id", v.item_id)
            .single();

          if (movie) {
           items.push({
  id: movie.id,
  type: "movie",
  title: movie.title ?? "Untitled",
  poster_url: movie.poster_url ?? "",
  backdrop_url: movie.backdrop_url ?? "",
  release_date: movie.release_date ?? "",
  vj: movie.vj ?? "unknown",
  description: movie.description ?? "",
  watch_url: movie.watch_url ?? undefined,
  trailer_url: movie.trailer_url ?? undefined,
   cast: movie.cast ? movie.cast.split(",").map((c: string) => c.trim()) : [],
  genres: movie.genres ?? [],
  created_at: new Date(movie.created_at).getTime(), // ✅ add this
});

          }
        } else if (v.item_type === "tvshows") {
          const { data: show } = await supabase
            .from("tvshows")
            .select("*")
            .eq("id", v.item_id)
            .single();

          if (show) {
            items.push({
              id: show.id,
              type: "tvshows",
              title: show.title ?? "Untitled",
              poster_url: show.poster_url ?? "",
              backdrop_url: show.backdrop_url ?? "",
              release_date: show.release_date ?? "",
              vj: show.vj ?? "unknown",
              description: show.description ?? "",
              watch_url: show.watch_url ?? undefined,
              trailer_url: show.trailer_url ?? undefined,
             cast: show.cast ? show.cast.split(",").map((c: string) => c.trim()) : [],
              genres: show.genres ?? [],
              episodes: show.episodes ?? undefined,
              seasons: show.seasons ?? undefined,
              status: show.status ?? undefined,
              created_at: new Date(show.created_at).getTime(),

            });
          }
        }
      }

      setItems(items);
    } catch (err) {
      console.error("Trending fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTrending();
}, []);


   const scrollRelated = (direction: "left" | "right") => {
    if (relatedRef.current) {
      const scrollAmount = 200;
      relatedRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }; 

  const relatedItems = selectedItem
    ? items.filter(
        (i) =>
          i.id !== selectedItem.id &&
          i.type === selectedItem.type &&
          i.genres.some((g) => selectedItem.genres.includes(g))
      )
    : [];

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300; // how much to scroll per click
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-8 relative">
  <h2 className="text-2xl font-bold text-gray-500 mb-6">Trending</h2>

  {/* Arrows for desktop only */}
  <button
    onClick={() => scroll("left")}
    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
  >
    <ChevronLeft size={28} />
  </button>
  <button
    onClick={() => scroll("right")}
    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
  >
    <ChevronRight size={28} />
  </button>

  {/* ✅ Single scrollable row */}
  <div
    ref={scrollRef}
    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
  >
    {loading
      ? Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[180px] bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse"
          >
            {/* Poster skeleton */}
            <div className="w-full h-[260px] bg-black/40"></div>

            {/* Text skeleton
            <div className="p-3 space-y-2">
              <div className="h-4 bg-black/40 rounded w-3/4"></div>
              <div className="h-3 bg-black/40 rounded w-1/2"></div>
            </div> */}
          </div>
        ))
      : items.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <Image
              src={item.poster_url}
              alt={item.title}
              width={180}
              height={260}
              className="object-cover h-55 w-35"
            />

              <p className="absolute top-1 right-2 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg">
    {item.vj}
  </p>
          </motion.div>
        ))}
  </div>


      {/* Expanded Details */}
       <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="animate-presence-scroll fixed inset-0 bg-black/70 backdrop-blur-lg z-50 p-4 overflow-y-auto"
                >
                  <div className="bg-white/10 rounded-2xl top-15 shadow-2xl max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10">
                    <Image
                      src={selectedItem.poster_url}
                      alt={selectedItem.title}
                      width={300}
                      height={450}
                      className="rounded-xl object-cover"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h2 className="text-1x3 font-bold text-white mb-2">{selectedItem.title}
                          <span className="text-sm text-gray-400 ml-2">{selectedItem.vj}</span>
                        </h2>
                         <p className="text-sm text-gray-300 mb-2">
                          {selectedItem.release_date} • {selectedItem.genres.join(", ")}
                        </p>
                        {selectedItem.watch_url && (
                          <button
                            onClick={() => window.open(selectedItem.watch_url, "_blank")}
                            className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition mb-4"
                          >
                            <Play size={18} /> Watch
                          </button>
                        )}
                        
                       
                      </div>
      
                      <div className="flex gap-4 mb-6">
                        {selectedItem.trailer_url && (
                          <a
                            href={selectedItem.trailer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
                          >
                            <Play size={18} /> Trailer
                          </a>
                        )}
                        <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
                          <Bookmark size={18} /> Save
                        </button>
                      </div>
                      <div className="flex-1 justify-between">
                        <Description text={selectedItem.description} limit={180} />
                      </div>
      
{/* More like this */}
{relatedItems.length > 0 && (
  <div className="relative mt-6">
    <h3 className="text-xl font-bold text-white mb-3">
      More like {selectedItem.title}
    </h3>

    {/* Scroll buttons for desktop */}
    <button
      onClick={() => scrollRelated("left")}
      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
    >
      <ChevronLeft size={28} />
    </button>
    <button
      onClick={() => scrollRelated("right")}
      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
    >
      <ChevronRight size={28} />
    </button>

    {/* Scrollable container */}
    <div
      ref={relatedRef}
      className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
    >
      {relatedItems.map((i) => (
        <div key={`${i.type}-${i.id}`} className="flex-shrink-0 snap-start">
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
  </div>
)}
                    </div>
      
                    <button
                      className="absolute top-4 right-4 text-white text-2xl"
                      onClick={() => setSelectedItem(null)}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
                </section>
  );
};

export default Trending;
