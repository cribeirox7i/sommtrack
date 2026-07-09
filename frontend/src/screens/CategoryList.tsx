import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useApp } from '../state/store';
import { chamarApi } from '../api/client';
import { traduzir } from '../i18n/dict';
import { HeaderBusca } from '../components/Header';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { StarRatingView } from '../components/StarRating';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { ModalConfirmacao } from '../components/Modal';
import { Icon } from '../icons/Icon';
import { v, miniIconButtonStyle } from '../theme/styles';
import { nomeItem, produtorItem, notaItem, imgUrlItem, dataItem, idItem, paisNome } from '../utils/itemFields';
import { ENTIDADE_CAMPOS } from '../types';
import type { AnyItem, TipoItem, ViewMode } from '../types';

function categoriaLabel(tipo: TipoItem, item: AnyItem, bjcp: { bjcp21_id: string | number; bjcp21_subestilo: string }[]): string {
  const rec = item as Record<string, unknown>;
  if (tipo === 'beer') {
    const b = bjcp.find((x) => String(x.bjcp21_id) === String(rec.bjcp21_id));
    return b ? b.bjcp21_subestilo : String(rec.beer_estilo_livre || '');
  }
  if (tipo === 'wine') return String(rec.wine_cor || '');
  if (tipo === 'dest') return String(rec.dest_tipo || '');
  return '';
}

