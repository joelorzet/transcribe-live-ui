"use client";

import { FilterLines, SearchLg, XClose } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languageLabel, type Language, type SpokenLanguage } from "@/models/language.model";
import type { SourceKind, TrackFilters } from "@/models/filters.model";
import type { TrackStatus } from "@/models/track.model";

interface Option {
  value: string;
  label: string;
}

interface TrackFiltersBarProps {
  filters: TrackFilters;
  update: <K extends keyof TrackFilters>(key: K, value: TrackFilters[K]) => void;
  reset: () => void;
  isFiltered: boolean;
  inputLanguages: SpokenLanguage[];
  outputLanguages: Language[];
  shown: number;
  total: number;
}

const STATUS_OPTIONS: Option[] = [
  { value: "live", label: "Live" },
  { value: "starting", label: "Starting" },
  { value: "ended", label: "Ended" },
  { value: "error", label: "Error" },
];

const SOURCE_OPTIONS: Option[] = [
  { value: "rtmp", label: "OBS push" },
  { value: "pull", label: "Pulled URL" },
  { value: "none", label: "No source" },
];

function FilterGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: Option[];
  value: string;
  onSelect: (next: string) => void;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{label}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function FilterChip({ label, value, onClear }: { label: string; value: string; onClear: () => void }) {
  return (
    <Badge variant="outline" className="gap-1.5 py-1 pr-1 pl-2.5 text-xs font-normal">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
      <button
        type="button"
        aria-label={`Clear ${label} filter`}
        onClick={onClear}
        className="hover:bg-muted cursor-pointer rounded p-0.5 transition-colors"
      >
        <XClose className="size-3" aria-hidden />
      </button>
    </Badge>
  );
}

export function TrackFiltersBar({
  filters,
  update,
  reset,
  isFiltered,
  inputLanguages,
  outputLanguages,
  shown,
  total,
}: TrackFiltersBarProps) {
  const inputOptions: Option[] = inputLanguages.map((code) => ({
    value: code,
    label: code === "auto" ? "Auto-detect" : languageLabel(code),
  }));
  const outputOptions: Option[] = outputLanguages.map((code) => ({
    value: code,
    label: languageLabel(code),
  }));

  const labelFor = (options: Option[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-52 flex-1">
        <SearchLg
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
          aria-hidden
        />
        <Input
          aria-label="Search sources by name"
          placeholder="Search sources"
          className="h-9 pl-9 text-sm"
          value={filters.query}
          onChange={(event) => update("query", event.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <FilterLines className="size-3.5" aria-hidden /> Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <FilterGroup
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onSelect={(next) => update("status", next as TrackStatus | "all")}
          />
          <FilterGroup
            label="Input language"
            options={inputOptions}
            value={filters.inputLanguage}
            onSelect={(next) => update("inputLanguage", next as SpokenLanguage | "all")}
          />
          <FilterGroup
            label="Output language"
            options={outputOptions}
            value={filters.outputLanguage}
            onSelect={(next) => update("outputLanguage", next as Language | "all")}
          />
          <FilterGroup
            label="Source"
            options={SOURCE_OPTIONS}
            value={filters.sourceKind}
            onSelect={(next) => update("sourceKind", next as SourceKind | "all")}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {filters.status !== "all" ? (
        <FilterChip
          label="Status"
          value={labelFor(STATUS_OPTIONS, filters.status)}
          onClear={() => update("status", "all")}
        />
      ) : null}
      {filters.inputLanguage !== "all" ? (
        <FilterChip
          label="Input"
          value={labelFor(inputOptions, filters.inputLanguage)}
          onClear={() => update("inputLanguage", "all")}
        />
      ) : null}
      {filters.outputLanguage !== "all" ? (
        <FilterChip
          label="Output"
          value={labelFor(outputOptions, filters.outputLanguage)}
          onClear={() => update("outputLanguage", "all")}
        />
      ) : null}
      {filters.sourceKind !== "all" ? (
        <FilterChip
          label="Source"
          value={labelFor(SOURCE_OPTIONS, filters.sourceKind)}
          onClear={() => update("sourceKind", "all")}
        />
      ) : null}

      {isFiltered ? (
        <>
          <span className="text-muted-foreground font-mono text-xs">
            {shown} of {total}
          </span>
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear all
          </Button>
        </>
      ) : null}
    </div>
  );
}
