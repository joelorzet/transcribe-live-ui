"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServices } from "@/contexts/services-context";
import { useTrackStream, type TrackView } from "@/hooks/use-track-stream";
import { EMPTY_TOTALS, type EventTotals } from "@/models/totals.model";
import { isTrackRunning, type NewTrack } from "@/models/track.model";
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
  createTrack: (input: NewTrack) => Promise<void>;
  stopTrack: (trackId: string) => Promise<void>;
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
    liveTracks: tracks.filter((view) => view.track.status === "live").length,
    words: tracks.reduce((sum, view) => sum + view.track.metrics.words, 0),
    latencyP50Ms,
    latencyP95Ms: measured.length
      ? Math.max(...measured.map((view) => view.track.metrics.latencyP95Ms))
      : 0,
    costUsd: tracks.reduce((sum, view) => sum + view.track.metrics.costUsd, 0),
  };
}

export function ControlRoomProvider({ children }: { children: ReactNode }) {
  const { sessions, glossaries: glossaryService, health, transcripts } = useServices();
  const { list, status, upsert } = useTrackStream(null);

  const [engine, setEngine] = useState<EngineInfo | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [glossaries, setGlossaries] = useState<GlossaryOption[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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

  const createTrack = useCallback(
    async (input: NewTrack) => {
      setIsCreating(true);
      try {
        upsert(await sessions.create(input));
      } finally {
        setIsCreating(false);
      }
    },
    [sessions, upsert],
  );

  const stopTrack = useCallback(
    async (trackId: string) => {
      upsert(await sessions.stop(trackId));
    },
    [sessions, upsert],
  );

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
      createTrack,
      stopTrack,
      transcriptUrl,
    }),
    [list, engine, engineError, glossaries, status, isCreating, createTrack, stopTrack, transcriptUrl],
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
