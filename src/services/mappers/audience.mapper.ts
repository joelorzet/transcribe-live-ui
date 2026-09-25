import { toLanguage, toSpokenLanguage } from "@/models/language.model";
import type { AudienceSession } from "@/models/audience.model";
import type { AudienceViewDto } from "@/services/dto/api.dto";

export class AudienceMapper {
  static fromDtoToModel(dto: AudienceViewDto): AudienceSession {
    return {
      id: dto.id,
      title: dto.title,
      status: dto.status,
      spokenLanguage: toSpokenLanguage(dto.spokenLanguage),
      languages: dto.languages.map((code) => toLanguage(code)),
      positionSeconds: dto.positionSeconds,
      captionLagMs: dto.captionLagMs,
      hasAudio: dto.hasAudio,
      waitingForPublisher: dto.waitingForPublisher,
      watchUrl: dto.watchUrl,
    };
  }
}
