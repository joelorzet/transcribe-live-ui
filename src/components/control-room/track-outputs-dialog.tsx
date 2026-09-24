"use client";

import Image from "next/image";
import { AlertTriangle, Copy01, LinkExternal01 } from "@untitledui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTrackOutputs } from "@/hooks/use-track-outputs";
import { languageLabel, type Language } from "@/models/language.model";
import { OVERLAY_CONTENT, OVERLAY_SIZES } from "@/models/output.model";
import type { ReactNode } from "react";

interface TrackOutputsDialogProps {
  trackId: string;
  trackTitle: string;
  subtitleLanguages: Language[];
  children: ReactNode;
}

function UrlRow({ url, label, onCopy }: { url: string; label: string; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={url} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
      <Button variant="outline" size="sm" onClick={onCopy}>
        <Copy01 className="size-3.5" aria-hidden /> Copy
      </Button>
      <Button asChild variant="ghost" size="sm" aria-label={`Open ${label}`}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <LinkExternal01 className="size-3.5" aria-hidden />
        </a>
      </Button>
    </div>
  );
}

export function TrackOutputsDialog({
  trackId,
  trackTitle,
  subtitleLanguages,
  children,
}: TrackOutputsDialogProps) {
  const { options, update, overlayUrl, audienceUrl, qrDataUrl, copy, isLocal } = useTrackOutputs(
    trackId,
    subtitleLanguages,
  );

  const languageOptions = [
    { value: "", label: "Original (no translation)" },
    ...subtitleLanguages.map((code) => ({ value: code, label: languageLabel(code) })),
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Outputs — {trackTitle}</DialogTitle>
          <DialogDescription>
            One output per language. Add a separate browser source in OBS for each language you
            broadcast.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="output-language">Subtitle language</Label>
          <Select
            value={options.language}
            onValueChange={(value) => update("language", value as Language | "")}
          >
            <SelectTrigger id="output-language" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value || "original"} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overlay">
          <TabsList className="w-full">
            <TabsTrigger value="overlay">OBS / vMix overlay</TabsTrigger>
            <TabsTrigger value="audience">Audience link</TabsTrigger>
          </TabsList>

          <TabsContent value="overlay" className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="overlay-content">Lines shown</Label>
                <Select
                  value={options.content}
                  onValueChange={(value) => update("content", value as typeof options.content)}
                >
                  <SelectTrigger id="overlay-content" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERLAY_CONTENT.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="overlay-size">Caption size</Label>
                <Select
                  value={options.size}
                  onValueChange={(value) => update("size", value as typeof options.size)}
                >
                  <SelectTrigger id="overlay-size" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERLAY_SIZES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <Label htmlFor="chroma" className="cursor-pointer">
                  Chroma key background
                </Label>
                <p className="text-muted-foreground text-xs">
                  Solid green instead of transparent, for mixers without alpha.
                </p>
              </div>
              <Switch
                id="chroma"
                checked={options.chromaKey}
                onCheckedChange={(checked) => update("chromaKey", checked)}
              />
            </div>

            <UrlRow url={overlayUrl} label="overlay" onCopy={() => void copy(overlayUrl, "Overlay URL")} />

            <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-xs">
              <li>In OBS: Sources → + → Browser</li>
              <li>Paste this URL, set 1920 × 1080</li>
              <li>Tick “Shutdown source when not visible”</li>
            </ol>
          </TabsContent>

          <TabsContent value="audience" className="flex flex-col gap-4 pt-4">
            <UrlRow
              url={audienceUrl}
              label="audience page"
              onCopy={() => void copy(audienceUrl, "Audience URL")}
            />

            {isLocal ? (
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                This link points at localhost, so phones cannot open it. Open the control room on
                your machine&rsquo;s LAN address and the QR code will work.
              </p>
            ) : null}

            {qrDataUrl ? (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={qrDataUrl}
                  alt={`QR code linking to subtitles for ${trackTitle}`}
                  width={200}
                  height={200}
                  unoptimized
                  className="rounded-lg"
                />
                <p className="text-muted-foreground text-xs">
                  Put this on a slide so the room can read subtitles on their phones.
                </p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
