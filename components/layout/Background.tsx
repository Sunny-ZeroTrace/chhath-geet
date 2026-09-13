"use client";

import { useEffect, useState } from "react";

interface BackgroundMediaProps {
  type: "image" | "video";
  src: string;
  mobileSrc?: string;
  posterSrc?: string;
}

/**
 * Full-bleed cinematic background. Swappable without touching layout —
 * pass a new `src` (e.g. from site_settings.background_url) to change it.
 * Falls back to a still poster image when the visitor has requested
 * reduced motion.
 */
export default function BackgroundMedia({
  type,
  src,
  mobileSrc,
  posterSrc,
}: BackgroundMediaProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);
    const handler = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  const showVideo = type === "video" && !prefersReducedMotion;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {showVideo ? (
        <video
          className="h-full w-full object-cover"
          src={src}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          {mobileSrc && (
            <source src={mobileSrc} media="(max-width: 640px)" />
          )}
        </video>
      ) : (
        <img
          className="h-full w-full object-cover"
          src={posterSrc ?? (type === "image" ? src : undefined)}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Warm gradient overlay keeps foreground text readable over the scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-ghat-900/70 via-ghat-900/50 to-ghat-900/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-ghat-900 via-transparent to-transparent" />
    </div>
  );
}
