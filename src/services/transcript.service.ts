import type { HttpClient } from "@/lib/http-client";
import type { Language } from "@/models/language.model";

export type TranscriptFormat = "srt" | "vtt" | "txt" | "json";

export class TranscriptService {
  constructor(private readonly http: HttpClient) {}

  downloadUrl(trackId: string, format: TranscriptFormat, language?: Language): string {
    const params: Record<string, string> = { format };
    if (language) params.lang = language;
    return this.http.buildUrl(`/api/sessions/${encodeURIComponent(trackId)}/transcript`, params);
  }
}
