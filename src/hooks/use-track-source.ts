"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";

export function useTrackSource(trackId: string) {
  const { ingests, startIngest, startRtmpIngest, stopIngest } = useControlRoom();
  const [value, setValue] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const ingest = ingests[trackId];

  const start = useCallback(async () => {
    const source = value.trim();
    if (!source) {
      toast.error("Paste a YouTube or media URL first");
      return;
    }

    setIsBusy(true);
    try {
      await startIngest(trackId, source);
      setValue("");
      toast.success("Pulling audio from the source");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that source");
    } finally {
      setIsBusy(false);
    }
  }, [startIngest, trackId, value]);

  const startRtmp = useCallback(async () => {
    setIsBusy(true);
    try {
      await startRtmpIngest(trackId);
      toast.success("Waiting for an OBS push on the RTMP URL");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open an RTMP endpoint");
    } finally {
      setIsBusy(false);
    }
  }, [startRtmpIngest, trackId]);

  const stop = useCallback(async () => {
    setIsBusy(true);
    try {
      await stopIngest(trackId);
      toast.success("Audio source stopped");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not stop the source");
    } finally {
      setIsBusy(false);
    }
  }, [stopIngest, trackId]);

  return { value, setValue, start, startRtmp, stop, isBusy, ingest };
}
