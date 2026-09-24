"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_SRC = "https://www.youtube.com/iframe_api";
const DRIFT_TOLERANCE_S = 1.5;
const CHECK_INTERVAL_MS = 4000;

interface YouTubePlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  playVideo: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: Record<string, unknown>,
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${API_SRC}"]`);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!existing) {
      const script = document.createElement("script");
      script.src = API_SRC;
      document.head.appendChild(script);
    }
  });
}

/**
 * Keeps an embedded player at the same point in the source that the server is
 * transcribing. Subtitles describe the server's position, so a player sitting
 * anywhere else shows the wrong words with a straight face.
 */
export function useSyncedPlayer(videoId: string, serverPositionSeconds: number | undefined) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const positionRef = useRef(serverPositionSeconds);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [driftSeconds, setDriftSeconds] = useState(0);

  positionRef.current = serverPositionSeconds;

  useEffect(() => {
    let cancelled = false;

    void loadApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { modestbranding: 1, rel: 0, playsinline: 1, controls: 1 },
        events: { onReady: () => !cancelled && setIsReady(true) },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  const start = useCallback(() => {
    const player = playerRef.current;
    const target = positionRef.current;
    if (!player || target === undefined) return;
    player.seekTo(target, true);
    player.playVideo();
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const player = playerRef.current;
      const target = positionRef.current;
      if (!player || target === undefined) return;

      const drift = player.getCurrentTime() - target;
      setDriftSeconds(drift);
      if (Math.abs(drift) > DRIFT_TOLERANCE_S) player.seekTo(target, true);
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return { containerRef, isReady, isPlaying, start, driftSeconds };
}
