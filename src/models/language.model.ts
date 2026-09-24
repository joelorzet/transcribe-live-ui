export const LANGUAGES = ["es", "en", "pt", "fr", "de", "it", "nl", "ja", "zh"] as const;

export type Language = (typeof LANGUAGES)[number];
export type SpokenLanguage = Language | "auto";

const LABELS: Record<SpokenLanguage, string> = {
  auto: "Auto-detect",
  es: "Spanish",
  en: "English",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  it: "Italian",
  nl: "Dutch",
  ja: "Japanese",
  zh: "Chinese",
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

export const SPOKEN_OPTIONS: { value: SpokenLanguage; label: string }[] = [
  { value: "auto", label: languageLabel("auto") },
  ...LANGUAGES.map((code) => ({ value: code as SpokenLanguage, label: languageLabel(code) })),
];

export const SUBTITLE_OPTIONS: { value: string; label: string }[] = [
  ...LANGUAGES.map((code) => ({ value: code, label: languageLabel(code) })),
  { value: "en,pt", label: "English + Portuguese" },
  { value: "es,pt", label: "Spanish + Portuguese" },
  { value: "es,en", label: "Spanish + English" },
];
