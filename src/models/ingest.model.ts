export type IngestKind = "pull" | "rtmp";

export interface IngestStatus {
  trackId: string;
  kind: IngestKind;
  source: string;
  secondsIngested: number;
  startedAt: number;
  waitingForPublisher: boolean;
  pushUrl?: string;
  server?: string;
  streamKey?: string;
}
