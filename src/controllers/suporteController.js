// suporteController.js | data: 24/03/2026

const nodemailer = require('nodemailer');

const enviarChamado = async (req, res) => {
  const {
    usuario,
    nome,
    email,
    telefone,
    whatsapp,
    canalContato,
    horarioContato,
    localProblema,
    nivelProblema,
    descricao,
    protocolo,
  } = req.body;

  // Validação básica no backend
  if (!usuario || !nome || !email || !telefone || !canalContato ||
      !horarioContato || !localProblema || !nivelProblema || !descricao || !protocolo) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  }

  if (descricao.trim().length < 20) {
    return res.status(400).json({ erro: 'Descrição deve ter no mínimo 20 caracteres.' });
  }

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

  const corpo = `
    <h2>Novo Chamado de Suporte</h2>
    <p><strong>Protocolo:</strong> ${protocolo}</p>
    <hr>
    <p><strong>Usuário:</strong> ${usuario}</p>
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>E-mail:</strong> ${email}</p>
    <p><strong>Telefone:</strong> ${telefone} ${whatsapp ? '(WhatsApp)' : ''}</p>
    <p><strong>Melhor Canal:</strong> ${canalContato}</p>
    <p><strong>Melhor Horário:</strong> ${horarioContato}</p>
    <hr>
    <p><strong>Local do Problema:</strong> ${localProblema}</p>
    <p><strong>Nível:</strong> ${nivelProblema}</p>
    <p><strong>Descrição:</strong></p>
    <p>${descricao}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Sistema Re⟳Loop" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: `[Suporte] ${protocolo} — ${nivelProblema.toUpperCase()} — ${localProblema}`,
      html: corpo,
    });

    return res.status(200).json({ mensagem: 'Chamado enviado com sucesso.', protocolo });
  } catch (error) {
    console.error('[Suporte] Erro ao enviar e-mail:', error.message);
    return res.status(500).json({ erro: 'Falha ao enviar o chamado. Tente novamente.' });
  }
};

module.exports = { enviarChamado };
