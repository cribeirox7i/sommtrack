import type { CSSProperties } from 'react';

export const v = {
  bg: 'var(--bg)', surface: 'var(--surface)', text: 'var(--text)', textMuted: 'var(--textMuted)',
  border: 'var(--border)', trackBg: 'var(--trackBg)', accent: 'var(--accent)', accentSoft: 'var(--accentSoft)',
  danger: 'var(--danger)',
};

export const pageStyle: CSSProperties = {
  minHeight: '100vh', background: v.bg, color: v.text, fontFamily: "'Manrope', sans-serif",
};

export const cardStyle: CSSProperties = {
  background: v.surface, border: `1px solid ${v.border}`, borderRadius: 14, padding: 16,
};

export const inputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 11,
  border: `1px solid ${v.border}`, background: v.surface, color: v.text, fontSize: 14, marginBottom: 12, outline: 'none',
};

export const fieldLabelStyle: CSSProperties = {
  fontSize: 12, fontWeight: 700, color: v.textMuted, marginBottom: 6, display: 'block',
};

export const primaryButtonStyle: CSSProperties = {
  width: '100%', padding: '13px 0', borderRadius: 11, border: 'none', background: v.accent,
  color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
};

export const ghostButtonStyle: CSSProperties = {
  padding: '10px 16px', borderRadius: 11, border: `1px solid ${v.border}`, background: 'transparent',
  color: v.text, fontWeight: 700, fontSize: 13, cursor: 'pointer',
};

export const dangerButtonStyle: CSSProperties = {
  ...ghostButtonStyle, border: `1px solid ${v.danger}`, color: v.danger,
};

export const linkButtonStyle: CSSProperties = {
  background: 'none', border: 'none', color: v.accent, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: 0,
};

export const miniIconButtonStyle: CSSProperties = {
  width: 38, height: 38, borderRadius: 10, border: `1px solid ${v.border}`, background: v.surface,
  color: v.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

export const chipStyle = (tone: 'ok' | 'warn' | 'muted' = 'muted'): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999,
  fontSize: 11, fontWeight: 700,
  background: tone === 'ok' ? v.accentSoft : tone === 'warn' ? 'oklch(55% 0.14 25 / 0.15)' : v.trackBg,
  color: tone === 'ok' ? v.accent : tone === 'warn' ? v.danger : v.textMuted,
});

export const toastStyle: CSSProperties = {
  position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: v.surface,
  border: `1px solid ${v.border}`, borderRadius: 11, padding: '10px 18px', fontSize: 13, fontWeight: 600,
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 200, color: v.text,
};

export const modalOverlayStyle: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', zIndex: 300, padding: 20,
};

export const modalCardStyle: CSSProperties = {
  ...cardStyle, width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
};

export const placeholderImageStyle = (aspect?: string): CSSProperties => ({
  width: '100%', aspectRatio: aspect || '4 / 3', borderRadius: 12,
  background: `repeating-linear-gradient(45deg, ${v.accentSoft}, ${v.accentSoft} 10px, ${v.border} 10px, ${v.border} 20px)`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 8,
  fontFamily: 'monospace', fontSize: 11, color: v.textMuted, overflow: 'hidden',
});
