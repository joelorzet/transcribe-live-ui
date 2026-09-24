"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  DEFAULT_OVERLAY_OPTIONS,
  buildAudienceUrl,
  buildOverlayUrl,
  isLocalOrigin,
  type OverlayOptions,
} from "@/models/output.model";
import type { Language } from "@/models/language.model";

export function useTrackOutputs(trackId: string, subtitleLanguages: Language[]) {
  const [options, setOptions] = useState<OverlayOptions>(() => ({
    ...DEFAULT_OVERLAY_OPTIONS,
    language: subtitleLanguages[0] ?? "",
  }));
  const [origin, setOrigin] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const update = useCallback(<K extends keyof OverlayOptions>(key: K, value: OverlayOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  }, []);

  const overlayUrl = useMemo(
    () => (origin ? buildOverlayUrl(origin, trackId, options) : ""),
    [origin, trackId, options],
  );

  const audienceUrl = useMemo(
    () => (origin ? buildAudienceUrl(origin, trackId, options.language) : ""),
    [origin, trackId, options.language],
  );

  useEffect(() => {
    if (!audienceUrl) return;
    let cancelled = false;
    QRCode.toDataURL(audienceUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [audienceUrl]);

  const copy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Clipboard blocked — select the URL and copy it manually");
    }
  }, []);

  return {
    options,
    update,
    overlayUrl,
    audienceUrl,
    qrDataUrl,
    copy,
    isLocal: origin ? isLocalOrigin(origin) : false,
  };
}
