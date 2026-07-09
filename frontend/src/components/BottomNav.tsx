import { useApp } from '../state/store';
import { carregarDashboard } from '../state/actions';
import { Icon } from '../icons/Icon';
import { traduzir } from '../i18n/dict';
import { v } from '../theme/styles';
import type { TipoItem } from '../types';

const ABAS: { tipo: TipoItem | 'home'; icon: 'home' | 'beer' | 'wine' | 'drink' | 'spirit'; label: string }[] = [
  { tipo: 'home', icon: 'home', label: 'home' },
  { tipo: 'beer', icon: 'beer', label: 'beers' },
  { tipo: 'wine', icon: 'wine', label: 'wines' },
  { tipo: 'drink', icon: 'drink', label: 'drinks' },
  { tipo: 'dest', icon: 'spirit', label: 'spirits' },
];

export function BottomNav() {
  const { state, patch } = useApp();
  const ativa = state.tela === 'home' ? 'home' : state.tela === 'list' ? state.listType : '';

  function irPara(tipo: TipoItem | 'home') {
    if (tipo === 'home') {
      patch({ tela: 'home' });
      carregarDashboard(patch);
    } else {
      patch({ tela: 'list', listType: tipo, searchQuery: '', filterCategory: 'all' });
    }
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto', display: 'flex', background: v.surface,
      borderTop: `1px solid ${v.border}`, paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100,
    }}>
      {ABAS.map((aba) => {
        const ativo = ativa === aba.tipo;
        return (
          <button key={aba.tipo} onClick={() => irPara(aba.tipo)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '8px 0 6px', background: 'none', border: 'none', cursor: 'pointer',
            color: ativo ? v.accent : v.textMuted,
          }}>
            <Icon name={aba.icon} size={22} />
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{traduzir(state.idioma, aba.label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
