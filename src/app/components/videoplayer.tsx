"use client";
import React, { useEffect, useRef, useState } from "react";
import type HlsType from "hls.js";

type Movie = {
  id?: number;
  title?: string;
  watch_url: string; // Supabase column
  poster_url?: string;
};

export default function Player({
  movie,
  className,
  showDownload = false,
}: {
  movie: Movie;
  className?: string;
  showDownload?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isYoutube, setIsYoutube] = useState(false);
  const [ytId, setYtId] = useState<string | null>(null);

  // Detect YouTube link
  useEffect(() => {
    const url = movie.watch_url;
    const ytRegex =
      /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(ytRegex);

    if (match) {
      setIsYoutube(true);
      setYtId(match[1]);
    } else {
      setIsYoutube(false);
      setYtId(null);
    }
  }, [movie.watch_url]);

  // Setup HLS player for non-YouTube links
  useEffect(() => {
    if (isYoutube) return;
    let hls: HlsType | null = null;

    async function setup() {
      const vid = videoRef.current;
      if (!vid) return;

      try {
        if (movie.watch_url.endsWith(".m3u8")) {
          const HlsModule = await import("hls.js");
          const Hls = HlsModule.default;

          if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(movie.watch_url);
            hls.attachMedia(vid);
          } else if (vid.canPlayType("application/vnd.apple.mpegurl")) {
            vid.src = movie.watch_url;
          }
        } else {
          vid.src = movie.watch_url;
        }
      } catch (err) {
        console.error("HLS setup error:", err);
      }
    }

    setup();

    return () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [movie.watch_url, isYoutube]);

  return (
    <div className={className ?? "w-full max-w-4xl mx-auto"}>
      {isYoutube && ytId ? (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={movie.title ?? "YouTube Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          poster={movie.poster_url}
          controls
          playsInline
          className="w-full rounded-lg bg-black"
        />
      )}

      <div className="mt-2 text-center text-sm text-gray-400">
        {movie.title}
      </div>

      {!isYoutube && showDownload && (
        <div className="mt-2 text-center">
          <a href={movie.watch_url} download className="text-sm underline">
            Download
          </a>
        </div>
      )}
    </div>
  );
}
