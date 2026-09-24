"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServices } from "@/contexts/services-context";
import { useTrackStream, type TrackView } from "@/hooks/use-track-stream";
import { EMPTY_TOTALS, type EventTotals } from "@/models/totals.model";
import { isTrackRunning, type NewTrack } from "@/models/track.model";
import type { IngestStatus } from "@/models/ingest.model";
import type { ConnectionStatus, EngineInfo, GlossaryOption } from "@/models/engine.model";
import type { Language } from "@/models/language.model";
import type { TranscriptFormat } from "@/services/transcript.service";

interface ControlRoomValue {
  tracks: TrackView[];
  totals: EventTotals;
  engine: EngineInfo | null;
  engineError: string | null;
  glossaries: GlossaryOption[];
  status: ConnectionStatus;
  isCreating: boolean;
  ingests: Record<string, IngestStatus>;
  createTrack: (input: NewTrack, mediaSource?: string) => Promise<void>;
  startIngest: (trackId: string, source: string) => Promise<void>;
  startRtmpIngest: (trackId: string) => Promise<void>;
  stopIngest: (trackId: string) => Promise<void>;
  stopTrack: (trackId: string) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
  addOutput: (trackId: string, language: Language) => Promise<void>;
  removeOutput: (trackId: string, language: Language) => Promise<void>;
  clearEndedTracks: () => Promise<number>;
  transcriptUrl: (trackId: string, format: TranscriptFormat, language?: Language) => string;
}

const ControlRoomContext = createContext<ControlRoomValue | null>(null);

function computeTotals(tracks: TrackView[]): EventTotals {
  if (tracks.length === 0) return EMPTY_TOTALS;

  const measured = tracks.filter((view) => view.track.metrics.latencyP50Ms > 0);
  const latencyP50Ms = measured.length
    ? Math.round(
        measured.reduce((sum, view) => sum + view.track.metrics.latencyP50Ms, 0) / measured.length,
      )
    : 0;

  return {
    liveInputs: tracks.filter((view) => view.track.status === "live").length,
    totalInputs: tracks.length,
    totalOutputs: tracks.reduce((sum, view) => sum + view.track.outputs.length, 0),
    words: tracks.reduce((sum, view) => sum + view.track.metrics.words, 0),
    audioSeconds: tracks.reduce((sum, view) => sum + view.track.metrics.audioSeconds, 0),
    latencyP50Ms,
    latencyP95Ms: measured.length
      ? Math.max(...measured.map((view) => view.track.metrics.latencyP95Ms))
      : 0,
    audioUsd: tracks.reduce((sum, view) => sum + view.track.cost.audioUsd, 0),
    translationUsd: tracks.reduce((sum, view) => sum + view.track.cost.translationUsd, 0),
    costUsd: tracks.reduce((sum, view) => sum + view.track.cost.usd, 0),
  };
}

export function ControlRoomProvider({ children }: { children: ReactNode }) {
  const { sessions, glossaries: glossaryService, health, transcripts, ingest } = useServices();
  const { list, status, upsert, remove: removeFromStream } = useTrackStream(null);

  const [engine, setEngine] = useState<EngineInfo | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [glossaries, setGlossaries] = useState<GlossaryOption[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [ingests, setIngests] = useState<Record<string, IngestStatus>>({});

  useEffect(() => {
    let cancelled = false;

    health
      .read()
      .then((info) => {
        if (!cancelled) {
          setEngine(info);
          setEngineError(null);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setEngineError(error.message);
      });

    glossaryService
      .list()
      .then((options) => {
        if (!cancelled) setGlossaries(options);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [health, glossaryService]);

  const startIngest = useCallback(
    async (trackId: string, source: string) => {
      const status = await ingest.start(trackId, { source });
      setIngests((current) => ({ ...current, [trackId]: status }));
    },
    [ingest],
  );

  const startRtmpIngest = useCallback(
    async (trackId: string) => {
      const status = await ingest.startRtmp(trackId);
      setIngests((current) => ({ ...current, [trackId]: status }));
    },
    [ingest],
  );

  const stopIngest = useCallback(
    async (trackId: string) => {
      await ingest.stop(trackId);
      setIngests((current) => {
        const next = { ...current };
        delete next[trackId];
        return next;
      });
    },
    [ingest],
  );

  const createTrack = useCallback(
    async (input: NewTrack, mediaSource?: string) => {
      setIsCreating(true);
      try {
        const track = await sessions.create(input);
        upsert(track);
        if (mediaSource) await startIngest(track.id, mediaSource);
      } finally {
        setIsCreating(false);
      }
    },
    [sessions, upsert, startIngest],
  );

  const stopTrack = useCallback(
    async (trackId: string) => {
      await ingest.stop(trackId).catch(() => undefined);
      setIngests((current) => {
        const next = { ...current };
        delete next[trackId];
        return next;
      });
      upsert(await sessions.stop(trackId));
    },
    [sessions, upsert, ingest],
  );

  const dropTrack = useCallback((trackId: string) => {
    setIngests((current) => {
      const next = { ...current };
      delete next[trackId];
      return next;
    });
    removeFromStream(trackId);
  }, [removeFromStream]);

  const addOutput = useCallback(
    async (trackId: string, language: Language) => {
      upsert(await sessions.addOutput(trackId, language));
    },
    [sessions, upsert],
  );

  const removeOutput = useCallback(
    async (trackId: string, language: Language) => {
      upsert(await sessions.removeOutput(trackId, language));
    },
    [sessions, upsert],
  );

  const removeTrack = useCallback(
    async (trackId: string) => {
      await sessions.remove(trackId);
      dropTrack(trackId);
    },
    [sessions, dropTrack],
  );

  const clearEndedTracks = useCallback(async () => {
    const removed = await sessions.removeEnded();
    for (const view of list) {
      if (view.track.status !== "live" && view.track.status !== "starting") dropTrack(view.track.id);
    }
    return removed;
  }, [sessions, list, dropTrack]);

  const transcriptUrl = useCallback(
    (trackId: string, format: TranscriptFormat, language?: Language) =>
      transcripts.downloadUrl(trackId, format, language),
    [transcripts],
  );

  const value = useMemo<ControlRoomValue>(
    () => ({
      tracks: list,
      totals: computeTotals(list),
      engine,
      engineError,
      glossaries,
      status,
      isCreating,
      ingests,
      createTrack,
      startIngest,
      startRtmpIngest,
      stopIngest,
      stopTrack,
      removeTrack,
      addOutput,
      removeOutput,
      clearEndedTracks,
      transcriptUrl,
    }),
    [
      list,
      engine,
      engineError,
      glossaries,
      status,
      isCreating,
      ingests,
      createTrack,
      startIngest,
      startRtmpIngest,
      stopIngest,
      stopTrack,
      removeTrack,
      addOutput,
      removeOutput,
      clearEndedTracks,
      transcriptUrl,
    ],
  );

  return <ControlRoomContext.Provider value={value}>{children}</ControlRoomContext.Provider>;
}

export function useControlRoom(): ControlRoomValue {
  const value = useContext(ControlRoomContext);
  if (!value) {
    throw new Error("useControlRoom must be used inside a ControlRoomProvider");
  }
  return value;
}

export { isTrackRunning };
