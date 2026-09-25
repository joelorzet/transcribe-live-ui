import type { Language, SpokenLanguage } from "@/models/language.model";
import type { TrackStatus } from "@/models/track.model";

/**
 * What the room is told about a talk. No cost, no token counts, no latency
 * windows: those belong to the people running the event, not to the audience.
 */
export interface AudienceSession {
  id: string;
  title: string;
  status: TrackStatus;
  spokenLanguage: SpokenLanguage;
  languages: Language[];
  positionSeconds?: number;
  captionLagMs: number;
  hasAudio: boolean;
  waitingForPublisher: boolean;
  watchUrl?: string;
}

export function subtitleNotice(session: AudienceSession | null): string | null {
  if (!session) return null;
  if (!session.hasAudio) return "No audio is reaching this talk yet, so there are no subtitles.";
  if (session.waitingForPublisher) {
    return "Waiting for the room to start streaming. Subtitles begin as soon as audio arrives.";
  }
  return null;
}
