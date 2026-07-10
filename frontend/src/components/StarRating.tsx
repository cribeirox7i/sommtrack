import { useId, useRef, type MouseEvent } from 'react';
import { STAR_PATH } from '../icons/Icon';
import { v } from '../theme/styles';

/**
 * Uma só <svg> com dois <path> idênticos (contorno + preenchimento recortado por
 * clipPath) — evita a técnica anterior de duas svgs sobrepostas + div com width em
 * porcentagem, que arredondava de forma diferente em cada camada e causava
 * desalinhamento/corte visual em tamanhos pequenos.
 */
function Estrela({ fracao, tamanho }: { fracao: number; tamanho: number }) {
  const idBase = useId();
  const clipId = `star-clip-${idBase}`;
  const pct = Math.max(0, Math.min(1, fracao));
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * pct} height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="none" stroke={v.border} strokeWidth={1.5} />
      <path d={STAR_PATH} fill={v.accent} stroke={v.accent} strokeWidth={1.5} clipPath={`url(#${clipId})`} />
    </svg>
  );
}

export function StarRatingView({ valor, tamanho = 20 }: { valor: number; tamanho?: number }) {
  const cels = Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, valor - i)));
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {cels.map((f, i) => <Estrela key={i} fracao={f} tamanho={tamanho} />)}
    </div>
  );
}

export function StarRatingEdit({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  function calcular(clientX: number) {
    const el = ref.current;
    if (!el) return valor;
    const rect = el.getBoundingClientRect();
    const fracao = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(fracao * 5 * 2) / 2 || 0.5;
  }

  function aoClicar(e: MouseEvent) {
    onChange(calcular(e.clientX));
  }
  function aoArrastar(e: MouseEvent) {
    if (e.buttons === 1) onChange(calcular(e.clientX));
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        ref={ref}
        onClick={aoClicar}
        onMouseMove={aoArrastar}
        style={{ display: 'flex', gap: 4, cursor: 'pointer', touchAction: 'none' }}
      >
        {Array.from({ length: 5 }, (_, i) => <Estrela key={i} fracao={Math.max(0, Math.min(1, valor - i))} tamanho={28} />)}
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: v.text }}>{valor.toFixed(1)}</span>
    </div>
  );
}
