// -----------------------------------------------
// clienteRoutes.js
// Tema: Rotas da API — dbo.Clientes
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// #endregion


// #region RATE LIMITER | rev.01 | 25/03/2026

// --- 100 requisições por IP em 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// #endregion


// #region MIDDLEWARES | rev.01 | 25/03/2026

// --- rejeita POST/PUT/PATCH sem body
const validateJSON = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ erro: 'Dados obrigatórios não fornecidos' });
    }
  }
  next();
};

// #endregion


// #region ROTAS | rev.01 | 25/03/2026

// --- listagem e busca
router.get('/',        generalLimiter, clienteController.listarTodos);
router.get('/buscar',  generalLimiter, clienteController.buscar);
router.get('/:id',     generalLimiter, clienteController.buscarPorId);

// --- criar e atualizar
router.post('/',       generalLimiter, validateJSON, clienteController.criar);
router.put('/:id',     generalLimiter, validateJSON, clienteController.atualizar);

// --- status
router.patch('/:id/reativar',    generalLimiter, validateJSON, clienteController.reativar);
router.patch('/:id/bloquear',    generalLimiter, clienteController.bloquear);
router.patch('/:id/desbloquear', generalLimiter, clienteController.desbloquear);
router.delete('/:id',            generalLimiter, clienteController.inativar);

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = router;

// #endregion
