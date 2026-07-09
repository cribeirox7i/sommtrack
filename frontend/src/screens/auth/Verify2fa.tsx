import { useState, type FormEvent } from 'react';
import { useApp } from '../../state/store';
import { doVerify2fa, doResend2fa } from '../../state/actions';
import { traduzir } from '../../i18n/dict';
import { fieldLabelStyle, primaryButtonStyle, linkButtonStyle } from '../../theme/styles';
import { AuthChrome } from './AuthChrome';

export function Verify2faScreen() {
  const { state, patch } = useApp();
  const [codigo, setCodigo] = useState('');
  const t = (k: string) => traduzir(state.idioma, k);

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!state.tempToken || codigo.length !== 6) return;
    doVerify2fa(patch, state.tempToken, codigo);
  }

  return (
    <AuthChrome>
      <form onSubmit={aoEnviar}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t('twoFactorTitle')}</div>
        <div style={{ fontSize: 13, color: 'var(--textMuted)', marginBottom: 6 }}>{t('twoFactorSubtitle')}</div>

        <div style={{ background: 'var(--accentSoft)', color: 'var(--accent)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, margin: '10px 0 16px' }}>
          {t('codeSentTo')} {state.authEmail}
        </div>

        {state.authError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{state.authError}</div>}

        <label style={fieldLabelStyle}>{t('code')}</label>
        <input
          value={codigo} maxLength={6} placeholder="000000"
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '14px 0', textAlign: 'center', fontSize: 22, fontWeight: 700,
            letterSpacing: '0.3em', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', marginBottom: 16, fontFamily: 'monospace',
          }}
        />

        <button type="submit" style={primaryButtonStyle} disabled={state.carregando}>{t('verify')}</button>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button" style={linkButtonStyle}
            onClick={() => state.tempToken && doResend2fa(patch, state.tempToken)}
          >
            {t('resendCode')}
          </button>
        </div>
      </form>
    </AuthChrome>
  );
}
