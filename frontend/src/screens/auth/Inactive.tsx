import { useApp } from '../../state/store';
import { traduzir } from '../../i18n/dict';
import { primaryButtonStyle } from '../../theme/styles';
import { AuthChrome } from './AuthChrome';

export function InactiveScreen() {
  const { state, patch } = useApp();
  const t = (k: string) => traduzir(state.idioma, k);
  return (
    <AuthChrome>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t('pendingActivation')}</div>
      <div style={{ fontSize: 13, color: 'var(--textMuted)', marginBottom: 20, lineHeight: 1.5 }}>{t('pendingActivationDesc')}</div>
      <button style={primaryButtonStyle} onClick={() => patch({ tela: 'login' })}>{t('backToLogin')}</button>
    </AuthChrome>
  );
}
