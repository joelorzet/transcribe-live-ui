export interface EngineInfo {
  isLive: boolean;
  label: string;
  transcriptionModel: string;
  translationModel: string;
  capacity: number;
  running: number;
}

export interface GlossaryOption {
  id: string;
  label: string;
  termCount: number;
}

export type ConnectionStatus = "connecting" | "connected" | "reconnecting";
