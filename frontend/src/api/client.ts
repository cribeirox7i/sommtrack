const API_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = 'sommtrack_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {}

/**
 * Content-Type: text/plain (não application/json) para evitar o preflight
 * OPTIONS — o Web App do Apps Script não responde a esse método.
 */
export async function chamarApi<T = unknown>(acao: string, payload: Record<string, unknown> = {}): Promise<T> {
  if (!API_URL) throw new ApiError('VITE_API_URL não configurada (veja frontend/.env.example).');
  const token = getToken();
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ acao, payload, token }),
  });
  if (!resp.ok) throw new ApiError(`Erro de rede (${resp.status})`);
  const json = await resp.json();
  if (!json.ok) throw new ApiError(json.erro || 'Erro desconhecido.');
  return json.data as T;
}

export function arquivoParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
