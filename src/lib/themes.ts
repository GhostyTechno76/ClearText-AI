export type ThemeKey = 'light' | 'dark' | 'high-contrast' | 'sepia';

export interface ThemeConfig {
  name: string;
  bg: string;
  text: string;
  accent: string;
  accentText: string;
  card: string;
  border: string;
  secondaryText: string;
  buttonBg: string;
  buttonText: string;
  inputBg: string;
  highlightBg: string;
}

export const themes: Record<ThemeKey, ThemeConfig> = {
  light: {
    name: 'Light',
    bg: '#ffffff',
    text: '#1a1a2e',
    accent: '#2563eb',
    accentText: '#ffffff',
    card: '#f8fafc',
    border: '#e2e8f0',
    secondaryText: '#64748b',
    buttonBg: '#2563eb',
    buttonText: '#ffffff',
    inputBg: '#f1f5f9',
    highlightBg: '#dbeafe',
  },
  dark: {
    name: 'Dark',
    bg: '#0f172a',
    text: '#e2e8f0',
    accent: '#3b82f6',
    accentText: '#ffffff',
    card: '#1e293b',
    border: '#334155',
    secondaryText: '#94a3b8',
    buttonBg: '#3b82f6',
    buttonText: '#ffffff',
    inputBg: '#1e293b',
    highlightBg: '#1e3a5f',
  },
  'high-contrast': {
    name: 'High Contrast',
    bg: '#000000',
    text: '#ffff00',
    accent: '#00ffff',
    accentText: '#000000',
    card: '#0a0a0a',
    border: '#ffff00',
    secondaryText: '#ffea00',
    buttonBg: '#ffff00',
    buttonText: '#000000',
    inputBg: '#141414',
    highlightBg: '#333300',
  },
  sepia: {
    name: 'Sepia',
    bg: '#f4ecd8',
    text: '#432818',
    accent: '#8b5a2b',
    accentText: '#ffffff',
    card: '#ede3c8',
    border: '#d7c7a5',
    secondaryText: '#705335',
    buttonBg: '#8b5a2b',
    buttonText: '#ffffff',
    inputBg: '#ede3c8',
    highlightBg: '#dfd2b2',
  },
};

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: 'sans' | 'dyslexic';
  bionicReading: boolean;
  theme: ThemeKey;
}

export const defaultSettings: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  letterSpacing: 0.02,
  fontFamily: 'sans',
  bionicReading: false,
  theme: 'light',
};
