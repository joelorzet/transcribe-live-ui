"use client";

import { Link03, XClose } from "@untitledui/icons";
import { OutputConnectDialog } from "@/components/sources/output-connect-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toDisplayCaption } from "@/lib/caption";
import { formatLatency, formatUsd } from "@/lib/format";
import { languageLabel, type Language } from "@/models/language.model";
import type { TrackOutput } from "@/models/track.model";

interface OutputStreamCardProps {
  output: TrackOutput & { trackId: string };
  text: string;
  canRemove: boolean;
  isPending: boolean;
  onRemove: () => void;
}

export function OutputStreamCard({
  output,
  text,
  canRemove,
  isPending,
  onRemove,
}: OutputStreamCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 border-b px-4 py-3">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary font-mono text-[0.7rem] font-semibold uppercase"
        >
          {output.language}
        </Badge>
        <span className="text-sm font-medium">{languageLabel(output.language as Language)}</span>
        <div className="flex-1" />
        <span className="text-muted-foreground font-mono text-xs">
          {output.words}w · {formatLatency(output.latencyP50Ms)} · {formatUsd(output.costUsd)}
        </span>
        {canRemove ? (
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-destructive size-7"
            aria-label={`Remove ${languageLabel(output.language as Language)} output`}
            disabled={isPending}
            onClick={onRemove}
          >
            <XClose className="size-3.5" aria-hidden />
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="min-h-24 px-4 py-4">
        {text ? (
          <p className="text-primary text-[0.95rem] leading-relaxed break-words">
            {toDisplayCaption(text)}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm italic">Waiting for speech…</p>
        )}
      </CardContent>

      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
        <OutputConnectDialog trackId={output.trackId} language={output.language as Language}>
          <Button variant="outline" size="sm">
            <Link03 className="size-3.5" aria-hidden /> Connect this stream
          </Button>
        </OutputConnectDialog>
        <span className="text-muted-foreground text-xs">OBS, audience page, WebSocket or SRT</span>
      </div>
    </Card>
  );
}
