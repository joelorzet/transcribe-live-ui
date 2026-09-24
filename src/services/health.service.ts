import type { HttpClient } from "@/lib/http-client";
import type { EngineInfo } from "@/models/engine.model";
import type { HealthDto } from "@/services/dto/api.dto";
import { EngineMapper } from "@/services/mappers/track.mapper";

export class HealthService {
  constructor(private readonly http: HttpClient) {}

  async read(): Promise<EngineInfo> {
    return EngineMapper.fromDtoToModel(await this.http.get<HealthDto>("/api/health"));
  }
}
