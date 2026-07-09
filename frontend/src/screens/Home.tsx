import { useEffect, useState } from 'react';
import { useApp } from '../state/store';
import { chamarApi } from '../api/client';
import { carregarDashboard } from '../state/actions';
import { traduzir } from '../i18n/dict';
import { HeaderBusca } from '../components/Header';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Icon } from '../icons/Icon';
import { cardStyle, v } from '../theme/styles';
import { nomeItem, produtorItem, imgUrlItem, ICONE_TIPO, ROTULO_TIPO } from '../utils/itemFields';
import type { AnyItem, TipoItem } from '../types';

export function HomeScreen() {
  const { state, patch } = useApp();
  const [indiceCarrossel, setIndiceCarrossel] = useState(0);
  const [resultados, setResultados] = useState<(AnyItem & { tipo: TipoItem; paisNome: string })[] | null>(null);
  const t = (k: string) => traduzir(state.idioma, k);

  const destaques = state.dashboard?.destaques || [];

  // Auto-suficiente independente de como se chegou aqui (ex.: botão "Voltar" do Perfil/Stats).
  useEffect(() => {
    if (!state.dashboard) carregarDashboard(patch);
  }, [state.dashboard]);

  useEffect(() => {
    if (destaques.length <= 1) return;
    const id = setInterval(() => setIndiceCarrossel((i) => (i + 1) % destaques.length), 4000);
    return () => clearInterval(id);
  }, [destaques.length]);

  useEffect(() => {
    const termo = state.searchQuery.trim();
    if (!termo) { setResultados(null); return; }
    const id = setTimeout(async () => {
      try {
        const r = await chamarApi<(AnyItem & { tipo: TipoItem; paisNome: string })[]>('busca.global', { query: termo });
        setResultados(r);
      } catch { setResultados([]); }
    }, 250);
    return () => clearTimeout(id);
  }, [state.searchQuery]);

  function abrirStats(tipo: TipoItem) {
    patch({ tela: 'stats', listType: tipo });
  }

  function abrirDetalhe(tipo: TipoItem, item: AnyItem) {
    patch({
      tela: 'detail', listType: tipo, itemSelecionado: item, isEditing: false,
      selectedItemId: (item as Record<string, unknown>)[`${tipo}_id`] as string | number,
    });
  }

  const cardsResumo: { tipo: TipoItem; total: number }[] = [
    { tipo: 'beer', total: state.dashboard?.contagens.beer ?? 0 },
    { tipo: 'wine', total: state.dashboard?.contagens.wine ?? 0 },
    { tipo: 'drink', total: state.dashboard?.contagens.drink ?? 0 },
    { tipo: 'dest', total: state.dashboard?.contagens.dest ?? 0 },
  ];

  return (
    <div>
      <HeaderBusca />

      <div style={{ padding: '0 20px 20px' }}>
        {resultados ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: v.textMuted, marginBottom: 10 }}>
              {resultados.length} {t('searchResultsFor')} "{state.searchQuery}"
            </div>
            {resultados.length === 0 && <div style={{ color: v.textMuted, fontSize: 13, padding: '30px 0', textAlign: 'center' }}>{t('noResults')}</div>}
            {resultados.map((r) => (
              <button
                key={`${r.tipo}-${nomeItem(r.tipo, r)}-${String((r as Record<string, unknown>)[`${r.tipo}_id`])}`}
                onClick={() => abrirDetalhe(r.tipo, r)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', borderBottom: `1px solid ${v.border}`, padding: '10px 0', cursor: 'pointer',
                }}
              >
                <div style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <PlaceholderImage nome={nomeItem(r.tipo, r)} url={imgUrlItem(r.tipo, r)} aspect="1 / 1" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: v.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomeItem(r.tipo, r)}</div>
                  <div style={{ fontSize: 12, color: v.textMuted }}>{produtorItem(r.tipo, r)} {r.paisNome && `· ${r.paisNome}`}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: v.accent, background: v.accentSoft, borderRadius: 8, padding: '3px 8px' }}>
                  {t(ROTULO_TIPO[r.tipo])}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {destaques.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: v.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
                  {t('featuredToday')}
                </div>
                <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  {destaques[indiceCarrossel] && (
                    <>
                      <div style={{ width: 150 }}>
                        <PlaceholderImage nome={nomeItem(destaques[indiceCarrossel].tipo, destaques[indiceCarrossel])} url={imgUrlItem(destaques[indiceCarrossel].tipo, destaques[indiceCarrossel])} aspect="1 / 1" />
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: v.accent, background: v.accentSoft, borderRadius: 8, padding: '3px 10px' }}>
                        {t(ROTULO_TIPO[destaques[indiceCarrossel].tipo])}
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{nomeItem(destaques[indiceCarrossel].tipo, destaques[indiceCarrossel])}</div>
                      <div style={{ fontSize: 12.5, color: v.textMuted }}>{produtorItem(destaques[indiceCarrossel].tipo, destaques[indiceCarrossel])}</div>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {destaques.map((_, i) => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === indiceCarrossel ? v.accent : v.border }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 700, color: v.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
              {t('overview')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {cardsResumo.map((c) => (
                <button
                  key={c.tipo}
                  onClick={() => abrirStats(c.tipo)}
                  style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left', border: `1px solid ${v.border}` }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: v.accentSoft, color: v.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={ICONE_TIPO[c.tipo]} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: v.textMuted, fontWeight: 700 }}>{t(ROTULO_TIPO[c.tipo])}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{c.total}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
