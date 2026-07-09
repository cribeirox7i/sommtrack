/**
 * Funções a rodar manualmente no editor Apps Script (uma vez, ou após mudanças de schema).
 */

/** Cria as abas que faltarem e garante que os cabeçalhos oficiais existam (não apaga dados). */
function setupBanco() {
  var ss = ss_();
  Object.keys(SHEETS_DEF).forEach(function (nomeAba) {
    var headers = SHEETS_DEF[nomeAba];
    var sheet = ss.getSheetByName(nomeAba);
    if (!sheet) {
      sheet = ss.insertSheet(nomeAba);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return;
    }
    var lastCol = sheet.getLastColumn();
    var existentes = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(normalizarCabecalho_) : [];
    var faltando = headers.filter(function (h) { return existentes.indexOf(h) === -1; });
    if (faltando.length) {
      sheet.getRange(1, lastCol + 1, 1, faltando.length).setValues([faltando]);
    }
    if (lastCol === 0) sheet.setFrozenRows(1);
  });

  seedListaPaises_();
  seedListaBjcp_();

  Logger.log('setupBanco concluído.');
}

function seedListaPaises_() {
  var existentes = lerTodos_('LIST_PAIS');
  if (existentes.length > 0) return;
  SEED_PAISES.forEach(function (nome) {
    inserir_('LIST_PAIS', { pais_nome: nome, pais_img: SEED_FLAGS[nome] || '' });
  });
}

function seedListaBjcp_() {
  var existentes = lerTodos_('list_bjcp_21');
  if (existentes.length > 0) return;
  SEED_BJCP21.forEach(function (linha) {
    var partes = linha.split(' - ');
    var cod = partes.shift();
    var subestilo = partes.join(' - ');
    inserir_('list_bjcp_21', { bjcp21_cod: cod, bjcp21_subestilo: subestilo });
  });
}

/**
 * Toca todos os serviços usados pelo app para disparar o pedido de permissões
 * completo no editor (rodar manualmente após mudanças de escopo/manifesto).
 */
function testeAutorizacao() {
  var ss = ss_();
  Logger.log('Planilha OK: ' + ss.getName());

  var pastaGeral = DriveApp.getFolderById(DRIVE_GERAL_FOLDER_ID);
  Logger.log('Pasta geral OK: ' + pastaGeral.getName());

  var pastaItens = DriveApp.getFolderById(DRIVE_ITENS_BASE_FOLDER_ID);
  Logger.log('Pasta de itens OK: ' + pastaItens.getName());

  Logger.log('Cota diária de e-mail restante: ' + MailApp.getRemainingDailyQuota());

  var cache = CacheService.getScriptCache();
  cache.put('teste_autorizacao', '1', 60);
  Logger.log('CacheService OK: ' + cache.get('teste_autorizacao'));

  var props = PropertiesService.getScriptProperties();
  props.setProperty('teste_autorizacao', '1');
  Logger.log('PropertiesService OK: ' + props.getProperty('teste_autorizacao'));

  Logger.log('Todos os serviços autorizados com sucesso.');
}
