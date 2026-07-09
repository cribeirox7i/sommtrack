/**
 * Ponto de entrada do Web App: doGet/doPost -> dispatcher único `api(acao, payload, token)`.
 * Ações 'auth.*' são públicas; todas as demais exigem sessão válida (token de 30 dias).
 *
 * CORS: o frontend deve chamar via fetch com Content-Type: text/plain (não application/json)
 * para evitar o preflight OPTIONS, que o Apps Script Web App não responde. Ver frontend/src/api/client.ts.
 */

const ACOES_PUBLICAS_ = ['auth.signup', 'auth.login', 'auth.verify2fa', 'auth.resend2fa', 'auth.forgot', 'auth.logout'];

function api(acao, payload, token) {
  payload = payload || {};
  var user = null;
  if (ACOES_PUBLICAS_.indexOf(acao) === -1) {
    user = usuarioDaSessao_(token);
  }

  switch (acao) {
    case 'auth.signup': return authSignup_(payload);
    case 'auth.login': return authLogin_(payload);
    case 'auth.verify2fa': return authVerify2fa_(payload);
    case 'auth.resend2fa': return authResend2fa_(payload);
    case 'auth.forgot': return authForgot_(payload);
    case 'auth.logout': return authLogout_(payload, token);

    case 'auth.me': return montarUsuarioPublico_(user);

    case 'home.dashboard': return homeDashboard_(payload, user);
    case 'busca.global': return buscaGlobal_(payload, user);

    case 'catalogo.listar': return catalogoListar_(payload, user);
    case 'catalogo.salvar': return catalogoSalvar_(payload, user);
    case 'catalogo.excluir': return catalogoExcluir_(payload, user);
    case 'catalogo.duplicar': return catalogoDuplicar_(payload, user);
    case 'catalogo.stats': return catalogoStats_(payload, user);

    case 'relac.listar': return relacListar_(payload, user);
    case 'listas.paises': return listasPaises_();
    case 'listas.bjcp': return listasBjcp_();

    case 'perfil.salvar': return perfilSalvar_(payload, user);
    case 'perfil.trocarSenha': return perfilTrocarSenha_(payload, user);
    case 'perfil.uploadFoto': return perfilUploadFoto_(payload, user);

    case 'admin.listarUsuarios': return adminListarUsuarios_(payload, user);
    case 'admin.setStatus': return adminSetStatus_(payload, user);
    case 'admin.log': return adminLog_(payload, user);

    default: throw new Error('Ação desconhecida: ' + acao);
  }
}

function respostaJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function executarChamada_(acao, payload, token) {
  try {
    var data = api(acao, payload, token);
    return respostaJson_({ ok: true, data: data });
  } catch (err) {
    return respostaJson_({ ok: false, erro: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respostaJson_({ ok: false, erro: 'Corpo da requisição inválido.' });
  }
  return executarChamada_(body.acao, body.payload, body.token);
}

function doGet(e) {
  if (e.parameter && e.parameter.acao) {
    var payload = {};
    try { payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {}; } catch (err) {}
    return executarChamada_(e.parameter.acao, payload, e.parameter.token);
  }
  return ContentService.createTextOutput('SommTrack API online.').setMimeType(ContentService.MimeType.TEXT);
}
