import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/models/engine.model";
import type { TrackStatus } from "@/models/track.model";

const TRACK_VARIANTS: Record<TrackStatus, { label: string; className: string; pulse: boolean }> = {
  live: { label: "live", className: "border-primary/50 bg-primary/10 text-primary", pulse: true },
  starting: { label: "starting", className: "border-sky-500/50 bg-sky-500/10 text-sky-400", pulse: true },
  ended: { label: "ended", className: "border-border bg-muted text-muted-foreground", pulse: false },
  error: { label: "error", className: "border-destructive/50 bg-destructive/10 text-destructive", pulse: false },
};

export function TrackStatusBadge({ status }: { status: TrackStatus }) {
  const variant = TRACK_VARIANTS[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase", variant.className)}>
      <span className={cn("size-1.5 rounded-full bg-current", variant.pulse && "animate-pulse")} />
      {variant.label}
    </Badge>
  );
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  if (status === "connected") return null;

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-amber-500/50 bg-amber-500/10 font-mono text-[0.68rem] tracking-wider text-amber-400 uppercase"
    >
      <span className="size-1.5 animate-pulse rounded-full bg-current" />
      {status === "connecting" ? "connecting" : "reconnecting"}
    </Badge>
  );
}
