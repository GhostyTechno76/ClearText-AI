/**
 * Bionic Reading utility
 * Splits words and wraps the first 40-50% of characters in <strong> tags
 * to guide the eye and improve reading speed.
 */

export function getBionicSplitIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return len;
  if (len <= 3) return Math.ceil(len * 0.5);
  return Math.ceil(len * 0.4);
}

export function bionicWord(word: string): string {
  if (!word.trim()) return word;
  
  // Preserve leading/trailing punctuation
  const match = word.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
  if (!match) return word;
  
  const [, leading, core, trailing] = match;
  if (!core) return word;
  
  const splitIdx = getBionicSplitIndex(core);
  const bold = core.slice(0, splitIdx);
  const rest = core.slice(splitIdx);
  
  return `${leading}<strong class="bionic-bold">${bold}</strong>${rest}${trailing}`;
}

export function bionicHTML(text: string): string {
  if (!text) return '';
  
  // Split into paragraphs
  return text
    .split(/\n+/)
    .map(paragraph => {
      if (!paragraph.trim()) return '';
      const words = paragraph.split(/\s+/);
      const bionicWords = words.map(bionicWord);
      return `<p>${bionicWords.join(' ')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

export function plainTextToHTML(text: string): string {
  if (!text) return '';
  return text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('\n');
}
