import { cn } from "@/lib/utils";
import type { Language } from "@/models/language.model";

interface CaptionStackProps {
  interim: string;
  original: string;
  translations: Partial<Record<Language, string>>;
  size?: "card" | "stage";
}

export function CaptionStack({ interim, original, translations, size = "card" }: CaptionStackProps) {
  const entries = Object.entries(translations) as [Language, string][];
  const isEmpty = !interim && !original && entries.length === 0;

  if (isEmpty) {
    return (
      <p className={cn("text-muted-foreground italic", size === "stage" ? "text-2xl" : "text-sm")}>
        Waiting for audio…
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col", size === "stage" ? "gap-5" : "gap-2.5")}>
      {interim ? (
        <p
          className={cn(
            "caret text-muted-foreground break-words",
            size === "stage" ? "text-3xl leading-snug md:text-4xl" : "text-[0.95rem] leading-relaxed",
          )}
        >
          {interim}
        </p>
      ) : null}

      {original ? (
        <p
          className={cn(
            "break-words",
            size === "stage" ? "text-3xl leading-snug md:text-4xl" : "text-[0.95rem] leading-relaxed",
          )}
        >
          {original}
        </p>
      ) : null}

      {entries.map(([language, text]) => (
        <p
          key={language}
          className={cn(
            "text-primary border-primary/40 border-l-2 break-words",
            size === "stage" ? "pl-4 text-3xl leading-snug md:text-4xl" : "pl-3 text-[0.95rem] leading-relaxed",
          )}
        >
          <span className="text-muted-foreground mr-2 font-mono text-[0.65rem] tracking-wider uppercase">
            {language}
          </span>
          {text}
        </p>
      ))}
    </div>
  );
}
