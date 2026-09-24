"use client";

import { useSearchParams } from "next/navigation";
import { useTrackStream } from "@/hooks/use-track-stream";
import { cn } from "@/lib/utils";
import type { Language } from "@/models/language.model";

export function OverlayView({ trackId }: { trackId: string }) {
  const params = useSearchParams();
  const only = params.get("only");
  const language = params.get("lang") as Language | null;
  const chroma = params.get("chroma") === "1";

  const { views, status } = useTrackStream(trackId);
  const view = views[trackId];

  const spoken = view?.interim || view?.original || "";
  const translated = language
    ? (view?.translations[language] ?? "")
    : Object.values(view?.translations ?? {})[0] ?? "";

  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-end justify-center px-[6vw] pb-[6vh]",
        chroma ? "bg-[#00b140]" : "bg-transparent",
      )}
    >
      {status !== "connected" ? (
        <span className="bg-destructive fixed top-3 left-3 rounded px-2 py-1 text-xs text-white">
          subtitles disconnected
        </span>
      ) : null}

      <div className="flex w-full max-w-[1500px] flex-col items-center gap-2 text-center">
        {only !== "translated" && spoken ? (
          <p className="inline-block rounded-lg bg-black/80 px-6 py-3 text-[clamp(22px,3.4vw,46px)] leading-snug font-medium text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.75)]">
            {spoken}
          </p>
        ) : null}

        {only !== "original" && translated ? (
          <p className="text-primary inline-block rounded-lg bg-black/80 px-6 py-3 text-[clamp(22px,3.4vw,46px)] leading-snug font-bold [text-shadow:0_2px_10px_rgba(0,0,0,0.75)]">
            {translated}
          </p>
        ) : null}
      </div>
    </div>
  );
}
