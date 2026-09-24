import { toLanguage, toSpokenLanguage } from "@/models/language.model";
import type { Language } from "@/models/language.model";
import type { Caption, NewTrack, Track } from "@/models/track.model";
import type { EngineInfo, GlossaryOption } from "@/models/engine.model";
import type {
  CreateSessionDto,
  GlossaryDto,
  HealthDto,
  SessionSnapshotDto,
  TranslationDto,
} from "@/services/dto/api.dto";

export class TrackMapper {
  static fromDtoToModel(dto: SessionSnapshotDto): Track {
    return {
      id: dto.id,
      title: dto.title,
      status: dto.status,
      spokenLanguage: toSpokenLanguage(dto.sourceLanguage),
      subtitleLanguages: dto.targetLanguages.map((code) => toLanguage(code)),
      glossaryId: dto.glossaryId,
      createdAt: dto.createdAt,
      errorMessage: dto.error,
      metrics: {
        latencyP50Ms: dto.latency.p50,
        latencyP95Ms: dto.latency.p95,
        words: dto.words,
        segments: dto.segments,
        audioSeconds: dto.audioSeconds,
        costUsd: dto.cost.usd,
        rotations: dto.rotations,
        viewers: dto.viewers,
      },
    };
  }

  static fromDtoListToModel(dtos: SessionSnapshotDto[]): Track[] {
    return dtos.map((dto) => TrackMapper.fromDtoToModel(dto));
  }

  static fromModelToCreateDto(model: NewTrack): CreateSessionDto {
    return {
      title: model.title,
      sourceLanguage: model.spokenLanguage,
      targetLanguages: model.subtitleLanguages.join(","),
      glossaryId: model.glossaryId,
    };
  }

  static emptyCaption(): Caption {
    return { original: "", translations: {} };
  }
}

export class TranslationMapper {
  static fromDtoToModel(dto: TranslationDto): { language: Language; text: string } {
    return { language: toLanguage(dto.language), text: dto.text };
  }
}

export class EngineMapper {
  static fromDtoToModel(dto: HealthDto): EngineInfo {
    const isLive = dto.engine === "gemini";
    return {
      isLive,
      label: isLive ? dto.models.transcription : "mock engine",
      transcriptionModel: dto.models.transcription,
      translationModel: dto.models.translation,
      capacity: dto.capacity,
      running: dto.running,
    };
  }
}

export class GlossaryMapper {
  static fromDtoToModel(dto: GlossaryDto): GlossaryOption {
    return { id: dto.id, label: dto.name, termCount: dto.terms };
  }

  static fromDtoListToModel(dtos: GlossaryDto[]): GlossaryOption[] {
    return dtos.map((dto) => GlossaryMapper.fromDtoToModel(dto));
  }
}
