"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";
import { languageLabel, type SpokenLanguage } from "@/models/language.model";

export function useSourceSettings(trackId: string) {
  const { updateSource, glossaries } = useControlRoom();
  const [pending, setPending] = useState<"language" | "glossary" | null>(null);

  const setSpokenLanguage = useCallback(
    async (sourceLanguage: SpokenLanguage) => {
      setPending("language");
      try {
        await updateSource(trackId, { sourceLanguage });
        toast.success(
          sourceLanguage === "auto"
            ? "Now detecting the spoken language automatically"
            : `Now listening for ${languageLabel(sourceLanguage)}`,
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not change the input language");
      } finally {
        setPending(null);
      }
    },
    [trackId, updateSource],
  );

  const setGlossary = useCallback(
    async (glossaryId: string) => {
      setPending("glossary");
      try {
        await updateSource(trackId, { glossaryId });
        toast.success("Glossary applied to this source");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not change the glossary");
      } finally {
        setPending(null);
      }
    },
    [trackId, updateSource],
  );

  return { setSpokenLanguage, setGlossary, pending, glossaries };
}
