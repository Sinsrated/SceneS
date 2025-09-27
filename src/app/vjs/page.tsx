"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";

interface Item {
  id: number;
  type: "movie" | "series";
  title: string;
  vj: string;
  poster_url: string;
  genre: string[];
}

export default function Vjspage() {
  const [items, setItems] = useState<Item[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [vjs, setVjs] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVj, setSelectedVj] = useState<string | null>(null);
  const [mode, setMode] = useState<"items" | "browse-genres" | "browse-vjs">("items");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // ✅ fetch movies + series
      const { data: movies } = await supabase.from("movies").select("*");
      const { data: series } = await supabase.from("series").select("*");

      const combined: Item[] = [
        ...(movies?.map((m) => ({
          id: m.id,
          type: "movie" as const,
          title: m.title,
          vj: m.vj,
          poster_url: m.poster_url,
          genre: m.genre ?? [],
        })) ?? []),
        ...(series?.map((s) => ({
          id: s.id,
          type: "series" as const,
          title: s.title,
          vj: s.vj,
          poster_url: s.poster_url,
          genre: s.genre ?? [],
        })) ?? []),
      ];

      setItems(combined);

      // ✅ fetch genres from genres table
     // ✅ fetch genres from genres table
const { data: genresData, error: genresError } = await supabase
  .from("genres")
  .select("name");

if (genresError) console.error("Genres fetch error:", genresError);

setGenres(
  (genresData as { name: string }[] | null)?.map((g) => g.name) ?? []
);

// ✅ fetch translators (vj) from translators table
const { data: vjData, error: vjError } = await supabase
  .from("translators")
  .select("VJ");

if (vjError) console.error("VJs fetch error:", vjError);

setVjs(
  (vjData as { VJ: string }[] | null)?.map((t) => t.VJ) ?? []
);

setLoading(false);

    };

    fetchData();
  }, []);

  // ✅ Filtering logic
  const filtered = items.filter((i) => {
    if (selectedGenre && selectedGenre !== "" && !i.genre.includes(selectedGenre))
      return false;
    if (selectedVj && selectedVj !== "" && i.vj !== selectedVj) return false;
    return true;
  });

  const handleGenreChange = (value: string) => {
    if (value === "all-genres") {
      setMode("browse-genres");
      setSelectedGenre(null);
    } else {
      setMode("items");
      setSelectedGenre(value || null);
    }
  };

  const handleVjChange = (value: string) => {
    if (value === "all-vjs") {
      setMode("browse-vjs");
      setSelectedVj(null);
    } else {
      setMode("items");
      setSelectedVj(value || null);
    }
  };

  return (
    <>
      <Header />
      <section className="w-full py-21 p-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Genre filter */}
          <select
            value={selectedGenre ?? ""}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="bg-white/10 text-white px-3 py-2 rounded-xl"
          >
            <option value="all-genres">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* VJ filter */}
          <select
            value={selectedVj ?? ""}
            onChange={(e) => handleVjChange(e.target.value)}
            className="bg-white/10 text-white px-3 py-2 rounded-xl"
          >
            <option value="all-vjs">All VJs</option>
            {vjs.map((vj) => (
              <option key={vj} value={vj}>
                {vj}
              </option>
            ))}
          </select>

          {/* Reset button */}
          {(selectedGenre || selectedVj) && (
            <button
              onClick={() => {
                setSelectedGenre(null);
                setSelectedVj(null);
                setMode("items");
              }}
              className="bg-red-500 text-white px-3 py-2 rounded-xl"
            >
              Reset
            </button>
          )}
        </div>

        {/* Items */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : mode === "browse-genres" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {genres.map((g) => (
              <div
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  setMode("items");
                }}
                className="bg-white/10 cursor-pointer text-white p-4 rounded-xl text-center hover:bg-white/20"
              >
                {g}
              </div>
            ))}
          </div>
        ) : mode === "browse-vjs" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {vjs.map((vj) => (
              <div
                key={vj}
                onClick={() => {
                  setSelectedVj(vj);
                  setMode("items");
                }}
                className="bg-white/10 cursor-pointer text-white p-4 rounded-xl text-center hover:bg-white/20"
              >
                {vj}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400">No items found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white/10 rounded-xl overflow-hidden shadow-lg"
              >
                <Image
                  src={item.poster_url}
                  alt={item.title}
                  width={200}
                  height={300}
                  className="object-cover w-full h-[300px]"
                />
                <div className="p-2">
                  <p className="text-white text-sm font-bold">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.vj}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
