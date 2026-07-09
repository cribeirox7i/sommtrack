import { useApp } from '../state/store';
import { Icon } from '../icons/Icon';
import { traduzir } from '../i18n/dict';
import { v } from '../theme/styles';

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export function ProfileSwitcher({ onSwitch }: { onSwitch: (id: number | null) => void }) {
  const { state, patch } = useApp();
  if (!state.usuario || state.relac.length === 0) return null;

  const ativo = state.viewedProfileId;
  const perfilAtivo = ativo ? state.relac.find((u) => u.id === ativo) : null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => patch({ profileMenuOpen: !state.profileMenuOpen })}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px 2px 2px', borderRadius: 20,
          border: `1px solid ${ativo ? v.accent : v.border}`, background: ativo ? v.accentSoft : 'transparent', cursor: 'pointer',
        }}
      >
        <span style={{
          width: 26, height: 26, borderRadius: '50%', background: v.accentSoft, color: v.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800,
        }}>
          {perfilAtivo ? iniciais(perfilAtivo.name) : iniciais(state.usuario.name)}
        </span>
        <Icon name="chevronDown" size={14} color={v.textMuted} />
      </button>

      {state.profileMenuOpen && (
        <>
          <div onClick={() => patch({ profileMenuOpen: false })} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, minWidth: 190, background: v.surface, border: `1px solid ${v.border}`,
            borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.3)', zIndex: 160, padding: 6,
          }}>
            <button
              onClick={() => { onSwitch(null); patch({ profileMenuOpen: false }); }}
              style={linhaStyle(!ativo)}
            >
              <span style={avatarMiniStyle}>{iniciais(state.usuario.name)}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{state.usuario.name} · {traduzir(state.idioma, 'myProfile')}</span>
              {!ativo && <Icon name="check" size={14} color={v.accent} />}
            </button>
            {state.relac.map((u) => (
              <button key={u.id} onClick={() => { onSwitch(u.id); patch({ profileMenuOpen: false }); }} style={linhaStyle(ativo === u.id)}>
                <span style={avatarMiniStyle}>{iniciais(u.name)}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{u.name}</span>
                {ativo === u.id && <Icon name="check" size={14} color={v.accent} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const avatarMiniStyle = {
  width: 26, height: 26, borderRadius: '50%', background: 'var(--accentSoft)', color: 'var(--accent)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, flexShrink: 0,
} as const;

function linhaStyle(selecionado: boolean) {
  return {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 10,
    border: 'none', background: selecionado ? 'var(--accentSoft)' : 'transparent', cursor: 'pointer',
    fontSize: 12.5, fontWeight: 600, color: 'var(--text)', textAlign: 'left' as const,
  };
}
