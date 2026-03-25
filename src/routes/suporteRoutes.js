// suporteRoutes.js | data: 24/03/2026

const express = require('express');
const router = express.Router();
const { enviarChamado } = require('../controllers/suporteController');

router.post('/chamado', enviarChamado);

module.exports = router;
