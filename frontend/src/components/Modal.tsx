import type { ReactNode } from 'react';
import { modalOverlayStyle, modalCardStyle, ghostButtonStyle, dangerButtonStyle, primaryButtonStyle } from '../theme/styles';
import { useApp } from '../state/store';
import { traduzir } from '../i18n/dict';

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function ModalConfirmacao({ mensagem, perigo, onConfirmar, onCancelar }: {
  mensagem: string; perigo?: boolean; onConfirmar: () => void; onCancelar: () => void;
}) {
  const { state } = useApp();
  const t = (k: string) => traduzir(state.idioma, k);
  return (
    <Modal onClose={onCancelar}>
      <p style={{ fontSize: 14, marginBottom: 20 }}>{mensagem}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button style={ghostButtonStyle} onClick={onCancelar}>{t('cancel')}</button>
        <button
          style={perigo ? { ...dangerButtonStyle, background: 'var(--danger)', color: '#fff', border: 'none' } : primaryButtonStyle}
          onClick={onConfirmar}
        >
          {t('confirmYes')}
        </button>
      </div>
    </Modal>
  );
}
