import { useEffect, useState, type ChangeEvent } from 'react';
import { useApp } from '../state/store';
import { chamarApi, arquivoParaBase64 } from '../api/client';
import { traduzir } from '../i18n/dict';
import { HeaderVoltar } from '../components/Header';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { StarRatingView, StarRatingEdit } from '../components/StarRating';
import { ModalConfirmacao } from '../components/Modal';
import { Icon } from '../icons/Icon';
import { cardStyle, fieldLabelStyle, inputStyle, primaryButtonStyle, v, miniIconButtonStyle } from '../theme/styles';
import { nomeItem, produtorItem, notaItem, imgUrlItem, idItem, paisNome } from '../utils/itemFields';
import { WINE_COR_LISTA, WINE_TIPO_LISTA, DEST_TIPO_LISTA } from '../utils/listasFixas';
import { ENTIDADE_CAMPOS } from '../types';
import type { AnyItem } from '../types';

function draftEmBranco(tipo: string, userId: number): Record<string, unknown> {
  const base: Record<string, unknown> = { pais_id: '', _imagemBase64: '' };
  if (tipo === 'beer') return { ...base, beer_nome: '', beer_produtor: '', beer_ibu: '', beer_abv: '', beer_nota: 3, beer_estilo_livre: '', bjcp21_id: '', beer_data: '' };
  if (tipo === 'wine') return { ...base, wine_nome: '', wine_produtor: '', wine_regiao: '', wine_uva: '', wine_safra: '', wine_cor: WINE_COR_LISTA[0], wine_tipo: WINE_TIPO_LISTA[0], wine_abv: '', wine_nota: 3, wine_data_degustacao: '' };
  if (tipo === 'dest') return { ...base, dest_nome: '', dest_produtor: '', dest_regiao: '', dest_safra: '', dest_tipo: DEST_TIPO_LISTA[0], dest_abv: '', dest_nota: 3, dest_data_degustacao: '' };
  return { ...base, drink_nome: '', drink_produtor: '', drink_regiao: '', drink_abv: '', drink_nota: 3, drink_data_degustacao: '' };
}

