"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlossaryDialog } from "@/components/control-room/glossary-dialog";
import { useSourceSettings } from "@/hooks/use-source-settings";
import { SPOKEN_OPTIONS, type SpokenLanguage } from "@/models/language.model";

interface SourceSettingsRowProps {
  trackId: string;
  spokenLanguage: SpokenLanguage;
  glossaryId: string;
  disabled: boolean;
}

export function SourceSettingsRow({
  trackId,
  spokenLanguage,
  glossaryId,
  disabled,
}: SourceSettingsRowProps) {
  const { setSpokenLanguage, setGlossary, pending, glossaries } = useSourceSettings(trackId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="flex min-h-8 items-center justify-between gap-2">
          <Label htmlFor="source-language" className="text-xs">
            Spoken language
          </Label>
        </div>
        <Select
          value={spokenLanguage}
          disabled={disabled || pending === "language"}
          onValueChange={(value) => void setSpokenLanguage(value as SpokenLanguage)}
        >
          <SelectTrigger id="source-language" size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPOKEN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground mt-auto text-xs">
          Changing this reconnects the speech model without dropping the source.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex min-h-8 items-center justify-between gap-2">
          <Label htmlFor="source-glossary" className="text-xs">
            Glossary
          </Label>
          <GlossaryDialog glossaryId={glossaryId} />
        </div>
        <Select
          value={glossaryId}
          disabled={disabled || pending === "glossary"}
          onValueChange={(value) => void setGlossary(value)}
        >
          <SelectTrigger id="source-glossary" size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {glossaries.map((glossary) => (
              <SelectItem key={glossary.id} value={glossary.id}>
                {glossary.label} ({glossary.termCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground mt-auto text-xs">
          Terms the speech model should recognise and the translator must keep.
        </p>
      </div>
    </div>
  );
}
