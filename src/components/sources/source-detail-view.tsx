"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, StopCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaptionStack } from "@/components/captions/caption-stack";
import { TrackStatusBadge } from "@/components/control-room/status-badge";
import { TrackSourceControl } from "@/components/control-room/track-source-control";
import { OutputStreamCard } from "@/components/sources/output-stream-card";
import { useControlRoom } from "@/contexts/control-room-context";
import { useTrackOutputsManager } from "@/hooks/use-track-outputs-manager";
import { useTrackActions } from "@/hooks/use-track-actions";
import { formatDuration, formatLatency, formatUsd } from "@/lib/format";
import { buildAudienceUrl, buildOverlayUrl } from "@/models/output.model";
import { languageLabel, type Language } from "@/models/language.model";

export function SourceDetailView({ trackId }: { trackId: string }) {
  const { tracks, transcriptUrl } = useControlRoom();
  const { stop, pendingId } = useTrackActions();
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const view = tracks.find((candidate) => candidate.track.id === trackId);

  if (!view) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden /> Control room
          </Link>
        </Button>
        <p className="text-muted-foreground mt-6 text-sm">
          No source with id <code className="font-mono">{trackId}</code>. It may have been removed.
        </p>
      </div>
    );
  }

  const { track } = view;
  const isRunning = track.status === "live" || track.status === "starting";

  return (
    <SourceDetailBody
      view={view}
      origin={origin}
      isRunning={isRunning}
      isStopping={pendingId === track.id}
      onStop={() => void stop(track.id)}
      transcriptUrl={transcriptUrl}
    />
  );
}

function SourceDetailBody({
  view,
  origin,
  isRunning,
  isStopping,
  onStop,
  transcriptUrl,
}: {
  view: NonNullable<ReturnType<typeof useControlRoom>["tracks"][number]>;
  origin: string;
  isRunning: boolean;
  isStopping: boolean;
  onStop: () => void;
  transcriptUrl: ReturnType<typeof useControlRoom>["transcriptUrl"];
}) {
  const { track } = view;
  const { available, add, remove, pendingLanguage } = useTrackOutputsManager(track);

  const copy = (url: string, label: string) => {
    void navigator.clipboard
      .writeText(url)
      .then(() => toast.success(`${label} copied`))
      .catch(() => toast.error("Clipboard blocked. Copy it manually"));
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 sm:px-6">
      <header className="bg-background/90 sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b py-4 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden /> Control room
          </Link>
        </Button>
        <h1 className="truncate text-base font-semibold">{track.title}</h1>
        <TrackStatusBadge status={track.status} />
        <span className="text-muted-foreground font-mono text-[0.68rem] tracking-wider uppercase">
          {track.spokenLanguage} source
        </span>
        <div className="flex-1" />
        {isRunning ? (
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-destructive"
            disabled={isStopping}
            onClick={onStop}
          >
            <StopCircle className="size-3.5" aria-hidden /> {isStopping ? "Stopping…" : "Stop source"}
          </Button>
        ) : null}
      </header>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-3">
          <CardTitle className="text-base">Input</CardTitle>
          <div className="flex-1" />
          <span className="text-muted-foreground font-mono text-xs">
            {formatDuration(track.metrics.audioSeconds)} audio · {track.metrics.segments} segments ·
            p50 {formatLatency(track.metrics.latencyP50Ms)} · audio {formatUsd(track.cost.audioUsd)}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TrackSourceControl trackId={track.id} />
          <div className="border-t pt-3">
            <div className="text-muted-foreground mb-2 text-[0.68rem] font-medium tracking-wider uppercase">
              Original transcript
            </div>
            <CaptionStack
              interim={view.interim}
              original={view.original}
              translations={{}}
            />
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold">Output streams</h2>
          <span className="text-muted-foreground text-xs">
            {track.outputs.length} live · translation {formatUsd(track.cost.translationUsd)}
          </span>
          <div className="flex-1" />
          {isRunning && available.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="size-3.5" aria-hidden /> Add output
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {available.map((code) => (
                  <DropdownMenuItem
                    key={code}
                    disabled={pendingLanguage === code}
                    onSelect={() => void add(code)}
                  >
                    {languageLabel(code)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        {track.outputs.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-10 text-center text-sm">
            No output languages yet. Add one and it starts translating this source immediately.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {track.outputs.map((output) => (
              <OutputStreamCard
                key={output.language}
                output={output}
                text={view.translations[output.language as Language] ?? ""}
                overlayUrl={buildOverlayUrl(origin, track.id, {
                  language: output.language as Language,
                  content: "translated",
                  chromaKey: false,
                  size: "md",
                })}
                audienceUrl={buildAudienceUrl(origin, track.id, output.language as Language)}
                srtUrl={transcriptUrl(track.id, "srt", output.language as Language)}
                canRemove={isRunning}
                isPending={pendingLanguage === output.language}
                onRemove={() => void remove(output.language as Language)}
                onCopy={copy}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
