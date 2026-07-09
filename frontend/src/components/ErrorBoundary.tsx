import { Component, type ReactNode } from 'react';
import { primaryButtonStyle, v } from '../theme/styles';

interface Props { children: ReactNode }
interface State { erro: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error) {
    return { erro };
  }

  componentDidCatch(erro: Error, info: { componentStack: string }) {
    // eslint-disable-next-line no-console
    console.error('SommTrack crash:', erro, info.componentStack);
  }

  render() {
    if (this.state.erro) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', background: 'var(--bg, #131110)', color: 'var(--text, #eee)',
        }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Algo deu errado</div>
          <div style={{ fontSize: 12.5, color: v.textMuted, maxWidth: 320, fontFamily: 'monospace', wordBreak: 'break-word' }}>
            {this.state.erro.message}
          </div>
          <button style={{ ...primaryButtonStyle, width: 'auto', padding: '10px 24px' }} onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
