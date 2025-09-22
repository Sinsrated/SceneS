"use client";
import React, { useEffect, useRef, useState } from "react";

type Movie = {
  id?: number;
  title?: string;
  watch_url: string;   // Supabase column
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

  // Detect YouTube
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

  // Setup HLS only if not YouTube
  useEffect(() => {
    if (isYoutube) return; // skip
    const video = videoRef.current;
    if (!video) return;
    let hls: any;

    async function setup() {
      if (movie.watch_url.endsWith(".m3u8")) {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(movie.watch_url);
          hls.attachMedia(video);
        } else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = movie.watch_url;
        }
      } else {
        if (video) {
          video.src = movie.watch_url;
        }
      }
    }

    setup();
    return () => {
      if (hls) hls.destroy();
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
