import { chamarApi, setToken } from '../api/client';
import type { AppState } from './store';
import type { BjcpEstilo, DashboardResposta, Pais, Usuario } from '../types';

type Patch = (p: Partial<AppState>) => void;

export async function carregarListasEstaticas(patch: Patch) {
  try {
    const [paises, bjcp] = await Promise.all([
      chamarApi<Pais[]>('listas.paises'),
      chamarApi<BjcpEstilo[]>('listas.bjcp'),
    ]);
    patch({ paises, bjcp });
  } catch {
    // listas auxiliares não são críticas para o app funcionar
  }
}

export async function carregarRelac(patch: Patch) {
  try {
    const relac = await chamarApi<Usuario[]>('relac.listar');
    patch({ relac });
  } catch {
    patch({ relac: [] });
  }
}

export async function carregarDashboard(patch: Patch) {
  try {
    const dashboard = await chamarApi<DashboardResposta>('home.dashboard');
    patch({ dashboard });
  } catch {
    // ignora — Home mostra estado vazio
  }
}

export async function aposLoginOk(patch: Patch, usuario: Usuario, token: string) {
  setToken(token);
  patch({
    usuario, tela: 'home',
    idioma: usuario.idioma, paleta: usuario.paleta, modo: usuario.modo,
    authError: null, tempToken: null,
  });
  await Promise.all([carregarListasEstaticas(patch), carregarRelac(patch), carregarDashboard(patch)]);
}

export async function doSignup(patch: Patch, nome: string, email: string, senha: string, idioma: string) {
  patch({ carregando: true, authError: null });
  try {
    await chamarApi('auth.signup', { nome, email, senha, idioma });
    patch({ carregando: false, tela: 'inactive', authEmail: email });
  } catch (e) {
    patch({ carregando: false, authError: (e as Error).message });
  }
}

export async function doLogin(patch: Patch, email: string, senha: string) {
  patch({ carregando: true, authError: null });
  try {
    const data = await chamarApi<{ step: string; tempToken?: string }>('auth.login', { email, senha });
    if (data.step === 'inactive') { patch({ carregando: false, tela: 'inactive', authEmail: email }); return; }
    patch({ carregando: false, tela: 'verify2fa', tempToken: data.tempToken || null, authEmail: email });
  } catch (e) {
    patch({ carregando: false, authError: (e as Error).message });
  }
}

export async function doVerify2fa(patch: Patch, tempToken: string, codigo: string) {
  patch({ carregando: true, authError: null });
  try {
    const data = await chamarApi<{ token: string; user: Usuario }>('auth.verify2fa', { tempToken, codigo });
    patch({ carregando: false });
    await aposLoginOk(patch, data.user, data.token);
  } catch (e) {
    patch({ carregando: false, authError: (e as Error).message });
  }
}

export async function doResend2fa(patch: Patch, tempToken: string) {
  try { await chamarApi('auth.resend2fa', { tempToken }); } catch { /* silencioso */ }
}

export async function doForgot(patch: Patch, email: string): Promise<boolean> {
  patch({ carregando: true, authError: null });
  try {
    await chamarApi('auth.forgot', { email });
    patch({ carregando: false });
    return true;
  } catch (e) {
    patch({ carregando: false, authError: (e as Error).message });
    return false;
  }
}

/** Ao abrir o app com um token salvo em localStorage, tenta restaurar a sessão sem exigir novo login/2FA. */
export async function restaurarSessao(patch: Patch, token: string) {
  try {
    const usuario = await chamarApi<Usuario>('auth.me');
    await aposLoginOk(patch, usuario, token);
  } catch {
    setToken(null);
    patch({ tela: 'login' });
  }
}

export async function doLogout(logout: () => void) {
  try { await chamarApi('auth.logout'); } catch { /* idempotente */ }
  setToken(null);
  logout();
}
