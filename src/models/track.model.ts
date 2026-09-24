import type { Language, SpokenLanguage } from "@/models/language.model";
import type { IngestStatus } from "@/models/ingest.model";

export type TrackStatus = "starting" | "live" | "ended" | "error";

export interface TrackOutput {
  language: Language;
  addedAt: number;
  segments: number;
  words: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  costUsd: number;
}

export interface TrackCost {
  audioSeconds: number;
  audioUsd: number;
  translationUsd: number;
  usd: number;
}

export interface TrackMetrics {
  latencyP50Ms: number;
  latencyP95Ms: number;
  words: number;
  segments: number;
  audioSeconds: number;
  costUsd: number;
  rotations: number;
  viewers: number;
}

export interface Track {
  id: string;
  title: string;
  status: TrackStatus;
  spokenLanguage: SpokenLanguage;
  outputs: TrackOutput[];
  input: IngestStatus | null;
  glossaryId: string;
  createdAt: number;
  metrics: TrackMetrics;
  cost: TrackCost;
  errorMessage?: string;
}

export interface Caption {
  original: string;
  translations: Partial<Record<Language, string>>;
}

export interface NewTrack {
  title: string;
  spokenLanguage: SpokenLanguage;
  subtitleLanguages: Language[];
  glossaryId: string;
}

export function isTrackRunning(track: Track): boolean {
  return track.status === "live" || track.status === "starting";
}

export function outputLanguages(track: Track): Language[] {
  return track.outputs.map((output) => output.language);
}
