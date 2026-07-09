/**
 * Regras de negócio: catálogo (beer/wine/dest/drink), RELAC, stats, home, perfil, admin.
 * Toda ação aqui recebe o usuário já autenticado (ver dispatcher em Main.gs) e
 * SEMPRE revalida posse (user_id) no servidor — nunca confia no que o cliente envia.
 */

const ENTIDADES_ = {
  beer: { aba: 'BEER', id: 'beer_id', imgNome: 'beer_img_nome', imgUrl: 'beer_img_url', data: 'beer_data', pais: 'pais_id', nota: 'beer_nota', nome: 'beer_nome', produtor: 'beer_produtor', categoria: 'bjcp21_id' },
  wine: { aba: 'WINE', id: 'wine_id', imgNome: 'wine_img_nome', imgUrl: 'wine_img_url', data: 'wine_data_degustacao', pais: 'pais_id', nota: 'wine_nota', nome: 'wine_nome', produtor: 'wine_produtor', categoria: 'wine_cor' },
  dest: { aba: 'DEST', id: 'dest_id', imgNome: 'dest_img_nome', imgUrl: 'dest_img_url', data: 'dest_data_degustacao', pais: 'pais_id', nota: 'dest_nota', nome: 'dest_nome', produtor: 'dest_produtor', categoria: 'dest_tipo' },
  drink: { aba: 'DRINK', id: 'drink_id', imgNome: 'drink_img_nome', imgUrl: 'drink_img_url', data: 'drink_data_degustacao', pais: 'pais_id', nota: 'drink_nota', nome: 'drink_nome', produtor: 'drink_produtor', categoria: null },
};

const CAMPOS_EDITAVEIS_ = {
  beer: ['beer_nome', 'beer_produtor', 'pais_id', 'beer_ibu', 'beer_abv', 'beer_nota', 'beer_estilo_livre', 'bjcp21_id', 'beer_data'],
  wine: ['wine_nome', 'wine_safra', 'wine_cor', 'wine_tipo', 'wine_produtor', 'pais_id', 'wine_regiao', 'wine_uva', 'wine_abv', 'wine_nota', 'wine_data_degustacao'],
  dest: ['dest_nome', 'dest_tipo', 'dest_safra', 'dest_produtor', 'pais_id', 'dest_regiao', 'dest_abv', 'dest_nota', 'dest_data_degustacao'],
  drink: ['drink_nome', 'drink_produtor', 'pais_id', 'drink_regiao', 'drink_abv', 'drink_nota', 'drink_data_degustacao'],
};

function validarEnumsCatalogo_(tipo, patch) {
  if (tipo === 'wine') {
    if (patch.wine_cor !== undefined && WINE_COR_VALIDOS.indexOf(patch.wine_cor) === -1) throw new Error('Cor de vinho inválida.');
    if (patch.wine_tipo !== undefined && WINE_TIPO_VALIDOS.indexOf(patch.wine_tipo) === -1) throw new Error('Tipo de vinho inválido.');
  }
  if (tipo === 'dest' && patch.dest_tipo !== undefined && DEST_TIPO_VALIDOS.indexOf(patch.dest_tipo) === -1) {
    throw new Error('Tipo de destilado inválido.');
  }
}

function entidade_(tipo) {
  var cfg = ENTIDADES_[tipo];
  if (!cfg) throw new Error('Tipo de item inválido: ' + tipo);
  return cfg;
}

function relacSeguidos_(userId) {
  return lerTodos_('RELAC')
    .filter(function (r) { return Number(r.user_id_seguidor) === Number(userId); })
    .map(function (r) { return Number(r.user_id_seguido); });
}

function podeVisualizarPerfil_(user, ownerId) {
  var meuId = Number(user.user_id);
  if (Number(ownerId) === meuId) return true;
  return relacSeguidos_(meuId).indexOf(Number(ownerId)) !== -1;
}

function comImagemResolvida_(cfg, item) {
  var out = Object.assign({}, item);
  out[cfg.imgUrl] = urlThumbnail_(item[cfg.imgNome]) || item[cfg.imgUrl] || '';
  return out;
}

