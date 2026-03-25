// teste-email.js
// Arquivo de teste para validar a conexão SMTP com o Google Workspace via Nodemailer.
//
// ANTES DE RODAR:
// 1. No arquivo .env na raiz do projeto, preencha as variáveis:
//    MAIL_USER=sua-conta@seu-dominio.com   (conta principal do Workspace, não alias)
//    MAIL_PASS=suasenhade16digitos          (senha de app gerada em myaccount.google.com > Segurança > Senhas de app)
//    MAIL_TO=destino@seu-dominio.com        (e-mail que vai receber o teste)
//
// 2. A conta precisa ter Verificação em duas etapas ativa.
//
// 3. Para rodar: node teste-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'login',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.MAIL_USER,
  to: process.env.MAIL_TO,
  subject: 'Teste Nodemailer — Suporte',
  text: 'Se você recebeu este e-mail, a configuração SMTP está funcionando corretamente.',
})
  .then(() => console.log('✅ E-mail enviado com sucesso!'))
  .catch(err => {
    console.log('❌ Erro ao enviar:');
    console.log(err.message);
  });
