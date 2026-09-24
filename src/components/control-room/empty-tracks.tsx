import { Microphone02 } from "@untitledui/icons";

export function EmptyTracks() {
  return (
    <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-14 text-center">
      <Microphone02 className="mx-auto mb-3 size-9 opacity-50" aria-hidden />
      <p className="text-sm">
        No tracks running yet. Start one above, or replay recorded talks with
        <code className="bg-muted mx-1.5 rounded px-1.5 py-0.5 font-mono text-xs">npm run replay</code>
        in <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">core-api</code>.
      </p>
    </div>
  );
}
