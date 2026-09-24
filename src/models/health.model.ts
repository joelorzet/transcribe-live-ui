import type { Track } from "@/models/track.model";

export type IssueKind = "error" | "silent" | "waiting" | "slow";

export interface Issue {
  kind: IssueKind;
  trackId: string;
  trackTitle: string;
  detail: string;
}

/** A talk is expected to produce something once this much audio has gone in. */
const SILENT_AFTER_SECONDS = 25;
/** Captions this far behind the speaker stop being usable in the room. */
const SLOW_P95_MS = 8000;

export function findIssues(tracks: Track[]): Issue[] {
  const issues: Issue[] = [];

  for (const track of tracks) {
    const base = { trackId: track.id, trackTitle: track.title };

    if (track.status === "error") {
      issues.push({
        ...base,
        kind: "error",
        detail: track.errorMessage ?? "The source stopped with an error.",
      });
      continue;
    }

    if (track.status !== "live" && track.status !== "starting") continue;

    if (track.input?.waitingForPublisher) {
      issues.push({ ...base, kind: "waiting", detail: "Waiting for the encoder to connect." });
      continue;
    }

    if (!track.input) {
      issues.push({ ...base, kind: "waiting", detail: "No audio source attached yet." });
      continue;
    }

    if (track.metrics.audioSeconds > SILENT_AFTER_SECONDS && track.metrics.segments === 0) {
      issues.push({
        ...base,
        kind: "silent",
        detail: `Audio is arriving but nothing has been transcribed in ${Math.round(track.metrics.audioSeconds)}s.`,
      });
      continue;
    }

    if (track.metrics.latencyP95Ms > SLOW_P95_MS) {
      issues.push({
        ...base,
        kind: "slow",
        detail: `Captions are running ${(track.metrics.latencyP95Ms / 1000).toFixed(1)}s behind at p95.`,
      });
    }
  }

  return issues;
}

export function countReconnects(tracks: Track[]): number {
  return tracks.reduce((sum, track) => sum + track.metrics.rotations, 0);
}
