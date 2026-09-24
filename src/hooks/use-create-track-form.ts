"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";
import { toSpokenLanguage, type Language, type SpokenLanguage } from "@/models/language.model";

interface FormState {
  title: string;
  spokenLanguage: SpokenLanguage;
  outputs: Language[];
  glossaryId: string;
  mediaSource: string;
}

const INITIAL: FormState = {
  title: "",
  spokenLanguage: "es",
  outputs: ["en"],
  glossaryId: "nerdearla",
  mediaSource: "",
};

export function useCreateTrackForm(onDone?: () => void) {
  const { createTrack, isCreating, glossaries } = useControlRoom();
  const [form, setForm] = useState<FormState>(INITIAL);
  const router = useRouter();

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleOutput = useCallback((language: Language) => {
    setForm((current) => ({
      ...current,
      outputs: current.outputs.includes(language)
        ? current.outputs.filter((code) => code !== language)
        : [...current.outputs, language],
    }));
  }, []);

  const submit = useCallback(async () => {
    const title = form.title.trim();
    if (!title) {
      toast.error("Give the source a name");
      return;
    }

    const mediaSource = form.mediaSource.trim();

    try {
      await createTrack(
        {
          title,
          spokenLanguage: toSpokenLanguage(form.spokenLanguage),
          subtitleLanguages: form.outputs,
          glossaryId: form.glossaryId,
        },
        mediaSource || undefined,
      );
      setForm(INITIAL);
      toast.success(
        mediaSource ? `"${title}" is live and pulling audio` : `"${title}" is live, waiting for audio`,
      );
      if (onDone) onDone();
      else router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the source");
    }
  }, [createTrack, form, onDone, router]);

  return { form, update, toggleOutput, submit, isCreating, glossaries };
}
