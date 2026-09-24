"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useServices } from "@/contexts/services-context";
import { emptyTerm, type Glossary, type GlossaryTerm } from "@/models/glossary.model";
import type { Language } from "@/models/language.model";

export function useGlossaryEditor(glossaryId: string, isOpen: boolean) {
  const { glossaries } = useServices();
  const [glossary, setGlossary] = useState<Glossary | null>(null);
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || glossaryId === "none") return;
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) setIsLoading(true);
    });

    glossaries
      .get(glossaryId)
      .then((loaded) => {
        if (cancelled) return;
        setGlossary(loaded);
        setTerms(loaded.terms);
      })
      .catch((error: Error) => {
        if (!cancelled) toast.error(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [glossaries, glossaryId, isOpen]);

  const updateTerm = useCallback((index: number, patch: Partial<GlossaryTerm>) => {
    setTerms((current) =>
      current.map((term, position) => (position === index ? { ...term, ...patch } : term)),
    );
  }, []);

  const setTranslation = useCallback(
    (index: number, text: string) => {
      setTerms((current) =>
        current.map((term, position) => {
          if (position !== index) return term;
          const translations = { ...term.translations };
          if (text.trim() === "") delete translations[language];
          else translations[language] = text;
          return { ...term, translations };
        }),
      );
    },
    [language],
  );

  const addTerm = useCallback(() => setTerms((current) => [emptyTerm(), ...current]), []);

  const removeTerm = useCallback((index: number) => {
    setTerms((current) => current.filter((_, position) => position !== index));
  }, []);

  const save = useCallback(async () => {
    if (!glossary) return;
    setIsSaving(true);
    try {
      const saved = await glossaries.update({ ...glossary, terms });
      setGlossary(saved);
      setTerms(saved.terms);
      toast.success(`Saved ${saved.terms.length} terms`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the glossary");
    } finally {
      setIsSaving(false);
    }
  }, [glossaries, glossary, terms]);

  return {
    glossary,
    terms,
    language,
    setLanguage,
    updateTerm,
    setTranslation,
    addTerm,
    removeTerm,
    save,
    isLoading,
    isSaving,
  };
}
