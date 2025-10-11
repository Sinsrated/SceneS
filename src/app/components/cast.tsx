"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface CastData {
  main_cast: CastMember[];
  total_cast: number;
  last_updated: string;
}

interface CastProps {
  itemId: number;
  type: "movie" | "tvshows";
}

export default function Cast({ itemId, type }: CastProps) {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCastMobile, setShowCastMobile] = useState(false); // Mobile dropdown toggle
  const [showAllCastDesktop, setShowAllCastDesktop] = useState(false); // Desktop "See More"

  const ITEMS_PER_ROW = 3;
  const ROWS_VISIBLE = 2;
  const visibleCount = ITEMS_PER_ROW * ROWS_VISIBLE;

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const tableName = type === "movie" ? "movies" : "tvshows";

        const { data, error } = await supabase
          .from(tableName)
          .select("cast")
          .eq("id", itemId)
          .single();

        if (error) throw error;

        let mainCast: CastMember[] = [];

        if (typeof data.cast === "string") {
          const parsed: CastData = JSON.parse(data.cast);
          mainCast = parsed.main_cast ?? [];
        } else if (data.cast?.main_cast) {
          mainCast = data.cast.main_cast;
        }

        setCast(mainCast);
      } catch (err) {
        console.error("Error fetching cast:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCast();
  }, [itemId, type]);

  const displayedCastDesktop = showAllCastDesktop ? cast : cast.slice(0, visibleCount);

  return (
    <div className="mt-8">
      <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
        Cast
      </h3>

      {/* ------------------ MOBILE ------------------ */}
      <div className="md:hidden">
        <button
          onClick={() => setShowCastMobile(prev => !prev)}
          className="w-full mb-4 text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
        >
          {showCastMobile ? "Hide" : "Show...."} 
        </button>

        {showCastMobile && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-white/5 rounded-2xl p-3 border border-white/10"
                  >
                    <div className="relative w-full aspect-square bg-white/10 rounded-xl mb-3" />
                    <div className="h-4 bg-white/20 rounded mb-1 w-3/4" />
                    <div className="h-3 bg-cyan-400/20 rounded w-1/2" />
                  </div>
                ))
              : cast.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl p-3 shadow-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
                      <Image
                        src={
                          member.profile_path
                            ? `https://image.tmdb.org/t/p/w300${member.profile_path}`
                            : "/default-pfp.png"
                        }
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="text-white font-semibold text-sm truncate">{member.name}</h4>
                    <p className="text-cyan-400/80 text-xs truncate">{member.character}</p>
                  </motion.div>
                ))}
          </div>
        )}
      </div>

      {/* ------------------ DESKTOP ------------------ */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2">
        {loading
          ? Array.from({ length: visibleCount }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white/5 rounded-2xl p-3 border border-white/10"
              >
                <div className="relative w-full aspect-square bg-white/10 rounded-xl mb-3" />
                <div className="h-4 bg-white/20 rounded mb-1 w-3/4" />
                <div className="h-3 bg-cyan-400/20 rounded w-1/2" />
              </div>
            ))
          : displayedCastDesktop.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="backdrop-blur-xl bg-white/5 rounded-2xl p-3 shadow-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
                  <Image
                    src={
                      member.profile_path
                        ? `https://image.tmdb.org/t/p/w300${member.profile_path}`
                        : "/default-pfp.png"
                    }
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="text-white font-semibold text-sm truncate">{member.name}</h4>
                <p className="text-cyan-400/80 text-xs truncate">{member.character}</p>
              </motion.div>
            ))}
      </div>

      {/* See More / See Less Button (Only on Desktop) */}
      {!loading && cast.length > visibleCount && (
        <div className="hidden md:flex  mt-4">
          <button
            onClick={() => setShowAllCastDesktop(prev => !prev)}
            className="px-4 py-2 rounded-lg  hover:text-cyan-200 text-cyan-500 font-medium transition"
          >
            {showAllCastDesktop ? "See Less" : "See More...."}
          </button>
        </div>
      )}
    </div>
  );
}
