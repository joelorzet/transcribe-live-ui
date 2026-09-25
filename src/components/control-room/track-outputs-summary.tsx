import { Badge } from "@/components/ui/badge";
import { formatLatency, formatUsd } from "@/lib/format";
import { languageLabel } from "@/models/language.model";
import type { TrackOutput } from "@/models/track.model";

export function TrackOutputsSummary({ outputs }: { outputs: TrackOutput[] }) {
  return (
    <div className="flex min-h-7 flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">Subtitles</span>

      {outputs.length === 0 ? (
        <span className="text-muted-foreground text-xs italic">no languages yet</span>
      ) : (
        outputs.map((output) => (
          <Badge
            key={output.language}
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary gap-1.5 font-mono text-[0.7rem]"
          >
            <span className="font-semibold">{languageLabel(output.language)}</span>
            <span className="text-muted-foreground">
              {output.words}w · {formatLatency(output.latencyP50Ms)} · {formatUsd(output.costUsd)}
            </span>
          </Badge>
        ))
      )}
    </div>
  );
}
