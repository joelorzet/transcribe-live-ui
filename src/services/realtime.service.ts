import type { ConnectionStatus } from "@/models/engine.model";
import type { TrackEvent } from "@/models/track-event.model";
import type { SessionEventDto } from "@/services/dto/api.dto";
import { TrackEventMapper } from "@/services/mappers/track-event.mapper";

const INITIAL_RETRY_MS = 500;
const MAX_RETRY_MS = 8000;

export interface RealtimeHandlers {
  onEvent: (event: TrackEvent) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export class RealtimeService {
  constructor(private readonly resolveWsUrl: () => string) {}

  subscribe(trackId: string | null, handlers: RealtimeHandlers): () => void {
    let socket: WebSocket | null = null;
    let retryMs = INITIAL_RETRY_MS;
    let retryTimer: ReturnType<typeof setTimeout>;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      const suffix = trackId ? `?sessionId=${encodeURIComponent(trackId)}` : "";
      socket = new WebSocket(`${this.resolveWsUrl()}/ws/view${suffix}`);

      socket.addEventListener("open", () => {
        retryMs = INITIAL_RETRY_MS;
        handlers.onStatusChange("connected");
      });

      socket.addEventListener("message", (message) => {
        const event = RealtimeService.parse(message.data as string);
        if (event) handlers.onEvent(event);
      });

      socket.addEventListener("close", () => {
        if (disposed) return;
        handlers.onStatusChange("reconnecting");
        retryTimer = setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
      });

      socket.addEventListener("error", () => socket?.close());
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
  }

  private static parse(raw: string): TrackEvent | null {
    try {
      return TrackEventMapper.fromDtoToModel(JSON.parse(raw) as SessionEventDto);
    } catch {
      return null;
    }
  }
}
