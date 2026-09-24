import type { Language } from "@/models/language.model";
import type { Glossary, GlossaryTerm } from "@/models/glossary.model";
import type { GlossaryDetailDto, GlossaryTermDto } from "@/services/dto/api.dto";

export class GlossaryDetailMapper {
  static fromDtoToModel(dto: GlossaryDetailDto): Glossary {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      terms: dto.terms.map((term) => GlossaryDetailMapper.termFromDto(term)),
    };
  }

  static termFromDto(dto: GlossaryTermDto): GlossaryTerm {
    return {
      term: dto.term,
      keepVerbatim: Boolean(dto.keepVerbatim),
      translations: (dto.translations ?? {}) as Partial<Record<Language, string>>,
    };
  }

  static fromModelToDto(model: Glossary): GlossaryDetailDto {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      terms: model.terms
        .filter((term) => term.term.trim() !== "")
        .map((term) => ({
          term: term.term.trim(),
          keepVerbatim: term.keepVerbatim,
          translations: Object.keys(term.translations).length > 0 ? term.translations : undefined,
        })),
    };
  }
}
