"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, Clock, RefreshCw01, Zap } from "@untitledui/icons";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProductionHealth } from "@/hooks/use-production-health";
import { cn } from "@/lib/utils";
import type { IssueKind } from "@/models/health.model";

const KINDS: Record<IssueKind, { label: string; tone: string; icon: typeof AlertTriangle }> = {
  error: { label: "Failed", tone: "text-destructive", icon: AlertTriangle },
  silent: { label: "No captions", tone: "text-destructive", icon: AlertTriangle },
  waiting: { label: "Waiting for audio", tone: "text-amber-400", icon: Clock },
  slow: { label: "Running behind", tone: "text-amber-400", icon: Zap },
};

export function HealthPanel() {
  const { issues, byKind, reconnects, apiReachable, isHealthy } = useProductionHealth();
  const [isOpen, setIsOpen] = useState(false);

  const tone = !apiReachable || byKind.error.length > 0 || byKind.silent.length > 0
    ? "border-destructive/40 bg-destructive/5"
    : issues.length > 0
      ? "border-amber-500/40 bg-amber-500/5"
      : "border-border";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("rounded-xl border", tone)}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="hover:bg-muted/30 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
        >
          {isHealthy ? (
            <CheckCircle className="text-primary size-4 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="size-4 shrink-0 text-amber-400" aria-hidden />
          )}

          <span className="text-sm font-medium">
            {!apiReachable
              ? "API unreachable"
              : isHealthy
                ? "All sources healthy"
                : `${issues.length} ${issues.length === 1 ? "source needs" : "sources need"} attention`}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(KINDS) as IssueKind[]).map((kind) =>
              byKind[kind].length > 0 ? (
                <Badge
                  key={kind}
                  variant="outline"
                  className={cn("gap-1 text-[0.68rem]", KINDS[kind].tone)}
                >
                  {byKind[kind].length} {KINDS[kind].label.toLowerCase()}
                </Badge>
              ) : null,
            )}
          </div>

          <div className="flex-1" />

          {reconnects > 0 ? (
            <span className="text-muted-foreground hidden items-center gap-1.5 font-mono text-xs sm:flex">
              <RefreshCw01 className="size-3.5" aria-hidden />
              {reconnects} auto recovered
            </span>
          ) : null}

          <ChevronDown
            className={cn("text-muted-foreground size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
            aria-hidden
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t px-4 py-3">
        {issues.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Every live source is producing captions within the latency budget. Reconnects are
            counted here even when they recovered on their own.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {issues.map((issue) => {
              const Icon = KINDS[issue.kind].icon;
              return (
                <li key={`${issue.trackId}-${issue.kind}`} className="flex items-start gap-2 text-sm">
                  <Icon className={cn("mt-0.5 size-3.5 shrink-0", KINDS[issue.kind].tone)} aria-hidden />
                  <Link
                    href={`/sources/${issue.trackId}`}
                    className="hover:text-primary cursor-pointer font-medium transition-colors"
                  >
                    {issue.trackTitle}
                  </Link>
                  <span className="text-muted-foreground min-w-0 flex-1">{issue.detail}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
