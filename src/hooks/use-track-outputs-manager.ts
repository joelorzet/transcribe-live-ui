"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";
import { LANGUAGES, languageLabel, type Language } from "@/models/language.model";
import type { Track } from "@/models/track.model";

export function useTrackOutputsManager(track: Track) {
  const { addOutput, removeOutput } = useControlRoom();
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const used = new Set(track.outputs.map((output) => output.language));
  const available = LANGUAGES.filter(
    (code) => !used.has(code) && code !== track.spokenLanguage,
  ) as Language[];

  const add = useCallback(
    async (language: Language) => {
      setPendingLanguage(language);
      try {
        await addOutput(track.id, language);
        toast.success(`${languageLabel(language)} output added`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not add the output");
      } finally {
        setPendingLanguage(null);
      }
    },
    [addOutput, track.id],
  );

  const remove = useCallback(
    async (language: Language) => {
      setPendingLanguage(language);
      try {
        await removeOutput(track.id, language);
        toast.success(`${languageLabel(language)} output removed`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove the output");
      } finally {
        setPendingLanguage(null);
      }
    },
    [removeOutput, track.id],
  );

  return { available, add, remove, pendingLanguage };
}
