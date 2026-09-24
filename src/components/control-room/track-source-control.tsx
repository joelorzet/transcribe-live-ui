"use client";

import { Play, StopCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTrackSource } from "@/hooks/use-track-source";

export function TrackSourceControl({ trackId }: { trackId: string }) {
  const { value, setValue, start, stop, isBusy, ingest } = useTrackSource(trackId);

  if (ingest) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-primary/50 bg-primary/10 text-primary gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-current" />
          pulling audio · {Math.round(ingest.secondsIngested)}s
        </Badge>
        <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">
          {ingest.source}
        </span>
        <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => void stop()}>
          <StopCircle className="size-3.5" aria-hidden /> Stop source
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void start();
      }}
    >
      <Input
        type="url"
        aria-label="Audio source URL"
        placeholder="YouTube or media URL…"
        className="h-8 text-xs"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button type="submit" variant="outline" size="sm" disabled={isBusy}>
        <Play className="size-3.5" aria-hidden /> {isBusy ? "Starting…" : "Pull audio"}
      </Button>
    </form>
  );
}
