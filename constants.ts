import { ThemeId, ThemeConfig } from './types';

// 森林主题背景：优先使用 picsum.photos 在线随机图片，网络不可达时回退本地 SVG
// 每次会话随机 seed，刷新得到不同图片；同会话内不闪烁
const _forestSeed = Math.floor(Math.random() * 9999) + 1;
export const FOREST_BG_URL = `https://picsum.photos/seed/${_forestSeed}/1920/1080?grayscale&blur=2`;
export const FOREST_BG_FALLBACK = '/forest-bg.svg';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  [ThemeId.MINIMAL_DARK]: {
    id: ThemeId.MINIMAL_DARK,
    label: 'Midnight Void',
    bgClass: 'bg-neutral-900',
    textClass: 'text-neutral-200',
    accentClass: 'text-neutral-500',
    fontFamily: 'font-sans',
  },
  [ThemeId.MINIMAL_LIGHT]: {
    id: ThemeId.MINIMAL_LIGHT,
    label: 'Paper White',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-800',
    accentClass: 'text-stone-400',
    fontFamily: 'font-serif',
  },
  [ThemeId.NEON_CYBERPUNK]: {
    id: ThemeId.NEON_CYBERPUNK,
    label: 'Cyberpunk Neon',
    bgClass: 'bg-black',
    textClass: 'text-fuchsia-400 drop-shadow-[0_0_15px_rgba(192,38,211,0.8)]',
    accentClass: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    fontFamily: 'font-mono',
  },
  [ThemeId.FOREST_GLASS]: {
    id: ThemeId.FOREST_GLASS,
    label: 'Misty Forest',
    bgClass: 'bg-slate-900',
    textClass: 'text-white drop-shadow-md',
    accentClass: 'text-emerald-300',
    fontFamily: 'font-sans',
    backgroundImage: FOREST_BG_URL
  },
  [ThemeId.TERMINAL_RETRO]: {
    id: ThemeId.TERMINAL_RETRO,
    label: 'Retro Terminal',
    bgClass: 'bg-green-950',
    textClass: 'text-green-500',
    accentClass: 'text-green-700',
    fontFamily: 'font-mono',
  }
};

export const FONT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Modern', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: 'Slab', value: '"Rockwell", "Courier Bold", "Courier", Georgia, Times, serif' },
];

export interface ColorPreset {
  label: string;
  value: string; // CSS value (hex or linear-gradient)
  type: 'solid' | 'gradient';
  svgStops?: Array<{ offset: string; color: string }>; // For SVG gradients in Analog clock
}

export const COLOR_PRESETS: ColorPreset[] = [
  // Solids
  { label: 'White', value: '#ffffff', type: 'solid' },
  { label: 'Warm', value: '#fb923c', type: 'solid' },
  { label: 'Rose', value: '#f43f5e', type: 'solid' },
  { label: 'Purple', value: '#c084fc', type: 'solid' },
  { label: 'Blue', value: '#60a5fa', type: 'solid' },
  { label: 'Teal', value: '#2dd4bf', type: 'solid' },
  { label: 'Green', value: '#4ade80', type: 'solid' },
  
  // Gradients
  { 
    label: 'Sunset', 
    value: 'linear-gradient(to right, #ff9966, #ff5e62)', 
    type: 'gradient',
    svgStops: [{ offset: '0%', color: '#ff9966' }, { offset: '100%', color: '#ff5e62' }]
  },
  { 
    label: 'Ocean', 
    value: 'linear-gradient(to right, #2193b0, #6dd5ed)', 
    type: 'gradient',
    svgStops: [{ offset: '0%', color: '#2193b0' }, { offset: '100%', color: '#6dd5ed' }]
  },
  { 
    label: 'Berry', 
    value: 'linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)', 
    type: 'gradient',
    svgStops: [{ offset: '0%', color: '#833ab4' }, { offset: '50%', color: '#fd1d1d' }, { offset: '100%', color: '#fcb045' }]
  },
  { 
    label: 'Aurora', 
    value: 'linear-gradient(to right, #00c6ff, #0072ff)', 
    type: 'gradient',
    svgStops: [{ offset: '0%', color: '#00c6ff' }, { offset: '100%', color: '#0072ff' }]
  },
  { 
    label: 'Lush', 
    value: 'linear-gradient(to right, #11998e, #38ef7d)', 
    type: 'gradient',
    svgStops: [{ offset: '0%', color: '#11998e' }, { offset: '100%', color: '#38ef7d' }]
  },
  { 
    label: 'Gold', 
    value: 'linear-gradient(to right, #FDC830, #F37335)', 
    type: 'gradient',
    svgStops: [{ offset: '0%', color: '#FDC830' }, { offset: '100%', color: '#F37335' }]
  }
];