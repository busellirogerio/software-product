// -----------------------------------------------
// database.js
// Tema: Configuração do pool de conexões SQL Server
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const sql = require('mssql');
require('dotenv').config();

// #endregion


// #region VALIDAÇÃO DE AMBIENTE | rev.01 | 25/03/2026

const requiredEnvVars = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não definidas:', missingVars);
  process.exit(1);
}

// #endregion


// #region CONFIG | rev.01 | 25/03/2026

const config = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     parseInt(process.env.DB_PORT, 10) || 1433,

  // --- pool de conexões
  pool: {
    max: 10,             // máximo 10 conexões simultâneas
    min: 2,              // mínimo 2 conexões sempre ativas
    idleTimeoutMillis: 30000, // 30s timeout para conexões ociosas
  },

  // --- opções de conexão
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 60000, // 60s timeout para conectar
    requestTimeout: 30000, // 30s timeout para queries
    enableArithAbort: true,
  },

  // --- retry
  retry: {
    count: 3,
    delay: 1000,
  },
};

// #endregion


// #region POOL | rev.01 | 25/03/2026

let globalPool = null;

// --- obtém ou cria o pool global
const getPool = async () => {
  try {
    if (!globalPool) {
      console.log('🔌 Criando pool de conexões com SQL Server...');
      globalPool = await sql.connect(config);

      globalPool.on('connect', () => console.log('✅ Nova conexão estabelecida com SQL Server'));
      globalPool.on('close',   () => console.log('⚠️  Conexão com SQL Server fechada'));
      globalPool.on('error',   (err) => {
        console.error('❌ Erro na conexão SQL Server:', err);
        globalPool = null;
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


// --- testa conectividade
const testConnection = async () => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 as test');
    console.log('✅ Teste de conectividade SQL Server: OK');
    return true;
  } catch (error) {
    console.error('❌ Teste de conectividade SQL Server: FALHOU');
    console.error('Detalhes:', error.message);
    return false;
  }
};


// --- fecha o pool gracefully
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

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = { config, getPool, testConnection, closePool, sql };

// #endregion
