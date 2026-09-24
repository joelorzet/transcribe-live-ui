"use client";

import Link from "next/link";
import { ArrowLeft, Signal01 } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlossaryDialog } from "@/components/control-room/glossary-dialog";
import { useCreateTrackForm } from "@/hooks/use-create-track-form";
import { cn } from "@/lib/utils";
import { LANGUAGES, SPOKEN_OPTIONS, languageLabel, type Language } from "@/models/language.model";

export function NewSourceForm() {
  const { form, update, toggleOutput, submit, isCreating, glossaries } = useCreateTrackForm();

  const outputCandidates = LANGUAGES.filter((code) => code !== form.spokenLanguage);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <header className="mb-6 flex items-center gap-3 border-b py-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden /> Control room
          </Link>
        </Button>
        <h1 className="text-base font-semibold">New source</h1>
      </header>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Source name</Label>
                <Input
                  id="title"
                  placeholder="Track A — Main stage"
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="spoken">Spoken language</Label>
                <Select
                  value={form.spokenLanguage}
                  onValueChange={(value) => update("spokenLanguage", value as typeof form.spokenLanguage)}
                >
                  <SelectTrigger id="spoken" className="w-full">
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
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="media">Audio source</Label>
              <Input
                id="media"
                type="url"
                placeholder="https://www.youtube.com/watch?v=…"
                value={form.mediaSource}
                onChange={(event) => update("mediaSource", event.target.value)}
              />
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Signal01 className="size-3.5" aria-hidden />
                Leave empty to push from OBS instead — you can start an RTMP endpoint after creating
                the source.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outputs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Translate this source into</Label>
              <div className="flex flex-wrap gap-2">
                {outputCandidates.map((code) => {
                  const selected = form.outputs.includes(code as Language);
                  return (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleOutput(code as Language)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
                        selected
                          ? "border-primary bg-primary/15 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-muted-foreground",
                      )}
                    >
                      {languageLabel(code)}
                    </button>
                  );
                })}
              </div>
              <p className="text-muted-foreground text-xs">
                Each output is an independent live translation with its own subtitles, cost and
                latency. You can add or remove them while the source is running.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="glossary">Glossary</Label>
                <GlossaryDialog glossaryId={form.glossaryId} />
              </div>
              <Select value={form.glossaryId} onValueChange={(value) => update("glossaryId", value)}>
                <SelectTrigger id="glossary" className="w-full">
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
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Starting…" : "Start source"}
          </Button>
          <Button asChild type="button" variant="ghost">
            <Link href="/">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
