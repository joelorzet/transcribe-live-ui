"use client";

import { Copy01, Play, Signal01, StopCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTrackSource } from "@/hooks/use-track-source";
import { cn } from "@/lib/utils";

function CopyField({
  id,
  label,
  value,
  onCopy,
}: {
  id: string;
  label: string;
  value: string;
  onCopy: (value: string, label: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          readOnly
          value={value}
          className="h-9 font-mono text-xs"
          onFocus={(event) => event.target.select()}
        />
        <Button variant="outline" size="sm" onClick={() => onCopy(value, label)}>
          <Copy01 className="size-3.5" aria-hidden /> Copy
        </Button>
      </div>
    </div>
  );
}

export function SourceInputPanel({
  trackId,
  onCopy,
}: {
  trackId: string;
  onCopy: (value: string, label: string) => void;
}) {
  const { value, setValue, start, startRtmp, stop, isBusy, ingest } = useTrackSource(trackId);

  if (!ingest) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Play className="size-4" aria-hidden /> Pull from a URL
          </div>
          <p className="text-muted-foreground text-xs">
            A YouTube link, an HLS playlist, or any media file the server can reach.
          </p>
          <form
            className="mt-1 flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void start();
            }}
          >
            <Input
              type="url"
              aria-label="Audio source URL"
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-9 text-xs"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <Button type="submit" size="sm" disabled={isBusy}>
              {isBusy ? "Starting" : "Pull"}
            </Button>
          </form>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Signal01 className="size-4" aria-hidden /> Receive from OBS or vMix
          </div>
          <p className="text-muted-foreground text-xs">
            Opens an RTMP endpoint and waits for your encoder to publish to it.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-auto w-fit"
            disabled={isBusy}
            onClick={() => void startRtmp()}
          >
            {isBusy ? "Opening" : "Open RTMP endpoint"}
          </Button>
        </div>
      </div>
    );
  }

  const waiting = ingest.waitingForPublisher;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase",
            waiting
              ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
              : "border-primary/50 bg-primary/10 text-primary",
          )}
        >
          <span className="size-1.5 animate-pulse rounded-full bg-current" />
          {waiting
            ? "waiting for encoder"
            : ingest.kind === "rtmp"
              ? "receiving rtmp"
              : "pulling audio"}
        </Badge>
        <span className="text-muted-foreground font-mono text-xs">
          {Math.round(ingest.secondsIngested)}s ingested
        </span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => void stop()}>
          <StopCircle className="size-3.5" aria-hidden /> Stop source
        </Button>
      </div>

      {ingest.kind === "rtmp" && ingest.server && ingest.streamKey ? (
        <div className="grid gap-3 md:grid-cols-2">
          <CopyField id="obs-server" label="OBS Server" value={ingest.server} onCopy={onCopy} />
          <CopyField id="obs-key" label="OBS Stream Key" value={ingest.streamKey} onCopy={onCopy} />
          <p className="text-muted-foreground md:col-span-2 text-xs">
            In OBS open Settings, then Stream, choose Custom, and paste these two values.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Pulling from</Label>
          <p className="text-muted-foreground truncate font-mono text-xs">{ingest.source}</p>
        </div>
      )}
    </div>
  );
}
