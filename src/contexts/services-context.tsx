"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { HttpClient } from "@/lib/http-client";
import { apiBaseUrl, wsBaseUrl } from "@/lib/config";
import { SessionService } from "@/services/session.service";
import { GlossaryService } from "@/services/glossary.service";
import { HealthService } from "@/services/health.service";
import { TranscriptService } from "@/services/transcript.service";
import { RealtimeService } from "@/services/realtime.service";
import { IngestService } from "@/services/ingest.service";

export interface Services {
  sessions: SessionService;
  glossaries: GlossaryService;
  health: HealthService;
  transcripts: TranscriptService;
  realtime: RealtimeService;
  ingest: IngestService;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo<Services>(() => {
    const http = new HttpClient(apiBaseUrl);
    return {
      sessions: new SessionService(http),
      glossaries: new GlossaryService(http),
      health: new HealthService(http),
      transcripts: new TranscriptService(http),
      realtime: new RealtimeService(wsBaseUrl),
      ingest: new IngestService(http),
    };
  }, []);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error("useServices must be used inside a ServicesProvider");
  }
  return services;
}
