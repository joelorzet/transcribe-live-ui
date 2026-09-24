"use client";

import { useState } from "react";
import { BookOpen01, Plus, Trash01 } from "@untitledui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGlossaryEditor } from "@/hooks/use-glossary-editor";
import { LANGUAGES, languageLabel, type Language } from "@/models/language.model";

export function GlossaryDialog({ glossaryId }: { glossaryId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    glossary,
    terms,
    language,
    setLanguage,
    updateTerm,
    setTranslation,
    addTerm,
    removeTerm,
    save,
    isLoading,
    isSaving,
  } = useGlossaryEditor(glossaryId, isOpen);

  const disabled = glossaryId === "none";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" disabled={disabled}>
          <BookOpen01 className="size-3.5" aria-hidden /> Edit terms
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{glossary?.name ?? "Glossary"}</DialogTitle>
          <DialogDescription>
            These terms are sent to the speech model so it recognises them, and used as a
            do-not-translate list so they survive translation. Without them &ldquo;Prometheus&rdquo;
            comes back as &ldquo;Promiscuous&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Label htmlFor="glossary-language" className="text-xs">
            Forced translations for
          </Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger id="glossary-language" size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((code) => (
                <SelectItem key={code} value={code}>
                  {languageLabel(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={addTerm}>
            <Plus className="size-3.5" aria-hidden /> Add term
          </Button>
        </div>

        <ScrollArea className="h-80 rounded-lg border">
          <div className="flex flex-col gap-2 p-3">
            {isLoading ? (
              <p className="text-muted-foreground p-4 text-center text-sm">Loading terms…</p>
            ) : terms.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm">
                No terms yet. Add speaker names, product names and acronyms.
              </p>
            ) : (
              terms.map((term, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <Input
                    aria-label="Term"
                    className="h-8 min-w-36 flex-1 text-xs"
                    placeholder="Kubernetes"
                    value={term.term}
                    onChange={(event) => updateTerm(index, { term: event.target.value })}
                  />
                  <Input
                    aria-label={`Translation in ${languageLabel(language)}`}
                    className="h-8 min-w-36 flex-1 text-xs"
                    placeholder={`${language.toUpperCase()} translation, leave empty to keep as-is`}
                    value={term.translations[language] ?? ""}
                    onChange={(event) => setTranslation(index, event.target.value)}
                  />
                  <div className="flex items-center gap-1.5">
                    <Switch
                      id={`verbatim-${index}`}
                      checked={term.keepVerbatim}
                      onCheckedChange={(checked) => updateTerm(index, { keepVerbatim: checked })}
                    />
                    <Label htmlFor={`verbatim-${index}`} className="text-muted-foreground text-xs">
                      keep
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Remove ${term.term || "term"}`}
                    onClick={() => removeTerm(index)}
                  >
                    <Trash01 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <span className="text-muted-foreground text-xs">
            {terms.length} terms · first 100 are sent to the speech model
          </span>
          <Button type="button" disabled={isSaving || isLoading} onClick={() => void save()}>
            {isSaving ? "Saving…" : "Save glossary"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
