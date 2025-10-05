"use client";

import React, { useState } from "react";

interface YouTubeTrailerProps {
  trailerKeys: string[];
  width?: string;
  height?: string;
}

const YouTubeTrailer: React.FC<YouTubeTrailerProps> = ({
  trailerKeys,
  width = "100%",
  height = "100%",
}) => {
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  if (!trailerKeys || trailerKeys.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        No trailers available
      </div>
    );
  }

  const currentKey = trailerKeys[currentTrailerIndex];

  const toggleMute = () => setIsMuted((prev) => !prev);
  const nextTrailer = () =>
    setCurrentTrailerIndex((prev) => (prev + 1) % trailerKeys.length);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      <iframe
        key={`${currentKey}-${isMuted}`} // force re-render on toggle
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${currentKey}?autoplay=0&controls=1&rel=0&modestbranding=1&mute=${
          isMuted ? 1 : 0
        }&playsinline=1&showinfo=0`}
        title="YouTube trailer"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      ></iframe>

      <div className="absolute bottom-2 left-2 flex gap-2 z-10">
        <button
          onClick={toggleMute}
          className="bg-black/60 text-white px-3 py-1 rounded text-sm"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        {trailerKeys.length > 1 && (
          <button
            onClick={nextTrailer}
            className="bg-black/60 text-white px-3 py-1 rounded text-sm"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default YouTubeTrailer;
