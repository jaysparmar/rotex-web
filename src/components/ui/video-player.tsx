"use client";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
  variant?: "light" | "dark";
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  poster?: string;
  className?: string;
  containerClassName?: string;
  showMuteToggle?: boolean;
};

export function VideoPlayer({
  src,
  variant = "light",
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  controls = false,
  poster,
  className,
  containerClassName,
  showMuteToggle = false,
}: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [inView, setInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only fetch the video once it's near the viewport — mounting every slide's
  // <video src> eagerly makes them all compete for Chrome's ~6 connections
  // per host, starving the one the user is actually looking at.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  const shimmerClass = variant === "dark" ? "animate-shimmer-dark" : "animate-shimmer";
  const iconBg      = variant === "dark" ? "bg-white/10" : "bg-stone-300/60";
  const iconColor   = variant === "dark" ? "text-white/50" : "text-stone-500";

  return (
    <div ref={containerRef} className={cn("group relative w-full h-full overflow-hidden", containerClassName)}>

      {/* Skeleton shimmer — shown until video is ready */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          shimmerClass,
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      />

      {/* Play icon overlay on skeleton */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", iconBg)}>
            <svg viewBox="0 0 24 24" className={cn("w-6 h-6 fill-current ml-1", iconColor)}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={inView ? src : undefined}
        preload={inView ? "auto" : "none"}
        autoPlay={inView && autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        controls={controls}
        poster={poster}
        onCanPlay={() => setLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />

      {/* Mute toggle — visible on hover */}
      {showMuteToggle && loaded && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 z-20 flex size-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70"
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" className="size-4.5 fill-current">
              <path d="M16.5 12A4.5 4.5 0 0 0 14 8.03v2.19l2.45 2.45a4.4 4.4 0 0 0 .05-.67ZM19 12a6.94 6.94 0 0 1-.54 2.7l1.51 1.51A8.86 8.86 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4.5 fill-current">
              <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8.03v7.94A4.5 4.5 0 0 0 16.5 12ZM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77Z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
