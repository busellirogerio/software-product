// clienteRoutes.js | última revisão data: 22/03/2026

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

//  RATE LIMITERS

// Rotas gerais — 100 requisições por 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

//  VALIDAÇÃO DE BODY
const validateJSON = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ erro: 'Dados obrigatórios não fornecidos' });
    }
  }
  next();
};

//  ROTAS

// Listar todos (ATIVO + BLOQUEADO)
router.get('/', generalLimiter, clienteController.listarTodos);

// Buscar por cpfcnpj
router.get('/buscar', generalLimiter, clienteController.buscar);

// Buscar por ID
router.get('/:id', generalLimiter, clienteController.buscarPorId);

// Criar novo cliente
router.post('/', generalLimiter, validateJSON, clienteController.criar);

// Atualizar dados do cliente
router.put('/:id', generalLimiter, validateJSON, clienteController.atualizar);

// Reativar cliente inativo (Status = 'ATIVO' + atualiza dados)
router.patch('/:id/reativar', generalLimiter, validateJSON, clienteController.reativar);

// Inativar cliente (soft delete — Status = 'INATIVO')
router.delete('/:id', generalLimiter, clienteController.inativar);

// Bloquear cliente (Status = 'BLOQUEADO')
router.patch('/:id/bloquear', generalLimiter, clienteController.bloquear);

// Desbloquear cliente (Status = 'ATIVO')
router.patch('/:id/desbloquear', generalLimiter, clienteController.desbloquear);

module.exports = router;
