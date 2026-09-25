"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/contexts/services-context";
import type { AudienceSession } from "@/models/audience.model";
import type { ConnectionStatus } from "@/models/engine.model";
import type { Language } from "@/models/language.model";

const STORAGE_KEY = "transcribe-live.subtitle-language";

interface Captions {
  interim: string;
  original: string;
  translated: string;
}

const NO_CAPTIONS: Captions = { interim: "", original: "", translated: "" };

/**
 * The audience side of a talk. Subscribes to one language at a time, so the
 * socket carries only the subtitles being read, and changing language changes
 * the subscription rather than filtering a firehose on the client.
 */
export function useAudienceSession(trackId: string, initialLanguage?: Language | "") {
  const { realtime } = useServices();
  const [session, setSession] = useState<AudienceSession | null>(null);
  const [captions, setCaptions] = useState<Captions>(NO_CAPTIONS);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [chosen, setChosen] = useState<Language | "" | null>(initialLanguage ?? null);

  const remembered =
    typeof window === "undefined"
      ? null
      : (window.localStorage.getItem(STORAGE_KEY) as Language | null);

  const available = session?.languages ?? [];
  const language: Language | "" =
    chosen ?? (remembered && available.includes(remembered) ? remembered : (available[0] ?? ""));

  useEffect(() => {
    return realtime.subscribe(
      trackId,
      {
        onStatusChange: setStatus,
        onEvent: (event) => {
          switch (event.kind) {
            case "session":
              setSession(event.view);
              break;
            case "interim":
              setCaptions((current) => ({ ...current, interim: event.text }));
              break;
            case "final":
              setCaptions((current) => ({
                ...current,
                interim: "",
                original: event.text,
                translated: "",
              }));
              break;
            case "translation":
              setCaptions((current) => ({ ...current, translated: event.text }));
              break;
            default:
              break;
          }
        },
      },
      language || undefined,
    );
  }, [realtime, trackId, language]);

  const chooseLanguage = useCallback((next: Language | "") => {
    setChosen(next);
    // Drop the previous language's words rather than leave them on screen while
    // the new subscription warms up.
    setCaptions(NO_CAPTIONS);
    if (typeof window !== "undefined" && next) window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { session, captions, status, language, available, chooseLanguage };
}
