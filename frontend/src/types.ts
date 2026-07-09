export type Idioma = 'pt' | 'en' | 'es';
export type Paleta = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'orange';
export type Modo = 'light' | 'dark';
export type TipoItem = 'beer' | 'wine' | 'dest' | 'drink';
export type ViewMode = 'deck' | 'table' | 'gallery';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  img: string;
  idioma: Idioma;
  paleta: Paleta;
  modo: Modo;
  status: 'active' | 'inactive';
  role: 'admin' | 'user';
}

export interface Pais {
  pais_id: number | string;
  pais_nome: string;
  pais_img: string;
}

export interface BjcpEstilo {
  bjcp21_id: number | string;
  bjcp21_cod: string;
  bjcp21_subestilo: string;
}

export interface ItemBase {
  user_id: number | string;
  pais_id?: number | string;
  [key: string]: unknown;
}

export interface Beer extends ItemBase {
  beer_id: number | string;
  beer_nome: string;
  beer_produtor: string;
  beer_ibu?: number | string;
  beer_abv?: number | string;
  beer_nota: number;
  beer_estilo_livre?: string;
  bjcp21_id?: number | string;
  beer_data?: string;
  beer_img_nome?: string;
  beer_img_url?: string;
  _imagemBase64?: string;
}

export interface Wine extends ItemBase {
  wine_id: number | string;
  wine_nome: string;
  wine_safra?: number | string;
  wine_cor?: string;
  wine_tipo?: string;
  wine_produtor: string;
  wine_regiao?: string;
  wine_uva?: string;
  wine_abv?: number | string;
  wine_nota: number;
  wine_data_degustacao?: string;
  wine_img_nome?: string;
  wine_img_url?: string;
  _imagemBase64?: string;
}

export interface Dest extends ItemBase {
  dest_id: number | string;
  dest_nome: string;
  dest_tipo?: string;
  dest_safra?: number | string;
  dest_produtor: string;
  dest_regiao?: string;
  dest_abv?: number | string;
  dest_nota: number;
  dest_data_degustacao?: string;
  dest_img_nome?: string;
  dest_img_url?: string;
  _imagemBase64?: string;
}

export interface Drink extends ItemBase {
  drink_id: number | string;
  drink_nome: string;
  drink_produtor: string;
  drink_regiao?: string;
  drink_abv?: number | string;
  drink_nota: number;
  drink_data_degustacao?: string;
  drink_img_nome?: string;
  drink_img_url?: string;
  _imagemBase64?: string;
}

export type AnyItem = Beer | Wine | Dest | Drink;

export interface StatsResposta {
  total: number;
  media: number;
  porPais: { nome: string; flag: string; total: number }[];
  porCategoria: { nome: string; total: number; proporcao: number }[];
  porFabricante: { nome: string; total: number }[];
}

export interface DashboardResposta {
  contagens: Record<TipoItem, number>;
  destaques: (AnyItem & { tipo: TipoItem })[];
}

export type Tela =
  | 'login' | 'signup' | 'forgot' | 'verify2fa' | 'inactive'
  | 'home' | 'list' | 'detail' | 'profile' | 'stats';

export const ENTIDADE_CAMPOS: Record<TipoItem, { id: string; nome: string; produtor: string; nota: string; pais: string; data: string; imgUrl: string; imgNome: string }> = {
  beer: { id: 'beer_id', nome: 'beer_nome', produtor: 'beer_produtor', nota: 'beer_nota', pais: 'pais_id', data: 'beer_data', imgUrl: 'beer_img_url', imgNome: 'beer_img_nome' },
  wine: { id: 'wine_id', nome: 'wine_nome', produtor: 'wine_produtor', nota: 'wine_nota', pais: 'pais_id', data: 'wine_data_degustacao', imgUrl: 'wine_img_url', imgNome: 'wine_img_nome' },
  dest: { id: 'dest_id', nome: 'dest_nome', produtor: 'dest_produtor', nota: 'dest_nota', pais: 'pais_id', data: 'dest_data_degustacao', imgUrl: 'dest_img_url', imgNome: 'dest_img_nome' },
  drink: { id: 'drink_id', nome: 'drink_nome', produtor: 'drink_produtor', nota: 'drink_nota', pais: 'pais_id', data: 'drink_data_degustacao', imgUrl: 'drink_img_url', imgNome: 'drink_img_nome' },
};
