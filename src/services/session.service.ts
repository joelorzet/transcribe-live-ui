import type { HttpClient } from "@/lib/http-client";
import type { NewTrack, Track } from "@/models/track.model";
import type { SessionListDto, SessionSnapshotDto } from "@/services/dto/api.dto";
import { TrackMapper } from "@/services/mappers/track.mapper";

export class SessionService {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Track[]> {
    const dto = await this.http.get<SessionListDto>("/api/sessions");
    return TrackMapper.fromDtoListToModel(dto.sessions);
  }

  async create(track: NewTrack): Promise<Track> {
    const dto = await this.http.post<SessionSnapshotDto>(
      "/api/sessions",
      TrackMapper.fromModelToCreateDto(track),
    );
    return TrackMapper.fromDtoToModel(dto);
  }

  async stop(trackId: string): Promise<Track> {
    const dto = await this.http.delete<SessionSnapshotDto>(
      `/api/sessions/${encodeURIComponent(trackId)}`,
    );
    return TrackMapper.fromDtoToModel(dto);
  }
}
