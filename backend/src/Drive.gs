/**
 * Upload de imagens no Google Drive. Fotos de perfil/gerais vão na pasta geral;
 * fotos de itens (cerveja/vinho/drink/destilado) vão na subpasta do usuário dono,
 * criada automaticamente no cadastro (ver criarPastaUsuario_).
 */

const LIMITE_IMAGEM_BYTES = 4 * 1024 * 1024;

function criarPastaUsuario_(userId, nome) {
  var base = DriveApp.getFolderById(DRIVE_ITENS_BASE_FOLDER_ID);
  var nomePasta = userId + '_' + String(nome || '').replace(/[^\w\s-]/g, '').trim();
  var pasta = base.createFolder(nomePasta);
  return pasta.getId();
}

function pastaDoUsuario_(user) {
  if (user.user_url_img) {
    try { return DriveApp.getFolderById(user.user_url_img); } catch (e) {}
  }
  return DriveApp.getFolderById(DRIVE_ITENS_BASE_FOLDER_ID);
}

/**
 * dataUrl no formato "data:<mime>;base64,<dados>". Retorna {id, url}.
 * destino: 'perfil' (pasta geral) ou 'item' (pasta do próprio usuário).
 */
function salvarImagem_(dataUrl, nomeSugerido, user, destino) {
  var match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('Formato de imagem inválido.');
  var mime = match[1];
  var base64 = match[2];
  var tamanhoAprox = base64.length * 0.75;
  if (tamanhoAprox > LIMITE_IMAGEM_BYTES) throw new Error('Imagem maior que o limite de 4 MB.');

  var bytes = Utilities.base64Decode(base64);
  var blob = Utilities.newBlob(bytes, mime, nomeSugerido || 'imagem');
  var pasta = destino === 'item' ? pastaDoUsuario_(user) : DriveApp.getFolderById(DRIVE_GERAL_FOLDER_ID);
  var arquivo = pasta.createFile(blob);
  arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { id: arquivo.getId(), url: urlThumbnail_(arquivo.getId()) };
}

function urlThumbnail_(idOuUrl, tamanho) {
  if (!idOuUrl) return '';
  if (/^https?:\/\//.test(idOuUrl)) return idOuUrl;
  return 'https://drive.google.com/thumbnail?id=' + idOuUrl + '&sz=w' + (tamanho || 600);
}