// ---- Catálogo (beer/wine/dest/drink) ----

function catalogoListar_(payload, user) {
  var cfg = entidade_(payload.tipo);
  var ownerId = payload.ownerId ? Number(payload.ownerId) : Number(user.user_id);
  if (!podeVisualizarPerfil_(user, ownerId)) throw new Error('Você não tem acesso a este perfil.');
  var todos = lerTodos_(cfg.aba).filter(function (r) { return Number(r.user_id) === ownerId; });
  return todos.map(function (r) { return comImagemResolvida_(cfg, r); });
}

function catalogoSalvar_(payload, user) {
  var cfg = entidade_(payload.tipo);
  var item = payload.item || {};
  var editaveis = CAMPOS_EDITAVEIS_[payload.tipo];
  var patch = {};
  editaveis.forEach(function (campo) {
    if (item[campo] !== undefined) patch[campo] = item[campo];
  });
  validarEnumsCatalogo_(payload.tipo, patch);

  var idExistente = item[cfg.id];
  var registroId;

  if (idExistente) {
    var existente = buscarPorId_(cfg.aba, cfg.id, idExistente);
    if (!existente) throw new Error('Item não encontrado.');
    if (Number(existente.user_id) !== Number(user.user_id)) throw new Error('Você não pode editar um item que não é seu.');
    registroId = idExistente;
  } else {
    patch.user_id = user.user_id;
    patch[cfg.imgNome] = '';
    patch[cfg.imgUrl] = '';
    registroId = inserir_(cfg.aba, patch);
    patch = {}; // já gravado no insert; imagem (se houver) é aplicada abaixo via atualizar_
  }

  if (item._imagemBase64) {
    var salvo = salvarImagem_(item._imagemBase64, (item[cfg.nome] || 'item') + '.jpg', user, 'item');
    patch[cfg.imgNome] = salvo.id;
    patch[cfg.imgUrl] = salvo.url;
  }

  if (Object.keys(patch).length) atualizar_(cfg.aba, cfg.id, registroId, patch);

  registrarLog_(user.user_id, user.user_mail, idExistente ? 'editar' : 'criar', cfg.aba, registroId, '');
  var salvo2 = buscarPorId_(cfg.aba, cfg.id, registroId);
  return comImagemResolvida_(cfg, salvo2);
}

function catalogoExcluir_(payload, user) {
  var cfg = entidade_(payload.tipo);
  var registro = buscarPorId_(cfg.aba, cfg.id, payload.id);
  if (!registro) throw new Error('Item não encontrado.');
  if (Number(registro.user_id) !== Number(user.user_id)) throw new Error('Você não pode excluir um item que não é seu.');
  excluir_(cfg.aba, cfg.id, payload.id);
  registrarLog_(user.user_id, user.user_mail, 'excluir', cfg.aba, payload.id, '');
  return { ok: true };
}

function catalogoDuplicar_(payload, user) {
  var cfg = entidade_(payload.tipo);
  var original = buscarPorId_(cfg.aba, cfg.id, payload.id);
  if (!original) throw new Error('Item não encontrado.');
  if (Number(original.user_id) !== Number(user.user_id)) throw new Error('Você não pode duplicar um item que não é seu.');
  var copia = {};
  CAMPOS_EDITAVEIS_[payload.tipo].forEach(function (campo) { copia[campo] = original[campo]; });
  copia[cfg.nome] = (original[cfg.nome] || '') + ' (cópia)';
  copia.user_id = user.user_id;
  copia[cfg.imgNome] = original[cfg.imgNome] || '';
  copia[cfg.imgUrl] = original[cfg.imgUrl] || '';
  var novoId = inserir_(cfg.aba, copia);
  registrarLog_(user.user_id, user.user_mail, 'duplicar', cfg.aba, novoId, 'origem=' + payload.id);
  return comImagemResolvida_(cfg, buscarPorId_(cfg.aba, cfg.id, novoId));
}

