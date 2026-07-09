import { useEffect, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react';
import { useApp } from '../state/store';
import { chamarApi, arquivoParaBase64 } from '../api/client';
import { doLogout } from '../state/actions';
import { traduzir } from '../i18n/dict';
import { HeaderVoltar } from '../components/Header';
import { HUES } from '../theme/theme';
import { cardStyle, fieldLabelStyle, inputStyle, primaryButtonStyle, dangerButtonStyle, chipStyle, v } from '../theme/styles';
import type { Idioma, Modo, Paleta, Usuario } from '../types';

const IDIOMAS: Idioma[] = ['pt', 'en', 'es'];
const PALETAS: Paleta[] = ['green', 'blue', 'red', 'orange', 'yellow', 'purple', 'pink'];

export function ProfileScreen() {
  const { state, patch, logout } = useApp();
  const t = (k: string) => traduzir(state.idioma, k);
  const usuario = state.usuario!;

  const [nome, setNome] = useState(usuario.name);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    if (usuario.role !== 'admin') return;
    chamarApi<Usuario[]>('admin.listarUsuarios').then(setUsuarios).catch(() => setUsuarios([]));
    chamarApi<Record<string, unknown>[]>('admin.log').then(setLogs).catch(() => setLogs([]));
  }, [usuario.role]);

  /**
   * Aplica a mudança na hora (otimista) — idioma/paleta/modo são só preferência
   * visual, não vale a pena travar o clique esperando o Apps Script responder.
   * Salva no servidor em segundo plano; se falhar, só avisa por toast.
   */
  function salvarPerfil(patchParcial: Partial<{ nome: string; idioma: Idioma; paleta: Paleta; modo: Modo }>) {
    patch({
      idioma: patchParcial.idioma ?? state.idioma,
      paleta: patchParcial.paleta ?? state.paleta,
      modo: patchParcial.modo ?? state.modo,
    });
    chamarApi<Usuario>('perfil.salvar', patchParcial)
      .then((atualizado) => patch({ usuario: atualizado }))
      .catch((e) => patch({ toast: (e as Error).message }));
  }

  async function aoTrocarFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await arquivoParaBase64(file);
    try {
      const r = await chamarApi<{ img: string }>('perfil.uploadFoto', { imagemBase64: b64 });
      patch({ usuario: { ...usuario, img: r.img }, toast: t('savePhoto') });
    } catch (err) { patch({ toast: (err as Error).message }); }
  }

  async function trocarSenha(e: FormEvent) {
    e.preventDefault();
    setErroSenha(null);
    if (novaSenha !== confirmaSenha) { setErroSenha(t('pwMismatch')); return; }
    try {
      await chamarApi('perfil.trocarSenha', { senhaAtual, novaSenha });
      setSenhaAtual(''); setNovaSenha(''); setConfirmaSenha('');
      patch({ toast: t('save') });
    } catch (e) { setErroSenha((e as Error).message); }
  }

  async function alternarStatusUsuario(u: Usuario) {
    const novoStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      await chamarApi('admin.setStatus', { userId: u.id, status: novoStatus });
      setUsuarios((lista) => lista && lista.map((x) => (x.id === u.id ? { ...x, status: novoStatus } : x)));
    } catch (e) { patch({ toast: (e as Error).message }); }
  }

  const iniciais = usuario.name.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');

  return (
    <div style={{ paddingBottom: 40 }}>
      <HeaderVoltar titulo={t('profile')} telaVolta="home" />
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {usuario.img ? (
            <img src={usuario.img} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: v.accentSoft, color: v.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
              {iniciais}
            </div>
          )}
          <label style={{ fontSize: 12.5, fontWeight: 700, color: v.accent, cursor: 'pointer' }}>
            {t('changePhoto')}
            <input type="file" accept="image/*" onChange={aoTrocarFoto} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <label style={fieldLabelStyle}>{t('friendlyName')}</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
          <button style={primaryButtonStyle} onClick={() => salvarPerfil({ nome })}>{t('save')}</button>
        </div>

        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <label style={fieldLabelStyle}>{t('language')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {IDIOMAS.map((op) => (
              <button key={op} onClick={() => salvarPerfil({ idioma: op })} style={segStyle(state.idioma === op)}>{op.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <label style={fieldLabelStyle}>{t('colorPalette')}</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {PALETAS.map((p) => (
              <button
                key={p} onClick={() => salvarPerfil({ paleta: p })}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: state.paleta === p ? `3px solid ${v.text}` : `1px solid ${v.border}`,
                  background: `oklch(58% 0.13 ${HUES[p]})`, cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['light', 'dark'] as Modo[]).map((m) => (
              <button key={m} onClick={() => salvarPerfil({ modo: m })} style={segStyle(state.modo === m)}>{t(m === 'light' ? 'lightMode' : 'darkMode')}</button>
            ))}
          </div>
        </div>

        <form onSubmit={trocarSenha} style={{ ...cardStyle, marginBottom: 14 }}>
          <label style={fieldLabelStyle}>{t('changePassword')}</label>
          <input type="password" placeholder={t('currentPassword')} value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} style={inputStyle} />
          <input type="password" placeholder={t('newPassword')} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} style={inputStyle} />
          <input type="password" placeholder={t('confirmPassword')} value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} style={inputStyle} />
          {erroSenha && <div style={{ color: v.danger, fontSize: 12, marginBottom: 10 }}>{erroSenha}</div>}
          <button type="submit" style={primaryButtonStyle}>{t('changePassword')}</button>
        </form>

        {usuario.role === 'admin' && (
          <>
            <div style={{ ...cardStyle, marginBottom: 14 }}>
              <label style={fieldLabelStyle}>{t('manageUsers')}</label>
              {(usuarios || []).map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${v.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: v.textMuted }}>{u.email}</div>
                  </div>
                  <span style={chipStyle(u.status === 'active' ? 'ok' : 'muted')}>{t(u.status === 'active' ? 'active' : 'inactive')}</span>
                  <button style={{ ...dangerButtonStyle, padding: '6px 10px', fontSize: 11 }} onClick={() => alternarStatusUsuario(u)}>
                    {t(u.status === 'active' ? 'deactivate' : 'activate')}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, marginBottom: 14 }}>
              <label style={fieldLabelStyle}>{t('accessLog')}</label>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {(logs || []).map((l, i) => (
                  <div key={i} style={{ fontSize: 11.5, padding: '6px 0', borderBottom: `1px solid ${v.border}`, color: v.textMuted }}>
                    <b style={{ color: v.text }}>{String(l.acao)}</b> · {String(l.user_mail)} · {String(l.log_data).slice(0, 19).replace('T', ' ')}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button style={{ ...dangerButtonStyle, width: '100%', background: v.danger, color: '#fff', border: 'none' }} onClick={() => doLogout(logout)}>
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

function segStyle(ativo: boolean): CSSProperties {
  return {
    flex: 1, padding: '9px 0', borderRadius: 10, border: `1px solid ${ativo ? 'var(--accent)' : 'var(--border)'}`,
    background: ativo ? 'var(--accentSoft)' : 'transparent', color: ativo ? 'var(--accent)' : 'var(--text)',
    fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
  };
}
