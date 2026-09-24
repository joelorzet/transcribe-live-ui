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

  const params = new URLSearchParams({
    autoplay: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });

  return {
    provider: "youtube",
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`,
  };
}
