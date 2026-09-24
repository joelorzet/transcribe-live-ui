export interface EventTotals {
  liveInputs: number;
  totalInputs: number;
  totalOutputs: number;
  words: number;
  audioSeconds: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  audioUsd: number;
  translationUsd: number;
  costUsd: number;
}

export const EMPTY_TOTALS: EventTotals = {
  liveInputs: 0,
  totalInputs: 0,
  totalOutputs: 0,
  words: 0,
  audioSeconds: 0,
  latencyP50Ms: 0,
  latencyP95Ms: 0,
  audioUsd: 0,
  translationUsd: 0,
  costUsd: 0,
};
