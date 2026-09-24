"use client";

import { useCallback, useMemo, useState } from "react";
import { useControlRoom } from "@/contexts/control-room-context";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  matchesFilters,
  type SourceKind,
  type TrackFilters,
} from "@/models/filters.model";
import type { Language, SpokenLanguage } from "@/models/language.model";

export function useTrackFilters() {
  const { tracks, ingests } = useControlRoom();
  const [filters, setFilters] = useState<TrackFilters>(EMPTY_FILTERS);

  const update = useCallback(<K extends keyof TrackFilters>(key: K, value: TrackFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const sourceKindOf = useCallback(
    (trackId: string): SourceKind => ingests[trackId]?.kind ?? "none",
    [ingests],
  );

  const visible = useMemo(
    () => tracks.filter((view) => matchesFilters(view.track, sourceKindOf(view.track.id), filters)),
    [tracks, filters, sourceKindOf],
  );

  const inputLanguages = useMemo(
    () => [...new Set(tracks.map((view) => view.track.spokenLanguage))] as SpokenLanguage[],
    [tracks],
  );

  const outputLanguages = useMemo(
    () =>
      [
        ...new Set(tracks.flatMap((view) => view.track.outputs.map((output) => output.language))),
      ] as Language[],
    [tracks],
  );

  return {
    filters,
    update,
    reset,
    visible,
    inputLanguages,
    outputLanguages,
    isFiltered: hasActiveFilters(filters),
    total: tracks.length,
  };
}
