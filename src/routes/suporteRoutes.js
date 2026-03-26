// -----------------------------------------------
// suporteRoutes.js
// Tema: Rotas da API — Suporte / Chamados
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const express = require('express');
const router = express.Router();
const { enviarChamado, listarChamados, atualizarResolvido, atualizarQualidade } = require('../controllers/suporteController');

// #endregion


// #region ROTAS | rev.01 | 25/03/2026

router.post('/chamado',                 enviarChamado);
router.get('/chamados',                 listarChamados);
router.patch('/chamados/:id/resolvido', atualizarResolvido);
router.patch('/chamados/:id/qualidade', atualizarQualidade);

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = router;

// #endregion
