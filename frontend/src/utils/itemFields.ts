import { ENTIDADE_CAMPOS } from '../types';
import type { AnyItem, Pais, TipoItem } from '../types';

export function campo(tipo: TipoItem, item: AnyItem, chave: keyof (typeof ENTIDADE_CAMPOS)['beer']): string {
  const nomeCampo = ENTIDADE_CAMPOS[tipo][chave];
  const valor = (item as Record<string, unknown>)[nomeCampo];
  return valor === undefined || valor === null ? '' : String(valor);
}

export function nomeItem(tipo: TipoItem, item: AnyItem) { return campo(tipo, item, 'nome'); }
export function produtorItem(tipo: TipoItem, item: AnyItem) { return campo(tipo, item, 'produtor'); }
export function notaItem(tipo: TipoItem, item: AnyItem) { return Number(campo(tipo, item, 'nota')) || 0; }
export function imgUrlItem(tipo: TipoItem, item: AnyItem) { return campo(tipo, item, 'imgUrl'); }
export function dataItem(tipo: TipoItem, item: AnyItem) { return campo(tipo, item, 'data'); }
export function idItem(tipo: TipoItem, item: AnyItem) { return campo(tipo, item, 'id'); }

export function paisNome(paises: Pais[], paisId: string | number | undefined) {
  const p = paises.find((x) => String(x.pais_id) === String(paisId));
  return p ? p.pais_nome : '';
}
export function paisFlag(paises: Pais[], paisId: string | number | undefined) {
  const p = paises.find((x) => String(x.pais_id) === String(paisId));
  return p ? p.pais_img : '';
}

export const ROTULO_TIPO: Record<TipoItem, string> = { beer: 'beers', wine: 'wines', dest: 'spirits', drink: 'drinks' };
export const ICONE_TIPO: Record<TipoItem, 'beer' | 'wine' | 'drink' | 'spirit'> = { beer: 'beer', wine: 'wine', dest: 'spirit', drink: 'drink' };
