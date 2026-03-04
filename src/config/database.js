// database.js | data: 03/03/2026

// src/config/database.js
const sql = require('mssql');
require('dotenv').config();

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    '❌ Variáveis de ambiente obrigatórias não definidas:',
    missingVars,
  );
  process.exit(1);
}

// Configuração do banco com pool de conexões
const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 1433,

  // Configurações de pool para performance
  pool: {
    max: 10, // Máximo 10 conexões simultâneas
    min: 2, // Mínimo 2 conexões sempre ativas
    idleTimeoutMillis: 30000, // 30s timeout para conexões ociosas
  },

  // Configurações de conexão
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 60000, // 60s timeout para conectar
    requestTimeout: 30000, // 30s timeout para queries
    enableArithAbort: true,
  },

  // Configurações de retry
  retry: {
    count: 3,
    delay: 1000,
  },
};

// Variável para controlar pool global
let globalPool = null;

// Função para obter conexão do pool
const getPool = async () => {
  try {
    if (!globalPool) {
      console.log('🔌 Criando pool de conexões com SQL Server...');
      globalPool = await sql.connect(config);

      // Eventos do pool
      globalPool.on('connect', () => {
        console.log('✅ Nova conexão estabelecida com SQL Server');
      });

      globalPool.on('close', () => {
        console.log('⚠️  Conexão com SQL Server fechada');
      });

      globalPool.on('error', (err) => {
        console.error('❌ Erro na conexão SQL Server:', err);
        globalPool = null; // Reset pool on error
      });

      console.log('✅ Pool de conexões SQL Server criado com sucesso');
    }

    return globalPool;
  } catch (error) {
    console.error('❌ Erro ao criar pool de conexões:', error);
    globalPool = null;
    throw error;
  }
};

// Função para testar conectividade
const testConnection = async () => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✅ Teste de conectividade SQL Server: OK');
    return true;
  } catch (error) {
    console.error('❌ Teste de conectividade SQL Server: FALHOU');
    console.error('Detalhes:', error.message);
    return false;
  }
};

// Função para fechar pool gracefully
const closePool = async () => {
  if (globalPool) {
    try {
      await globalPool.close();
      console.log('✅ Pool de conexões fechado');
      globalPool = null;
    } catch (error) {
      console.error('❌ Erro ao fechar pool:', error);
    }
  }
};

// Exportar configurações e funções
module.exports = {
  config,
  getPool,
  testConnection,
  closePool,
  sql,
};
