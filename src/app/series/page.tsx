"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import Header from "../components/Header"

type Episode = {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
};

type Season = {
  id: number;
  season: string;
  poster: string;
  episodes: Episode[];
};

type Series = {
  id: number;
  title: string;
  poster: string;
  description: string;
  seasons: Season[];
};

const seriesList: Series[] = [
  {
    id: 1,
    title: "Power: Ghost",
    poster: "/movieposters/powerbook.jpg",
    description:
      "Tariq St. Patrick navigates life, crime, and betrayal after his father's death.",
    seasons: [
      {
        id: 1,
        season: "S1",
        poster: "/movieposters/powerbook.jpg",
        episodes: [
          {
            id: 1,
            title: "Pilot",
            thumbnail: "/series/thumbnails/ep1.jpg",
            description:
              "The journey begins as Tariq struggles to balance school and the streets.",
          },
        ],
      },
      {
        id: 2,
        season: "S2",
        poster: "/movieposters/powerbook.jpg",
        episodes: [
          {
            id: 1,
            title: "Betrayal",
            thumbnail: "/series/thumbnails/ep2.jpg",
            description:
              "Alliances shift as new enemies rise and Tariq faces deadly choices.",
          },
        ],
      },
      // ➕ Add S3–S9
    ],
  },
  {
    id: 2,
    title: "Breaking Bad",
    poster: "/movieposters/breakingbad.jpg",
    description:
      "Walter White transforms from a chemistry teacher to a feared drug kingpin.",
    seasons: [
      {
        id: 1,
        season: "S1",
        poster: "/movieposters/breakingbad.jpg",
        episodes: [
          {
            id: 1,
            title: "Pilot",
            thumbnail: "/series/thumbnails/bb-ep1.jpg",
            description:
              "Walter White, a high school chemistry teacher, is diagnosed with cancer.",
          },
        ],
      },
    ],
  },
];

export default function Series() {
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 pt-24">
     

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {seriesList.map((series) => (
          <button
            key={series.id}
            onClick={() => setSelectedSeries(series)}
            className="relative group overflow-hidden rounded-2xl shadow-lg transition transform hover:scale-105"
          >
            <Image
              src={series.poster}
              alt={series.title}
              width={300}
              height={450}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <span className="text-purple-400 font-bold text-lg">
                View Seasons
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal for Series -> Seasons */}
      {selectedSeries && !selectedSeason && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-3xl w-full shadow-xl relative">
            {/* Close */}
            <button
              onClick={() => setSelectedSeries(null)}
              className="absolute top-3 right-3 text-gray-300 hover:text-purple-400 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              {selectedSeries.title}
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              {selectedSeries.description}
            </p>

            {/* Seasons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {selectedSeries.seasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeason(s)}
                  className="relative group overflow-hidden rounded-2xl shadow-lg transition transform hover:scale-105"
                >
                  <Image
                    src={s.poster}
                    alt={s.season}
                    width={300}
                    height={450}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="text-purple-400 font-bold text-lg">
                      {s.season}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Season -> Episodes */}
      {selectedSeason && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-2xl w-full shadow-xl relative">
            {/* Close */}
            <button
              onClick={() => setSelectedSeason(null)}
              className="absolute top-3 right-3 text-gray-300 hover:text-purple-400 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              {selectedSeason.season}
            </h2>

            {/* Episodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {selectedSeason.episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 transition"
                >
                  <Image
                    src={ep.thumbnail}
                    alt={ep.title}
                    width={400}
                    height={250}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-md font-semibold text-cyan-300">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {ep.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
