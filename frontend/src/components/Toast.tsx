import { useEffect } from 'react';
import { toastStyle } from '../theme/styles';
import { useApp } from '../state/store';

export function Toast() {
  const { state, patch } = useApp();
  useEffect(() => {
    if (!state.toast) return;
    const id = setTimeout(() => patch({ toast: null }), 2500);
    return () => clearTimeout(id);
  }, [state.toast]);

  if (!state.toast) return null;
  return <div style={toastStyle}>{state.toast}</div>;
}
