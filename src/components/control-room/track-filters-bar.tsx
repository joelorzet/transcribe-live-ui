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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languageLabel, type Language, type SpokenLanguage } from "@/models/language.model";
import { groupState, type FilterGroupKey, type SourceKind, type TrackFilters } from "@/models/filters.model";
import type { TrackStatus } from "@/models/track.model";

interface Option {
  value: string;
  label: string;
}

interface TrackFiltersBarProps {
  filters: TrackFilters;
  setQuery: (query: string) => void;
  toggle: (group: FilterGroupKey, value: string) => void;
  clearGroup: (group: FilterGroupKey) => void;
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
  selected,
  onToggle,
  onSelectAll,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  onSelectAll: () => void;
}) {
  if (options.length === 0) return null;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {label}
        {selected.length > 0 ? (
          <span className="text-muted-foreground ml-auto pl-3 font-mono text-xs">
            {selected.length}
          </span>
        ) : null}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-72 w-48 overflow-y-auto">
        <DropdownMenuCheckboxItem
          checked={groupState(selected, options.length)}
          onSelect={(event) => {
            event.preventDefault();
            onSelectAll();
          }}
        >
          All
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onSelect={(event) => {
              event.preventDefault();
              onToggle(option.value);
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
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
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <FilterGroup
            label="Status"
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onToggle={(value) => toggle("statuses", value as TrackStatus)}
            onSelectAll={() => clearGroup("statuses")}
          />
          <FilterGroup
            label="Input"
            options={inputOptions}
            selected={filters.inputLanguages}
            onToggle={(value) => toggle("inputLanguages", value as SpokenLanguage)}
            onSelectAll={() => clearGroup("inputLanguages")}
          />
          <FilterGroup
            label="Output"
            options={outputOptions}
            selected={filters.outputLanguages}
            onToggle={(value) => toggle("outputLanguages", value as Language)}
            onSelectAll={() => clearGroup("outputLanguages")}
          />
          <FilterGroup
            label="Source"
            options={SOURCE_OPTIONS}
            selected={filters.sourceKinds}
            onToggle={(value) => toggle("sourceKinds", value as SourceKind)}
            onSelectAll={() => clearGroup("sourceKinds")}
          />
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
