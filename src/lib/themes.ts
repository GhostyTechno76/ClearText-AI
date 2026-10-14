export type ThemeKey = 'light' | 'dark' | 'high-contrast' | 'sepia';

export interface ThemeConfig {
  name: string;
  bg: string;
  text: string;
  accent: string;
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
    accent: '#3b82f6',
    card: '#f8fafc',
    border: '#e2e8f0',
    secondaryText: '#64748b',
    buttonBg: '#3b82f6',
    buttonText: '#ffffff',
    inputBg: '#f1f5f9',
    highlightBg: '#dbeafe',
  },
  dark: {
    name: 'Dark',
    bg: '#0f172a',
    text: '#e2e8f0',
    accent: '#60a5fa',
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
    card: '#1a1a00',
    border: '#ffff00',
    secondaryText: '#cccc00',
    buttonBg: '#ffff00',
    buttonText: '#000000',
    inputBg: '#1a1a00',
    highlightBg: '#333300',
  },
  sepia: {
    name: 'Sepia',
    bg: '#f4ecd8',
    text: '#5c4033',
    accent: '#8b6914',
    card: '#efe3c8',
    border: '#d4c4a0',
    secondaryText: '#7a6652',
    buttonBg: '#8b6914',
    buttonText: '#ffffff',
    inputBg: '#efe3c8',
    highlightBg: '#e0d4b8',
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
