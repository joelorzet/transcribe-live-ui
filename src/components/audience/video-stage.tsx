"use client";

import { useState } from "react";
import { PlayCircle, RefreshCw01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { toDisplayCaption } from "@/lib/caption";
import { buildEmbedUrl, type EmbeddableVideo } from "@/lib/video";

interface VideoStageProps {
  video: EmbeddableVideo;
  original: string;
  interim: string;
  translated: string;
  showOriginal: boolean;
  serverPositionSeconds: number | undefined;
}

export function VideoStage({
  video,
  original,
  interim,
  translated,
  showOriginal,
  serverPositionSeconds,
}: VideoStageProps) {
  // Remounting the iframe with a fresh offset is how both starting and
  // resyncing work, so the key carries the offset it was opened at.
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const spoken = interim || original;
  const isLive = serverPositionSeconds === undefined;
  const isPlaying = startedAt !== null;

  const play = () => setStartedAt(serverPositionSeconds ?? 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full overflow-hidden rounded-xl border bg-black">
        <div className="aspect-video w-full">
          {isPlaying ? (
            <iframe
              key={startedAt}
              src={buildEmbedUrl(video.id, isLive ? undefined : startedAt)}
              title="Live talk"
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>

        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center">
            <p className="text-sm text-white/80">
              {isLive
                ? "This is a live broadcast, so it opens where the stream is now."
                : "The player opens at the point being subtitled right now."}
            </p>
            <Button size="lg" onClick={play}>
              <PlayCircle className="size-5" aria-hidden /> Watch with subtitles
            </Button>
          </div>
        ) : null}

        {isPlaying && (translated || spoken) ? (
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

      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="text-muted-foreground text-xs">
          Subtitles are generated from the audio, so they trail the picture by a second or two.
        </p>
        {isPlaying && !isLive ? (
          <Button variant="ghost" size="sm" onClick={play}>
            <RefreshCw01 className="size-3.5" aria-hidden /> Resync with subtitles
          </Button>
        ) : null}
      </div>
    </div>
  );
}
