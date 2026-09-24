"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";

export function useTrackActions() {
  const { stopTrack, removeTrack, restartTrack, clearEndedTracks } = useControlRoom();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const run = useCallback(
    async (trackId: string, action: () => Promise<void>, success: string, failure: string) => {
      setPendingId(trackId);
      try {
        await action();
        toast.success(success);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : failure);
      } finally {
        setPendingId(null);
      }
    },
    [],
  );

  const stop = useCallback(
    (trackId: string) =>
      run(trackId, () => stopTrack(trackId), "Track stopped", "Could not stop the track"),
    [run, stopTrack],
  );

  const remove = useCallback(
    (trackId: string) =>
      run(trackId, () => removeTrack(trackId), "Track removed", "Could not remove the track"),
    [run, removeTrack],
  );

  const restart = useCallback(
    (trackId: string) =>
      run(
        trackId,
        () => restartTrack(trackId),
        "Source restarted",
        "Could not restart the source",
      ),
    [run, restartTrack],
  );

  const clearEnded = useCallback(async () => {
    setIsClearing(true);
    try {
      const removed = await clearEndedTracks();
      toast.success(removed === 0 ? "Nothing to clear" : `Cleared ${removed} finished track(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not clear finished tracks");
    } finally {
      setIsClearing(false);
    }
  }, [clearEndedTracks]);

  return { stop, remove, restart, clearEnded, pendingId, isClearing };
}
