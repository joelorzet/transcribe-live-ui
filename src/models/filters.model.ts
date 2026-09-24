import type { Language, SpokenLanguage } from "@/models/language.model";
import type { Track, TrackStatus } from "@/models/track.model";

export type SourceKind = "rtmp" | "pull" | "none";

export interface TrackFilters {
  query: string;
  status: TrackStatus | "all";
  inputLanguage: SpokenLanguage | "all";
  outputLanguage: Language | "all";
  sourceKind: SourceKind | "all";
}

export const EMPTY_FILTERS: TrackFilters = {
  query: "",
  status: "all",
  inputLanguage: "all",
  outputLanguage: "all",
  sourceKind: "all",
};

export function hasActiveFilters(filters: TrackFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.status !== "all" ||
    filters.inputLanguage !== "all" ||
    filters.outputLanguage !== "all" ||
    filters.sourceKind !== "all"
  );
}

export function matchesFilters(
  track: Track,
  sourceKind: SourceKind,
  filters: TrackFilters,
): boolean {
  const query = filters.query.trim().toLowerCase();
  if (query && !track.title.toLowerCase().includes(query) && !track.id.toLowerCase().includes(query)) {
    return false;
  }
  if (filters.status !== "all" && track.status !== filters.status) return false;
  if (filters.inputLanguage !== "all" && track.spokenLanguage !== filters.inputLanguage) return false;
  if (
    filters.outputLanguage !== "all" &&
    !track.outputs.some((output) => output.language === filters.outputLanguage)
  ) {
    return false;
  }
  if (filters.sourceKind !== "all" && sourceKind !== filters.sourceKind) return false;
  return true;
}
