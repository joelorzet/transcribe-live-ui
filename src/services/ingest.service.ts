import type { HttpClient } from "@/lib/http-client";
import type { IngestStatus } from "@/models/ingest.model";
import type { IngestStatusDto, StartIngestDto } from "@/services/dto/api.dto";

export interface StartIngestInput {
  source: string;
  startSeconds?: number;
  durationSeconds?: number;
}

export class IngestService {
  constructor(private readonly http: HttpClient) {}

  async start(trackId: string, input: StartIngestInput): Promise<IngestStatus> {
    const payload: StartIngestDto = { source: input.source };
    if (input.startSeconds !== undefined) payload.startSeconds = input.startSeconds;
    if (input.durationSeconds !== undefined) payload.durationSeconds = input.durationSeconds;

    return this.http.post<IngestStatusDto>(
      `/api/sessions/${encodeURIComponent(trackId)}/ingest`,
      payload,
    );
  }

  async status(trackId: string): Promise<IngestStatus | null> {
    const { ingest } = await this.http.get<{ ingest: IngestStatusDto | null }>(
      `/api/sessions/${encodeURIComponent(trackId)}/ingest`,
    );
    return ingest;
  }

  async stop(trackId: string): Promise<void> {
    await this.http.delete<{ stopped: true }>(`/api/sessions/${encodeURIComponent(trackId)}/ingest`);
  }
}
