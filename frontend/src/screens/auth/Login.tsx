import { useState, type FormEvent } from 'react';
import { useApp } from '../../state/store';
import { doLogin } from '../../state/actions';
import { traduzir } from '../../i18n/dict';
import { fieldLabelStyle, inputStyle, primaryButtonStyle, linkButtonStyle } from '../../theme/styles';
import { AuthChrome } from './AuthChrome';

export function LoginScreen() {
  const { state, patch } = useApp();
  const [email, setEmail] = useState(state.authEmail);
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const t = (k: string) => traduzir(state.idioma, k);

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;
    doLogin(patch, email, senha);
  }

  return (
    <AuthChrome>
      <form onSubmit={aoEnviar}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t('welcomeBack')}</div>
        <div style={{ fontSize: 13, color: 'var(--textMuted)', marginBottom: 20 }}>{t('loginSubtitle')}</div>

        <label style={fieldLabelStyle}>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />

        <label style={fieldLabelStyle}>{t('password')}</label>
        <div style={{ position: 'relative' }}>
          <input
            type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
          />
          <button type="button" onClick={() => setMostrarSenha((v) => !v)} style={{
            position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15,
          }}>
            {mostrarSenha ? '🙈' : '👁'}
          </button>
        </div>

        {state.authError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{state.authError}</div>}

        <button type="submit" style={primaryButtonStyle} disabled={state.carregando}>{t('enter')}</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
          <button type="button" style={linkButtonStyle} onClick={() => patch({ tela: 'forgot', authError: null })}>{t('forgotPassword')}</button>
          <button type="button" style={linkButtonStyle} onClick={() => patch({ tela: 'signup', authError: null })}>{t('createAccount')}</button>
        </div>
      </form>
    </AuthChrome>
  );
}
