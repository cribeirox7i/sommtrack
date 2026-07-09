# SommTrack — Backend (Google Apps Script)

API JSON pura sobre a planilha do Google Sheets. Não serve HTML — o frontend (React, hospedado no GitHub Pages) chama esta API via `fetch`.

## Arquivos (`src/`)
- `Constantes.gs` — IDs da planilha/pastas Drive, listas de seed, enums válidos.
- `Sheets.gs` — camada de acesso à planilha (leitura tolerante a cabeçalho, autoincrement, `LockService`).
- `Setup.gs` — `setupBanco()` e `testeAutorizacao()` (rodar manualmente no editor).
- `Auth.gs` — signup/login/2FA/esqueci-senha/sessão.
- `Drive.gs` — upload de imagens (perfil e itens, segregado por usuário).
- `Mail.gs` — e-mails transacionais (pt/en/es).
- `Api.gs` — regras de negócio: catálogo, stats, RELAC, perfil, admin.
- `Main.gs` — `doGet`/`doPost` + dispatcher único `api(acao, payload, token)`.
- `appsscript.json` — manifesto do Web App.

## Passo a passo de implantação

### 1. Antes de tudo — configurar o PEPPER
O pepper usado no hash de senha (`Auth.gs`, `pepper_()`) **não fica no código** — o repositório é público no GitHub. Configure-o como Propriedade do Script:

No editor do Apps Script: **⚙️ Configurações do projeto → Propriedades do script → Adicionar propriedade do script** → nome `PEPPER`, valor: qualquer string longa e aleatória só sua.

Sem essa propriedade configurada, `hashSenha_` lança erro e login/signup não funcionam. Trocar o valor depois invalida os hashes já gravados (força troca de senha de todo mundo).

### 2. Criar o projeto Apps Script
**Opção A — clasp (recomendado, permite versionar `backend/src` no git):**
```bash
npm install -g @google/clasp
clasp login
cd backend
clasp create --type webapp --title "SommTrack API" --rootDir ./src
clasp push
```

**Opção B — colar manualmente no editor:**
Abra [script.google.com](https://script.google.com), crie um projeto novo, cole cada arquivo de `src/` (criando os arquivos `.gs` com os mesmos nomes) e substitua o conteúdo de `appsscript.json` em "Editor > Configurações do projeto > Mostrar arquivo de manifesto".

### 3. Autorizar
No editor, selecione a função `testeAutorizacao` e rode (▶). Aceite o aviso "app não verificado" → Avançado → Acessar. Isso concede permissão para Planilhas, Drive e Gmail de uma vez.

### 4. Criar as abas da planilha
Rode a função `setupBanco()` uma vez (cria as abas/cabeçalhos que faltarem e semeia `LIST_PAIS`/`list_bjcp_21`; nunca apaga dados existentes).

### 5. Implantar como Web App
`Implantar > Nova implantação > Tipo: App da Web`:
- **Executar como:** Eu (senão MailApp/Planilha falham para visitantes)
- **Quem pode acessar:** Qualquer pessoa

Copie a URL `.../exec` gerada — é o `VITE_API_URL` do frontend.

### 6. Fluxo de atualização
- Para testar mudanças: use a URL `/dev` (implantações de teste, sempre serve o código salvo).
- Para publicar: `clasp push` (ou colar de novo) e depois `Implantar > Gerenciar implantações > editar (lápis) > Nova versão` na implantação existente — **nunca** crie uma nova implantação a cada mudança (gera URLs órfãs e quebra o frontend).
- Após mexer em escopos/manifesto: rode `testeAutorizacao` de novo antes de gerar nova versão.

## Limitações conhecidas
- Sessões (30 dias) ficam em `PropertiesService` (uma propriedade por token, prefixo `sess_`) — não há expurgo automático de tokens vencidos; eles são ignorados na validação mas continuam ocupando espaço. Se isso crescer muito, criar um gatilho diário chamando uma função de limpeza.
- `MailApp` tem cota diária (~100/dia em contas Gmail pessoais).
- Sem CORS: o frontend deve enviar `Content-Type: text/plain` no `fetch` (ver `frontend/src/api/client.ts`) para evitar o preflight `OPTIONS`, que o Apps Script Web App não responde.
