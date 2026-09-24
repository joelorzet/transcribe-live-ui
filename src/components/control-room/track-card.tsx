import Link from "next/link";
import { Download01, Eye, Share07, StopCircle, Trash01 } from "@untitledui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CaptionStack } from "@/components/captions/caption-stack";
import { TrackStatusBadge } from "@/components/control-room/status-badge";
import { formatDuration, formatLatency, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TrackView } from "@/hooks/use-track-stream";
import type { ReactNode } from "react";

interface TrackCardProps {
  view: TrackView;
  downloads: { label: string; href: string }[];
  outputs: ReactNode;
  isPending: boolean;
  onStop: () => void;
  onRemove: () => void;
  sourceControl?: ReactNode;
  outputsBar: ReactNode;
}

export function TrackCard({
  view,
  downloads,
  outputs,
  isPending,
  onStop,
  onRemove,
  sourceControl,
  outputsBar,
}: TrackCardProps) {
  const { track } = view;
  const isRunning = track.status === "live" || track.status === "starting";

  const metrics = [
    { label: "Latency p50", value: formatLatency(track.metrics.latencyP50Ms) },
    { label: "Words", value: track.metrics.words.toLocaleString("en-US") },
    { label: "Audio", value: formatDuration(track.metrics.audioSeconds) },
    { label: "Cost", value: formatUsd(track.metrics.costUsd) },
  ];

  return (
    <Card className={cn("gap-0 overflow-hidden py-0", track.status === "live" && "border-primary/40")}>
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 border-b px-4 py-3">
        <span className="min-w-0 flex-1 truncate text-[0.95rem] font-semibold" title={track.title}>
          {track.title}
        </span>
        <span className="text-muted-foreground font-mono text-[0.68rem] tracking-wider uppercase">
          {track.spokenLanguage} → {track.outputs.map((output) => output.language).join(" + ")}
        </span>
        <TrackStatusBadge status={track.status} />
      </CardHeader>

      <CardContent className="min-h-32 px-4 py-4">
        <CaptionStack
          interim={view.interim}
          original={view.original}
          translations={view.translations}
        />
      </CardContent>

      <div className="border-t px-4 py-2.5">{outputsBar}</div>

      {sourceControl && isRunning ? (
        <div className="border-t px-4 py-2.5">{sourceControl}</div>
      ) : null}

      <div className="bg-border grid grid-cols-2 gap-px border-y sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-card px-3 py-2">
            <div className="text-muted-foreground text-[0.62rem] tracking-wider uppercase">
              {metric.label}
            </div>
            <div className="tabular font-mono text-sm">{metric.value}</div>
          </div>
        ))}
      </div>

      <CardFooter className="flex flex-wrap gap-2 px-4 py-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/session/${track.id}`} target="_blank">
            <Eye className="size-3.5" aria-hidden /> Captions
          </Link>
        </Button>
        {outputs}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download01 className="size-3.5" aria-hidden /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {downloads.map((download) => (
              <DropdownMenuItem key={download.label} asChild>
                <a href={download.href}>{download.label}</a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {isRunning ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive ml-auto"
            disabled={isPending}
            onClick={onStop}
          >
            <StopCircle className="size-3.5" aria-hidden /> {isPending ? "Stopping…" : "Stop"}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive ml-auto"
            disabled={isPending}
            onClick={onRemove}
          >
            <Trash01 className="size-3.5" aria-hidden /> {isPending ? "Removing…" : "Remove"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