function catalogoStats_(payload, user) {
  var cfg = entidade_(payload.tipo);
  var paises = lerTodos_('LIST_PAIS');
  var flagPorNome = {};
  paises.forEach(function (p) { flagPorNome[p.pais_nome] = p.pais_img; });
  var lista = lerTodos_(cfg.aba).filter(function (r) { return Number(r.user_id) === Number(user.user_id); });

  var total = lista.length;
  var somaNotas = lista.reduce(function (acc, r) { return acc + (Number(r[cfg.nota]) || 0); }, 0);
  var media = total ? somaNotas / total : 0;

  var porPaisMap = {};
  lista.forEach(function (r) {
    var nomePais = paisNomePorId_(paises, r[cfg.pais]);
    if (!nomePais) return;
    porPaisMap[nomePais] = (porPaisMap[nomePais] || 0) + 1;
  });
  var porPais = Object.keys(porPaisMap)
    .map(function (nome) { return { nome: nome, flag: flagPorNome[nome] || '🏳️', total: porPaisMap[nome] }; })
    .sort(function (a, b) { return b.total - a.total; });

  var porCategoria = [];
  if (cfg.categoria) {
    var catMap = {};
    lista.forEach(function (r) {
      var c = r[cfg.categoria] || '—';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    var maxCat = Math.max(1, Object.keys(catMap).map(function (k) { return catMap[k]; }).reduce(function (a, b) { return Math.max(a, b); }, 0));
    porCategoria = Object.keys(catMap).map(function (nome) { return { nome: nome, total: catMap[nome], proporcao: catMap[nome] / maxCat }; })
      .sort(function (a, b) { return b.total - a.total; });
  }

  var porFabricanteMap = {};
  lista.forEach(function (r) {
    var f = r[cfg.produtor] || '—';
    porFabricanteMap[f] = (porFabricanteMap[f] || 0) + 1;
  });
  var porFabricante = Object.keys(porFabricanteMap)
    .map(function (nome) { return { nome: nome, total: porFabricanteMap[nome] }; })
    .sort(function (a, b) { return b.total - a.total; });

  return { total: total, media: media, porPais: porPais, porCategoria: porCategoria, porFabricante: porFabricante };
}

function paisNomePorId_(paises, paisId) {
  var p = paises.filter(function (x) { return String(x.pais_id) === String(paisId); })[0];
  return p ? p.pais_nome : '';
}

// ---- Home ----

function homeDashboard_(payload, user) {
  var tipos = ['beer', 'wine', 'dest', 'drink'];
  var contagens = {};
  var listasProprias = {};
  tipos.forEach(function (tipo) {
    var cfg = ENTIDADES_[tipo];
    var lista = lerTodos_(cfg.aba).filter(function (r) { return Number(r.user_id) === Number(user.user_id); });
    listasProprias[tipo] = lista;
    contagens[tipo] = lista.length;
  });

  var destaques = [];
  ['beer', 'wine', 'drink'].forEach(function (tipo) {
    var lista = listasProprias[tipo];
    if (!lista.length) return;
    var cfg = ENTIDADES_[tipo];
    var escolhido = lista[Math.floor(Math.random() * lista.length)];
    destaques.push(Object.assign({ tipo: tipo }, comImagemResolvida_(cfg, escolhido)));
  });

  return { contagens: contagens, destaques: destaques };
}

function buscaGlobal_(payload, user) {
  var termo = String(payload.query || '').trim().toLowerCase();
  if (!termo) return [];
  var paises = lerTodos_('LIST_PAIS');
  var resultado = [];
  Object.keys(ENTIDADES_).forEach(function (tipo) {
    var cfg = ENTIDADES_[tipo];
    var lista = lerTodos_(cfg.aba).filter(function (r) { return Number(r.user_id) === Number(user.user_id); });
    lista.forEach(function (r) {
      var nomePais = paisNomePorId_(paises, r[cfg.pais]);
      var alvo = [r[cfg.nome], r[cfg.produtor], nomePais].join(' ').toLowerCase();
      if (alvo.indexOf(termo) !== -1) {
        resultado.push(Object.assign({ tipo: tipo, paisNome: nomePais }, comImagemResolvida_(cfg, r)));
      }
    });
  });
  return resultado;
}

// ---- RELAC ----

function relacListar_(payload, user) {
  var ids = relacSeguidos_(user.user_id);
  if (!ids.length) return [];
  var usuarios = lerTodos_('USER');
  return usuarios
    .filter(function (u) { return ids.indexOf(Number(u.user_id)) !== -1; })
    .map(function (u) { return montarUsuarioPublico_(u); });
}

// ---- Listas auxiliares ----

function listasPaises_() { return lerTodos_('LIST_PAIS'); }
function listasBjcp_() { return lerTodos_('list_bjcp_21'); }

// ---- Perfil ----

function perfilSalvar_(payload, user) {
  var patch = {};
  if (payload.nome) patch.user_nome = String(payload.nome).trim();
  if (payload.idioma && IDIOMAS_VALIDOS.indexOf(payload.idioma) !== -1) patch.user_idioma = payload.idioma;
  if (payload.paleta && PALETAS_VALIDAS.indexOf(payload.paleta) !== -1) patch.user_paleta = payload.paleta;
  if (payload.modo === 'light' || payload.modo === 'dark') patch.user_modo = payload.modo;
  if (Object.keys(patch).length) {
    atualizar_('USER', 'user_id', user.user_id, patch);
    registrarLog_(user.user_id, user.user_mail, 'editar_perfil', 'USER', user.user_id, Object.keys(patch).join(','));
  }
  var atualizado = buscarPorId_('USER', 'user_id', user.user_id);
  return montarUsuarioPublico_(atualizado);
}

function perfilTrocarSenha_(payload, user) {
  var atual = String(payload.senhaAtual || '');
  var nova = String(payload.novaSenha || '');
  if (user.user_pwd !== hashSenha_(atual, user.user_mail)) throw new Error('Senha atual incorreta.');
  if (!validarComplexidadeSenha_(nova)) throw new Error('Nova senha não atende aos requisitos mínimos.');
  atualizar_('USER', 'user_id', user.user_id, {
    user_pwd: hashSenha_(nova, user.user_mail),
    user_pwd_changed_at: isoData_(new Date()),
  });
  registrarLog_(user.user_id, user.user_mail, 'trocar_senha', 'USER', user.user_id, '');
  return { ok: true };
}

function perfilUploadFoto_(payload, user) {
  var salvo = salvarImagem_(payload.imagemBase64, 'perfil_' + user.user_id + '.jpg', user, 'perfil');
  atualizar_('USER', 'user_id', user.user_id, { user_img: salvo.id });
  registrarLog_(user.user_id, user.user_mail, 'trocar_foto', 'USER', user.user_id, '');
  return { img: urlThumbnail_(salvo.id) };
}

// ---- Admin ----

function exigirAdmin_(user) {
  if (user.user_role !== 'admin') throw new Error('Acesso restrito a administradores.');
}

function adminListarUsuarios_(payload, user) {
  exigirAdmin_(user);
  return lerTodos_('USER').map(montarUsuarioPublico_);
}

function adminSetStatus_(payload, user) {
  exigirAdmin_(user);
  var alvo = buscarPorId_('USER', 'user_id', payload.userId);
  if (!alvo) throw new Error('Usuário não encontrado.');
  var novoStatus = payload.status === 'active' ? 'S' : 'N';
  atualizar_('USER', 'user_id', payload.userId, { user_status: novoStatus });
  registrarLog_(user.user_id, user.user_mail, 'alterar_status_usuario', 'USER', payload.userId, novoStatus);
  if (novoStatus === 'S') {
    try { enviarEmailBoasVindas_(alvo.user_mail, alvo.user_nome, alvo.user_idioma || 'pt'); } catch (e) {}
  }
  return { ok: true };
}

function adminLog_(payload, user) {
  exigirAdmin_(user);
  var linhas = lerTodos_('LOG');
  linhas.sort(function (a, b) { return new Date(b.log_data) - new Date(a.log_data); });
  return linhas.slice(0, 300);
}
