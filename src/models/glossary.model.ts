import type { Language } from "@/models/language.model";

export interface GlossaryTerm {
  term: string;
  keepVerbatim: boolean;
  translations: Partial<Record<Language, string>>;
}

export interface Glossary {
  id: string;
  name: string;
  description?: string;
  terms: GlossaryTerm[];
}

export function emptyTerm(): GlossaryTerm {
  return { term: "", keepVerbatim: true, translations: {} };
}

export function countForcedTranslations(terms: GlossaryTerm[]): number {
  return terms.filter((term) => Object.keys(term.translations).length > 0).length;
}
