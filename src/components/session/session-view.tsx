"use client";

import Link from "next/link";
import { ArrowLeft, Download01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaptionStack } from "@/components/captions/caption-stack";
import { VideoStage } from "@/components/audience/video-stage";
import { useAudienceSession } from "@/hooks/use-audience-session";
import { useServices } from "@/contexts/services-context";
import { toEmbeddableVideo } from "@/lib/video";
import { cn } from "@/lib/utils";
import { subtitleNotice } from "@/models/audience.model";
import { languageLabel, type Language } from "@/models/language.model";

export function SessionView({
  trackId,
  initialLanguage,
}: {
  trackId: string;
  initialLanguage?: Language | "";
}) {
  const { transcripts } = useServices();
  const { session, captions, status, language, available, chooseLanguage } = useAudienceSession(
    trackId,
    initialLanguage,
  );

  const video = toEmbeddableVideo(session?.watchUrl);
  const notice = subtitleNotice(session);
  const isLive = session?.status === "live" || session?.status === "starting";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 pb-10 sm:px-6">
      <header className="bg-background/90 sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b py-4 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/live">
            <ArrowLeft className="size-4" aria-hidden /> All talks
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
          {session?.title ?? "Live subtitles"}
        </h1>
        {isLive ? (
          <Badge
            variant="outline"
            className="border-primary/50 bg-primary/10 text-primary gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-current" />
            live
          </Badge>
        ) : null}
        {status !== "connected" ? (
          <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[0.68rem]">
            reconnecting
          </Badge>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Read it in</span>
        <button
          type="button"
          aria-pressed={language === ""}
          onClick={() => chooseLanguage("")}
          className={cn(
            "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            language === ""
              ? "border-foreground/40 bg-foreground/10 font-medium"
              : "border-border text-muted-foreground hover:border-muted-foreground",
          )}
        >
          {session ? `Original (${languageLabel(session.spokenLanguage)})` : "Original"}
        </button>
        {available.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={language === code}
            onClick={() => chooseLanguage(code)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              language === code
                ? "border-primary bg-primary/15 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-muted-foreground",
            )}
          >
            {languageLabel(code)}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-3 text-center text-sm">
          {notice}
        </p>
      ) : null}

      <main className="flex flex-1 flex-col justify-center gap-5">
        {video ? (
          <VideoStage
            video={video}
            original={captions.original}
            interim={captions.interim}
            translated={captions.translated}
            showOriginal={language === ""}
            serverPositionSeconds={session?.positionSeconds}
            captionLagMs={session?.captionLagMs ?? 1500}
          />
        ) : (
          <div className="flex flex-1 flex-col justify-end pb-6">
            <CaptionStack
              interim={captions.interim}
              original={captions.original}
              translations={language ? { [language]: captions.translated } : {}}
              size="stage"
            />
          </div>
        )}
      </main>

      <footer className="flex justify-center border-t pt-4">
        <Button asChild variant="ghost" size="sm">
          <a href={transcripts.downloadUrl(trackId, "txt", language || undefined)}>
            <Download01 className="size-3.5" aria-hidden /> Download this transcript
          </a>
        </Button>
      </footer>
    </div>
  );
}
