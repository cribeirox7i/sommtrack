import type { ReactNode } from 'react';
import { useApp } from '../../state/store';
import { traduzir } from '../../i18n/dict';
import { v } from '../../theme/styles';
import type { Idioma } from '../../types';

const IDIOMAS: { valor: Idioma; label: string }[] = [
  { valor: 'pt', label: 'PT' }, { valor: 'en', label: 'EN' }, { valor: 'es', label: 'ES' },
];

export function AuthChrome({ children }: { children: ReactNode }) {
  const { state, patch } = useApp();
  return (
    <div className="auth-frame">
      <div className="auth-phone" style={{ background: v.bg, padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: v.accentSoft }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: v.text }}>SommTrack</div>
          <div style={{ fontSize: 13, color: v.textMuted }}>{traduzir(state.idioma, 'tagline')}</div>
        </div>

        {children}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 28 }}>
          {IDIOMAS.map((op) => (
            <button
              key={op.valor}
              onClick={() => patch({ idioma: op.valor })}
              style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${state.idioma === op.valor ? v.accent : v.border}`,
                background: state.idioma === op.valor ? v.accentSoft : 'transparent',
                color: state.idioma === op.valor ? v.accent : v.textMuted,
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
