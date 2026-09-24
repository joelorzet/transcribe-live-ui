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
  /** Where in the source the ingest began. */
  startSeconds?: number;
  /** Where the server currently is in the source. Subtitles describe this moment. */
  positionSeconds?: number;
}
