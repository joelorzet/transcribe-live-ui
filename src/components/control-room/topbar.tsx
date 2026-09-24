import Link from "next/link";
import { AlertTriangle, Microphone01 } from "@untitledui/icons";
import { Badge } from "@/components/ui/badge";
import { ConnectionBadge } from "@/components/control-room/status-badge";
import { cn } from "@/lib/utils";
import type { ConnectionStatus, EngineInfo } from "@/models/engine.model";

interface TopbarProps {
  engine: EngineInfo | null;
  engineError: string | null;
  status: ConnectionStatus;
  liveInputs?: number;
}

export function Topbar({ engine, engineError, status, liveInputs = 0 }: TopbarProps) {
  return (
    <header className="bg-background/90 sticky top-0 z-30 mb-6 flex flex-wrap items-center gap-3 border-b py-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
        <Microphone01 className="text-primary size-6" aria-hidden />
        Transcribe Live
      </Link>

      {engineError ? (
        <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive gap-1.5">
          <AlertTriangle className="size-3.5" aria-hidden />
          API unreachable
        </Badge>
      ) : engine ? (
        <>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase",
              engine.isLive
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-amber-500/50 bg-amber-500/10 text-amber-400",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {engine.label}
          </Badge>
          <Badge
            variant="outline"
            className="text-muted-foreground font-mono text-[0.68rem]"
            title="Concurrent live inputs in use, and the configured maximum"
          >
            {liveInputs}/{engine.capacity} inputs
          </Badge>
        </>
      ) : null}

      <div className="flex-1" />
      <ConnectionBadge status={status} />
    </header>
  );
}
