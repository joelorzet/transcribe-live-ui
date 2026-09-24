"use client";

import { useControlRoom } from "@/contexts/control-room-context";
import { useStopTrack } from "@/hooks/use-stop-track";
import { Topbar } from "@/components/control-room/topbar";
import { TotalsGrid } from "@/components/control-room/totals-grid";
import { CreateTrackForm } from "@/components/control-room/create-track-form";
import { TrackCard } from "@/components/control-room/track-card";
import { EmptyTracks } from "@/components/control-room/empty-tracks";

export function ControlRoomView() {
  const { tracks, totals, engine, engineError, status, transcriptUrl } = useControlRoom();
  const { stop, stoppingId } = useStopTrack();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6">
      <Topbar engine={engine} engineError={engineError} status={status} />

      <div className="flex flex-col gap-6">
        <TotalsGrid totals={totals} />
        <CreateTrackForm />

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Live tracks</h2>
          {tracks.length === 0 ? (
            <EmptyTracks />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {tracks.map((view) => (
                <TrackCard
                  key={view.track.id}
                  view={view}
                  srtUrl={transcriptUrl(view.track.id, "srt")}
                  isStopping={stoppingId === view.track.id}
                  onStop={() => void stop(view.track.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
