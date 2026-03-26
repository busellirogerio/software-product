// -----------------------------------------------
// veiculoRoutes.js
// Tema: Rotas da API — dbo.Veiculos
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');

// #endregion


// #region RATE LIMITER | rev.01 | 25/03/2026

// --- 100 requisições por IP em 15 minutos
const veiculoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// #endregion


// #region MIDDLEWARES | rev.01 | 25/03/2026

// --- rejeita POST/PUT sem body
const validateJSON = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ erro: 'Dados obrigatórios não fornecidos' });
    }
  }
  next();
};

// #endregion


// #region ROTAS | rev.01 | 25/03/2026

// --- rotas específicas ANTES de /:id para evitar conflito de parâmetro

// GET /api/veiculos                       → lista todos (?ordem=ASC/DESC)
router.get('/',         veiculoLimiter, veiculoController.listarTodos);

// GET /api/veiculos/buscar                → busca por placa ou proprietário
// ?tipo=placa&valor=ABC1D23
// ?tipo=proprietario&valor=98765432100
router.get('/buscar',   veiculoLimiter, veiculoController.buscar);

// GET /api/veiculos/cliente               → busca cliente por CPF/CNPJ
// ?cpfCnpj=98765432100
router.get('/cliente',  veiculoLimiter, veiculoController.buscarCliente);

// GET /api/veiculos/:id                   → busca veículo por ID
router.get('/:id',      veiculoLimiter, veiculoController.buscarPorId);

// POST /api/veiculos                      → cria novo veículo
router.post('/',        veiculoLimiter, validateJSON, veiculoController.criar);

// PUT /api/veiculos/:id                   → atualiza veículo (incluindo Km)
router.put('/:id',      veiculoLimiter, validateJSON, veiculoController.atualizar);

// PATCH /api/veiculos/:id/inativar        → inativa (Ativo=0 + ClienteId=NULL)
router.patch('/:id/inativar', veiculoLimiter, veiculoController.inativar);

// PATCH /api/veiculos/:id/reativar        → reativa + vincula proprietário
router.patch('/:id/reativar', veiculoLimiter, validateJSON, veiculoController.reativar);

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = router;

// #endregion
