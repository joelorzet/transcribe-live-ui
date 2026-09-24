"use client";

import { Microphone02, PlayCircle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { useDemoTrack } from "@/hooks/use-demo-track";

export function EmptyTracks() {
  const { startDemo, isStarting } = useDemoTrack();

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
      <Microphone02 className="text-muted-foreground size-9 opacity-50" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium">No tracks running</p>
        <p className="text-muted-foreground max-w-md text-sm">
          Start a track above and paste a YouTube or media URL. The server pulls the audio, captions
          it live, and translates it as it goes.
        </p>
      </div>
      <Button variant="outline" disabled={isStarting} onClick={() => void startDemo()}>
        <PlayCircle className="size-4" aria-hidden />
        {isStarting ? "Starting…" : "Start a demo track"}
      </Button>
    </div>
  );
}
