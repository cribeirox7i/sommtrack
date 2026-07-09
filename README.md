# SommTrack

App de sommelieria para cervejas, vinhos, drinks e destilados: registre degustações, avalie com estrelas, navegue em modo deck/tabela/galeria e acompanhe perfis de outros usuários (RELAC).

- **Frontend**: React + TypeScript + Vite, hospedado no GitHub Pages (`frontend/`).
- **Backend**: Google Apps Script — API JSON pura sobre Google Sheets (`backend/`).
- **Imagens**: Google Drive (pasta geral + subpasta por usuário).

Design de referência: `_handoff_extracted/design_handoff_sommtrack/` (protótipo interativo do Code Design — não é código de produção, é a especificação visual/comportamental que este projeto implementa).

## Decisões confirmadas com o product owner
- Destilados tem 5ª aba própria na barra inferior (Home/Cervejas/Vinhos/Drinks/Destilados).
- A tela de Drinks não tem tags de cor/estilo (a aba DRINK real não tem essas colunas).
- Papel de admin é a coluna `user_role` (admin/user) na aba USER.
- Paleta de cores: 7 opções (verde/vermelho/amarelo/azul/roxo/rosa/laranja).

## Como rodar

### 1. Backend
Siga `backend/README.md` (criar o Web App do Apps Script, rodar `setupBanco()`/`testeAutorizacao()`, implantar e copiar a URL `/exec`).

### 2. Frontend
Requer [Node.js](https://nodejs.org) 20+ instalado.
```bash
cd frontend
cp .env.example .env   # cole a URL do Web App em VITE_API_URL
npm install
npm run dev
```

### 3. Deploy (GitHub Pages)
1. Em Settings → Pages do repositório, defina "Source: GitHub Actions".
2. Em Settings → Secrets and variables → Actions, crie o secret `VITE_API_URL` com a URL do Web App.
3. Ajuste `frontend/vite.config.ts` (`base`) se o nome do repositório não for `SommTrack`.
4. Um push em `main` que altere `frontend/**` dispara `.github/workflows/deploy.yml`.

## Estrutura
```
SommTrack/
  backend/    # Google Apps Script (API JSON)
  frontend/   # React + TS + Vite (SPA estática)
  .github/workflows/deploy.yml
```

## Limitações conhecidas
- Sem CORS "de verdade": o frontend envia `Content-Type: text/plain` para evitar o preflight OPTIONS que o Apps Script Web App não responde.
- Sessões de 30 dias ficam em `PropertiesService` do backend (uma propriedade por token) — não há expurgo automático de tokens vencidos.
- `MailApp` tem cota diária (~100/dia em contas Gmail pessoais) — 2FA e e-mails transacionais dependem dela.
- Não há PWA/ícone de instalação real: GitHub Pages serve um site estático comum (sem manifest/service worker configurado neste primeiro corte).
