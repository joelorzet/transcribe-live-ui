"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";
import { toLanguage, toSpokenLanguage } from "@/models/language.model";
import type { Language, SpokenLanguage } from "@/models/language.model";

interface FormState {
  title: string;
  spokenLanguage: SpokenLanguage;
  subtitleLanguages: string;
  glossaryId: string;
}

const INITIAL: FormState = {
  title: "",
  spokenLanguage: "es",
  subtitleLanguages: "en",
  glossaryId: "nerdearla",
};

export function useCreateTrackForm() {
  const { createTrack, isCreating, glossaries } = useControlRoom();
  const [form, setForm] = useState<FormState>(INITIAL);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    const title = form.title.trim();
    if (!title) {
      toast.error("Give the track a name");
      return;
    }

    const subtitleLanguages = form.subtitleLanguages
      .split(",")
      .map((code) => toLanguage(code.trim()))
      .filter((code, index, all): code is Language => all.indexOf(code) === index);

    try {
      await createTrack({
        title,
        spokenLanguage: toSpokenLanguage(form.spokenLanguage),
        subtitleLanguages,
        glossaryId: form.glossaryId,
      });
      setForm((current) => ({ ...current, title: "" }));
      toast.success(`"${title}" is live`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the track");
    }
  }, [createTrack, form]);

  return { form, update, submit, isCreating, glossaries };
}
