"use client";

import Link from "next/link";
import { ArrowLeft, Download01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaptionStack } from "@/components/captions/caption-stack";
import { ConnectionBadge, TrackStatusBadge } from "@/components/control-room/status-badge";
import { useSessionCaptions } from "@/hooks/use-session-captions";
import type { Language } from "@/models/language.model";

const FORMATS: { format: "srt" | "vtt" | "txt"; label: string }[] = [
  { format: "srt", label: "SRT" },
  { format: "vtt", label: "VTT" },
  { format: "txt", label: "Text" },
];

export function SessionView({
  trackId,
  initialLanguage,
}: {
  trackId: string;
  initialLanguage?: Language | "";
}) {
  const { view, status, language, available, chooseLanguage, visibleTranslations, downloadUrl } =
    useSessionCaptions(trackId, initialLanguage);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 pb-10 sm:px-6">
      <header className="bg-background/90 sticky top-0 z-30 mb-6 flex flex-wrap items-center gap-3 border-b py-4 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden /> Control room
          </Link>
        </Button>
        <span className="truncate font-semibold">{view?.track.title ?? trackId}</span>
        {view ? <TrackStatusBadge status={view.track.status} /> : null}

        <div className="flex-1" />

        <Select value={language} onValueChange={(value) => chooseLanguage(value as Language)}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Original only" />
          </SelectTrigger>
          <SelectContent>
            {available.map((code) => (
              <SelectItem key={code} value={code}>
                {code.toUpperCase()} subtitles
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {FORMATS.map(({ format, label }) => (
          <Button key={format} asChild variant="outline" size="sm">
            <a href={downloadUrl(format)}>
              <Download01 className="size-3.5" aria-hidden /> {label}
            </a>
          </Button>
        ))}

        <ConnectionBadge status={status} />
      </header>

      <main className="flex flex-1 flex-col justify-end pb-6">
        <CaptionStack
          interim={view?.interim ?? ""}
          original={view?.original ?? ""}
          translations={visibleTranslations}
          size="stage"
        />
      </main>

      {view && view.history.length > 0 ? (
        <ScrollArea className="h-56 border-t pt-4">
          <div className="text-muted-foreground flex flex-col gap-3 pr-4 text-sm">
            {view.history.map((line, index) => (
              <div key={`${line.original}-${index}`}>
                <p>{line.original}</p>
                {Object.entries(line.translations).map(([code, text]) => (
                  <p key={code} className="text-primary/80">
                    {text}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}
