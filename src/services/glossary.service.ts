import type { HttpClient } from "@/lib/http-client";
import type { GlossaryOption } from "@/models/engine.model";
import type { Glossary } from "@/models/glossary.model";
import type { GlossaryDetailDto, GlossaryDto } from "@/services/dto/api.dto";
import { GlossaryMapper } from "@/services/mappers/track.mapper";
import { GlossaryDetailMapper } from "@/services/mappers/glossary.mapper";

export class GlossaryService {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<GlossaryOption[]> {
    const { glossaries } = await this.http.get<{ glossaries: GlossaryDto[] }>("/api/glossaries");
    return GlossaryMapper.fromDtoListToModel(glossaries);
  }

  async get(id: string): Promise<Glossary> {
    const dto = await this.http.get<GlossaryDetailDto>(`/api/glossaries/${encodeURIComponent(id)}`);
    return GlossaryDetailMapper.fromDtoToModel(dto);
  }

  async create(glossary: Glossary): Promise<Glossary> {
    const dto = await this.http.post<GlossaryDetailDto>(
      "/api/glossaries",
      GlossaryDetailMapper.fromModelToDto(glossary),
    );
    return GlossaryDetailMapper.fromDtoToModel(dto);
  }

  async update(glossary: Glossary): Promise<Glossary> {
    const dto = await this.http.put<GlossaryDetailDto>(
      `/api/glossaries/${encodeURIComponent(glossary.id)}`,
      GlossaryDetailMapper.fromModelToDto(glossary),
    );
    return GlossaryDetailMapper.fromDtoToModel(dto);
  }
}
