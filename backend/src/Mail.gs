/**
 * E-mails transacionais. MailApp tem cota diária (~100/dia em contas Gmail) —
 * falhas de envio nunca devem quebrar o fluxo principal (sempre chamado em try/catch pelo Auth.gs).
 */

const EMAIL_TEXTOS_ = {
  pt: {
    boasVindasAssunto: 'SommTrack — cadastro recebido',
    boasVindasCorpo: function (nome) {
      return '<p>Olá, ' + nome + '!</p><p>Seu cadastro no <b>SommTrack</b> foi recebido e está aguardando ativação manual. Você receberá um e-mail assim que sua conta for liberada.</p>';
    },
    codigoAssunto: 'SommTrack — seu código de verificação',
    codigoCorpo: function (nome, codigo) {
      return '<p>Olá, ' + nome + '!</p><p>Seu código de verificação é:</p><p style="font-size:28px;font-weight:800;letter-spacing:0.2em;">' + codigo + '</p><p>Ele expira em 15 minutos.</p>';
    },
    senhaTempAssunto: 'SommTrack — senha temporária',
    senhaTempCorpo: function (nome, senha) {
      return '<p>Olá, ' + nome + '!</p><p>Sua senha temporária é:</p><p style="font-size:22px;font-weight:800;">' + senha + '</p><p>Entre com ela e troque sua senha em seguida, em Perfil &gt; Trocar senha.</p>';
    },
  },
  en: {
    boasVindasAssunto: 'SommTrack — sign-up received',
    boasVindasCorpo: function (nome) {
      return '<p>Hi, ' + nome + '!</p><p>Your SommTrack sign-up was received and is awaiting manual activation. You will get an e-mail once your account is approved.</p>';
    },
    codigoAssunto: 'SommTrack — your verification code',
    codigoCorpo: function (nome, codigo) {
      return '<p>Hi, ' + nome + '!</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:800;letter-spacing:0.2em;">' + codigo + '</p><p>It expires in 15 minutes.</p>';
    },
    senhaTempAssunto: 'SommTrack — temporary password',
    senhaTempCorpo: function (nome, senha) {
      return '<p>Hi, ' + nome + '!</p><p>Your temporary password is:</p><p style="font-size:22px;font-weight:800;">' + senha + '</p><p>Sign in with it and change your password afterwards, under Profile &gt; Change password.</p>';
    },
  },
  es: {
    boasVindasAssunto: 'SommTrack — registro recibido',
    boasVindasCorpo: function (nome) {
      return '<p>¡Hola, ' + nome + '!</p><p>Tu registro en SommTrack fue recibido y espera activación manual. Recibirás un correo cuando tu cuenta sea aprobada.</p>';
    },
    codigoAssunto: 'SommTrack — tu código de verificación',
    codigoCorpo: function (nome, codigo) {
      return '<p>¡Hola, ' + nome + '!</p><p>Tu código de verificación es:</p><p style="font-size:28px;font-weight:800;letter-spacing:0.2em;">' + codigo + '</p><p>Expira en 15 minutos.</p>';
    },
    senhaTempAssunto: 'SommTrack — contraseña temporal',
    senhaTempCorpo: function (nome, senha) {
      return '<p>¡Hola, ' + nome + '!</p><p>Tu contraseña temporal es:</p><p style="font-size:22px;font-weight:800;">' + senha + '</p><p>Inicia sesión con ella y cámbiala luego en Perfil &gt; Cambiar contraseña.</p>';
    },
  },
};

function rodapeEmail_(idioma) {
  var dica = {
    pt: 'Se aparecer "Não foi possível abrir o arquivo", abra o link em uma janela anônima ou em um navegador com apenas uma conta Google.',
    en: 'If you see "Unable to open file", open the link in an incognito window or a browser signed into only one Google account.',
    es: 'Si aparece "No se pudo abrir el archivo", abre el enlace en una ventana de incógnito o en un navegador con una sola cuenta de Google.',
  }[idioma] || '';
  return '<p style="margin-top:24px;font-size:11px;color:#888;">' + dica + '</p>';
}

function envolverHtml_(corpo, idioma) {
  return '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#161412;color:#f0e9e0;border-radius:12px;">' +
    '<div style="font-size:18px;font-weight:800;margin-bottom:16px;">🍷 SommTrack</div>' +
    corpo + rodapeEmail_(idioma) + '</div>';
}

function enviarEmail2fa_(destinatario, nome, codigo, idioma) {
  var t = EMAIL_TEXTOS_[idioma] || EMAIL_TEXTOS_.pt;
  MailApp.sendEmail({
    to: destinatario,
    subject: t.codigoAssunto,
    htmlBody: envolverHtml_(t.codigoCorpo(nome, codigo), idioma),
  });
}

function enviarEmailBoasVindas_(destinatario, nome, idioma) {
  var t = EMAIL_TEXTOS_[idioma] || EMAIL_TEXTOS_.pt;
  MailApp.sendEmail({
    to: destinatario,
    subject: t.boasVindasAssunto,
    htmlBody: envolverHtml_(t.boasVindasCorpo(nome), idioma),
  });
}

function enviarEmailSenhaTemporaria_(destinatario, nome, senhaTemp, idioma) {
  var t = EMAIL_TEXTOS_[idioma] || EMAIL_TEXTOS_.pt;
  MailApp.sendEmail({
    to: destinatario,
    subject: t.senhaTempAssunto,
    htmlBody: envolverHtml_(t.senhaTempCorpo(nome, senhaTemp), idioma),
  });
}
