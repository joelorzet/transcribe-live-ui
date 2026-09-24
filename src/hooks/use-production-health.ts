"use client";

import { useMemo } from "react";
import { useControlRoom } from "@/contexts/control-room-context";
import { countReconnects, findIssues, type Issue, type IssueKind } from "@/models/health.model";

export function useProductionHealth() {
  const { tracks, engine, engineError } = useControlRoom();

  return useMemo(() => {
    const models = tracks.map((view) => view.track);
    const issues = findIssues(models);

    const byKind = issues.reduce<Record<IssueKind, Issue[]>>(
      (acc, issue) => {
        acc[issue.kind].push(issue);
        return acc;
      },
      { error: [], silent: [], waiting: [], slow: [] },
    );

    return {
      issues,
      byKind,
      reconnects: countReconnects(models),
      apiReachable: !engineError,
      engineIsLive: engine?.isLive ?? false,
      isHealthy: issues.length === 0 && !engineError,
    };
  }, [tracks, engine, engineError]);
}
