const SENTENCE_BOUNDARY = /(?<=[.!?…])\s+/;

export function toDisplayCaption(text: string, maxChars = 170): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;

  const sentences = trimmed.split(SENTENCE_BOUNDARY);
  const kept: string[] = [];
  let length = 0;

  for (let index = sentences.length - 1; index >= 0; index -= 1) {
    const sentence = sentences[index];
    if (kept.length > 0 && length + sentence.length > maxChars) break;
    kept.unshift(sentence);
    length += sentence.length + 1;
  }

  const result = kept.join(" ").trim();
  return result.length <= maxChars ? result : `…${result.slice(-maxChars)}`;
}
