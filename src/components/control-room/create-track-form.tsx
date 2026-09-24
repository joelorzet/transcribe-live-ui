"use client";

import { PlusCircle } from "@untitledui/icons";
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
import { useCreateTrackForm } from "@/hooks/use-create-track-form";

const SPOKEN_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" },
  { value: "pt", label: "Portuguese" },
];

const SUBTITLE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "en,pt", label: "English + Portuguese" },
  { value: "es,pt", label: "Spanish + Portuguese" },
];

export function CreateTrackForm() {
  const { form, update, submit, isCreating, glossaries } = useCreateTrackForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PlusCircle className="size-4" aria-hidden />
          Start a track
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label htmlFor="track-title">Track name</Label>
            <Input
              id="track-title"
              placeholder="Track A — Keynote"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="media-source">
              Audio source <span className="text-muted-foreground">— YouTube or media URL</span>
            </Label>
            <Input
              id="media-source"
              type="url"
              placeholder="https://www.youtube.com/watch?v=…  (leave empty to stream audio yourself)"
              value={form.mediaSource}
              onChange={(event) => update("mediaSource", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="spoken">Spoken</Label>
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="subtitles">Subtitles</Label>
            <Select
              value={form.subtitleLanguages}
              onValueChange={(value) => update("subtitleLanguages", value)}
            >
              <SelectTrigger id="subtitles" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBTITLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="glossary">Glossary</Label>
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

          <Button type="submit" disabled={isCreating} className="w-full lg:col-span-5 xl:w-auto">
            {isCreating ? "Starting…" : "Start track"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
