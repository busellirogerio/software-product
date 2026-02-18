const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rate limiting para login - previne ataques de força bruta
// Máximo 5 tentativas por IP em 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para reset de senha
// Máximo 3 tentativas por IP em 1 hora
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { erro: 'Muitas solicitações de reset. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting geral para outras operações
// Máximo 100 requests por IP em 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para validar JSON nas requisições POST/PUT
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

// ROTAS PÚBLICAS - não requerem autenticação

// Login de usuário com rate limiting
router.post('/login', loginLimiter, validateJSON, usuarioController.login);

// Reset de senha com rate limiting
router.post(
  '/reset-senha',
  resetLimiter,
  validateJSON,
  usuarioController.resetSenha,
);

// ROTAS PROTEGIDAS - aplicam rate limiting geral
// TODO: Adicionar middleware de autenticação JWT quando implementado

// Listar todos usuários
router.get('/', generalLimiter, usuarioController.listarTodos);

// Criar novo usuário
router.post('/', generalLimiter, validateJSON, usuarioController.criar);

// Atualizar usuário existente
router.put('/:id', generalLimiter, validateJSON, usuarioController.atualizar);

// Deletar usuário (soft delete)
router.delete('/:id', generalLimiter, usuarioController.deletar);

module.exports = router;
