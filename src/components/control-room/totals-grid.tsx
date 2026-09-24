import { CurrencyDollar, Microphone01, Translate01, Type01, Zap } from "@untitledui/icons";
import { StatTile } from "@/components/control-room/stat-tile";
import { formatCount, formatDuration, formatUsd } from "@/lib/format";
import type { EventTotals } from "@/models/totals.model";

export function TotalsGrid({ totals }: { totals: EventTotals }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatTile
        label="Inputs live"
        value={`${totals.liveInputs}`}
        unit={totals.totalInputs > totals.liveInputs ? `of ${totals.totalInputs}` : undefined}
        icon={Microphone01}
      />
      <StatTile label="Language outputs" value={formatCount(totals.totalOutputs)} icon={Translate01} />
      <StatTile
        label="Audio captioned"
        value={formatDuration(totals.audioSeconds)}
        icon={Type01}
      />
      <StatTile label="Latency p50" value={String(totals.latencyP50Ms)} unit="ms" icon={Zap} />
      <StatTile
        label="Spend"
        value={formatUsd(totals.costUsd)}
        unit={`audio ${formatUsd(totals.audioUsd)} · tx ${formatUsd(totals.translationUsd)}`}
        icon={CurrencyDollar}
      />
    </div>
  );
}
