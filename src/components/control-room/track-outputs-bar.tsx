"use client";

import { Plus, XClose } from "@untitledui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTrackOutputsManager } from "@/hooks/use-track-outputs-manager";
import { formatLatency, formatUsd } from "@/lib/format";
import { languageLabel } from "@/models/language.model";
import type { Track } from "@/models/track.model";

export function TrackOutputsBar({ track }: { track: Track }) {
  const { available, add, remove, pendingLanguage } = useTrackOutputsManager(track);
  const isRunning = track.status === "live" || track.status === "starting";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-[0.68rem] font-medium tracking-wider uppercase">
        Outputs
      </span>

      {track.outputs.length === 0 ? (
        <span className="text-muted-foreground text-xs italic">none yet</span>
      ) : null}

      {track.outputs.map((output) => (
        <Badge
          key={output.language}
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary gap-1.5 py-1 pr-1 pl-2.5 font-mono text-[0.7rem]"
        >
          <span className="font-semibold uppercase">{output.language}</span>
          <span className="text-muted-foreground">
            {output.words}w · {formatLatency(output.latencyP50Ms)} · {formatUsd(output.costUsd)}
          </span>
          {isRunning ? (
            <button
              type="button"
              aria-label={`Remove ${languageLabel(output.language)} output`}
              disabled={pendingLanguage === output.language}
              onClick={() => void remove(output.language)}
              className="hover:bg-destructive/20 hover:text-destructive cursor-pointer rounded p-0.5 transition-colors"
            >
              <XClose className="size-3" aria-hidden />
            </button>
          ) : null}
        </Badge>
      ))}

      {isRunning && available.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Plus className="size-3.5" aria-hidden /> Add language
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
            {available.map((code) => (
              <DropdownMenuItem
                key={code}
                disabled={pendingLanguage === code}
                onSelect={() => void add(code)}
              >
                {languageLabel(code)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
