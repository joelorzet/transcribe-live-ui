"use client";

import { useState } from "react";
import { PlayCircle, RefreshCw01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useYouTubePlayer } from "@/hooks/use-youtube-player";
import { toDisplayCaption } from "@/lib/caption";
import type { EmbeddableVideo } from "@/lib/video";

interface VideoStageProps {
  video: EmbeddableVideo;
  original: string;
  interim: string;
  translated: string;
  showOriginal: boolean;
  serverPositionSeconds: number | undefined;
  captionLagMs: number;
}

const MIN_LAG_S = 0.5;
const MAX_LAG_S = 4;

export function VideoStage({
  video,
  original,
  interim,
  translated,
  showOriginal,
  serverPositionSeconds,
  captionLagMs,
}: VideoStageProps) {
  const { hostRef, isReady, state, startAt } = useYouTubePlayer(video.id);
  const [hasStarted, setHasStarted] = useState(false);
  const [nudge, setNudge] = useState(0);

  const isLive = serverPositionSeconds === undefined;
  const lag = Math.min(MAX_LAG_S, Math.max(MIN_LAG_S, captionLagMs / 1000));
  const offset = lag + nudge;
  const isPaused = hasStarted && (state === "paused" || state === "ended");

  const sync = (extraNudge = 0) => {
    setNudge((current) => current + extraNudge);
    setHasStarted(true);
    startAt(serverPositionSeconds === undefined ? 0 : serverPositionSeconds - (offset + extraNudge));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full overflow-hidden rounded-xl border bg-black">
        <div ref={hostRef} className="aspect-video w-full" />

        {!hasStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center">
            <p className="text-sm text-white/80">
              {isLive
                ? "This is a live broadcast, so it opens where the stream is now."
                : `Opening ${offset.toFixed(1)}s earlier so the subtitles land in time.`}
            </p>
            <Button size="lg" disabled={!isReady} onClick={() => sync()}>
              <PlayCircle className="size-5" aria-hidden />
              {isReady ? "Watch with subtitles" : "Loading"}
            </Button>
          </div>
        ) : null}

        {isPaused ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
            <p className="max-w-sm text-sm text-white/85">
              The talk carries on while you are paused, so the subtitles have moved ahead of the
              picture.
            </p>
            <Button size="lg" onClick={() => sync()}>
              <RefreshCw01 className="size-5" aria-hidden /> Catch up to live
            </Button>
          </div>
        ) : null}

        {hasStarted && !isPaused && (translated || interim || original) ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-[14%] flex flex-col items-center gap-1 px-4">
            {showOriginal && (interim || original) ? (
              <p className="max-w-[46ch] text-center text-[clamp(13px,1.5vw,17px)] leading-snug text-white/75 [text-shadow:0_2px_6px_rgb(0_0_0/0.95)]">
                {toDisplayCaption(interim || original, 110)}
              </p>
            ) : null}
            {translated ? (
              <p className="max-w-[46ch] text-center text-[clamp(17px,2.3vw,30px)] leading-[1.35] font-medium text-white [text-shadow:0_2px_4px_rgb(0_0_0/0.98),0_0_14px_rgb(0_0_0/0.85)]">
                {toDisplayCaption(translated, 130)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasStarted && !isLive ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <Badge
            variant="outline"
            className={
              state === "playing"
                ? "border-primary/50 text-primary gap-1.5 text-[0.68rem]"
                : "gap-1.5 border-amber-500/50 text-amber-400 text-[0.68rem]"
            }
            title="What the player reports it is doing"
          >
            <span
              className={`size-1.5 rounded-full bg-current ${state === "playing" ? "animate-pulse" : ""}`}
            />
            player: {state}
          </Badge>
          <span className="text-muted-foreground">Subtitles out of step?</span>
          <Button variant="outline" size="sm" onClick={() => sync(-1)}>
            Video later
          </Button>
          <span className="text-muted-foreground tabular font-mono">{offset.toFixed(1)}s</span>
          <Button variant="outline" size="sm" onClick={() => sync(1)}>
            Video earlier
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-center text-xs">
          Subtitles are generated from the audio as the talk happens.
        </p>
      )}
    </div>
  );
}
