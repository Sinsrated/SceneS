"use client";
import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, Maximize, Minimize } from "lucide-react";

interface VideoModalProps {
  url: string;
  onClose: () => void;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const VideoModal: React.FC<VideoModalProps> = ({ url, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const touchStart = useRef({ x: 0, y: 0 });
  const touchSide = useRef<"left" | "right">("left");
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseMoveTimeout = useRef<NodeJS.Timeout | null>(null);
  const fingerOnScreen = useRef(false);

  // Video loading
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.play().catch(() => {});
      videoRef.current.volume = volume;

      const vid = videoRef.current;
      const updateTime = () => setCurrentTime(vid.currentTime);
      const setVidDuration = () => setDuration(vid.duration || 0);

      vid.addEventListener("timeupdate", updateTime);
      vid.addEventListener("loadedmetadata", setVidDuration);

      return () => {
        vid.removeEventListener("timeupdate", updateTime);
        vid.removeEventListener("loadedmetadata", setVidDuration);
      };
    }
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
  };

  const handleBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    fingerOnScreen.current = true;
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchSide.current = e.touches[0].clientX < window.innerWidth / 2 ? "left" : "right";
    setControlsVisible(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = touchStart.current.y - e.touches[0].clientY;
    if (touchSide.current === "left") {
      setBrightness(prev => Math.min(2, Math.max(0.2, prev + deltaY / 500)));
    } else {
      const val = Math.min(1, Math.max(0, volume + deltaY / 500));
      setVolume(val);
      if (videoRef.current) videoRef.current.volume = val;
    }
    touchStart.current.y = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    fingerOnScreen.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    if (deltaX > 50) handleForward();
    else if (deltaX < -50) handleBackward();

    hideTimeout.current = setTimeout(() => {
      if (!fingerOnScreen.current) setControlsVisible(false);
    }, 2000);
  };

  // Desktop auto-hide for fullscreen
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (mouseMoveTimeout.current) clearTimeout(mouseMoveTimeout.current);
    if (fullscreen) {
      mouseMoveTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 5000);
    }
  };

  // Progress bar drag
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = parseFloat(e.target.value);
    setCurrentTime(videoRef.current.currentTime);
  };

  return (
    <div
      ref={containerRef}
      className=" fixed inset-0 z-50 bg-black flex justify-center items-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        style={{ filter: `brightness(${brightness})` }}
        autoPlay
        playsInline
        controls={false}
      />

      {controlsVisible && (
        <>
          {/* Center Controls */}
          <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-none">
            <button
              onClick={handleBackward}
              className="pointer-events-auto bg-black/25 p-4 rounded-full text-white/90 hover:bg-black/70"
            >
              10
            </button>

            <button
              onClick={togglePlay}
              className="pointer-events-auto bg-black/25 p-4 rounded-full text-white/90 hover:bg-black/70"
            >
              {playing ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <button
              onClick={handleForward}
              className="pointer-events-auto bg-black/25 p-4 rounded-full text-white/90 hover:bg-black/70"
            >
              10
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 text-white/90 hover:text-white pointer-events-auto"
          >
            {fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-3xl pointer-events-auto"
          >
            ✕
          </button>

          {/* 2035 Glass Style Progress + Time */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 pointer-events-auto">
            <span className="text-xs text-white font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-1 h-1 rounded-full accent-cyan-400"
            />
            <span className="text-xs text-white font-mono">{formatTime(duration)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoModal;
