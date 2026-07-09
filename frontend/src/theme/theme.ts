import type { Modo, Paleta } from '../types';

// Hue em graus por paleta — mesma curva de lightness/chroma para todas, só rotaciona o hue.
// purple/pink adicionados para fechar as 7 paletas confirmadas no spec (green/blue/red/orange/yellow já existiam no protótipo).
export const HUES: Record<Paleta, number> = {
  green: 150, blue: 245, red: 22, orange: 55, yellow: 95, purple: 300, pink: 350,
};

export interface Theme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  trackBg: string;
  accent: string;
  accentSoft: string;
  danger: string;
}

export function buildTheme(paleta: Paleta, modo: Modo): Theme {
  const h = HUES[paleta];
  const dark = modo === 'dark';
  return {
    bg: dark ? `oklch(17% 0.012 ${h})` : `oklch(98% 0.006 ${h})`,
    surface: dark ? `oklch(22% 0.014 ${h})` : `oklch(100% 0 0)`,
    text: dark ? `oklch(95% 0.01 ${h})` : `oklch(22% 0.02 ${h})`,
    textMuted: dark ? `oklch(70% 0.02 ${h})` : `oklch(48% 0.02 ${h})`,
    border: dark ? `oklch(32% 0.02 ${h})` : `oklch(90% 0.012 ${h})`,
    trackBg: dark ? `oklch(30% 0.02 ${h})` : `oklch(92% 0.012 ${h})`,
    accent: `oklch(58% 0.13 ${h})`,
    accentSoft: dark ? `oklch(30% 0.05 ${h})` : `oklch(93% 0.03 ${h})`,
    danger: `oklch(55% 0.14 25)`,
  };
}

export function aplicarThemeNoDocumento(theme: Theme) {
  const root = document.documentElement.style;
  Object.entries(theme).forEach(([k, v]) => root.setProperty(`--${k}`, v));
}
