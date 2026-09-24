"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";

export function useStopTrack() {
  const { stopTrack } = useControlRoom();
  const [stoppingId, setStoppingId] = useState<string | null>(null);

  const stop = useCallback(
    async (trackId: string) => {
      setStoppingId(trackId);
      try {
        await stopTrack(trackId);
        toast.success("Track stopped");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not stop the track");
      } finally {
        setStoppingId(null);
      }
    },
    [stopTrack],
  );

  return { stop, stoppingId };
}
