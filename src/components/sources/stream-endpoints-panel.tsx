"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Copy01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiBaseUrl, wsBaseUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import { languageLabel, type Language } from "@/models/language.model";
import type { TrackOutput } from "@/models/track.model";

function Endpoint({
  label,
  hint,
  value,
  example,
}: {
  label: string;
  hint: string;
  value: string;
  example?: string;
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
      </div>
      <p className="text-muted-foreground text-xs">{hint}</p>
      {example ? (
        <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md px-3 py-2 font-mono text-[0.7rem]">
          {example}
        </pre>
      ) : null}
    </div>
  );
}

const ORIGINAL = "original";

export function StreamEndpointsPanel({
  trackId,
  outputs,
}: {
  trackId: string;
  outputs: TrackOutput[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<string>(outputs[0]?.language ?? ORIGINAL);

  const api = apiBaseUrl();
  const ws = wsBaseUrl();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const id = encodeURIComponent(trackId);
  const chosen = language === ORIGINAL ? "" : language;
  const suffix = chosen ? `&lang=${chosen}` : "";
  const questionSuffix = chosen ? `?lang=${chosen}` : "";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-xl border">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="hover:bg-muted/40 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
        >
          <ChevronDown
            className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
            aria-hidden
          />
          <span className="text-sm font-medium">Advanced: consume these streams elsewhere</span>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            WebSocket, SSE, plain text and subtitle files
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-5 border-t px-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="endpoint-language" className="text-xs">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="endpoint-language" size="sm" className="w-56">
              <SelectValue placeholder="Original (no translation)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ORIGINAL}>Original (no translation)</SelectItem>
              {outputs.map((output) => (
                <SelectItem key={output.language} value={output.language}>
                  {languageLabel(output.language as Language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Endpoint
          label="Server sent events"
          hint="Simplest live feed. Works from any language, survives proxies, reconnects on its own."
          value={`${api}/api/sessions/${id}/events${questionSuffix}`}
          example={`curl -N "${api}/api/sessions/${id}/events${questionSuffix}"`}
        />

        <Endpoint
          label="WebSocket feed"
          hint="Same events over a socket, for players and encoders that already speak WebSocket."
          value={`${ws}/ws/view?sessionId=${id}${suffix}`}
          example={`{ "type": "segment.translated", "translation": { "language": "${chosen || "es"}", "text": "..." } }`}
        />

        <Endpoint
          label="Latest caption as plain text"
          hint="Poll this from a vMix title, CasparCG template or a sign. Returns the last two caption lines."
          value={`${api}/api/sessions/${id}/live.txt${questionSuffix}`}
          example={`curl "${api}/api/sessions/${id}/live.txt${questionSuffix}"`}
        />

        <Endpoint
          label="Subtitle file"
          hint="Finished cues for a recording. Swap srt for vtt, txt or json."
          value={`${api}/api/sessions/${id}/transcript?format=srt${suffix}`}
        />

        <Endpoint
          label="Browser overlay"
          hint="Add as a Browser source in OBS or vMix at 1920 by 1080, transparent background."
          value={`${origin}/overlay/${id}${questionSuffix}`}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
