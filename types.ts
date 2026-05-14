
export enum ClockMode {
  DIGITAL = 'DIGITAL',
  ANALOG = 'ANALOG',
  DUAL = 'DUAL',
}

export enum ThemeId {
  MINIMAL_DARK = 'MINIMAL_DARK',
  MINIMAL_LIGHT = 'MINIMAL_LIGHT',
  NEON_CYBERPUNK = 'NEON_CYBERPUNK',
  FOREST_GLASS = 'FOREST_GLASS',
  TERMINAL_RETRO = 'TERMINAL_RETRO'
}

export enum ParticleMode {
  NONE = 'NONE',
  SNOW = 'SNOW',
  STARS = 'STARS',
  RAIN = 'RAIN',
  MATRIX = 'MATRIX'
}

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  fontFamily: string; // Tailwind class like 'font-sans'
  backgroundImage?: string;
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  period: 'AM' | 'PM';
  fullDate: string;
}

export type AIProvider = 'gemini' | 'modelscope' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ElementConfig {
  id: string;
  x: number;        // X offset from center (percentage)
  y: number;        // Y offset from center (percentage)
  scale: number;    // Scale factor
  rotation: number; // Rotation in degrees
  zIndex: number;   // Layer order (higher = on top)
  visible: boolean; // Whether visible
  opacity: number;  // Opacity (0-1)
  customColor: string | null; // Element-specific color
}

export interface LayoutConfig {
  digitalClock: ElementConfig;
  analogClock: ElementConfig;
  dateLine: ElementConfig;
}
