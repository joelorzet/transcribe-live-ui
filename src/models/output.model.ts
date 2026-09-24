import type { Language } from "@/models/language.model";

export type OverlayContent = "both" | "original" | "translated";
export type OverlaySize = "sm" | "md" | "lg";

export interface OverlayOptions {
  language: Language | "";
  content: OverlayContent;
  chromaKey: boolean;
  size: OverlaySize;
}

export const DEFAULT_OVERLAY_OPTIONS: OverlayOptions = {
  language: "",
  content: "translated",
  chromaKey: false,
  size: "md",
};

export const OVERLAY_SIZES: { value: OverlaySize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const OVERLAY_CONTENT: { value: OverlayContent; label: string }[] = [
  { value: "translated", label: "Translation only" },
  { value: "original", label: "Original only" },
  { value: "both", label: "Both lines" },
];

export function buildOverlayUrl(origin: string, trackId: string, options: OverlayOptions): string {
  const params = new URLSearchParams();
  if (options.language) params.set("lang", options.language);
  if (options.content !== "both") params.set("only", options.content);
  if (options.chromaKey) params.set("chroma", "1");
  if (options.size !== "md") params.set("size", options.size);

  const query = params.toString();
  return `${origin}/overlay/${encodeURIComponent(trackId)}${query ? `?${query}` : ""}`;
}

export function buildAudienceUrl(origin: string, trackId: string, language: Language | ""): string {
  const query = language ? `?lang=${language}` : "";
  return `${origin}/session/${encodeURIComponent(trackId)}${query}`;
}

export function isLocalOrigin(origin: string): boolean {
  return /localhost|127\.0\.0\.1|\[::1\]/.test(origin);
}
