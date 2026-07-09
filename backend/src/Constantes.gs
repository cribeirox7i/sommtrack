/**
 * Constantes globais do backend SommTrack.
 */
const SHEET_ID = '1IP0SwhJjx1kkcaNy2DdSAy5CpCrFRso83NIKDoQFPc4';
const DRIVE_GERAL_FOLDER_ID = '1twJtCwg_dyuB3iLYpdGLvYWbke2S46uN';
const DRIVE_ITENS_BASE_FOLDER_ID = '1RddO9tMQVTht-97J0nZHPd2SLvIZ_gFM';

const SESSAO_DIAS = 30;
const TOKEN_2FA_TTL_SEGUNDOS = 15 * 60;

const PALETAS_VALIDAS = ['green', 'red', 'yellow', 'blue', 'purple', 'pink', 'orange'];
const IDIOMAS_VALIDOS = ['pt', 'en', 'es'];

// Definição de abas: nome real da planilha -> cabeçalhos na ordem oficial.
// (colunas de sessão/senha ficam ao final de USER e não são visíveis/editáveis pelo app)
const SHEETS_DEF = {
  USER: ['user_id', 'user_nome', 'user_mail', 'user_pwd', 'user_img', 'user_idioma', 'user_paleta', 'user_modo', 'user_url_img', 'user_status', 'user_role', 'user_pwd_changed_at'],
  RELAC: ['relac_id', 'user_id_seguido', 'user_id_seguidor'],
  BEER: ['beer_id', 'beer_nome', 'beer_produtor', 'pais_id', 'beer_ibu', 'beer_abv', 'beer_nota', 'beer_estilo_livre', 'bjcp21_id', 'beer_data', 'beer_img_nome', 'beer_img_url', 'user_id'],
  WINE: ['wine_id', 'wine_nome', 'wine_safra', 'wine_cor', 'wine_tipo', 'wine_produtor', 'pais_id', 'wine_regiao', 'wine_uva', 'wine_abv', 'wine_nota', 'wine_data_degustacao', 'wine_img_nome', 'wine_img_url', 'user_id'],
  DEST: ['dest_id', 'dest_nome', 'dest_tipo', 'dest_safra', 'dest_produtor', 'pais_id', 'dest_regiao', 'dest_abv', 'dest_nota', 'dest_data_degustacao', 'dest_img_nome', 'dest_img_url', 'user_id'],
  DRINK: ['drink_id', 'drink_nome', 'drink_produtor', 'pais_id', 'drink_regiao', 'drink_abv', 'drink_nota', 'drink_data_degustacao', 'drink_img_nome', 'drink_img_url', 'user_id'],
  LIST_PAIS: ['pais_id', 'pais_nome', 'pais_img'],
  list_bjcp_21: ['bjcp21_id', 'bjcp21_cod', 'bjcp21_subestilo'],
  LOG: ['log_id', 'log_data', 'user_id', 'user_mail', 'acao', 'tabela', 'registro_id', 'detalhe'],
};

const DEST_TIPO_VALIDOS = ['Cachaça', 'Vodka', 'Gin', 'Whisky', 'Rum', 'Tequila', 'Brandy', 'Pisco', 'Shochu', 'Sake', 'Vermute', 'Bitter'];
const WINE_COR_VALIDOS = ['Tinto', 'Branco', 'Verde', 'Laranja', 'Rosê'];
const WINE_TIPO_VALIDOS = ['Seco', 'Semi-Seco', 'Suave', 'Brut'];

// Seeds iniciais (portados do protótipo de design) para list_bjcp_21 e LIST_PAIS.
const SEED_PAISES = ['Brasil', 'EUA', 'Irlanda', 'República Tcheca', 'Alemanha', 'Argentina', 'Chile', 'França', 'Nova Zelândia', 'Escócia', 'Rússia', 'México', 'Cuba', 'Inglaterra', 'Itália'];
const SEED_FLAGS = {
  'Brasil': '🇧🇷', 'EUA': '🇺🇸', 'Irlanda': '🇮🇪', 'República Tcheca': '🇨🇿', 'Alemanha': '🇩🇪',
  'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'França': '🇫🇷', 'Nova Zelândia': '🇳🇿', 'Escócia': '🏴',
  'Rússia': '🇷🇺', 'México': '🇲🇽', 'Cuba': '🇨🇺', 'Inglaterra': '🏴', 'Itália': '🇮🇹',
};
const SEED_BJCP21 = [
  '1 - American Light Lager', '2 - International Lager', '3 - Czech Lager', '4 - Pale Malty European Lager',
  '5 - Pale Bitter European Beer', '6 - Amber Malty European Lager', '7 - Amber Bitter European Lager', '8 - Dark European Lager',
  '9 - Strong European Lager', '10 - German Wheat Beer', '11 - British Bitter', '12 - Pale Commonwealth Beer',
  '13 - Brown British Beer', '14 - Scottish Ale', '15 - Irish Beer', '16 - Dark British Beer', '17 - Strong British Ale',
  '18 - Pale American Ale', '19 - Amber and Brown American Beer', '20 - American Porter and Stout', '21 - IPA',
  '22 - Strong American Ale', '23 - European Sour Ale', '24 - Belgian Ale', '25 - Strong Belgian Ale', '26 - Trappist Ale',
  '27 - Historical Beer', '28 - American Wild Ale', '29 - Fruit Beer', '30 - Spiced Beer', '31 - Alternative Fermentables Beer',
  '32 - Specialty Beer', '33 - Alternative Fermentation Beer', '34 - Wood Beer',
];
