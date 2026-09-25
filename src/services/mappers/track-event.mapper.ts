import type { TrackEvent } from "@/models/track-event.model";
import type { SessionEventDto } from "@/services/dto/api.dto";
import { TrackMapper, TranslationMapper } from "@/services/mappers/track.mapper";
import { AudienceMapper } from "@/services/mappers/audience.mapper";

export class TrackEventMapper {
  static fromDtoToModel(dto: SessionEventDto): TrackEvent | null {
    switch (dto.type) {
      case "hello": {
        // The control room is handed every track; a viewer is handed the slim
        // view of the one they opened.
        const hello = dto as unknown as {
          sessions?: Parameters<typeof TrackMapper.fromDtoListToModel>[0];
          session?: Parameters<typeof AudienceMapper.fromDtoToModel>[0] | null;
        };
        if (hello.sessions) {
          return { kind: "tracks", tracks: TrackMapper.fromDtoListToModel(hello.sessions) };
        }
        return hello.session
          ? { kind: "session", view: AudienceMapper.fromDtoToModel(hello.session) }
          : null;
      }
      case "session.view":
        return {
          kind: "session",
          view: AudienceMapper.fromDtoToModel(
            (dto as unknown as { session: Parameters<typeof AudienceMapper.fromDtoToModel>[0] }).session,
          ),
        };
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
