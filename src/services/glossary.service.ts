import type { HttpClient } from "@/lib/http-client";
import type { GlossaryOption } from "@/models/engine.model";
import type { GlossaryDto } from "@/services/dto/api.dto";
import { GlossaryMapper } from "@/services/mappers/track.mapper";

export class GlossaryService {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<GlossaryOption[]> {
    const { glossaries } = await this.http.get<{ glossaries: GlossaryDto[] }>("/api/glossaries");
    return GlossaryMapper.fromDtoListToModel(glossaries);
  }
}
