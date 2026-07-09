import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '../state/store';
import { chamarApi } from '../api/client';
import { traduzir } from '../i18n/dict';
import { HeaderVoltar } from '../components/Header';
import { StarRatingView } from '../components/StarRating';
import { cardStyle, v } from '../theme/styles';
import { ROTULO_TIPO } from '../utils/itemFields';
import type { StatsResposta } from '../types';

export function StatsScreen() {
  const { state } = useApp();
  const tipo = state.listType;
  const t = (k: string) => traduzir(state.idioma, k);
  const [stats, setStats] = useState<StatsResposta | null>(null);

  useEffect(() => {
    setStats(null);
    chamarApi<StatsResposta>('catalogo.stats', { tipo }).then(setStats).catch(() => setStats(null));
  }, [tipo]);

  return (
    <div>
      <HeaderVoltar titulo={t(ROTULO_TIPO[tipo])} telaVolta="home" />
      <div style={{ padding: '0 20px 30px' }}>
        {!stats ? (
          <div style={{ textAlign: 'center', color: v.textMuted, padding: 40 }}>{t('loading')}</div>
        ) : (
          <>
            <div style={{ ...cardStyle, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.total}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}><StarRatingView valor={stats.media} /></div>
              <div style={{ fontSize: 12, color: v.textMuted, marginTop: 4 }}>{t('avgRating')}: {stats.media.toFixed(1)}</div>
            </div>

            <Secao titulo={t('byCountry')}>
              {stats.porPais.map((p) => (
                <LinhaLista key={p.nome} icone={p.flag} nome={p.nome} total={p.total} />
              ))}
            </Secao>

            {stats.porCategoria.length > 0 && (
              <Secao titulo={t('byCategory')}>
                {stats.porCategoria.map((c) => (
                  <div key={c.nome} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                      <span>{c.nome}</span><span style={{ color: v.textMuted }}>{c.total}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: v.trackBg }}>
                      <div style={{ height: '100%', width: `${c.proporcao * 100}%`, background: v.accent, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </Secao>
            )}

            <Secao titulo={t('byManufacturer')}>
              {stats.porFabricante.map((f) => (
                <LinhaLista key={f.nome} nome={f.nome} total={f.total} />
              ))}
            </Secao>
          </>
        )}
      </div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--textMuted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{titulo}</div>
      <div style={cardStyle}>{children}</div>
    </div>
  );
}

function LinhaLista({ icone, nome, total }: { icone?: string; nome: string; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${v.border}`, fontSize: 13 }}>
      {icone && <span>{icone}</span>}
      <span style={{ flex: 1 }}>{nome}</span>
      <span style={{ color: v.textMuted, fontWeight: 700 }}>{total}</span>
    </div>
  );
}
