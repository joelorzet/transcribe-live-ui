"use client";

import Link from "next/link";
import { Plus, Trash01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { useControlRoom } from "@/contexts/control-room-context";
import { useTrackFilters } from "@/hooks/use-track-filters";
import { TrackFiltersBar } from "@/components/control-room/track-filters-bar";
import { useTrackActions } from "@/hooks/use-track-actions";
import { Topbar } from "@/components/control-room/topbar";
import { TotalsGrid } from "@/components/control-room/totals-grid";
import { HealthPanel } from "@/components/control-room/health-panel";
import { AudienceLinkDialog } from "@/components/control-room/audience-link-dialog";
import { TrackCard } from "@/components/control-room/track-card";
import { EmptyTracks } from "@/components/control-room/empty-tracks";

export function ControlRoomView() {
  const { tracks, totals, engine, engineError, status, transcriptUrl } = useControlRoom();
  const {
    filters,
    setQuery,
    toggle,
    clearGroup,
    reset,
    visible,
    inputLanguages,
    outputLanguages: outputCodes,
    counts,
    selectedCount,
    isFiltered,
    total,
  } = useTrackFilters();
  const { stop, remove, clearEnded, pendingId, isClearing } = useTrackActions();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6">
      <Topbar
        engine={engine}
        engineError={engineError}
        status={status}
        liveInputs={totals.liveInputs}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">Control room</h1>
          <div className="flex-1" />
          <AudienceLinkDialog />
          <Button asChild>
            <Link href="/sources/new">
              <Plus className="size-4" aria-hidden /> New source
            </Link>
          </Button>
        </div>

        <HealthPanel />

        <TotalsGrid totals={totals} />

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">Sources</h2>
            <div className="flex-1" />
            {tracks.some((view) => view.track.status === "ended" || view.track.status === "error") ? (
              <Button variant="ghost" size="sm" disabled={isClearing} onClick={() => void clearEnded()}>
                <Trash01 className="size-3.5" aria-hidden /> Clear finished
              </Button>
            ) : null}
          </div>
          <TrackFiltersBar
            filters={filters}
            setQuery={setQuery}
            toggle={toggle}
            clearGroup={clearGroup}
            reset={reset}
            isFiltered={isFiltered}
            inputLanguages={inputLanguages}
            outputLanguages={outputCodes}
            counts={counts}
            selectedCount={selectedCount}
            shown={visible.length}
            total={total}
          />

          {tracks.length === 0 ? (
            <EmptyTracks />
          ) : visible.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-10 text-center text-sm">
              No sources match these filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
              {visible.map((view) => (
                <TrackCard
                  key={view.track.id}
                  view={view}
                  downloads={[
                    { label: "Subtitles (.srt)", href: transcriptUrl(view.track.id, "srt") },
                    { label: "WebVTT (.vtt)", href: transcriptUrl(view.track.id, "vtt") },
                    { label: "Plain text (.txt)", href: transcriptUrl(view.track.id, "txt") },
                    ...view.track.outputs.map(({ language: code }) => ({
                      label: `Subtitles ${code.toUpperCase()} (.srt)`,
                      href: transcriptUrl(view.track.id, "srt", code),
                    })),
                  ]}

                  isPending={pendingId === view.track.id}
                  onStop={() => void stop(view.track.id)}
                  onRemove={() => void remove(view.track.id)}

                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
