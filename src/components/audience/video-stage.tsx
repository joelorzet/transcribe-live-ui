"use client";

import { PlayCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { useSyncedPlayer } from "@/hooks/use-synced-player";
import { toDisplayCaption } from "@/lib/caption";
import { cn } from "@/lib/utils";
import type { EmbeddableVideo } from "@/lib/video";

interface VideoStageProps {
  video: EmbeddableVideo;
  title: string;
  original: string;
  interim: string;
  translated: string;
  showOriginal: boolean;
  serverPositionSeconds: number | undefined;
}

export function VideoStage({
  video,
  title,
  original,
  interim,
  translated,
  showOriginal,
  serverPositionSeconds,
}: VideoStageProps) {
  const { containerRef, isReady, isPlaying, start, driftSeconds } = useSyncedPlayer(
    video.id,
    serverPositionSeconds,
  );

  const spoken = interim || original;
  const hasCaption = Boolean(translated || spoken);
  const drifted = Math.abs(driftSeconds) > 2;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full overflow-hidden rounded-xl border bg-black">
        <div className="aspect-video w-full">
          <div ref={containerRef} className="size-full" />
        </div>

        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 text-center">
            <p className="px-6 text-sm text-white/80">
              {serverPositionSeconds === undefined
                ? "Waiting for the talk to start"
                : "The player will jump to the point being subtitled right now."}
            </p>
            <Button size="lg" disabled={!isReady || serverPositionSeconds === undefined} onClick={start}>
              <PlayCircle className="size-5" aria-hidden />
              {isReady ? "Watch with subtitles" : "Loading player"}
            </Button>
          </div>
        ) : null}

        {isPlaying && hasCaption ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 p-3 sm:p-5">
            {showOriginal && spoken ? (
              <p className="max-w-3xl rounded-lg bg-black/80 px-3 py-1.5 text-center text-sm leading-snug text-white/90 sm:text-base">
                {toDisplayCaption(spoken, 120)}
              </p>
            ) : null}
            {translated ? (
              <p className="text-primary max-w-3xl rounded-lg bg-black/85 px-4 py-2 text-center text-base leading-snug font-semibold sm:text-xl">
                {toDisplayCaption(translated, 140)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <p
        className={cn(
          "text-center text-xs",
          drifted ? "text-amber-400" : "text-muted-foreground",
        )}
      >
        {isPlaying
          ? drifted
            ? `Realigning the video with the subtitles (${driftSeconds > 0 ? "ahead" : "behind"} by ${Math.abs(Math.round(driftSeconds))}s)`
            : "Video and subtitles are aligned. Subtitles are generated from the audio, so they trail the picture by a second or two."
          : "Subtitles are generated live from this talk's audio."}
      </p>
    </div>
  );
}
