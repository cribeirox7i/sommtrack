import { useApp } from '../state/store';
import { Icon } from '../icons/Icon';
import { traduzir } from '../i18n/dict';
import { v } from '../theme/styles';

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export function HeaderBusca({ onFieldOptions }: { onFieldOptions?: { value: string; label: string }[] }) {
  const { state, patch } = useApp();
  const t = (k: string) => traduzir(state.idioma, k);
  const opcoes = onFieldOptions || [
    { value: 'all', label: t('searchAll') }, { value: 'name', label: t('name') },
    { value: 'manufacturer', label: t('manufacturer') }, { value: 'country', label: t('country') },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '14px 16px' }}>
      <input
        value={state.searchQuery}
        onChange={(e) => patch({ searchQuery: e.target.value })}
        placeholder={t('searchPlaceholder')}
        style={{
          flex: 1, padding: '10px 16px', borderRadius: 20, border: `1px solid ${v.border}`,
          background: v.surface, color: v.text, fontSize: 13, outline: 'none',
        }}
      />
      <select
        value={state.searchField}
        onChange={(e) => patch({ searchField: e.target.value })}
        style={{ padding: '9px 8px', borderRadius: 10, border: `1px solid ${v.border}`, background: v.surface, color: v.text, fontSize: 12 }}
      >
        {opcoes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <button
        onClick={() => patch({ tela: 'profile' })}
        style={{
          width: 38, height: 38, minWidth: 38, borderRadius: '50%', background: v.accentSoft, color: v.accent,
          border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}
      >
        {state.usuario ? iniciais(state.usuario.name) : '?'}
      </button>
    </div>
  );
}

export function HeaderVoltar({ titulo, telaVolta, onSalvar }: { titulo: string; telaVolta: 'home' | 'list'; onSalvar?: () => void }) {
  const { state, patch } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
      <button onClick={() => patch({ tela: telaVolta, isEditing: false })} style={{
        background: 'none', border: 'none', color: v.textMuted, fontWeight: 700, fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        ← {traduzir(state.idioma, 'back')}
      </button>
      {state.isEditing && onSalvar ? (
        <button onClick={onSalvar} style={{ background: 'none', border: 'none', color: v.accent, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
          {traduzir(state.idioma, 'save')}
        </button>
      ) : (
        <div style={{ fontSize: 16, fontWeight: 800, color: v.text }}>{titulo}</div>
      )}
      <div style={{ width: 40 }} />
    </div>
  );
}

export { Icon };
