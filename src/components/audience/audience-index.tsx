"use client";

import Link from "next/link";
import { Microphone01, Translate01 } from "@untitledui/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTrackStream } from "@/hooks/use-track-stream";
import { languageLabel, type Language } from "@/models/language.model";
import { isTrackRunning } from "@/models/track.model";

export function AudienceIndex() {
  const { list } = useTrackStream(null);
  const live = list.filter((view) => isTrackRunning(view.track));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-8 text-center">
        <Microphone01 className="text-primary mx-auto mb-3 size-8" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight">Live subtitles</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pick a talk, then the language you want to read it in.
        </p>
      </header>

      {live.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-14 text-center text-sm">
          <p className="font-medium">Nothing is live right now</p>
          <p className="mt-1">This page updates by itself when a talk starts.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {live.map(({ track }) => (
            <Card key={track.id} className="gap-0 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="flex-1 text-base font-semibold">{track.title}</span>
                <Badge
                  variant="outline"
                  className="border-primary/50 bg-primary/10 text-primary gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-current" />
                  live
                </Badge>
              </div>

              <p className="text-muted-foreground mb-3 text-xs">
                Spoken in{" "}
                <span className="text-foreground font-medium">
                  {track.spokenLanguage === "auto"
                    ? "a language detected automatically"
                    : languageLabel(track.spokenLanguage as Language)}
                </span>
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/session/${track.id}`}
                  className="hover:border-muted-foreground cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors"
                >
                  Original
                </Link>
                {track.outputs.map((output) => (
                  <Link
                    key={output.language}
                    href={`/session/${track.id}?lang=${output.language}`}
                    className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <Translate01 className="size-3.5" aria-hidden />
                    {languageLabel(output.language as Language)}
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
