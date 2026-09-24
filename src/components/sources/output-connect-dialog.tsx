"use client";

import { toast } from "sonner";
import { Copy01, LinkExternal01 } from "@untitledui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiBaseUrl, wsBaseUrl } from "@/lib/config";
import { buildAudienceUrl, buildOverlayUrl } from "@/models/output.model";
import { languageLabel, type Language } from "@/models/language.model";
import type { ReactNode } from "react";

interface OutputConnectDialogProps {
  trackId: string;
  language: Language;
  children: ReactNode;
}

function Endpoint({
  label,
  hint,
  value,
  openable,
}: {
  label: string;
  hint: string;
  value: string;
  openable?: boolean;
}) {
  const copy = () => {
    void navigator.clipboard
      .writeText(value)
      .then(() => toast.success(`${label} copied`))
      .catch(() => toast.error("Clipboard blocked. Copy it manually"));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={value}
          className="h-9 font-mono text-xs"
          onFocus={(event) => event.target.select()}
        />
        <Button variant="outline" size="sm" onClick={copy}>
          <Copy01 className="size-3.5" aria-hidden /> Copy
        </Button>
        {openable ? (
          <Button asChild variant="ghost" size="sm" aria-label={`Open ${label}`}>
            <a href={value} target="_blank" rel="noopener noreferrer">
              <LinkExternal01 className="size-3.5" aria-hidden />
            </a>
          </Button>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">{hint}</p>
    </div>
  );
}

export function OutputConnectDialog({ trackId, language, children }: OutputConnectDialogProps) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const api = apiBaseUrl();
  const ws = wsBaseUrl();
  const encoded = encodeURIComponent(trackId);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Consume the {languageLabel(language)} stream</DialogTitle>
          <DialogDescription>
            Four ways to take this translation somewhere else. Everything below is scoped to this
            source and this language.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-1">
          <Endpoint
            label="OBS or vMix browser source"
            hint="Add as a Browser source at 1920 by 1080. Transparent background, so it keys over your programme feed."
            value={buildOverlayUrl(origin, trackId, {
              language,
              content: "translated",
              chromaKey: false,
              size: "md",
            })}
            openable
          />

          <Endpoint
            label="Audience web page"
            hint="Share this link or show it as a QR code so people read subtitles on their own phones."
            value={buildAudienceUrl(origin, trackId, language)}
            openable
          />

          <div className="flex flex-col gap-2">
            <Endpoint
              label="Live WebSocket feed"
              hint="For your own player, captioner or encoder. Emits JSON as the speaker talks; only this language is sent."
              value={`${ws}/ws/view?sessionId=${encoded}&lang=${language}`}
            />
            <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-lg p-3 font-mono text-[0.7rem] leading-relaxed">
{`{ "type": "segment.interim", "sessionId": "${trackId}", "text": "partial words as spoken" }
{ "type": "segment.final",   "sessionId": "${trackId}", "segment": { "text": "...", "latencyMs": 480 } }
{ "type": "segment.translated", "translation": { "language": "${language}", "text": "..." } }`}
            </pre>
          </div>

          <Endpoint
            label="Subtitle file"
            hint="Finished cues for upload alongside a recording. Swap format for vtt, txt or json."
            value={`${api}/api/sessions/${encoded}/transcript?format=srt&lang=${language}`}
            openable
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
