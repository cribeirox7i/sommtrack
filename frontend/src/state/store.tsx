import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AnyItem, BjcpEstilo, DashboardResposta, Idioma, Modo, Paleta, Pais, Tela, TipoItem, Usuario, ViewMode } from '../types';

export interface AppState {
  tela: Tela;
  telaAnterior: Tela | null;
  usuario: Usuario | null;
  idioma: Idioma;
  paleta: Paleta;
  modo: Modo;

  authEmail: string;
  authError: string | null;
  tempToken: string | null;
  carregando: boolean;
  toast: string | null;

  listType: TipoItem;
  viewMode: ViewMode;
  searchQuery: string;
  searchField: string;
  filterCategory: string;
  sortField: string | null;
  sortDir: 'asc' | 'desc';

  viewedProfileId: number | null;
  profileMenuOpen: boolean;
  relac: Usuario[];

  paises: Pais[];
  bjcp: BjcpEstilo[];
  listaAtual: AnyItem[];

  selectedItemId: string | number | null;
  itemSelecionado: AnyItem | null;
  isEditing: boolean;

  dashboard: DashboardResposta | null;

  /** Cache da 1ª página (sem busca/ordenação) por "tipo:ownerId" — evita reconsultar
   * o servidor toda vez que o usuário só troca de aba e volta (ver MEMORIA.md do AromaLab). */
  listCache: Record<string, { itens: AnyItem[]; total: number }>;
}

export const initialState: AppState = {
  tela: 'login',
  telaAnterior: null,
  usuario: null,
  idioma: (navigator.language?.slice(0, 2) as Idioma) === 'es' ? 'es' : (navigator.language?.slice(0, 2) as Idioma) === 'en' ? 'en' : 'pt',
  paleta: 'green',
  modo: 'dark',

  authEmail: '',
  authError: null,
  tempToken: null,
  carregando: false,
  toast: null,

  listType: 'beer',
  viewMode: 'deck',
  searchQuery: '',
  searchField: 'all',
  filterCategory: 'all',
  sortField: null,
  sortDir: 'asc',

  viewedProfileId: null,
  profileMenuOpen: false,
  relac: [],

  paises: [],
  bjcp: [],
  listaAtual: [],

  selectedItemId: null,
  itemSelecionado: null,
  isEditing: false,

  dashboard: null,

  listCache: {},
};

type Action = { type: 'patch'; payload: Partial<AppState> } | { type: 'logout' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'logout':
      return { ...initialState, idioma: state.idioma, paleta: state.paleta, modo: state.modo };
    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
  logout: () => void;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const patch = (p: Partial<AppState>) => dispatch({ type: 'patch', payload: p });
  const logout = () => dispatch({ type: 'logout' });
  return <AppContext.Provider value={{ state, patch, logout, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>.');
  return ctx;
}
