import type { Language } from "@/models/language.model";
import type { Track } from "@/models/track.model";

export type TrackEvent =
  | { kind: "tracks"; tracks: Track[] }
  | { kind: "track"; track: Track }
  | { kind: "interim"; trackId: string; text: string }
  | { kind: "final"; trackId: string; text: string }
  | { kind: "translation"; trackId: string; language: Language; text: string };
