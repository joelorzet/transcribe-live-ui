"use client";

import Link from "next/link";
import { Plus, Trash01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { outputLanguages } from "@/models/track.model";
import { useControlRoom } from "@/contexts/control-room-context";
import { useTrackActions } from "@/hooks/use-track-actions";
import { Topbar } from "@/components/control-room/topbar";
import { TotalsGrid } from "@/components/control-room/totals-grid";
import { TrackCard } from "@/components/control-room/track-card";
import { TrackSourceControl } from "@/components/control-room/track-source-control";
import { TrackOutputsDialog } from "@/components/control-room/track-outputs-dialog";
import { TrackOutputsBar } from "@/components/control-room/track-outputs-bar";
import { Share07 } from "@untitledui/icons";
import { EmptyTracks } from "@/components/control-room/empty-tracks";

export function ControlRoomView() {
  const { tracks, totals, engine, engineError, status, transcriptUrl } = useControlRoom();
  const { stop, remove, clearEnded, pendingId, isClearing } = useTrackActions();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6">
      <Topbar engine={engine} engineError={engineError} status={status} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">Control room</h1>
          <div className="flex-1" />
          <Button asChild>
            <Link href="/sources/new">
              <Plus className="size-4" aria-hidden /> New source
            </Link>
          </Button>
        </div>

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
          {tracks.length === 0 ? (
            <EmptyTracks />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {tracks.map((view) => (
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
                  outputs={
                    <TrackOutputsDialog
                      trackId={view.track.id}
                      trackTitle={view.track.title}
                      subtitleLanguages={outputLanguages(view.track)}
                    >
                      <Button variant="outline" size="sm">
                        <Share07 className="size-3.5" aria-hidden /> Outputs
                      </Button>
                    </TrackOutputsDialog>
                  }
                  isPending={pendingId === view.track.id}
                  onStop={() => void stop(view.track.id)}
                  onRemove={() => void remove(view.track.id)}
                  sourceControl={<TrackSourceControl trackId={view.track.id} />}
                  outputsBar={<TrackOutputsBar track={view.track} />}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
