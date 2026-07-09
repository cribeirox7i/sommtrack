import { useRef, type MouseEvent } from 'react';
import { STAR_PATH } from '../icons/Icon';
import { v } from '../theme/styles';

function estrela(fracao: number, key: number, tamanho: number) {
  const pct = Math.max(0, Math.min(1, fracao)) * 100;
  return (
    <div key={key} style={{ position: 'relative', width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
        <path d={STAR_PATH} fill="none" stroke={v.border} strokeWidth={1.5} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pct}%` }}>
        <svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
          <path d={STAR_PATH} fill={v.accent} stroke={v.accent} strokeWidth={1.5} />
        </svg>
      </div>
    </div>
  );
}

export function StarRatingView({ valor, tamanho = 20 }: { valor: number; tamanho?: number }) {
  const cels = Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, valor - i)));
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {cels.map((f, i) => estrela(f, i, tamanho))}
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
        {Array.from({ length: 5 }, (_, i) => estrela(Math.max(0, Math.min(1, valor - i)), i, 28))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: v.text }}>{valor.toFixed(1)}</span>
    </div>
  );
}
