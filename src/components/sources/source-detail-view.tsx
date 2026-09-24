"use client";

import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Plus, RefreshCw01, StopCircle, Trash01 } from "@untitledui/icons";
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
import { SourceInputPanel } from "@/components/sources/source-input-panel";
import { SourceSettingsRow } from "@/components/sources/source-settings-row";
import { OutputStreamCard } from "@/components/sources/output-stream-card";
import { StreamEndpointsPanel } from "@/components/sources/stream-endpoints-panel";
import { useControlRoom } from "@/contexts/control-room-context";
import { useTrackOutputsManager } from "@/hooks/use-track-outputs-manager";
import { useTrackActions } from "@/hooks/use-track-actions";
import { formatDuration, formatLatency, formatUsd } from "@/lib/format";
import { languageLabel, type Language } from "@/models/language.model";
import type { TrackView } from "@/hooks/use-track-stream";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t pt-5">
      <h3 className="text-muted-foreground mb-3 text-[0.68rem] font-medium tracking-wider uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border px-3 py-2.5">
      <span className="text-muted-foreground text-[0.62rem] tracking-wider uppercase">{label}</span>
      <span className="tabular font-mono text-base leading-none">{value}</span>
    </div>
  );
}

export function SourceDetailView({ trackId }: { trackId: string }) {
  const { tracks } = useControlRoom();
  const view = tracks.find((candidate) => candidate.track.id === trackId);

  if (!view) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
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

  return <SourceDetailBody view={view} />;
}

function SourceDetailBody({ view }: { view: TrackView }) {
  const { track } = view;
  const { stop, remove, restart, pendingId } = useTrackActions();
  const { available, add, remove: removeOutput, pendingLanguage } = useTrackOutputsManager(track);
  const isRunning = track.status === "live" || track.status === "starting";
  const canEditOutputs = track.status !== "ended";
  const isPending = pendingId === track.id;

  const copy = (value: string, label: string) => {
    void navigator.clipboard
      .writeText(value)
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
        <span className="text-muted-foreground text-xs">
          Speaking{" "}
          <span className="text-foreground font-medium">
            {track.spokenLanguage === "auto"
              ? "auto-detect"
              : languageLabel(track.spokenLanguage as Language)}
          </span>
        </span>
        <div className="flex-1" />
        {isRunning ? (
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-destructive"
            disabled={isPending}
            onClick={() => void stop(track.id)}
          >
            <StopCircle className="size-3.5" aria-hidden /> {isPending ? "Stopping" : "Stop source"}
          </Button>
        ) : (
          <>
            <Button size="sm" disabled={isPending} onClick={() => void restart(track.id)}>
              <RefreshCw01 className="size-3.5" aria-hidden /> {isPending ? "Restarting" : "Restart"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-destructive"
              disabled={isPending}
              onClick={() => void remove(track.id)}
            >
              <Trash01 className="size-3.5" aria-hidden /> Remove
            </Button>
          </>
        )}
      </header>

      {track.errorMessage || (!isRunning && track.status !== "ended") ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive flex flex-wrap items-start gap-3 rounded-lg border px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">This source stopped with an error</p>
            <p className="mt-0.5 font-mono text-xs break-words opacity-90">
              {track.errorMessage ?? "The speech stream closed unexpectedly."}
            </p>
            <p className="mt-1 text-xs opacity-80">
              Retrying reconnects the speech model and keeps the transcript, outputs and glossary.
            </p>
          </div>
          <Button size="sm" disabled={isPending} onClick={() => void restart(track.id)}>
            <RefreshCw01 className="size-3.5" aria-hidden /> {isPending ? "Retrying" : "Retry"}
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Audio" value={formatDuration(track.metrics.audioSeconds)} />
            <Stat label="Segments" value={String(track.metrics.segments)} />
            <Stat label="Latency p50" value={formatLatency(track.metrics.latencyP50Ms)} />
            <Stat label="Latency p95" value={formatLatency(track.metrics.latencyP95Ms)} />
            <Stat label="Audio cost" value={formatUsd(track.cost.audioUsd)} />
          </div>

          <Section title="Audio source">
            <SourceInputPanel trackId={track.id} onCopy={copy} />
          </Section>

          <Section title="Recognition">
            <SourceSettingsRow
              trackId={track.id}
              spokenLanguage={track.spokenLanguage}
              glossaryId={track.glossaryId}
              disabled={!canEditOutputs}
            />
          </Section>

          <Section
            title={`Live transcript in ${
              track.spokenLanguage === "auto"
                ? "the detected language"
                : languageLabel(track.spokenLanguage as Language)
            }`}
          >
            <CaptionStack interim={view.interim} original={view.original} translations={{}} />
          </Section>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold">Output streams</h2>
          <span className="text-muted-foreground text-xs">
            {track.outputs.length} {track.outputs.length === 1 ? "language" : "languages"} · translation{" "}
            {formatUsd(track.cost.translationUsd)}
          </span>
          <div className="flex-1" />
          {canEditOutputs && available.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="size-3.5" aria-hidden /> Add language
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
                output={{ ...output, trackId: track.id }}
                text={view.translations[output.language as Language] ?? ""}
                canRemove={canEditOutputs}
                isPending={pendingLanguage === output.language}
                onRemove={() => void removeOutput(output.language as Language)}
              />
            ))}
          </div>
        )}
      </section>

      <StreamEndpointsPanel trackId={track.id} outputs={track.outputs} />
    </div>
  );
}
