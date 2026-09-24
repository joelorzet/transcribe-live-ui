"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";
import { toSpokenLanguage, type Language, type SpokenLanguage } from "@/models/language.model";

export type InputMethod = "pull" | "obs" | "later";

interface FormState {
  title: string;
  spokenLanguage: SpokenLanguage;
  outputs: Language[];
  glossaryId: string;
  inputMethod: InputMethod;
  mediaSource: string;
  watchUrl: string;
}

const INITIAL: FormState = {
  title: "",
  spokenLanguage: "es",
  outputs: ["en"],
  glossaryId: "nerdearla",
  inputMethod: "pull",
  mediaSource: "",
  watchUrl: "",
};

export function useCreateTrackForm() {
  const { createTrack, startRtmpIngest, isCreating, glossaries } = useControlRoom();
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
    if (form.inputMethod === "pull" && !mediaSource) {
      toast.error("Paste a URL to pull audio from, or pick another input method");
      return;
    }

    try {
      const track = await createTrack(
        {
          title,
          spokenLanguage: toSpokenLanguage(form.spokenLanguage),
          subtitleLanguages: form.outputs,
          glossaryId: form.glossaryId,
          watchUrl: form.watchUrl.trim() || undefined,
        },
        form.inputMethod === "pull" ? mediaSource : undefined,
      );

      if (form.inputMethod === "obs") {
        await startRtmpIngest(track.id);
        toast.success(`"${title}" is ready. Copy the OBS settings below`);
      } else if (form.inputMethod === "pull") {
        toast.success(`"${title}" is live and pulling audio`);
      } else {
        toast.success(`"${title}" is ready. Attach an audio source when you are`);
      }

      setForm(INITIAL);
      router.push(`/sources/${track.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the source");
    }
  }, [createTrack, startRtmpIngest, form, router]);

  return { form, update, toggleOutput, submit, isCreating, glossaries };
}
