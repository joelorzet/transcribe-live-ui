import Link from "next/link";
import { Download01, Eye, LayersTwo01, StopCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CaptionStack } from "@/components/captions/caption-stack";
import { TrackStatusBadge } from "@/components/control-room/status-badge";
import { formatDuration, formatLatency, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TrackView } from "@/hooks/use-track-stream";

interface TrackCardProps {
  view: TrackView;
  srtUrl: string;
  isStopping: boolean;
  onStop: () => void;
}

export function TrackCard({ view, srtUrl, isStopping, onStop }: TrackCardProps) {
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
          {track.spokenLanguage} → {track.subtitleLanguages.join(" + ")}
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
        <Button asChild variant="outline" size="sm">
          <Link href={`/overlay/${track.id}`} target="_blank">
            <LayersTwo01 className="size-3.5" aria-hidden /> Overlay
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={srtUrl}>
            <Download01 className="size-3.5" aria-hidden /> SRT
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive ml-auto"
          disabled={!isRunning || isStopping}
          onClick={onStop}
        >
          <StopCircle className="size-3.5" aria-hidden /> Stop
        </Button>
      </CardFooter>
    </Card>
  );
}
