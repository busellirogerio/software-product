// -----------------------------------------------
// usuarioRoutes.js
// Tema: Rotas da API — dbo.Usuarios
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// #endregion


// #region RATE LIMITERS | rev.01 | 25/03/2026

// --- login: máximo 5 tentativas por IP em 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// --- reset de senha: máximo 3 tentativas por IP em 1 hora
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { erro: 'Muitas solicitações de reset. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// --- geral: máximo 100 requests por IP em 15 minutos
const generalLimiter = rateLimit({
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


// #region ROTAS PÚBLICAS | rev.01 | 25/03/2026

router.post('/login',      loginLimiter, validateJSON, usuarioController.login);
router.post('/reset-senha', resetLimiter, validateJSON, usuarioController.resetSenha);

// #endregion


// #region ROTAS PROTEGIDAS | rev.01 | 25/03/2026

// TODO: adicionar middleware de autenticação JWT quando implementado

router.get('/',     generalLimiter, usuarioController.listarTodos);
router.post('/',    generalLimiter, validateJSON, usuarioController.criar);
router.put('/:id',  generalLimiter, validateJSON, usuarioController.atualizar);
router.delete('/:id', generalLimiter, usuarioController.deletar);

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = router;

// #endregion
