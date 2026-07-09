import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base = '/<nome-do-repo>/' para GitHub Pages (projeto, não usuário/organização).
// Ajuste VITE_BASE_PATH no workflow/ambiente se o nome do repositório for outro.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/SommTrack/',
});
