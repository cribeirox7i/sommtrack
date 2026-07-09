import { useEffect } from 'react';
import { useApp } from './state/store';
import { restaurarSessao } from './state/actions';
import { getToken } from './api/client';
import { aplicarThemeNoDocumento, buildTheme } from './theme/theme';
import { pageStyle } from './theme/styles';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';

import { LoginScreen } from './screens/auth/Login';
import { SignupScreen } from './screens/auth/Signup';
import { ForgotScreen } from './screens/auth/Forgot';
import { Verify2faScreen } from './screens/auth/Verify2fa';
import { InactiveScreen } from './screens/auth/Inactive';
import { HomeScreen } from './screens/Home';
import { CategoryListScreen } from './screens/CategoryList';
import { ItemDetailScreen } from './screens/ItemDetail';
import { StatsScreen } from './screens/Stats';
import { ProfileScreen } from './screens/Profile';

export function App() {
  const { state, patch } = useApp();

  useEffect(() => {
    aplicarThemeNoDocumento(buildTheme(state.paleta, state.modo));
  }, [state.paleta, state.modo]);

  useEffect(() => {
    const token = getToken();
    if (token) restaurarSessao(patch, token);
  }, []);

  const comBottomNav = state.tela === 'home' || state.tela === 'list';

  return (
    <div className="app-shell" style={{ ...pageStyle, paddingBottom: comBottomNav ? 64 : 0 }}>
      {renderTela()}
      {comBottomNav && <BottomNav />}
      <Toast />
    </div>
  );

  function renderTela() {
    switch (state.tela) {
      case 'login': return <LoginScreen />;
      case 'signup': return <SignupScreen />;
      case 'forgot': return <ForgotScreen />;
      case 'verify2fa': return <Verify2faScreen />;
      case 'inactive': return <InactiveScreen />;
      case 'home': return <HomeScreen />;
      case 'list': return <CategoryListScreen />;
      case 'detail': return <ItemDetailScreen />;
      case 'stats': return <StatsScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <LoginScreen />;
    }
  }
}
