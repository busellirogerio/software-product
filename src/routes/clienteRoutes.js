// src/routes/clienteRoutes.js

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

/* ===========================
  RATE LIMITERS
=========================== */

// Rotas gerais — 100 requisições por 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===========================
  VALIDAÇÃO DE BODY
  Rejeita POST/PUT sem body
=========================== */
const validateJSON = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ erro: 'Dados obrigatórios não fornecidos' });
    }
  }
  next();
};

/* ===========================
  ROTAS
=========================== */

// Listar todos os clientes ativos
router.get('/', generalLimiter, clienteController.listarTodos);

// Buscar por nome, cpfcnpj ou telefone
// Exemplo: GET /api/clientes/buscar?tipo=nome&valor=joao
router.get('/buscar', generalLimiter, clienteController.buscar);

// Buscar por ID
router.get('/:id', generalLimiter, clienteController.buscarPorId);

// Criar novo cliente
router.post('/', generalLimiter, validateJSON, clienteController.criar);

// Atualizar cliente
router.put('/:id', generalLimiter, validateJSON, clienteController.atualizar);

// Soft delete
router.delete('/:id', generalLimiter, clienteController.deletar);

module.exports = router;
