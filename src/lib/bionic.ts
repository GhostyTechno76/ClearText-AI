/**
 * Bionic Reading utility
 * Splits words and wraps the first 40-50% of characters in <strong> tags
 * to guide the eye and improve reading speed.
 */

/**
 * Safely escapes HTML special characters to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getBionicSplitIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return len;
  if (len <= 3) return Math.ceil(len * 0.5);
  return Math.ceil(len * 0.4);
}

export function bionicWord(word: string): string {
  if (!word.trim()) return escapeHtml(word);

  // Preserve leading/trailing punctuation & symbols
  const match = word.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
  if (!match) return escapeHtml(word);

  const [, leading, core, trailing] = match;
  if (!core) return escapeHtml(word);

  const splitIdx = getBionicSplitIndex(core);
  const bold = core.slice(0, splitIdx);
  const rest = core.slice(splitIdx);

  return `${escapeHtml(leading)}<strong class="bionic-bold">${escapeHtml(bold)}</strong>${escapeHtml(rest)}${escapeHtml(trailing)}`;
}

export function bionicParagraph(paragraph: string): string {
  if (!paragraph.trim()) return '';
  const words = paragraph.split(/\s+/);
  return words.map(bionicWord).join(' ');
}

export function bionicHTML(text: string): string {
  if (!text) return '';

  return text
    .split(/\n+/)
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      const isBullet = /^[•\-\*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
      const bionicContent = bionicParagraph(trimmed);
      if (isBullet) {
        return `<li class="my-1.5 list-disc pl-1">${bionicContent}</li>`;
      }
      return `<p class="mb-4">${bionicContent}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

export function plainTextToHTML(text: string): string {
  if (!text) return '';
  return text
    .split(/\n+/)
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      const isBullet = /^[•\-\*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
      const escaped = escapeHtml(trimmed);
      if (isBullet) {
        return `<li class="my-1.5 list-disc pl-1">${escaped}</li>`;
      }
      return `<p class="mb-4">${escaped}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Splits text into individual readable paragraphs for TTS and reading tracking.
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
