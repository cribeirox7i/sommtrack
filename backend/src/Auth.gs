/**
 * Autenticação: signup, login, 2FA por e-mail, esqueci-senha, sessão de 30 dias.
 * Senha nunca em claro: SHA-256 com sal = e-mail (lowercase) + pepper fixo.
 * Sessão: token aleatório guardado em ScriptProperties (o sandbox do GAS não
 * permite cookies próprios; o token cumpre esse papel, guardado no cliente em localStorage).
 */

/**
 * O pepper NUNCA fica no código-fonte (o repositório é público) — é lido de uma
 * Propriedade do Script, configurada uma vez em: editor do Apps Script >
 * ⚙️ Configurações do projeto > Propriedades do script > adicionar "PEPPER".
 * Trocar o valor invalida os hashes já gravados (força troca de senha de todo mundo).
 */
function pepper_() {
  var valor = PropertiesService.getScriptProperties().getProperty('PEPPER');
  if (!valor) throw new Error('Propriedade do script "PEPPER" não configurada. Veja backend/README.md.');
  return valor;
}

function hashSenha_(senhaPlana, email) {
  var sal = String(email || '').trim().toLowerCase();
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + senhaPlana + pepper_());
  return bytes.map(function (b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
}

function validarComplexidadeSenha_(senha) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(senha || '');
}

