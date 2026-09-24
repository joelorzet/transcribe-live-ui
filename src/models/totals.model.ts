export interface EventTotals {
  liveTracks: number;
  words: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  costUsd: number;
}

export const EMPTY_TOTALS: EventTotals = {
  liveTracks: 0,
  words: 0,
  latencyP50Ms: 0,
  latencyP95Ms: 0,
  costUsd: 0,
};