export function ItemDetailScreen() {
  const { state, patch } = useApp();
  const tipo = state.listType;
  const cfg = ENTIDADE_CAMPOS[tipo];
  const t = (k: string) => traduzir(state.idioma, k);
  const podeEditar = !state.viewedProfileId;
  const novo = !state.selectedItemId;

  const [draft, setDraft] = useState<Record<string, unknown>>(
    () => (state.itemSelecionado ? { ...state.itemSelecionado } : draftEmBranco(tipo, state.usuario?.id || 0)),
  );
  const [zoomAberto, setZoomAberto] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setDraft(state.itemSelecionado ? { ...state.itemSelecionado } : draftEmBranco(tipo, state.usuario?.id || 0));
  }, [state.itemSelecionado, tipo]);

  function campoDraft(nomeCampo: string) { return (draft[nomeCampo] ?? '') as string | number; }
  function setCampoDraft(nomeCampo: string, valor: unknown) { setDraft((d) => ({ ...d, [nomeCampo]: valor })); }

  async function aoTrocarFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await arquivoParaBase64(file);
    setCampoDraft('_imagemBase64', b64);
  }

  /** Item sempre pertence ao próprio usuário aqui (edição só é permitida no próprio perfil). */
  function invalidarCacheLista() {
    const chave = `${tipo}:own`;
    const { [chave]: _removido, ...resto } = state.listCache;
    patch({ listCache: resto, dashboard: null });
  }

  async function salvar() {
    setErro(null);
    if (!campoDraft(cfg.nome)) { setErro(t('requiredFields')); return; }
    try {
      const salvo = await chamarApi<AnyItem>('catalogo.salvar', { tipo, item: draft });
      invalidarCacheLista();
      patch({ toast: t('itemSaved'), tela: 'list', isEditing: false, itemSelecionado: salvo });
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function excluir() {
    try {
      await chamarApi('catalogo.excluir', { tipo, id: state.selectedItemId });
      invalidarCacheLista();
      patch({ toast: t('itemDeleted'), tela: 'list' });
    } catch (e) {
      patch({ toast: (e as Error).message });
    }
    setConfirmarExclusao(false);
  }

  async function duplicar() {
    try {
      await chamarApi('catalogo.duplicar', { tipo, id: state.selectedItemId });
      invalidarCacheLista();
      patch({ toast: t('itemDuplicated'), tela: 'list' });
    } catch (e) { patch({ toast: (e as Error).message }); }
  }

  function pesquisarGoogle() {
    const query = [campoDraft(cfg.nome), campoDraft(cfg.produtor), paisNome(state.paises, campoDraft('pais_id'))].filter(Boolean).join(' ');
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }

  async function compartilhar() {
    const texto = `${campoDraft(cfg.nome)} — ${campoDraft(cfg.produtor)}`;
    if (navigator.share) { try { await navigator.share({ text: texto }); } catch { /* cancelado */ } }
    else { await navigator.clipboard.writeText(texto); patch({ toast: t('shareItem') }); }
  }

  const titulo = state.isEditing ? '' : (novo ? t('newItem') : nomeItem(tipo, draft as AnyItem));

  return (
    <div style={{ paddingBottom: 40 }}>
      <HeaderVoltar titulo={titulo} telaVolta="list" onSalvar={state.isEditing ? salvar : undefined} />

      <div style={{ padding: '0 20px' }}>
        {state.isEditing ? (
          <div>
            <label style={{ ...fieldLabelStyle, marginTop: 0 }}>{t('changePhoto')}</label>
            <label style={{ display: 'block', marginBottom: 14, cursor: 'pointer' }}>
              <PlaceholderImage nome={String(campoDraft(cfg.nome) || t('newItem'))} url={typeof draft._imagemBase64 === 'string' && draft._imagemBase64 ? draft._imagemBase64 : imgUrlItem(tipo, draft as AnyItem)} aspect="4 / 3" />
              <input type="file" accept="image/*" onChange={aoTrocarFoto} style={{ display: 'none' }} />
            </label>

            <label style={fieldLabelStyle}>{t('rating')}</label>
            <div style={{ marginBottom: 16 }}>
              <StarRatingEdit valor={Number(campoDraft(cfg.nota)) || 0} onChange={(val) => setCampoDraft(cfg.nota, val)} />
            </div>

            <CampoTexto label={t('name')} valor={campoDraft(cfg.nome)} onChange={(x) => setCampoDraft(cfg.nome, x)} />
            <CampoTexto label={t('manufacturer')} valor={campoDraft(cfg.produtor)} onChange={(x) => setCampoDraft(cfg.produtor, x)} />

            <label style={fieldLabelStyle}>{t('country')}</label>
            <select value={campoDraft('pais_id') as string} onChange={(e) => setCampoDraft('pais_id', e.target.value)} style={inputStyle}>
              <option value="">—</option>
              {state.paises.map((p) => <option key={p.pais_id} value={p.pais_id}>{p.pais_img} {p.pais_nome}</option>)}
            </select>

            {tipo === 'beer' && (
              <>
                <CampoTexto label={t('ibu')} tipoInput="number" valor={campoDraft('beer_ibu')} onChange={(x) => setCampoDraft('beer_ibu', x)} />
                <CampoTexto label={t('abv')} tipoInput="number" valor={campoDraft('beer_abv')} onChange={(x) => setCampoDraft('beer_abv', x)} />
                <CampoTexto label={t('beerEstiloLivre')} valor={campoDraft('beer_estilo_livre')} onChange={(x) => setCampoDraft('beer_estilo_livre', x)} />
                <label style={fieldLabelStyle}>{t('bjcp21')}</label>
                <select value={campoDraft('bjcp21_id') as string} onChange={(e) => setCampoDraft('bjcp21_id', e.target.value)} style={inputStyle}>
                  <option value="">—</option>
                  {state.bjcp.map((b) => <option key={b.bjcp21_id} value={b.bjcp21_id}>{b.bjcp21_cod} — {b.bjcp21_subestilo}</option>)}
                </select>
                <CampoTexto label={t('tastingDate')} tipoInput="date" valor={campoDraft('beer_data')} onChange={(x) => setCampoDraft('beer_data', x)} />
              </>
            )}

            {tipo === 'wine' && (
              <>
                <CampoTexto label={t('wineRegiao')} valor={campoDraft('wine_regiao')} onChange={(x) => setCampoDraft('wine_regiao', x)} />
                <CampoTexto label={t('wineUva')} valor={campoDraft('wine_uva')} onChange={(x) => setCampoDraft('wine_uva', x)} />
                <CampoTexto label={t('wineSafra')} tipoInput="number" valor={campoDraft('wine_safra')} onChange={(x) => setCampoDraft('wine_safra', x)} />
                <CampoSelect label={t('wineCor')} valor={campoDraft('wine_cor') as string} opcoes={WINE_COR_LISTA} onChange={(x) => setCampoDraft('wine_cor', x)} />
                <CampoSelect label={t('wineTipo')} valor={campoDraft('wine_tipo') as string} opcoes={WINE_TIPO_LISTA} onChange={(x) => setCampoDraft('wine_tipo', x)} />
                <CampoTexto label={t('abv')} tipoInput="number" valor={campoDraft('wine_abv')} onChange={(x) => setCampoDraft('wine_abv', x)} />
                <CampoTexto label={t('tastingDate')} tipoInput="date" valor={campoDraft('wine_data_degustacao')} onChange={(x) => setCampoDraft('wine_data_degustacao', x)} />
              </>
            )}

            {tipo === 'dest' && (
              <>
                <CampoTexto label={t('region')} valor={campoDraft('dest_regiao')} onChange={(x) => setCampoDraft('dest_regiao', x)} />
                <CampoTexto label={t('vintage')} tipoInput="number" valor={campoDraft('dest_safra')} onChange={(x) => setCampoDraft('dest_safra', x)} />
                <CampoSelect label={t('type')} valor={campoDraft('dest_tipo') as string} opcoes={DEST_TIPO_LISTA} onChange={(x) => setCampoDraft('dest_tipo', x)} />
                <CampoTexto label={t('abv')} tipoInput="number" valor={campoDraft('dest_abv')} onChange={(x) => setCampoDraft('dest_abv', x)} />
                <CampoTexto label={t('tastingDate')} tipoInput="date" valor={campoDraft('dest_data_degustacao')} onChange={(x) => setCampoDraft('dest_data_degustacao', x)} />
              </>
            )}

            {tipo === 'drink' && (
              <>
                <CampoTexto label={t('region')} valor={campoDraft('drink_regiao')} onChange={(x) => setCampoDraft('drink_regiao', x)} />
                <CampoTexto label={t('abv')} tipoInput="number" valor={campoDraft('drink_abv')} onChange={(x) => setCampoDraft('drink_abv', x)} />
                <CampoTexto label={t('tastingDate')} tipoInput="date" valor={campoDraft('drink_data_degustacao')} onChange={(x) => setCampoDraft('drink_data_degustacao', x)} />
              </>
            )}

            {erro && <div style={{ color: v.danger, fontSize: 12.5, margin: '6px 0 12px' }}>{erro}</div>}
            <button style={{ ...primaryButtonStyle, marginTop: 8 }} onClick={salvar}>{t('save')}</button>
          </div>
        ) : (
          <div>
            <div onClick={() => setZoomAberto(true)} style={{ cursor: 'zoom-in', marginBottom: 14 }}>
              <PlaceholderImage nome={nomeItem(tipo, draft as AnyItem)} url={imgUrlItem(tipo, draft as AnyItem)} aspect="4 / 3" />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button style={miniIconButtonStyle} title={t('searchGoogle')} onClick={pesquisarGoogle}><Icon name="search" size={16} /></button>
              <button style={miniIconButtonStyle} title={t('shareItem')} onClick={compartilhar}><Icon name="share" size={16} /></button>
              {podeEditar && (
                <>
                  <button style={miniIconButtonStyle} onClick={() => patch({ isEditing: true })}><Icon name="edit" size={16} /></button>
                  <button style={miniIconButtonStyle} onClick={duplicar}><Icon name="duplicate" size={16} /></button>
                  <button style={{ ...miniIconButtonStyle, borderColor: v.danger, color: v.danger }} onClick={() => setConfirmarExclusao(true)}><Icon name="delete" size={16} /></button>
                </>
              )}
            </div>

            <div style={{ fontSize: 20, fontWeight: 800 }}>{nomeItem(tipo, draft as AnyItem)}</div>
            <div style={{ fontSize: 13, color: v.textMuted, marginBottom: 8 }}>
              {produtorItem(tipo, draft as AnyItem)}{campoDraft('pais_id') ? ` · ${paisNome(state.paises, campoDraft('pais_id'))}` : ''}
            </div>
            <StarRatingView valor={notaItem(tipo, draft as AnyItem)} />

            <div style={{ ...cardStyle, marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {tipo === 'beer' && (
                <>
                  <Campo label={t('ibu')} valor={campoDraft('beer_ibu')} />
                  <Campo label={t('abv')} valor={campoDraft('beer_abv')} />
                  <Campo label={t('beerEstiloLivre')} valor={campoDraft('beer_estilo_livre')} />
                  <Campo label={t('tastingDate')} valor={String(campoDraft('beer_data') || '').slice(0, 10)} />
                </>
              )}
              {tipo === 'wine' && (
                <>
                  <Campo label={t('wineSafra')} valor={campoDraft('wine_safra')} />
                  <Campo label={t('wineCor')} valor={campoDraft('wine_cor')} />
                  <Campo label={t('wineTipo')} valor={campoDraft('wine_tipo')} />
                  <Campo label={t('wineUva')} valor={campoDraft('wine_uva')} />
                  <Campo label={t('abv')} valor={campoDraft('wine_abv')} />
                  <Campo label={t('tastingDate')} valor={String(campoDraft('wine_data_degustacao') || '').slice(0, 10)} />
                </>
              )}
              {tipo === 'dest' && (
                <>
                  <Campo label={t('type')} valor={campoDraft('dest_tipo')} />
                  <Campo label={t('vintage')} valor={campoDraft('dest_safra')} />
                  <Campo label={t('abv')} valor={campoDraft('dest_abv')} />
                  <Campo label={t('tastingDate')} valor={String(campoDraft('dest_data_degustacao') || '').slice(0, 10)} />
                </>
              )}
              {tipo === 'drink' && (
                <>
                  <Campo label={t('abv')} valor={campoDraft('drink_abv')} />
                  <Campo label={t('tastingDate')} valor={String(campoDraft('drink_data_degustacao') || '').slice(0, 10)} />
                </>
              )}
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: v.textMuted }}>{t('idLabel')} {idItem(tipo, draft as AnyItem)}</div>
          </div>
        )}
      </div>

      {zoomAberto && (
        <div onClick={() => setZoomAberto(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 400, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 30,
        }}>
          <img src={imgUrlItem(tipo, draft as AnyItem)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
          <button onClick={() => setZoomAberto(false)} style={{
            position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '50%', width: 40, height: 40, color: '#fff', cursor: 'pointer',
          }}>
            <Icon name="close" size={18} color="#fff" />
          </button>
        </div>
      )}

      {confirmarExclusao && (
        <ModalConfirmacao
          mensagem={t('confirmDeleteMsg').replace('{name}', nomeItem(tipo, draft as AnyItem))}
          perigo
          onConfirmar={excluir}
          onCancelar={() => setConfirmarExclusao(false)}
        />
      )}
    </div>
  );
}

function CampoTexto({ label, valor, onChange, tipoInput = 'text' }: { label: string; valor: unknown; onChange: (v: string) => void; tipoInput?: string }) {
  return (
    <>
      <label style={fieldLabelStyle}>{label}</label>
      <input type={tipoInput} value={valor as string} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </>
  );
}

function CampoSelect({ label, valor, opcoes, onChange }: { label: string; valor: string; opcoes: string[]; onChange: (v: string) => void }) {
  return (
    <>
      <label style={fieldLabelStyle}>{label}</label>
      <select value={valor} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </>
  );
}

function Campo({ label, valor }: { label: string; valor: unknown }) {
  if (valor === undefined || valor === null || valor === '') return null;
  return (
    <div>
      <div style={{ fontSize: 10.5, color: v.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{String(valor)}</div>
    </div>
  );
}
