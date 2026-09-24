"use client";

import { Signal01, Copy01, Play, StopCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTrackSource } from "@/hooks/use-track-source";
import { toast } from "sonner";

export function TrackSourceControl({ trackId }: { trackId: string }) {
  const { value, setValue, start, startRtmp, stop, isBusy, ingest } = useTrackSource(trackId);

  if (ingest) {
    const waiting = ingest.waitingForPublisher;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              waiting
                ? "gap-1.5 border-amber-500/50 bg-amber-500/10 font-mono text-[0.68rem] tracking-wider text-amber-400 uppercase"
                : "border-primary/50 bg-primary/10 text-primary gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase"
            }
          >
            <span className="size-1.5 animate-pulse rounded-full bg-current" />
            {waiting
              ? "waiting for encoder"
              : `${ingest.kind === "rtmp" ? "rtmp" : "pulling"} · ${Math.round(ingest.secondsIngested)}s`}
          </Badge>
          <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => void stop()}>
            <StopCircle className="size-3.5" aria-hidden /> Stop source
          </Button>
        </div>

        {ingest.pushUrl ? (
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={ingest.pushUrl}
              className="h-8 font-mono text-xs"
              onFocus={(event) => event.target.select()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard
                  .writeText(ingest.pushUrl as string)
                  .then(() => toast.success("RTMP URL copied. Paste it in OBS under Settings, Stream"))
                  .catch(() => toast.error("Clipboard blocked. Select the URL and copy it"));
              }}
            >
              <Copy01 className="size-3.5" aria-hidden /> Copy
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground truncate font-mono text-xs">{ingest.source}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        className="flex min-w-56 flex-1 items-center gap-2"
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
          <Play className="size-3.5" aria-hidden /> Pull
        </Button>
      </form>
      <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => void startRtmp()}>
        <Signal01 className="size-3.5" aria-hidden /> OBS push
      </Button>
    </div>
  );
}
