import { useState, type FormEvent } from 'react';
import { useApp } from '../../state/store';
import { doForgot } from '../../state/actions';
import { traduzir } from '../../i18n/dict';
import { fieldLabelStyle, inputStyle, primaryButtonStyle, linkButtonStyle } from '../../theme/styles';
import { AuthChrome } from './AuthChrome';

export function ForgotScreen() {
  const { state, patch } = useApp();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const t = (k: string) => traduzir(state.idioma, k);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    const ok = await doForgot(patch, email);
    if (ok) setEnviado(true);
  }

  return (
    <AuthChrome>
      <form onSubmit={aoEnviar}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t('forgotPassword')}</div>
        <div style={{ fontSize: 13, color: 'var(--textMuted)', marginBottom: 20 }}>{t('forgotSubtitle')}</div>

        {enviado && (
          <div style={{ background: 'var(--accentSoft)', color: 'var(--accent)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, marginBottom: 16 }}>
            {t('resetSent')}
          </div>
        )}

        <label style={fieldLabelStyle}>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />

        <button type="submit" style={primaryButtonStyle} disabled={state.carregando}>{t('sendLink')}</button>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button type="button" style={linkButtonStyle} onClick={() => patch({ tela: 'login' })}>{t('backToLogin')}</button>
        </div>
      </form>
    </AuthChrome>
  );
}
