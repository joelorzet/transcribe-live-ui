"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useServices } from "@/contexts/services-context";
import type { ConnectionStatus } from "@/models/engine.model";
import type { TrackEvent } from "@/models/track-event.model";
import type { Caption, Track } from "@/models/track.model";

const MAX_HISTORY = 12;

export interface TrackView extends Caption {
  track: Track;
  interim: string;
  history: Caption[];
}

export type TrackViewMap = Record<string, TrackView>;

function emptyView(track: Track): TrackView {
  return { track, interim: "", original: "", translations: {}, history: [] };
}

function reduce(views: TrackViewMap, event: TrackEvent): TrackViewMap {
  if (event.kind === "tracks") {
    const next: TrackViewMap = {};
    for (const track of event.tracks) {
      const existing = views[track.id];
      next[track.id] = existing ? { ...existing, track } : emptyView(track);
    }
    return next;
  }

  if (event.kind === "track") {
    const existing = views[event.track.id];
    return {
      ...views,
      [event.track.id]: existing ? { ...existing, track: event.track } : emptyView(event.track),
    };
  }

  const current = views[event.trackId];
  if (!current) return views;

  if (event.kind === "interim") {
    return { ...views, [event.trackId]: { ...current, interim: event.text } };
  }

  if (event.kind === "final") {
    const history = current.original
      ? [{ original: current.original, translations: current.translations }, ...current.history].slice(
          0,
          MAX_HISTORY,
        )
      : current.history;

    return {
      ...views,
      [event.trackId]: { ...current, interim: "", original: event.text, translations: {}, history },
    };
  }

  return {
    ...views,
    [event.trackId]: {
      ...current,
      translations: { ...current.translations, [event.language]: event.text },
    },
  };
}

export interface TrackStream {
  views: TrackViewMap;
  list: TrackView[];
  status: ConnectionStatus;
  upsert: (track: Track) => void;
  remove: (trackId: string) => void;
}

export function useTrackStream(trackId: string | null = null): TrackStream {
  const { realtime } = useServices();
  const [views, setViews] = useState<TrackViewMap>({});
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(
    () =>
      realtime.subscribe(trackId, {
        onEvent: (event) => setViews((current) => reduce(current, event)),
        onStatusChange: setStatus,
      }),
    [realtime, trackId],
  );

  const list = useMemo(
    () => Object.values(views).sort((a, b) => b.track.createdAt - a.track.createdAt),
    [views],
  );

  const upsert = useCallback((track: Track) => {
    setViews((current) => ({
      ...current,
      [track.id]: current[track.id] ? { ...current[track.id], track } : emptyView(track),
    }));
  }, []);

  const remove = useCallback((trackId: string) => {
    setViews((current) => {
      const next = { ...current };
      delete next[trackId];
      return next;
    });
  }, []);

  return { views, list, status, upsert, remove };
}
