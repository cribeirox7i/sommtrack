import { useState, type FormEvent } from 'react';
import { useApp } from '../../state/store';
import { doSignup } from '../../state/actions';
import { traduzir } from '../../i18n/dict';
import { fieldLabelStyle, inputStyle, primaryButtonStyle, linkButtonStyle } from '../../theme/styles';
import { AuthChrome } from './AuthChrome';

const REGEX_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function SignupScreen() {
  const { state, patch } = useApp();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const t = (k: string) => traduzir(state.idioma, k);

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!nome || !email || !senha) return;
    if (!REGEX_SENHA.test(senha)) { patch({ authError: t('pwWeak') }); return; }
    doSignup(patch, nome, email, senha, state.idioma);
  }

  return (
    <AuthChrome>
      <form onSubmit={aoEnviar}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t('createYourAccount')}</div>
        <div style={{ fontSize: 13, color: 'var(--textMuted)', marginBottom: 20 }}>{t('signupSubtitle')}</div>

        <label style={fieldLabelStyle}>{t('friendlyName')}</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ana" style={inputStyle} />

        <label style={fieldLabelStyle}>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />

        <label style={fieldLabelStyle}>{t('password')}</label>
        <div style={{ position: 'relative' }}>
          <input
            type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44, marginBottom: 6 }}
          />
          <button type="button" onClick={() => setMostrarSenha((v) => !v)} style={{
            position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15,
          }}>
            {mostrarSenha ? '🙈' : '👁'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--textMuted)', marginBottom: 12 }}>{t('passwordRequirements')}</div>

        {state.authError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{state.authError}</div>}

        <button type="submit" style={primaryButtonStyle} disabled={state.carregando}>{t('createAccount')}</button>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button type="button" style={linkButtonStyle} onClick={() => patch({ tela: 'login', authError: null })}>{t('alreadyHaveAccount')}</button>
        </div>
      </form>
    </AuthChrome>
  );
}
