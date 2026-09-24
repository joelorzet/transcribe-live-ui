import type { Language, SpokenLanguage } from "@/models/language.model";

export type TrackStatus = "starting" | "live" | "ended" | "error";

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
  subtitleLanguages: Language[];
  glossaryId: string;
  createdAt: number;
  metrics: TrackMetrics;
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
