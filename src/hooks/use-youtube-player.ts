"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_SRC = "https://www.youtube.com/iframe_api";

export type PlaybackState = "idle" | "playing" | "paused" | "buffering" | "ended";

const STATES: Record<number, PlaybackState> = {
  0: "ended",
  1: "playing",
  2: "paused",
  3: "buffering",
};

interface YouTubePlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: { Player: new (host: HTMLElement, options: Record<string, unknown>) => YouTubePlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SRC;
      document.head.appendChild(script);
    }
  });
}

/**
 * Wraps the IFrame API so the page can tell whether the viewer is actually
 * watching. Without that, pausing the video leaves subtitles racing ahead of a
 * frozen picture, because the talk carries on being transcribed regardless.
 *
 * The player is mounted into a child node this hook owns, not the caller's
 * container: the API replaces the node it is given, which leaves a development
 * double mount with nothing to mount into the second time around.
 */
export function useYouTubePlayer(videoId: string) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<PlaybackState>("idle");

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;

    void loadApi().then(() => {
      if (disposed || !host || !window.YT?.Player) return;

      const mount = document.createElement("div");
      mount.className = "size-full";
      host.replaceChildren(mount);

      playerRef.current = new window.YT.Player(mount, {
        videoId,
        playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            if (!disposed) setIsReady(true);
          },
          onStateChange: (event: { data: number }) => {
            if (!disposed) setState(STATES[event.data] ?? "idle");
          },
        },
      });
    });

    return () => {
      disposed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host?.replaceChildren();
      setIsReady(false);
      setState("idle");
    };
  }, [videoId]);

  const startAt = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(Math.max(0, seconds), true);
    player.playVideo();
  }, []);

  return { hostRef, isReady, state, startAt };
}
