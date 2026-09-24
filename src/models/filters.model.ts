import type { Language, SpokenLanguage } from "@/models/language.model";
import type { Track, TrackStatus } from "@/models/track.model";

export type SourceKind = "rtmp" | "pull" | "none";

export interface TrackFilters {
  query: string;
  statuses: TrackStatus[];
  inputLanguages: SpokenLanguage[];
  outputLanguages: Language[];
  sourceKinds: SourceKind[];
}

export const EMPTY_FILTERS: TrackFilters = {
  query: "",
  statuses: [],
  inputLanguages: [],
  outputLanguages: [],
  sourceKinds: [],
};

export type FilterGroupKey = "statuses" | "inputLanguages" | "outputLanguages" | "sourceKinds";

export function hasActiveFilters(filters: TrackFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.statuses.length > 0 ||
    filters.inputLanguages.length > 0 ||
    filters.outputLanguages.length > 0 ||
    filters.sourceKinds.length > 0
  );
}

export function toggleValue<T extends string>(current: T[], value: T): T[] {
  return current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
}

export type GroupState = true | false | "indeterminate";

export function groupState(selected: string[], totalOptions: number): GroupState {
  if (selected.length === 0 || selected.length === totalOptions) return true;
  return "indeterminate";
}

function allows<T extends string>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
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
  if (!allows(filters.statuses, track.status)) return false;
  if (!allows(filters.inputLanguages, track.spokenLanguage)) return false;
  if (!allows(filters.sourceKinds, sourceKind)) return false;
  if (
    filters.outputLanguages.length > 0 &&
    !track.outputs.some((output) => filters.outputLanguages.includes(output.language))
  ) {
    return false;
  }
  return true;
}
