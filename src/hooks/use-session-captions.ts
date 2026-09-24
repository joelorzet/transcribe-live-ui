"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useServices } from "@/contexts/services-context";
import { useTrackStream } from "@/hooks/use-track-stream";
import type { Language } from "@/models/language.model";
import { outputLanguages } from "@/models/track.model";
import type { TranscriptFormat } from "@/services/transcript.service";

const STORAGE_KEY = "transcribe-live.subtitle-language";

export function useSessionCaptions(trackId: string, initialLanguage?: Language | "") {
  const { transcripts } = useServices();
  const { views, status } = useTrackStream(trackId);
  const [language, setLanguage] = useState<Language | "">(initialLanguage ?? "");

  const view = views[trackId];
  const available = useMemo(() => (view ? outputLanguages(view.track) : []), [view]);

  useEffect(() => {
    if (language !== "" || initialLanguage) return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    const next = stored && available.includes(stored) ? stored : available[0];
    if (next) setLanguage(next);
  }, [available, language, initialLanguage]);

  const chooseLanguage = useCallback((next: Language | "") => {
    setLanguage(next);
    if (next) window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const visibleTranslations = useMemo(() => {
    if (!view) return {};
    if (language === "") return {};
    const text = view.translations[language];
    return text ? { [language]: text } : {};
  }, [view, language]);

  const downloadUrl = useCallback(
    (format: TranscriptFormat) => transcripts.downloadUrl(trackId, format, language || undefined),
    [transcripts, trackId, language],
  );

  return { view, status, language, available, chooseLanguage, visibleTranslations, downloadUrl };
}
