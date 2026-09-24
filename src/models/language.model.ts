export const LANGUAGES = ["es", "en", "pt"] as const;

export type Language = (typeof LANGUAGES)[number];
export type SpokenLanguage = Language | "auto";

const LABELS: Record<SpokenLanguage, string> = {
  auto: "Auto-detect",
  es: "Spanish",
  en: "English",
  pt: "Portuguese",
};

export function languageLabel(value: SpokenLanguage): string {
  return LABELS[value] ?? value;
}

export function toLanguage(value: string, fallback: Language = "es"): Language {
  const short = value.slice(0, 2).toLowerCase();
  return (LANGUAGES as readonly string[]).includes(short) ? (short as Language) : fallback;
}

export function toSpokenLanguage(value: string): SpokenLanguage {
  return value === "auto" ? "auto" : toLanguage(value);
}
