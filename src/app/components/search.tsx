"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, ArrowLeft, Play, Bookmark } from "lucide-react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

// ✅ Unified Item type
export interface Item {
  id: number;
  title: string;
  poster_url: string;
  description: string;
  year?: string;
  genre?: string[];
  watch_url?: string;
  trailer_url?: string;
  episode?: number;
  seasons?: number;
  type: "movie" | "series";
}

interface Props {
  compact?: boolean;
}

interface Season {
  id: number;
  season_number: number;
  episodes: Episode[];
}

interface Episode {
  id: number;
  title: string;
  episode_number: number;
  watch_url?: string;
}

export default function SearchBar({ compact = false }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [seriesDetails, setSeriesDetails] = useState<Season[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(false);
  const [isSmall, setIsSmall] = useState(false);

  // ✅ Handle window resize
  useEffect(() => {
    const check = () =>
      setIsSmall(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ Normalize function
  const normalize = (row: any, type: "movie" | "series"): Item => ({
    id: row.id,
    title: row.title,
    poster_url: row.poster_url || "/placeholder.png",
    description: row.description || "No description available",
    year: row.year || "",
    genre: row.genre || [],
    watch_url: row.watch_url || null,
    trailer_url: row.trailer_url || null,
    episode: row.episode || undefined,
    seasons: row.seasons || undefined,
    type,
  });

  // ✅ Fetch all initial data
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        supabase.from("movies").select("*").order("title"),
        supabase.from("series").select("*").order("title"),
      ]);

      const formatted: Item[] = [
        ...(moviesRes.data?.map((m) => normalize(m, "movie")) ?? []),
        ...(seriesRes.data?.map((s) => normalize(s, "series")) ?? []),
      ];
      formatted.sort((a, b) => a.title.localeCompare(b.title));
      setResults(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounced search
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(async () => {
      if (!query.trim()) {
        fetchAll();
        return;
      }
      setLoading(true);
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          supabase
            .from("movies")
            .select("*")
            .ilike("title", `%${query}%`)
            .limit(10),
          supabase
            .from("series")
            .select("*")
            .ilike("title", `%${query}%`)
            .limit(10),
        ]);

        const formatted: Item[] = [
          ...(moviesRes.data?.map((m) => normalize(m, "movie")) ?? []),
          ...(seriesRes.data?.map((s) => normalize(s, "series")) ?? []),
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
  }, [query]);

  // ✅ Keyboard shortcuts
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
  }, [results, open]);

  // ✅ Open suggestion + fetch series details if needed
  const openSuggestion = async (s: Item) => {
    setSelectedItem(s);
    const related = results
      .filter((r) => r.type === s.type && r.id !== s.id)
      .slice(0, 10);
    setRelatedItems(related);

    if (s.type === "series") {
      const { data: seasonsData } = await supabase
        .from("seasons")
        .select("id, season_number")
        .eq("series_id", s.id)
        .order("season_number");

      if (seasonsData) {
        const seasonsWithEpisodes: Season[] = [];
        for (const season of seasonsData) {
          const { data: episodesData } = await supabase
            .from("episodes")
            .select("id, title, episode_number, watch_url")
            .eq("season_id", season.id)
            .order("episode_number");
          seasonsWithEpisodes.push({
            id: season.id,
            season_number: season.season_number,
            episodes: episodesData ?? [],
          });
        }
        setSeriesDetails(seasonsWithEpisodes);
      }
    } else {
      setSeriesDetails([]);
    }
  };

  return (
    <div className="relative w-full">
      {/* 🔍 Search button */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center w-64 gap-2 px-2 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-gray-500"
        >
          <SearchIcon className="text-red-400" size={20} />
          <span>Search</span>
        </button>
      )}

      {/* 🖥 Desktop suggestions dropdown */}
      {!isSmall && open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-64 max-h-80 overflow-y-auto bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg z-50">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => openSuggestion(r)}
              className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-white/10 transition"
            >
              <span className="text-white">{r.title}</span>
              <span className="text-xs text-red-400 uppercase">{r.type}</span>
            </button>
          ))}
        </div>
      )}

      {/* 🔲 Fullscreen mobile overlay */}
      <AnimatePresence>
        {open && !selectedItem && isSmall && (
          <motion.div
            key="search-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg p-4 overflow-y-auto scrollbar-hide"
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
                >
                  <ArrowLeft />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                    <SearchIcon className="text-red-400" size={20} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search movies, series..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
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
                      <span className="text-white">{r.title}</span>
                      <span className="text-xs text-red-400 uppercase">{r.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎬 Selected item overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            key="selected-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-lg overflow-y-auto scrollbar-hide p-4"
          >
            <div className="max-w-5xl mx-auto bg-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative mt-10 mb-10 shadow-2xl">
              <Image
                src={selectedItem.poster_url || "/placeholder.png"}
                alt={selectedItem.title}
                width={300}
                height={450}
                className="rounded-xl object-cover"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedItem.title}</h2>
                  {selectedItem.watch_url && (
                    <button
                      onClick={() => window.open(selectedItem.watch_url, "_blank")}
                      className="flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition mb-4"
                    >
                      <Play size={18} /> Watch
                    </button>
                  )}
                  <p className="text-gray-300 mb-4">{selectedItem.description}</p>
                  <p className="text-sm text-gray-300 mb-2">{selectedItem.year} • {selectedItem.genre?.join(", ")}</p>
                </div>

                {/* ✅ Show seasons + episodes if series */}
                {selectedItem.type === "series" && seriesDetails.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-white mb-3">Seasons</h3>
                    {seriesDetails.map((season) => (
                      <div key={season.id} className="mb-4">
                        <h4 className="text-lg font-semibold text-red-400 mb-2">Season {season.season_number}</h4>
                        <ul className="space-y-2">
                          {season.episodes.map((ep) => (
                            <li key={ep.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg">
                              <span className="text-white">Ep {ep.episode_number}: {ep.title}</span>
                              {ep.watch_url && (
                                <button
                                  onClick={() => window.open(ep.watch_url!, "_blank")}
                                  className="text-sm px-3 py-1 bg-red-500 rounded-lg text-white"
                                >
                                  Watch
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 mb-6 mt-4">
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

                {relatedItems.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      More like {selectedItem.title}
                    </h3>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
                      {relatedItems.map((i) => (
                        <div
                          key={`${i.type}-${i.id}`}
                          className="flex-shrink-0 snap-start"
                        >
                          <Image
                            src={i.poster_url || "/placeholder.png"}
                            alt={i.title}
                            width={120}
                            height={180}
                            className="rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() => openSuggestion(i)}
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
    </div>
  );
}
