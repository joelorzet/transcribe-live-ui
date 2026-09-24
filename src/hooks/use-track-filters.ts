"use client";

import { useCallback, useMemo, useState } from "react";
import { useControlRoom } from "@/contexts/control-room-context";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  matchesFilters,
  toggleValue,
  type FilterGroupKey,
  type SourceKind,
  type TrackFilters,
} from "@/models/filters.model";
import type { Language, SpokenLanguage } from "@/models/language.model";

export function useTrackFilters() {
  const { tracks, ingests } = useControlRoom();
  const [filters, setFilters] = useState<TrackFilters>(EMPTY_FILTERS);

  const setQuery = useCallback((query: string) => {
    setFilters((current) => ({ ...current, query }));
  }, []);

  const toggle = useCallback((group: FilterGroupKey, value: string) => {
    setFilters((current) => ({
      ...current,
      [group]: toggleValue(current[group] as string[], value),
    }));
  }, []);

  const clearGroup = useCallback((group: FilterGroupKey) => {
    setFilters((current) => ({ ...current, [group]: [] }));
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

  const countBy = useCallback(
    (predicate: (view: (typeof tracks)[number]) => boolean) => tracks.filter(predicate).length,
    [tracks],
  );

  const counts = useMemo(
    () => ({
      statuses: (value: string) => countBy((view) => view.track.status === value),
      inputLanguages: (value: string) => countBy((view) => view.track.spokenLanguage === value),
      outputLanguages: (value: string) =>
        countBy((view) => view.track.outputs.some((output) => output.language === value)),
      sourceKinds: (value: string) => countBy((view) => sourceKindOf(view.track.id) === value),
    }),
    [countBy, sourceKindOf],
  );

  const selectedCount =
    filters.statuses.length +
    filters.inputLanguages.length +
    filters.outputLanguages.length +
    filters.sourceKinds.length;

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
    setQuery,
    toggle,
    clearGroup,
    reset,
    visible,
    inputLanguages,
    outputLanguages,
    counts,
    selectedCount,
    isFiltered: hasActiveFilters(filters),
    total: tracks.length,
  };
}
