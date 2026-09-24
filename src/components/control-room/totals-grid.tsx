import { Activity, CurrencyDollar, Microphone01, Type01, Zap } from "@untitledui/icons";
import { StatTile } from "@/components/control-room/stat-tile";
import { formatCount, formatUsd } from "@/lib/format";
import type { EventTotals } from "@/models/totals.model";

export function TotalsGrid({ totals }: { totals: EventTotals }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatTile label="Live tracks" value={String(totals.liveTracks)} icon={Microphone01} />
      <StatTile label="Words captioned" value={formatCount(totals.words)} icon={Type01} />
      <StatTile label="Latency p50" value={String(totals.latencyP50Ms)} unit="ms" icon={Zap} />
      <StatTile label="Latency p95" value={String(totals.latencyP95Ms)} unit="ms" icon={Activity} />
      <StatTile label="Spend" value={formatUsd(totals.costUsd)} icon={CurrencyDollar} />
    </div>
  );
}
