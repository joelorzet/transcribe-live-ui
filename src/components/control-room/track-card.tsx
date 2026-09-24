import Link from "next/link";
import { ArrowRight, Download01, Eye, StopCircle, Trash01 } from "@untitledui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CaptionStack } from "@/components/captions/caption-stack";
import { TrackOutputsSummary } from "@/components/control-room/track-outputs-summary";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { languageLabel, type Language } from "@/models/language.model";
import { TrackStatusBadge } from "@/components/control-room/status-badge";
import { formatDuration, formatLatency, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TrackView } from "@/hooks/use-track-stream";

interface TrackCardProps {
  view: TrackView;
  downloads: { label: string; href: string }[];
  isPending: boolean;
  onStop: () => void;
  onRemove: () => void;
}

export function TrackCard({
  view,
  downloads,
  isPending,
  onStop,
  onRemove,
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
        <Link
          href={`/sources/${track.id}`}
          title={`Open ${track.title}`}
          className="hover:text-primary min-w-0 flex-1 cursor-pointer truncate text-[0.95rem] font-semibold transition-colors"
        >
          {track.title}
        </Link>
        <span className="text-muted-foreground text-xs">
          Speaking{" "}
          <span className="text-foreground font-medium">
            {track.spokenLanguage === "auto"
              ? "auto-detect"
              : languageLabel(track.spokenLanguage as Language)}
          </span>
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

      <div className="border-t px-4 py-2.5">
        <TrackOutputsSummary outputs={track.outputs} />
      </div>

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="outline" size="sm">
              <Link href={`/sources/${track.id}`}>
                <ArrowRight className="size-3.5" aria-hidden /> Manage
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open this source to change its audio input and output languages</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/session/${track.id}`} target="_blank">
                <Eye className="size-3.5" aria-hidden /> Captions
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Full screen subtitles for the audience</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download01 className="size-3.5" aria-hidden /> Export
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Download the transcript as subtitles or plain text</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {downloads.map((download) => (
              <DropdownMenuItem key={download.label} asChild>
                <a href={download.href}>{download.label}</a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {isRunning ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive ml-auto"
                disabled={isPending}
                onClick={onStop}
              >
                <StopCircle className="size-3.5" aria-hidden /> {isPending ? "Stopping" : "Stop"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop transcribing. The transcript stays available</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive ml-auto"
                disabled={isPending}
                onClick={onRemove}
              >
                <Trash01 className="size-3.5" aria-hidden /> {isPending ? "Removing" : "Remove"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete this source and its transcript</TooltipContent>
          </Tooltip>
        )}
      </CardFooter>
    </Card>
  );
}
