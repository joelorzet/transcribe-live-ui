"use client";

import { Trash01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { useControlRoom } from "@/contexts/control-room-context";
import { useTrackActions } from "@/hooks/use-track-actions";
import { Topbar } from "@/components/control-room/topbar";
import { TotalsGrid } from "@/components/control-room/totals-grid";
import { CreateTrackForm } from "@/components/control-room/create-track-form";
import { TrackCard } from "@/components/control-room/track-card";
import { TrackSourceControl } from "@/components/control-room/track-source-control";
import { EmptyTracks } from "@/components/control-room/empty-tracks";

export function ControlRoomView() {
  const { tracks, totals, engine, engineError, status, transcriptUrl } = useControlRoom();
  const { stop, remove, clearEnded, pendingId, isClearing } = useTrackActions();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6">
      <Topbar engine={engine} engineError={engineError} status={status} />

      <div className="flex flex-col gap-6">
        <TotalsGrid totals={totals} />
        <CreateTrackForm />

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">Live tracks</h2>
            <div className="flex-1" />
            {tracks.some((view) => view.track.status === "ended" || view.track.status === "error") ? (
              <Button variant="ghost" size="sm" disabled={isClearing} onClick={() => void clearEnded()}>
                <Trash01 className="size-3.5" aria-hidden /> Clear finished
              </Button>
            ) : null}
          </div>
          {tracks.length === 0 ? (
            <EmptyTracks />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {tracks.map((view) => (
                <TrackCard
                  key={view.track.id}
                  view={view}
                  srtUrl={transcriptUrl(view.track.id, "srt")}
                  isPending={pendingId === view.track.id}
                  onStop={() => void stop(view.track.id)}
                  onRemove={() => void remove(view.track.id)}
                  sourceControl={<TrackSourceControl trackId={view.track.id} />}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
