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
  glowColor?: string;
  glassBackdrop?: string;
}

export const themes: Record<ThemeKey, ThemeConfig> = {
  light: {
    name: 'Paper Light',
    bg: '#FAF8F5',
    text: '#1F2328',
    accent: '#2563EB',
    accentText: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E6E2DA',
    secondaryText: '#475467',
    buttonBg: '#1F2328',
    buttonText: '#FFFFFF',
    inputBg: '#F3EFEA',
    highlightBg: '#EBF3FE',
    glowColor: 'rgba(37, 99, 235, 0.15)',
    glassBackdrop: 'rgba(255, 255, 255, 0.85)',
  },
  dark: {
    name: 'Warm Obsidian',
    bg: '#121316',
    text: '#EDEDEC',
    accent: '#38BDF8',
    accentText: '#090D16',
    card: '#1A1C20',
    border: '#2A2D35',
    secondaryText: '#A8ABB4',
    buttonBg: '#38BDF8',
    buttonText: '#090D16',
    inputBg: '#16181C',
    highlightBg: '#1E293B',
    glowColor: 'rgba(56, 189, 248, 0.18)',
    glassBackdrop: 'rgba(26, 28, 32, 0.85)',
  },
  'high-contrast': {
    name: 'OLED Contrast',
    bg: '#000000',
    text: '#FACC15',
    accent: '#34D399',
    accentText: '#000000',
    card: '#0A0A0A',
    border: '#FACC15',
    secondaryText: '#34D399',
    buttonBg: '#FACC15',
    buttonText: '#000000',
    inputBg: '#111111',
    highlightBg: '#1F1E05',
    glowColor: 'rgba(250, 204, 21, 0.25)',
    glassBackdrop: 'rgba(10, 10, 10, 0.95)',
  },
  sepia: {
    name: 'Restorative Sepia',
    bg: '#F6EEDB',
    text: '#3C3226',
    accent: '#8B5A2B',
    accentText: '#FFFFFF',
    card: '#FBF5E8',
    border: '#ECE2CC',
    secondaryText: '#786650',
    buttonBg: '#8B5A2B',
    buttonText: '#FFFFFF',
    inputBg: '#EFE5CE',
    highlightBg: '#EFE2C6',
    glowColor: 'rgba(139, 90, 43, 0.18)',
    glassBackdrop: 'rgba(251, 245, 232, 0.88)',
  },
};

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: 'sans' | 'dyslexic';
  bionicReading: boolean;
  theme: ThemeKey;
  readingRuler: boolean;
}

export const defaultSettings: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  letterSpacing: 0.02,
  fontFamily: 'sans',
  bionicReading: false,
  theme: 'light',
  readingRuler: false,
};
