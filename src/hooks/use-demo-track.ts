"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useControlRoom } from "@/contexts/control-room-context";

const DEMO_SOURCE = "https://www.youtube.com/watch?v=dyKmnC_S-UI";

export function useDemoTrack() {
  const { createTrack } = useControlRoom();
  const [isStarting, setIsStarting] = useState(false);

  const startDemo = useCallback(async () => {
    setIsStarting(true);
    try {
      await createTrack(
        {
          title: "Demo, Nerdearla 2025",
          spokenLanguage: "es",
          subtitleLanguages: ["en"],
          glossaryId: "nerdearla",
        },
        DEMO_SOURCE,
      );
      toast.success("Demo track started. Captions appear in a couple of seconds");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the demo track");
    } finally {
      setIsStarting(false);
    }
  }, [createTrack]);

  return { startDemo, isStarting };
}
