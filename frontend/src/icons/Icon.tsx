export const ICON_PATHS: Record<string, string> = {
  home: 'M4 11 L12 4 L20 11 M6 9.5 V20 H18 V9.5',
  beer: 'M6 4 H15 V20 H6 Z M15 8 H18 A2 2 0 0 1 18 14 H15 M8 4 V2 M13 4 V2',
  wine: 'M7 3 H17 L15.3 11 A3.3 3.3 0 0 1 8.7 11 Z M12 11 V20 M8 20 H16',
  drink: 'M4 4 H20 L12 13 Z M12 13 V20 M8 20 H16',
  spirit: 'M10 3 H14 V7 L16.5 10.5 V20 H7.5 V10.5 L10 7 Z M9 14 H15',
  deck: 'M4 4 H15 V14 H4 Z M8 8 H20 V18 H8 Z',
  plus: 'M12 4 V20 M4 12 H20',
  chevronDown: 'M5 8 L12 15 L19 8',
  check: 'M4 12 L9 17 L20 6',
  table: 'M3 4 H21 V20 H3 Z M3 12 H21 M10 4 V20',
  gallery: 'M3 3 H10 V10 H3 Z M14 3 H21 V10 H14 Z M3 14 H10 V21 H3 Z M14 14 H21 V21 H14 Z',
  edit: 'M4 20 L4.7 16.6 L15.5 5.8 A2 2 0 0 1 18.3 5.8 L18.2 5.9 A2 2 0 0 1 18.2 8.7 L7.4 19.4 Z M14 7.5 L16.5 10',
  duplicate: 'M8 8 H18 V18 H8 Z M6 16 V6 H16',
  delete: 'M5 6 H19 M9 6 V4 H15 V6 M7 6 L8 20 H16 L17 6',
  share: 'M18 8 A2.5 2.5 0 1 0 15.6 5 A2.5 2.5 0 0 0 18 8 Z M6 14.5 A2.5 2.5 0 1 0 3.6 11.5 A2.5 2.5 0 0 0 6 14.5 Z M18 21 A2.5 2.5 0 1 0 15.6 18 A2.5 2.5 0 0 0 18 21 Z M8.2 13.2 L15.8 9.3 M8.2 12.8 L15.8 16.7',
  search: 'M11 4 A7 7 0 1 0 11 18 A7 7 0 0 0 11 4 Z M16.2 16.2 L21 21',
  close: 'M5 5 L19 19 M19 5 L5 19',
  zoomIn: 'M11 4 A7 7 0 1 0 11 18 A7 7 0 0 0 11 4 Z M16.2 16.2 L21 21 M11 8 V14 M8 11 H14',
  zoomOut: 'M11 4 A7 7 0 1 0 11 18 A7 7 0 0 0 11 4 Z M16.2 16.2 L21 21 M8 11 H14',
};

export const STAR_PATH = 'M12 2.5 L14.9 9.1 L22 9.8 L16.6 14.6 L18.2 21.5 L12 17.8 L5.8 21.5 L7.4 14.6 L2 9.8 L9.1 9.1 Z';

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2 }: { name: keyof typeof ICON_PATHS; size?: number; color?: string; strokeWidth?: number }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
