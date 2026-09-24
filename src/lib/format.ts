export function formatLatency(ms: number): string {
  if (!ms) return "-";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function formatUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return "$0.00";
  if (usd >= 1) return `$${usd.toFixed(2)}`;

  const decimals = Math.min(8, Math.max(2, Math.ceil(-Math.log10(usd)) + 2));
  const trimmed = usd.toFixed(decimals).replace(/(\.\d\d)(\d*?)0+$/, "$1$2");
  return `$${trimmed}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}
