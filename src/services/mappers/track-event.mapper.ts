import type { TrackEvent } from "@/models/track-event.model";
import type { SessionEventDto } from "@/services/dto/api.dto";
import { TrackMapper, TranslationMapper } from "@/services/mappers/track.mapper";

export class TrackEventMapper {
  static fromDtoToModel(dto: SessionEventDto): TrackEvent | null {
    switch (dto.type) {
      case "hello":
        return { kind: "tracks", tracks: TrackMapper.fromDtoListToModel(dto.sessions) };
      case "session.started":
      case "session.stats":
      case "session.ended":
        return { kind: "track", track: TrackMapper.fromDtoToModel(dto.session) };
      case "segment.interim":
        return { kind: "interim", trackId: dto.sessionId, text: dto.text };
      case "segment.final":
        return { kind: "final", trackId: dto.sessionId, text: dto.segment.text };
      case "segment.translated": {
        const { language, text } = TranslationMapper.fromDtoToModel(dto.translation);
        return { kind: "translation", trackId: dto.sessionId, language, text };
      }
      default:
        return null;
    }
  }
}
