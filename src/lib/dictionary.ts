/**
 * 5th-grade friendly dictionary for instant inline word definitions
 */
export const DICTIONARY_5TH_GRADE: Record<string, { definition: string; phonetic?: string; example?: string }> = {
  neuroscience: {
    phonetic: 'noor-oh-SY-ens',
    definition: 'The study of the brain and how it helps us think, feel, and move.',
    example: 'Neuroscience helps doctors understand how we learn.',
  },
  cognitive: {
    phonetic: 'KOG-nih-tiv',
    definition: 'Related to thinking, understanding, remembering, and learning.',
    example: 'Reading is a complex cognitive workout for your brain.',
  },
  fusiform: {
    phonetic: 'FYOO-zih-form',
    definition: 'A spindle-shaped fold in the brain that recognizes faces and words.',
    example: 'The fusiform gyrus spots letter shapes in a fraction of a second.',
  },
  gyrus: {
    phonetic: 'JY-rus',
    definition: 'A ridge or bump on the surface of your brain.',
    example: 'Folds and gyri give your brain more surface area to think.',
  },
  saccadic: {
    phonetic: 'suh-KAD-ik',
    definition: 'Quick, jumping eye movements you make when reading or looking around.',
    example: 'Your eyes take tiny saccadic jumps across each line of text.',
  },
  phonological: {
    phonetic: 'foh-nuh-LOJ-ih-kul',
    definition: 'Having to do with the sounds that make up spoken words.',
    example: 'Beginning readers use phonological skills to sound out new words.',
  },
  orthographic: {
    phonetic: 'or-thuh-GRAF-ik',
    definition: 'Related to the correct spelling and visual shape of written words.',
    example: 'Orthographic memory helps you recognize whole words instantly.',
  },
  dyslexia: {
    phonetic: 'dis-LEK-see-uh',
    definition: 'A brain difference that makes connecting letters and word sounds trickier, but doesn\'t affect intelligence.',
    example: 'Many brilliant scientists and artists have dyslexia.',
  },
  compensatory: {
    phonetic: 'kum-PEN-suh-tor-ee',
    definition: 'Extra methods or tricks used to overcome a challenge.',
    example: 'Listening to audiobooks is a helpful compensatory reading tool.',
  },
  democratize: {
    phonetic: 'dih-MOK-ruh-tyz',
    definition: 'To make something open, affordable, and available to everyone.',
    example: 'Accessible web tools democratize learning.',
  },
  synthesis: {
    phonetic: 'SIN-thuh-sis',
    definition: 'Putting different ideas or things together into a single clear whole.',
    example: 'A summary is a synthesis of the main ideas.',
  },
  saccade: {
    phonetic: 'suh-KAHD',
    definition: 'A rapid movement of the eye between fixation points.',
  },
  lexile: {
    phonetic: 'LEK-syl',
    definition: 'A score that measures how easy or hard a text is to read.',
  },
  phoneme: {
    phonetic: 'FOH-neem',
    definition: 'A single basic sound in a language, like "b" or "sh".',
  },
  fixation: {
    phonetic: 'fik-SAY-shun',
    definition: 'Pausing your eye on a word to read it before jumping forward.',
  },
  comprehension: {
    phonetic: 'kom-pree-HEN-shun',
    definition: 'The ability to understand what you are reading or hearing.',
  },
  photophobia: {
    phonetic: 'foh-toh-FOH-bee-uh',
    definition: 'Extreme sensitivity to bright light or glaring screens.',
  },
  neurodivergent: {
    phonetic: 'noor-oh-dy-VER-jent',
    definition: 'Having a brain that processes information differently, like ADHD, autism, or dyslexia.',
  },
  accessibility: {
    phonetic: 'ak-ses-uh-BIL-uh-tee',
    definition: 'Designing things so that everyone, including people with disabilities, can use them easily.',
  },
};

export function lookupWord(rawWord: string): { word: string; definition: string; phonetic?: string; example?: string } | null {
  const clean = rawWord.toLowerCase().replace(/[^a-z0-9\-]/g, '').trim();
  if (!clean || clean.length < 3) return null;

  // Direct match
  if (DICTIONARY_5TH_GRADE[clean]) {
    return { word: clean, ...DICTIONARY_5TH_GRADE[clean] };
  }

  // Singular form match (e.g. "pathways" -> "pathway")
  if (clean.endsWith('ies') && DICTIONARY_5TH_GRADE[clean.slice(0, -3) + 'y']) {
    const root = clean.slice(0, -3) + 'y';
    return { word: clean, ...DICTIONARY_5TH_GRADE[root] };
  }
  if (clean.endsWith('s') && DICTIONARY_5TH_GRADE[clean.slice(0, -1)]) {
    const root = clean.slice(0, -1);
    return { word: clean, ...DICTIONARY_5TH_GRADE[root] };
  }
  if (clean.endsWith('ing') && DICTIONARY_5TH_GRADE[clean.slice(0, -3)]) {
    const root = clean.slice(0, -3);
    return { word: clean, ...DICTIONARY_5TH_GRADE[root] };
  }

  return null;
}
