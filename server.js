// server.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const veiculoRoutes = require('./src/routes/veiculoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

/* ===========================
  RATE LIMIT
=========================== */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { erro: 'Servidor sobrecarregado. Tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===========================
  CORS
=========================== */
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/* ===========================
  SECURITY HEADERS
=========================== */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  next();
});

app.use(globalLimiter);
app.use(cors(corsOptions));

/* ===========================
  STATIC FILES
=========================== */
app.use(express.static(path.join(__dirname, 'public')));

/* ===========================
  API VALIDATION
=========================== */
app.use('/api', express.json({ limit: '10mb' }));

app.use('/api', (req, res, next) => {
  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.is('application/json')
  ) {
    return res
      .status(415)
      .json({ erro: 'Content-Type deve ser application/json' });
  }
  next();
});

/* ===========================
  LOG
=========================== */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ===========================
  ROTAS API
=========================== */
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/veiculos', veiculoRoutes);

/* ===========================
  ROTAS FRONT (FIX)
=========================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

app.get('/pages/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

/* ===========================
  404
=========================== */
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ erro: 'Endpoint não encontrado' });
  } else {
    res.status(404).send('404 - Página não encontrada');
  }
});

/* ===========================
  START
=========================== */
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`Servidor rodando: http://127.0.0.1:${PORT}`);
  console.log(`Login: http://127.0.0.1:${PORT}/pages/login.html`);
  console.log(`Dashboard: http://127.0.0.1:${PORT}/pages/dashboard.html`);
  console.log('========================================');
});
