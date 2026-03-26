// -----------------------------------------------
// suporteController.js
// Tema: Controller — Suporte / Chamados
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const nodemailer = require('nodemailer');
const { getPool, sql } = require('../config/database');

// #endregion


// #region ENVIAR CHAMADO | rev.01 | 25/03/2026

// --- POST /api/suporte/chamado
// envia e-mail + grava no banco (INSERT independente do e-mail)
const enviarChamado = async (req, res) => {
  const {
    usuario, nome, email, telefone, whatsapp,
    canalContato, horarioContato,
    localProblema, nivelProblema, descricao, protocolo,
  } = req.body;

  // --- validação básica
  if (!usuario || !nome || !email || !telefone || !canalContato ||
      !horarioContato || !localProblema || !nivelProblema || !descricao || !protocolo) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  }

  if (descricao.trim().length < 20) {
    return res.status(400).json({ erro: 'Descrição deve ter no mínimo 20 caracteres.' });
  }

  // --- configuração do transporte de e-mail
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

  // --- envia e-mail
  try {
    await transporter.sendMail({
      from:    `"Sistema Re⟳Loop" <${process.env.MAIL_USER}>`,
      to:      process.env.MAIL_TO,
      subject: `[Suporte] ${protocolo} — ${nivelProblema.toUpperCase()} — ${localProblema}`,
      html:    corpo,
    });
  } catch (error) {
    console.error('[Suporte] Erro ao enviar e-mail:', error.message);
    return res.status(500).json({ erro: 'Falha ao enviar o chamado. Tente novamente.' });
  }

  // --- grava no banco em try/catch separado — não afeta retorno do e-mail
  try {
    const pool = await getPool();
    await pool.request()
      .input('protocolo',     sql.NVarChar(25),       protocolo)
      .input('usuario',       sql.NVarChar(100),      usuario)
      .input('nomeCompleto',  sql.NVarChar(200),      nome)
      .input('localProblema', sql.NVarChar(100),      localProblema)
      .input('nivelProblema', sql.NVarChar(50),       nivelProblema)
      .input('descricao',     sql.NVarChar(sql.MAX),  descricao)
      .query(`
        INSERT INTO dbo.Chamados
          (Protocolo, Usuario, NomeCompleto, LocalProblema, NivelProblema, Descricao)
        VALUES
          (@protocolo, @usuario, @nomeCompleto, @localProblema, @nivelProblema, @descricao)
      `);
  } catch (dbError) {
    console.error('[Suporte] Erro ao gravar chamado no banco:', dbError.message);
  }

  return res.status(200).json({ mensagem: 'Chamado enviado com sucesso.', protocolo });
};

// #endregion


// #region LISTAR CHAMADOS | rev.01 | 25/03/2026

// --- GET /api/suporte/chamados?usuario=xxx&dataInicial=&dataFinal=
const listarChamados = async (req, res) => {
  const { usuario, dataInicial, dataFinal } = req.query;

  if (!usuario) {
    return res.status(400).json({ erro: 'Parâmetro usuario é obrigatório.' });
  }

  try {
    const pool    = await getPool();
    const request = pool.request().input('usuario', sql.NVarChar(100), usuario);

    let where = 'WHERE Usuario = @usuario';

    if (dataInicial) {
      request.input('dataInicial', sql.Date, dataInicial);
      where += ' AND CAST(DataEnvio AS DATE) >= @dataInicial';
    }
    if (dataFinal) {
      request.input('dataFinal', sql.Date, dataFinal);
      where += ' AND CAST(DataEnvio AS DATE) <= @dataFinal';
    }

    const result = await request.query(`
      SELECT ChamadoId, Protocolo, LocalProblema, NivelProblema, DataEnvio, Resolvido, Qualidade
      FROM dbo.Chamados
      ${where}
      ORDER BY DataEnvio DESC
    `);

    return res.json(result.recordset);
  } catch (error) {
    console.error('[Suporte] Erro ao listar chamados:', error.message);
    return res.status(500).json({ erro: 'Erro ao carregar histórico de chamados.' });
  }
};

// #endregion


// #region ATUALIZAR RESOLVIDO | rev.01 | 25/03/2026

// --- PATCH /api/suporte/chamados/:id/resolvido
const atualizarResolvido = async (req, res) => {
  const { id } = req.params;
  const { resolvido } = req.body;

  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const pool = await getPool();
    await pool.request()
      .input('id',        sql.Int, Number(id))
      .input('resolvido', sql.Bit, resolvido ? 1 : 0)
      .query(`UPDATE dbo.Chamados SET Resolvido = @resolvido WHERE ChamadoId = @id`);

    return res.json({ mensagem: 'Atualizado com sucesso.' });
  } catch (error) {
    console.error('[Suporte] Erro ao atualizar resolvido:', error.message);
    return res.status(500).json({ erro: 'Erro ao atualizar chamado.' });
  }
};

// #endregion


// #region ATUALIZAR QUALIDADE | rev.01 | 25/03/2026

// --- PATCH /api/suporte/chamados/:id/qualidade
const atualizarQualidade = async (req, res) => {
  const { id } = req.params;
  const { qualidade } = req.body;

  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

  if (qualidade === null || qualidade === undefined || qualidade < 1 || qualidade > 5) {
    return res.status(400).json({ erro: 'Qualidade deve ser entre 1 e 5.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('id',        sql.Int,     Number(id))
      .input('qualidade', sql.TinyInt, Number(qualidade))
      .query(`UPDATE dbo.Chamados SET Qualidade = @qualidade WHERE ChamadoId = @id`);

    return res.json({ mensagem: 'Avaliação registrada com sucesso.' });
  } catch (error) {
    console.error('[Suporte] Erro ao atualizar qualidade:', error.message);
    return res.status(500).json({ erro: 'Erro ao registrar avaliação.' });
  }
};

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = { enviarChamado, listarChamados, atualizarResolvido, atualizarQualidade };

// #endregion