function gerarSenhaTemporaria_() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  var s = '';
  for (var i = 0; i < 8; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

function gerarCodigo2fa_() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * user_status é editado à mão diretamente na planilha (não há tela de ativação).
 * Aceita variações razoáveis de "ativo" além do "S" canônico, já que é um
 * campo de entrada humana — mas o app sempre GRAVA apenas 'S' ou 'N'.
 */
function statusAtivo_(valor) {
  var norm = String(valor || '').trim().toUpperCase();
  return ['S', 'SIM', 'A', 'ATIVO', 'TRUE', '1'].indexOf(norm) !== -1;
}

function buscarUsuarioPorEmail_(email) {
  var alvo = String(email || '').trim().toLowerCase();
  var usuarios = lerTodos_('USER');
  for (var i = 0; i < usuarios.length; i++) {
    if (String(usuarios[i].user_mail || '').trim().toLowerCase() === alvo) return usuarios[i];
  }
  return null;
}

function montarUsuarioPublico_(u) {
  return {
    id: Number(u.user_id),
    name: u.user_nome,
    email: u.user_mail,
    img: u.user_img || '',
    idioma: u.user_idioma || 'pt',
    paleta: u.user_paleta || 'green',
    modo: u.user_modo || 'dark',
    status: statusAtivo_(u.user_status) ? 'active' : 'inactive',
    role: u.user_role === 'admin' ? 'admin' : 'user',
  };
}

// ---- Sessões (ScriptProperties, uma propriedade por token) ----

function criarSessao_(userId) {
  var token = Utilities.getUuid().replace(/-/g, '');
  var expira = new Date(Date.now() + SESSAO_DIAS * 24 * 60 * 60 * 1000);
  PropertiesService.getScriptProperties().setProperty('sess_' + token, JSON.stringify({
    userId: userId, expira: expira.toISOString(),
  }));
  return token;
}

function validarSessao_(token) {
  if (!token) return null;
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty('sess_' + token);
  if (!raw) return null;
  var dados = JSON.parse(raw);
  if (new Date(dados.expira).getTime() < Date.now()) {
    props.deleteProperty('sess_' + token);
    return null;
  }
  return dados;
}

function revogarSessao_(token) {
  if (!token) return;
  PropertiesService.getScriptProperties().deleteProperty('sess_' + token);
}

/** Usado pelo dispatcher: valida token e retorna o usuário completo (linha da planilha) ou lança erro. */
function usuarioDaSessao_(token) {
  var sessao = validarSessao_(token);
  if (!sessao) throw new Error('Sessão expirada ou inválida. Faça login novamente.');
  var usuarios = lerTodos_('USER');
  var user = usuarios.filter(function (u) { return Number(u.user_id) === Number(sessao.userId); })[0];
  if (!user) throw new Error('Usuário da sessão não existe mais.');
  if (!statusAtivo_(user.user_status)) throw new Error('Usuário inativo.');
  return user;
}

// ---- Ações públicas (auth.*) ----

function authSignup_(payload) {
  var nome = String(payload.nome || '').trim();
  var email = String(payload.email || '').trim().toLowerCase();
  var senha = String(payload.senha || '');
  var idioma = IDIOMAS_VALIDOS.indexOf(payload.idioma) !== -1 ? payload.idioma : 'pt';

  if (!nome || !email || !senha) throw new Error('Nome, e-mail e senha são obrigatórios.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido.');
  if (!validarComplexidadeSenha_(senha)) throw new Error('Senha não atende aos requisitos mínimos.');
  if (buscarUsuarioPorEmail_(email)) throw new Error('Já existe uma conta com este e-mail.');

  var userId = inserir_('USER', {
    user_nome: nome,
    user_mail: email,
    user_pwd: hashSenha_(senha, email),
    user_img: '',
    user_idioma: idioma,
    user_paleta: 'green',
    user_modo: 'dark',
    user_url_img: '',
    user_status: 'N',
    user_role: 'user',
    user_pwd_changed_at: isoData_(new Date()),
  });

  try {
    var pastaId = criarPastaUsuario_(userId, nome);
    atualizar_('USER', 'user_id', userId, { user_url_img: pastaId });
  } catch (e) {
    registrarLog_(userId, email, 'erro_criar_pasta_drive', 'USER', userId, String(e));
  }

  registrarLog_(userId, email, 'signup', 'USER', userId, 'Cadastro criado, aguardando ativação.');
  try { enviarEmailBoasVindas_(email, nome, idioma); } catch (e) {}

  return { status: 'inactive' };
}

function authLogin_(payload) {
  var email = String(payload.email || '').trim().toLowerCase();
  var senha = String(payload.senha || '');
  var user = buscarUsuarioPorEmail_(email);

  if (!user || user.user_pwd !== hashSenha_(senha, email)) {
    registrarLog_('', email, 'login_falhou', 'USER', '', 'Credenciais inválidas.');
    throw new Error('E-mail ou senha inválidos.');
  }
  if (!statusAtivo_(user.user_status)) {
    return { step: 'inactive' };
  }

  var codigo = gerarCodigo2fa_();
  var tempToken = Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('pend_' + tempToken, JSON.stringify({
    userId: user.user_id, email: email, codigo: codigo,
  }), TOKEN_2FA_TTL_SEGUNDOS);

  try { enviarEmail2fa_(email, user.user_nome, codigo, user.user_idioma || 'pt'); } catch (e) {}

  return { step: '2fa', tempToken: tempToken };
}

function authVerify2fa_(payload) {
  var tempToken = String(payload.tempToken || '');
  var codigo = String(payload.codigo || '');
  var raw = CacheService.getScriptCache().get('pend_' + tempToken);
  if (!raw) throw new Error('Código expirado. Solicite um novo.');
  var pend = JSON.parse(raw);
  if (pend.codigo !== codigo) throw new Error('Código inválido, tente novamente.');

  CacheService.getScriptCache().remove('pend_' + tempToken);
  var user = buscarPorId_('USER', 'user_id', pend.userId);
  if (!user || !statusAtivo_(user.user_status)) throw new Error('Usuário inativo.');

  var token = criarSessao_(user.user_id);
  registrarLog_(user.user_id, user.user_mail, 'login', 'USER', user.user_id, 'Login bem-sucedido.');
  return { token: token, user: montarUsuarioPublico_(user) };
}

function authResend2fa_(payload) {
  var tempToken = String(payload.tempToken || '');
  var raw = CacheService.getScriptCache().get('pend_' + tempToken);
  if (!raw) throw new Error('Sessão de verificação expirada. Faça login novamente.');
  var pend = JSON.parse(raw);
  var novoCodigo = gerarCodigo2fa_();
  pend.codigo = novoCodigo;
  CacheService.getScriptCache().put('pend_' + tempToken, JSON.stringify(pend), TOKEN_2FA_TTL_SEGUNDOS);
  var user = buscarPorId_('USER', 'user_id', pend.userId);
  try { enviarEmail2fa_(pend.email, user ? user.user_nome : '', novoCodigo, user ? user.user_idioma : 'pt'); } catch (e) {}
  return { ok: true };
}

function authForgot_(payload) {
  var email = String(payload.email || '').trim().toLowerCase();
  var user = buscarUsuarioPorEmail_(email);
  if (user) {
    var senhaTemp = gerarSenhaTemporaria_();
    atualizar_('USER', 'user_id', user.user_id, {
      user_pwd: hashSenha_(senhaTemp, email),
      user_pwd_changed_at: isoData_(new Date()),
    });
    registrarLog_(user.user_id, email, 'esqueci_senha', 'USER', user.user_id, 'Senha temporária gerada.');
    try { enviarEmailSenhaTemporaria_(email, user.user_nome, senhaTemp, user.user_idioma || 'pt'); } catch (e) {}
  }
  // resposta neutra: nunca revela se o e-mail existe ou não
  return { ok: true };
}

function authLogout_(payload, token) {
  revogarSessao_(token);
  return { ok: true };
}
