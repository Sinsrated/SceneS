"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

interface Suggestion {
  id: number | string;
  type: "movie" | "series" | "genre" | "animation" | "drama" | "aniserie";
  title: string;
}

interface Props {
  compact?: boolean; // header passes compact on mobile
}

export default function SearchBar({ compact = false }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(false);

  const [isSmall, setIsSmall] = useState<boolean>(false);
  useEffect(() => {
    const check = () =>
      setIsSmall(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // fetch all when query empty
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [moviesRes, seriesRes, genresRes] = await Promise.all([
        supabase.from("movies").select("id, title").order("title"),
        supabase.from("series").select("id, title").order("title"),
        supabase.from("genres").select("id, name").order("name"),
      ]);

      const formatted: Suggestion[] = [
        ...(moviesRes.data?.map((m: any) => ({
          id: m.id,
          type: "movie" as const,
          title: m.title,
        })) || []),
        ...(seriesRes.data?.map((s: any) => ({
          id: s.id,
          type: "series" as const,
          title: s.title,
        })) || []),
        ...(genresRes.data?.map((g: any) => ({
          id: g.id,
          type: "genre" as const,
          title: g.name,
        })) || []),
      ];

      formatted.sort((a, b) => a.title.localeCompare(b.title));
      setResults(formatted);
    } catch (err) {
      console.error("Fetch all error:", err);
    } finally {
      setLoading(false);
    }
  };

  // debounced search
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(async () => {
      if (!query.trim()) {
        fetchAll();
        return;
      }

      setLoading(true);
      try {
        const [
          moviesRes,
          seriesRes,
          genresRes,
          animationsRes,
          dramasRes,
          aniserieRes,
        ] = await Promise.all([
          supabase.from("movies").select("id, title").ilike("title", `%${query}%`).limit(10),
          supabase.from("series").select("id, title").ilike("title", `%${query}%`).limit(10),
          supabase.from("genres").select("id, name").ilike("name", `%${query}%`).limit(10),
          supabase.from("animations").select("id, title").ilike("title", `%${query}%`).limit(10),
          supabase.from("dramas").select("id, title").ilike("title", `%${query}%`).limit(10),
          supabase.from("aniserie").select("id, title").ilike("title", `%${query}%`).limit(10),
        ]);

        const formatted: Suggestion[] = [
          ...(moviesRes.data?.map((m: any) => ({ id: m.id, type: "movie" as const, title: m.title })) || []),
          ...(seriesRes.data?.map((s: any) => ({ id: s.id, type: "series" as const, title: s.title })) || []),
          ...(genresRes.data?.map((g: any) => ({ id: g.id, type: "genre" as const, title: g.name })) || []),
          ...(animationsRes.data?.map((a: any) => ({ id: a.id, type: "animation" as const, title: a.title })) || []),
          ...(dramasRes.data?.map((d: any) => ({ id: d.id, type: "drama" as const, title: d.title })) || []),
          ...(aniserieRes.data?.map((a: any) => ({ id: a.id, type: "aniserie" as const, title: a.title })) || []),
        ];

        if (mounted) {
          formatted.sort((a, b) => a.title.localeCompare(b.title));
          setResults(formatted);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [query]);

  // keyboard enter/esc
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && results.length > 0) {
        openSuggestion(results[0]);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, open]);

  const openSuggestion = (s: Suggestion) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    if (s.type === "movie") {
      router.push(`/movies/${s.id}`);
    } else if (s.type === "series") {
      router.push(`/series/${s.id}`);
    } else if (s.type === "drama") {
      router.push(`/dramas/${s.id}`);
    } else if (s.type === "aniserie") {
      router.push(`/aniserie/${s.id}`);
    } else if (s.type === "animation") {
      router.push(`/animations/${s.id}`);
    } else {
      router.push(`/movies?genre=${encodeURIComponent(s.title)}`);
    }
  };

  return (
    <div className="relative w-full">
      {/* Desktop: only show a button, not the input */}
      {!open && !compact && !isSmall && (
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

      {/* Mobile/compact: same trigger */}
      {!open && (compact || isSmall) && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center w-64 gap-2 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-x1 border border-white/5 text-gray-500"
        >
          <SearchIcon className="text-red-400" size={20} />
          <span>Search</span>
        </button>
      )}

      {/* Full-screen overlay (desktop + mobile) */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="search-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg p-4"
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
                    <SearchIcon className="text-red-400" size={20} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search movies, series, drama, animation, aniserie genres..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* results */}
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
    </div>
  );
}
