/**
 * Camada de acesso à planilha: leitura tolerante a cabeçalho, autoincrement,
 * escrita com LockService. Nenhuma outra parte do backend deve chamar
 * SpreadsheetApp diretamente — sempre passar por estas funções.
 */

function normalizarCabecalho_(nome) {
  return String(nome || '')
    .trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_');
}

// Cache válido só durante a execução atual (evita reabrir a planilha a cada
// aba lida — homeDashboard_, por exemplo, lê 4 abas na mesma requisição).
var _ssCache_ = null;
function ss_() {
  if (!_ssCache_) _ssCache_ = SpreadsheetApp.openById(SHEET_ID);
  return _ssCache_;
}

function planilha_(nomeAba) {
  var ss = ss_();
  var sheet = ss.getSheetByName(nomeAba);
  if (!sheet) throw new Error('Aba não encontrada: ' + nomeAba);
  return sheet;
}

function mapaCabecalho_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) {
    var norm = normalizarCabecalho_(h);
    if (norm) map[norm] = i + 1; // 1-based
  });
  return map;
}

function isoData_(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
  }
  return valor === '' || valor === null || valor === undefined ? '' : String(valor);
}

/** Lê todas as linhas de uma aba como objetos {campo: valor}, com _row (nº da linha real). */
function lerTodos_(nomeAba) {
  var sheet = planilha_(nomeAba);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var headerMap = mapaCabecalho_(sheet);
  var invertido = Object.keys(headerMap).reduce(function (acc, k) { acc[headerMap[k]] = k; return acc; }, {});
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var out = [];
  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    // Considera linha real só quando a 1ª coluna (id/autoincrement) está preenchida —
    // evita tratar como registro linhas "fantasma" com formatação/preenchimento
    // acidental em alguma coluna (ex.: arrastar uma fórmula/valor por milhares de linhas).
    var primeiraCelula = row[0];
    var idVazio = primeiraCelula === '' || primeiraCelula === null || primeiraCelula === undefined;
    if (idVazio) continue;
    var obj = { _row: r + 2 };
    for (var c = 0; c < row.length; c++) {
      var campo = invertido[c + 1];
      if (!campo) continue;
      obj[campo] = isoData_(row[c]);
    }
    out.push(obj);
  }
  return out;
}

function buscarPorId_(nomeAba, idCampo, idValor) {
  var todos = lerTodos_(nomeAba);
  for (var i = 0; i < todos.length; i++) {
    if (String(todos[i][idCampo]) === String(idValor)) return todos[i];
  }
  return null;
}

function comLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/** Insere um registro novo, gerando autoincrement no campo id (primeira coluna definida). */
function inserir_(nomeAba, dados) {
  return comLock_(function () {
    var sheet = planilha_(nomeAba);
    var headers = SHEETS_DEF[nomeAba];
    var idCampo = headers[0];
    var existentes = lerTodos_(nomeAba);
    var maxId = existentes.reduce(function (max, r) {
      var v = Number(r[idCampo]) || 0;
      return v > max ? v : max;
    }, 0);
    var novoId = maxId + 1;
    var registro = Object.assign({}, dados, {});
    registro[idCampo] = novoId;
    var linha = headers.map(function (h) { return registro[h] !== undefined ? registro[h] : ''; });
    sheet.appendRow(linha);
    return novoId;
  });
}

/** Atualiza campos de um registro existente (por id), preservando os demais. */
function atualizar_(nomeAba, idCampo, idValor, patch) {
  return comLock_(function () {
    var sheet = planilha_(nomeAba);
    var headerMap = mapaCabecalho_(sheet);
    var idColIdx = headerMap[idCampo];
    if (!idColIdx) throw new Error('Campo id não encontrado: ' + idCampo);
    var lastRow = sheet.getLastRow();
    var idsColuna = sheet.getRange(2, idColIdx, Math.max(0, lastRow - 1), 1).getValues();
    var linhaAlvo = -1;
    for (var i = 0; i < idsColuna.length; i++) {
      if (String(idsColuna[i][0]) === String(idValor)) { linhaAlvo = i + 2; break; }
    }
    if (linhaAlvo === -1) throw new Error('Registro não encontrado: ' + idCampo + '=' + idValor);
    Object.keys(patch).forEach(function (campo) {
      var col = headerMap[normalizarCabecalho_(campo)];
      if (col) sheet.getRange(linhaAlvo, col).setValue(patch[campo]);
    });
    return true;
  });
}

function excluir_(nomeAba, idCampo, idValor) {
  return comLock_(function () {
    var sheet = planilha_(nomeAba);
    var headerMap = mapaCabecalho_(sheet);
    var idColIdx = headerMap[idCampo];
    var lastRow = sheet.getLastRow();
    var idsColuna = sheet.getRange(2, idColIdx, Math.max(0, lastRow - 1), 1).getValues();
    for (var i = 0; i < idsColuna.length; i++) {
      if (String(idsColuna[i][0]) === String(idValor)) {
        sheet.deleteRow(i + 2);
        return true;
      }
    }
    return false;
  });
}

/** Grava entrada no LOG; nunca derruba a operação principal. */
function registrarLog_(userId, userMail, acao, tabela, registroId, detalhe) {
  try {
    inserir_('LOG', {
      log_data: isoData_(new Date()),
      user_id: userId || '',
      user_mail: userMail || '',
      acao: acao || '',
      tabela: tabela || '',
      registro_id: registroId || '',
      detalhe: detalhe || '',
    });
  } catch (e) {
    // silencioso: log nunca pode quebrar a operação principal
  }
}
