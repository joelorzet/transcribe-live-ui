"use client";

import Link from "next/link";
import { ArrowLeft, Download01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaptionStack } from "@/components/captions/caption-stack";
import { VideoStage } from "@/components/audience/video-stage";
import { toEmbeddableVideo } from "@/lib/video";
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

  const video = toEmbeddableVideo(view?.track.watchUrl ?? view?.track.input?.source);
  const translatedText = language ? (visibleTranslations[language] ?? "") : "";

  // Compensate with the lag actually measured for the line being read: an
  // output's p50 covers transcription plus its own translation hop.
  const selectedOutput = view?.track.outputs.find((output) => output.language === language);
  const captionLagMs =
    selectedOutput?.latencyP95Ms ||
    selectedOutput?.latencyP50Ms ||
    view?.track.metrics.latencyP95Ms ||
    2500;

  // A talk can be on air with its video playing while nothing is feeding audio
  // in. Saying so beats an empty caption area that looks like a broken page.
  const track = view?.track;
  const subtitleNotice = !track
    ? null
    : !track.input
      ? "No audio is reaching this talk yet, so there are no subtitles."
      : track.input.waitingForPublisher
        ? "Waiting for the room to start streaming. Subtitles begin as soon as audio arrives."
        : track.metrics.segments === 0
          ? "Audio is arriving. The first subtitles appear in a moment."
          : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 pb-10 sm:px-6">
      <header className="bg-background/90 sticky top-0 z-30 mb-6 flex flex-wrap items-center gap-3 border-b py-4 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/live">
            <ArrowLeft className="size-4" aria-hidden /> All talks
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
            {available.map((code: Language) => (
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

      <main className="flex flex-1 flex-col justify-center gap-6 pb-6">
        {subtitleNotice ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-3 text-center text-sm">
            {subtitleNotice}
          </p>
        ) : null}

        {video ? (
          <VideoStage
            video={video}
            original={view?.original ?? ""}
            interim={view?.interim ?? ""}
            translated={translatedText}
            showOriginal={!language}
            serverPositionSeconds={view?.track.input?.positionSeconds}
            captionLagMs={captionLagMs}
          />
        ) : (
          <div className="flex flex-1 flex-col justify-end">
            <CaptionStack
              interim={view?.interim ?? ""}
              original={view?.original ?? ""}
              translations={visibleTranslations}
              size="stage"
            />
          </div>
        )}
      </main>

    </div>
  );
}
