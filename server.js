const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas da API
app.use('/api/usuarios', usuarioRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📡 API: <http://localhost>:${PORT}/api/usuarios`);
  console.log(`🌐 Frontend: <http://localhost>:${PORT}/pages/login.html`);
});
