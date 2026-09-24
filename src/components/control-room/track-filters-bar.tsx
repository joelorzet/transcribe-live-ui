"use client";

import { FilterLines, SearchLg, XClose } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { languageLabel, type Language, type SpokenLanguage } from "@/models/language.model";
import { groupState, type FilterGroupKey, type SourceKind, type TrackFilters } from "@/models/filters.model";
import type { TrackStatus } from "@/models/track.model";

interface Option {
  value: string;
  label: string;
  dotClass?: string;
}

type CountFn = (value: string) => number;

interface TrackFiltersBarProps {
  filters: TrackFilters;
  setQuery: (query: string) => void;
  toggle: (group: FilterGroupKey, value: string) => void;
  clearGroup: (group: FilterGroupKey) => void;
  reset: () => void;
  isFiltered: boolean;
  inputLanguages: SpokenLanguage[];
  outputLanguages: Language[];
  counts: Record<FilterGroupKey, CountFn>;
  selectedCount: number;
  shown: number;
  total: number;
}

const STATUS_OPTIONS: Option[] = [
  { value: "live", label: "Live", dotClass: "bg-primary" },
  { value: "starting", label: "Starting", dotClass: "bg-sky-400" },
  { value: "ended", label: "Ended", dotClass: "bg-muted-foreground" },
  { value: "error", label: "Error", dotClass: "bg-destructive" },
];

const SOURCE_OPTIONS: Option[] = [
  { value: "rtmp", label: "OBS push", dotClass: "bg-violet-400" },
  { value: "pull", label: "Pulled URL", dotClass: "bg-amber-400" },
  { value: "none", label: "No source", dotClass: "bg-muted-foreground" },
];

function FilterSection({
  label,
  group,
  options,
  selected,
  count,
  toggle,
  clearGroup,
}: {
  label: string;
  group: FilterGroupKey;
  options: Option[];
  selected: string[];
  count: CountFn;
  toggle: (group: FilterGroupKey, value: string) => void;
  clearGroup: (group: FilterGroupKey) => void;
}) {
  if (options.length === 0) return null;

  return (
    <>
      <DropdownMenuCheckboxItem
        checked={groupState(selected, options.length)}
        onSelect={(event) => {
          event.preventDefault();
          clearGroup(group);
        }}
        className="font-medium"
      >
        {label}
        {selected.length > 0 ? (
          <span className="text-muted-foreground ml-auto pr-6 font-mono text-xs">
            {selected.length}
          </span>
        ) : null}
      </DropdownMenuCheckboxItem>

      {options.map((option) => (
        <DropdownMenuCheckboxItem
          key={option.value}
          checked={selected.includes(option.value)}
          onSelect={(event) => {
            event.preventDefault();
            toggle(group, option.value);
          }}
          className="pl-6"
        >
          {option.dotClass ? (
            <span className={cn("size-1.5 shrink-0 rounded-full", option.dotClass)} aria-hidden />
          ) : null}
          <span className="truncate">{option.label}</span>
          <span className="text-muted-foreground ml-auto pr-6 font-mono text-xs">
            {count(option.value)}
          </span>
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}

function FilterChip({
  label,
  values,
  onClear,
}: {
  label: string;
  values: string[];
  onClear: () => void;
}) {
  if (values.length === 0) return null;

  return (
    <Badge variant="outline" className="gap-1.5 py-1 pr-1 pl-2.5 text-xs font-normal">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {values.length <= 2 ? values.join(", ") : `${values.length} selected`}
      </span>
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
  setQuery,
  toggle,
  clearGroup,
  reset,
  isFiltered,
  inputLanguages,
  outputLanguages,
  counts,
  selectedCount,
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

  const labelsFor = (options: Option[], selected: string[]) =>
    selected.map((value) => options.find((option) => option.value === value)?.label ?? value);

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
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <FilterLines className="size-3.5" aria-hidden /> Filters
            {selectedCount > 0 ? (
              <span className="bg-primary/15 text-primary ml-1 rounded px-1.5 font-mono text-xs">
                {selectedCount}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-0">
          <div className="max-h-96 overflow-y-auto p-1">
            <FilterSection
              label="Status"
              group="statuses"
              options={STATUS_OPTIONS}
              selected={filters.statuses}
              count={counts.statuses}
              toggle={(group, value) => toggle(group, value as TrackStatus)}
              clearGroup={clearGroup}
            />
            <DropdownMenuSeparator />
            <FilterSection
              label="Input language"
              group="inputLanguages"
              options={inputOptions}
              selected={filters.inputLanguages}
              count={counts.inputLanguages}
              toggle={(group, value) => toggle(group, value as SpokenLanguage)}
              clearGroup={clearGroup}
            />
            <DropdownMenuSeparator />
            <FilterSection
              label="Output language"
              group="outputLanguages"
              options={outputOptions}
              selected={filters.outputLanguages}
              count={counts.outputLanguages}
              toggle={(group, value) => toggle(group, value as Language)}
              clearGroup={clearGroup}
            />
            <DropdownMenuSeparator />
            <FilterSection
              label="Source"
              group="sourceKinds"
              options={SOURCE_OPTIONS}
              selected={filters.sourceKinds}
              count={counts.sourceKinds}
              toggle={(group, value) => toggle(group, value as SourceKind)}
              clearGroup={clearGroup}
            />
          </div>

          <div className="text-muted-foreground flex items-center gap-2 border-t px-3 py-2 text-xs">
            <span>{selectedCount} selected</span>
            <div className="flex-1" />
            <button
              type="button"
              className="hover:text-foreground cursor-pointer transition-colors"
              onClick={reset}
            >
              Clear
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <FilterChip
        label="Status"
        values={labelsFor(STATUS_OPTIONS, filters.statuses)}
        onClear={() => clearGroup("statuses")}
      />
      <FilterChip
        label="Input"
        values={labelsFor(inputOptions, filters.inputLanguages)}
        onClear={() => clearGroup("inputLanguages")}
      />
      <FilterChip
        label="Output"
        values={labelsFor(outputOptions, filters.outputLanguages)}
        onClear={() => clearGroup("outputLanguages")}
      />
      <FilterChip
        label="Source"
        values={labelsFor(SOURCE_OPTIONS, filters.sourceKinds)}
        onClear={() => clearGroup("sourceKinds")}
      />

      {isFiltered ? (
        <span className="text-muted-foreground font-mono text-xs">
          {shown} of {total}
        </span>
      ) : null}
    </div>
  );
}
