export interface EmbeddableVideo {
  provider: "youtube";
  id: string;
  embedUrl: string;
}

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"];

export function toEmbeddableVideo(source: string | undefined | null): EmbeddableVideo | null {
  if (!source) return null;

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return null;
  }

  if (!YOUTUBE_HOSTS.includes(url.hostname)) return null;

  const id = url.hostname.includes("youtu.be")
    ? url.pathname.slice(1)
    : (url.searchParams.get("v") ?? url.pathname.replace(/^\/(embed|live|shorts)\//, ""));

  if (!id || !/^[\w-]{6,20}$/.test(id)) return null;

  return { provider: "youtube", id, embedUrl: buildEmbedUrl(id) };
}

/**
 * Subtitles describe the point the server is transcribing, so the player has to
 * open there. Passing the offset in the embed URL aligns it on load, which is
 * far more dependable than driving the IFrame API and racing its readiness.
 */
export function buildEmbedUrl(videoId: string, startSeconds?: number): string {
  const params = new URLSearchParams({
    autoplay: "1",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });
  if (startSeconds !== undefined && startSeconds > 0) {
    params.set("start", String(Math.floor(startSeconds)));
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
