export interface LatencyDto {
  count: number;
  p50: number;
  p95: number;
  max: number;
}

export interface SessionCostDto {
  audioSeconds: number;
  translationInputTokens: number;
  translationOutputTokens: number;
  audioUsd: number;
  translationUsd: number;
  usd: number;
}

export interface OutputDto {
  language: string;
  addedAt: number;
  segments: number;
  words: number;
  inputTokens: number;
  outputTokens: number;
  latency: LatencyDto;
  costUsd: number;
}

export interface SessionSnapshotDto {
  id: string;
  title: string;
  status: "starting" | "live" | "ended" | "error";
  sourceLanguage: string;
  targetLanguages: string[];
  outputs: OutputDto[];
  glossaryId: string;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  audioSeconds: number;
  segments: number;
  words: number;
  rotations: number;
  viewers: number;
  latency: LatencyDto;
  transcriptionLatency: LatencyDto;
  cost: SessionCostDto;
  error?: string;
}

export interface TranslationDto {
  language: string;
  text: string;
  latencyMs: number;
}

export interface TranscriptSegmentDto {
  id: string;
  sessionId: string;
  seq: number;
  kind: "interim" | "final";
  text: string;
  language: string;
  audioOffsetMs: number;
  createdAt: number;
  latencyMs: number;
  translations: TranslationDto[];
}

export type SessionEventDto =
  | { type: "hello"; topic: string; sessions: SessionSnapshotDto[] }
  | { type: "session.started"; session: SessionSnapshotDto }
  | { type: "session.stats"; session: SessionSnapshotDto }
  | { type: "session.ended"; session: SessionSnapshotDto }
  | { type: "segment.interim"; sessionId: string; text: string; language: string; at: number }
  | { type: "segment.final"; sessionId: string; segment: TranscriptSegmentDto }
  | {
      type: "segment.translated";
      sessionId: string;
      segmentId: string;
      seq: number;
      translation: TranslationDto;
    };

export interface HealthDto {
  status: string;
  engine: "gemini" | "mock";
  models: { transcription: string; translation: string };
  transcriptionMode: string;
  running: number;
  capacity: number;
  uptimeSeconds: number;
}

export interface GlossaryDto {
  id: string;
  name: string;
  terms: number;
}

export interface SessionListDto {
  engine: string;
  capacity: number;
  running: number;
  sessions: SessionSnapshotDto[];
}

export interface CreateSessionDto {
  title: string;
  sourceLanguage: string;
  targetLanguages: string;
  glossaryId: string;
}

export interface IngestStatusDto {
  trackId: string;
  kind: "pull" | "rtmp";
  source: string;
  secondsIngested: number;
  startedAt: number;
  waitingForPublisher: boolean;
  pushUrl?: string;
}

export interface StartIngestDto {
  source: string;
  startSeconds?: number;
  durationSeconds?: number;
}

export interface GlossaryTermDto {
  term: string;
  keepVerbatim?: boolean;
  translations?: Record<string, string>;
}

export interface GlossaryDetailDto {
  id: string;
  name: string;
  description?: string;
  terms: GlossaryTermDto[];
}