export function CategoryListScreen() {
  const { state, patch } = useApp();
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<AnyItem | null>(null);
  const t = (k: string) => traduzir(state.idioma, k);
  const tipo = state.listType;
  const cfg = ENTIDADE_CAMPOS[tipo];

  const perfilVisualizado = state.viewedProfileId ? state.relac.find((u) => u.id === state.viewedProfileId) : null;
  const podeEditar = !state.viewedProfileId;

  async function carregarLista() {
    setCarregandoLista(true);
    try {
      const ownerId = state.viewedProfileId || state.usuario?.id;
      const lista = await chamarApi<AnyItem[]>('catalogo.listar', { tipo, ownerId });
      patch({ listaAtual: lista });
    } catch {
      patch({ listaAtual: [] });
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => { carregarLista(); }, [tipo, state.viewedProfileId]);

  function trocarPerfil(id: number | null) {
    patch({ viewedProfileId: id, filterCategory: 'all' });
  }

  const listaFiltrada = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    let lista = state.listaAtual;
    if (q) {
      lista = lista.filter((item) => {
        const nome = nomeItem(tipo, item).toLowerCase();
        const produtor = produtorItem(tipo, item).toLowerCase();
        const pais = paisNome(state.paises, (item as Record<string, unknown>)[cfg.pais] as string).toLowerCase();
        if (state.searchField === 'name') return nome.includes(q);
        if (state.searchField === 'manufacturer') return produtor.includes(q);
        if (state.searchField === 'country') return pais.includes(q);
        return nome.includes(q) || produtor.includes(q) || pais.includes(q);
      });
    }
    if (state.sortField) {
      lista = [...lista].sort((a, b) => {
        const va = String((a as Record<string, unknown>)[state.sortField!] ?? '');
        const vb = String((b as Record<string, unknown>)[state.sortField!] ?? '');
        const cmp = va.localeCompare(vb, undefined, { numeric: true });
        return state.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return lista;
  }, [state.listaAtual, state.searchQuery, state.searchField, state.sortField, state.sortDir, tipo]);

  function abrirNovo() {
    patch({ tela: 'detail', selectedItemId: null, itemSelecionado: null, isEditing: true });
  }
  function abrirItem(item: AnyItem, editar: boolean) {
    patch({ tela: 'detail', selectedItemId: idItem(tipo, item), itemSelecionado: item, isEditing: editar });
  }
  async function duplicar(item: AnyItem, e: MouseEvent) {
    e.stopPropagation();
    try {
      await chamarApi('catalogo.duplicar', { tipo, id: idItem(tipo, item) });
      patch({ toast: t('itemDuplicated') });
      carregarLista();
    } catch (err) { patch({ toast: (err as Error).message }); }
  }
  async function confirmarExcluir() {
    if (!confirmarExclusao) return;
    try {
      await chamarApi('catalogo.excluir', { tipo, id: idItem(tipo, confirmarExclusao) });
      patch({ toast: t('itemDeleted') });
      setConfirmarExclusao(null);
      carregarLista();
    } catch (err) { patch({ toast: (err as Error).message }); setConfirmarExclusao(null); }
  }

  function ordenarPor(campoOrdenacao: string) {
    if (state.sortField === campoOrdenacao) patch({ sortDir: state.sortDir === 'asc' ? 'desc' : 'asc' });
    else patch({ sortField: campoOrdenacao, sortDir: 'asc' });
  }

  const camposDeBusca = [
    { value: 'all', label: t('searchAll') }, { value: 'name', label: t('name') },
    { value: 'manufacturer', label: t('manufacturer') }, { value: 'country', label: t('country') },
  ];

  return (
    <div>
      <HeaderBusca onFieldOptions={camposDeBusca} />

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ProfileSwitcher onSwitch={trocarPerfil} />
          {state.relac.length > 0 && <div style={{ width: 1, height: 24, background: v.border }} />}

          {(['deck', 'table', 'gallery'] as ViewMode[]).map((modo) => (
            <button
              key={modo}
              onClick={() => patch({ viewMode: modo })}
              style={{
                width: 40, height: 38, borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${state.viewMode === modo ? v.accent : v.border}`,
                background: state.viewMode === modo ? v.accentSoft : 'transparent',
                color: state.viewMode === modo ? v.accent : v.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name={modo} size={18} />
            </button>
          ))}

          {podeEditar && (
            <>
              <div style={{ width: 1, height: 24, background: v.border }} />
              <button onClick={abrirNovo} style={{
                width: 38, height: 38, borderRadius: 10, border: 'none', background: v.accent, color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto',
              }}>
                <Icon name="plus" size={18} />
              </button>
            </>
          )}
        </div>

        <div style={{ fontSize: 12, color: v.textMuted, marginBottom: perfilVisualizado ? 2 : 14 }}>
          {listaFiltrada.length} {t('itemsShown')}
        </div>
        {perfilVisualizado && (
          <div style={{ fontSize: 12, color: v.accent, fontWeight: 700, marginBottom: 14 }}>
            {t('viewingProfileOf')} {perfilVisualizado.name} · {t('secondaryProfileReadOnly')}
          </div>
        )}

        {carregandoLista && <div style={{ textAlign: 'center', color: v.textMuted, padding: 30 }}>{t('loading')}</div>}

        {!carregandoLista && listaFiltrada.length === 0 && (
          <div style={{ textAlign: 'center', color: v.textMuted, padding: '40px 0', fontSize: 13 }}>{t('noResults')}</div>
        )}

        {!carregandoLista && listaFiltrada.length > 0 && state.viewMode === 'deck' && (
          <div>
            {listaFiltrada.map((item) => (
              <div
                key={idItem(tipo, item)}
                onClick={() => abrirItem(item, false)}
                style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${v.border}`, cursor: 'pointer', alignItems: 'center' }}
              >
                <div style={{ width: 72, height: 72, flexShrink: 0 }}>
                  <PlaceholderImage nome={nomeItem(tipo, item)} url={imgUrlItem(tipo, item)} aspect="1 / 1" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nomeItem(tipo, item)}</div>
                  <div style={{ fontSize: 12.5, color: v.textMuted, marginBottom: 4 }}>{produtorItem(tipo, item)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarRatingView valor={notaItem(tipo, item)} tamanho={13} />
                    <span style={{ fontSize: 11, color: v.textMuted }}>{dataItem(tipo, item)?.slice(0, 10)}</span>
                  </div>
                </div>
                {podeEditar && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button style={miniIconButtonStyle} onClick={() => abrirItem(item, true)}><Icon name="edit" size={15} /></button>
                    <button style={miniIconButtonStyle} onClick={(e) => duplicar(item, e)}><Icon name="duplicate" size={15} /></button>
                    <button style={{ ...miniIconButtonStyle, borderColor: v.danger, color: v.danger }} onClick={() => setConfirmarExclusao(item)}><Icon name="delete" size={15} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!carregandoLista && listaFiltrada.length > 0 && state.viewMode === 'table' && (
          <div className="tabela-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 560 }}>
              <thead>
                <tr style={{ background: v.trackBg }}>
                  {[['nome', cfg.nome, t('name')], ['produtor', cfg.produtor, t('manufacturer')], ['categoria', null, t('category')], ['data', cfg.data, t('tastingDate')], ['nota', cfg.nota, t('rating')]].map(([chave, campoReal, label]) => (
                    <th
                      key={String(chave)}
                      onClick={() => campoReal && ordenarPor(campoReal as string)}
                      style={{ padding: '8px 10px', textAlign: 'left', cursor: campoReal ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                    >
                      {label}{state.sortField === campoReal && (state.sortDir === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                  ))}
                  {podeEditar && <th style={{ padding: '8px 10px' }}>{t('actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((item) => (
                  <tr key={idItem(tipo, item)} onClick={() => abrirItem(item, false)} style={{ borderBottom: `1px solid ${v.border}`, cursor: 'pointer' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{nomeItem(tipo, item)}</td>
                    <td style={{ padding: '8px 10px' }}>{produtorItem(tipo, item)}</td>
                    <td style={{ padding: '8px 10px' }}>{categoriaLabel(tipo, item, state.bjcp)}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{dataItem(tipo, item)?.slice(0, 10)}</td>
                    <td style={{ padding: '8px 10px' }}><StarRatingView valor={notaItem(tipo, item)} tamanho={12} /></td>
                    {podeEditar && (
                      <td style={{ padding: '8px 10px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={miniIconButtonStyle} onClick={(e) => duplicar(item, e)}><Icon name="duplicate" size={14} /></button>
                          <button style={{ ...miniIconButtonStyle, borderColor: v.danger, color: v.danger }} onClick={() => setConfirmarExclusao(item)}><Icon name="delete" size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!carregandoLista && listaFiltrada.length > 0 && state.viewMode === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {listaFiltrada.map((item) => (
              <div key={idItem(tipo, item)} onClick={() => abrirItem(item, false)} style={{ cursor: 'pointer' }}>
                <PlaceholderImage nome={nomeItem(tipo, item)} url={imgUrlItem(tipo, item)} aspect="3 / 4" />
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nomeItem(tipo, item)}</div>
                <div style={{ fontSize: 11, color: v.textMuted }}>{produtorItem(tipo, item)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmarExclusao && (
        <ModalConfirmacao
          mensagem={t('confirmDeleteMsg').replace('{name}', nomeItem(tipo, confirmarExclusao))}
          perigo
          onConfirmar={confirmarExcluir}
          onCancelar={() => setConfirmarExclusao(null)}
        />
      )}
    </div>
  );
}
