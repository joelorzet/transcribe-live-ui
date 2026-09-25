"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { toast } from "sonner";
import { AlertTriangle, Copy01, LinkExternal01, Users01 } from "@untitledui/icons";
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
import { isLocalOrigin } from "@/models/output.model";

export function AudienceLinkDialog() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const audienceUrl = origin ? `${origin}/live` : "";

  useEffect(() => {
    if (!audienceUrl) return;
    let cancelled = false;
    QRCode.toDataURL(audienceUrl, { width: 360, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [audienceUrl]);

  const copy = () => {
    void navigator.clipboard
      .writeText(audienceUrl)
      .then(() => toast.success("Audience link copied"))
      .catch(() => toast.error("Clipboard blocked. Copy it manually"));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users01 className="size-3.5" aria-hidden /> Audience link
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send the room here</DialogTitle>
          <DialogDescription>
            One link for the whole event. People pick their talk and their language, then watch it
            with subtitles. It updates itself as talks start and finish.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={audienceUrl}
            className="h-9 font-mono text-xs"
            onFocus={(event) => event.target.select()}
          />
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy01 className="size-3.5" aria-hidden /> Copy
          </Button>
          <Button asChild variant="ghost" size="sm" aria-label="Open the audience view">
            <a href="/live" target="_blank" rel="noopener noreferrer">
              <LinkExternal01 className="size-3.5" aria-hidden />
            </a>
          </Button>
        </div>

        {isLocalOrigin(origin) ? (
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            This points at localhost, so phones cannot open it. Open the control room on this
            machine&rsquo;s LAN address and the QR code will work in the room.
          </p>
        ) : null}

        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-2 pt-1">
            <Image
              src={qrDataUrl}
              alt="QR code linking to the audience subtitle page"
              width={220}
              height={220}
              unoptimized
              className="rounded-lg"
            />
            <p className="text-muted-foreground text-xs">Put this on a slide between talks.</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
