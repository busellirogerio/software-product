# STATUS CODIGO 02_02  EM 03/03/2026

sql - src - .env -.gitignore - server.js - package.json - package-lock.json

```sql
-- Clientes.sql

-- =========================================
-- BANCO: SoftwareProduct
-- TABELA: dbo.Clientes
-- VERSÃO: 1.0 - AC1
-- DATA: 2026-02-18
-- AUTOR: Buselli Rogerio
-- =========================================

USE SoftwareProduct;
GO

-- =========================================
-- LIMPEZA — remove objetos existentes
-- =========================================
IF OBJECT_ID('dbo.TR_Clientes_SetDataAtualizacao', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Clientes_SetDataAtualizacao;
GO

IF OBJECT_ID('dbo.Clientes', 'U') IS NOT NULL
    DROP TABLE dbo.Clientes;
GO

-- =========================================
-- CRIAÇÃO DA TABELA
-- =========================================
CREATE TABLE dbo.Clientes
(
    -- IDENTIFICAÇÃO
    ClienteId           INT             IDENTITY(1,1)   NOT NULL,

    -- TIPO: PF = Pessoa Física | PJ = Pessoa Jurídica
    Tipo                CHAR(2)                         NOT NULL
        CONSTRAINT CK_Clientes_Tipo
            CHECK (Tipo IN ('PF', 'PJ')),

    -- DOCUMENTO: CPF (11 dígitos) ou CNPJ (14 dígitos) — sem formatação
    CpfCnpj             NVARCHAR(14)                    NOT NULL,

    -- DADOS PESSOAIS — armazenados em MAIÚSCULO
    NomeCompleto        NVARCHAR(200)                   NOT NULL,
    DataNascimento      DATE                            NULL,
    Genero              CHAR(1)                         NULL
        CONSTRAINT CK_Clientes_Genero
            CHECK (Genero IS NULL OR Genero IN ('M', 'F', 'O')),

    -- CONTATO
    Telefone            NVARCHAR(20)                    NULL,
    TelefoneWhatsApp    BIT                             NOT NULL
        CONSTRAINT DF_Clientes_TelefoneWhatsApp DEFAULT (0),
    Email               NVARCHAR(254)                   NULL
        CONSTRAINT CK_Clientes_Email
            CHECK (Email IS NULL OR Email LIKE '%_@_%._%'),

    -- ENDEREÇO — armazenado em MAIÚSCULO
    Cep                 CHAR(8)                         NULL,
    Logradouro          NVARCHAR(200)                   NULL,
    Numero              NVARCHAR(10)                    NULL,
    Complemento         NVARCHAR(100)                   NULL,
    Bairro              NVARCHAR(100)                   NULL,
    Cidade              NVARCHAR(100)                   NULL,
    Estado              CHAR(2)                         NULL,

    -- CONTROLE LÓGICO (soft delete)
    Ativo               BIT                             NOT NULL
        CONSTRAINT DF_Clientes_Ativo DEFAULT (1),

    -- AUDITORIA
    DataCriacao         DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_Clientes_DataCriacao DEFAULT (SYSDATETIME()),
    DataAtualizacao     DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_Clientes_DataAtualizacao DEFAULT (SYSDATETIME()),

    -- CONSTRAINTS
    CONSTRAINT PK_Clientes
        PRIMARY KEY CLUSTERED (ClienteId),
    CONSTRAINT UQ_Clientes_CpfCnpj
        UNIQUE (CpfCnpj)
);
GO

-- =========================================
-- ÍNDICES — otimizam buscas principais
-- =========================================

-- Busca por nome completo
CREATE NONCLUSTERED INDEX IX_Clientes_NomeCompleto
    ON dbo.Clientes (NomeCompleto)
    WHERE Ativo = 1;
GO

-- Busca por CPF/CNPJ
CREATE NONCLUSTERED INDEX IX_Clientes_CpfCnpj
    ON dbo.Clientes (CpfCnpj)
    WHERE Ativo = 1;
GO

-- Busca por telefone
CREATE NONCLUSTERED INDEX IX_Clientes_Telefone
    ON dbo.Clientes (Telefone)
    WHERE Ativo = 1;
GO

-- Filtro por clientes ativos
CREATE NONCLUSTERED INDEX IX_Clientes_Ativo
    ON dbo.Clientes (Ativo)
    INCLUDE (ClienteId, NomeCompleto, CpfCnpj, Telefone);
GO

-- =========================================
-- TRIGGER — atualiza DataAtualizacao
-- automaticamente a cada UPDATE
-- =========================================
CREATE TRIGGER dbo.TR_Clientes_SetDataAtualizacao
ON dbo.Clientes
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE c
        SET DataAtualizacao = SYSDATETIME()
    FROM dbo.Clientes c
    INNER JOIN inserted i ON i.ClienteId = c.ClienteId;
END;
GO

PRINT '✅ Tabela dbo.Clientes criada com sucesso!';
GO
```

```sql
-- Usuarios.sql

-- =========================================
-- BANCO: SoftwareProduct
-- TABELA: dbo.Usuarios
-- VERSÃO: 1.0 - AC1
-- =========================================

USE SoftwareProduct;
GO

-- Remove trigger se existir
IF OBJECT_ID('dbo.TR_Usuarios_SetDataAtualizacao', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Usuarios_SetDataAtualizacao;
GO

-- Remove tabela se existir
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL
    DROP TABLE dbo.Usuarios;
GO

CREATE TABLE dbo.Usuarios
(
    -- IDENTIFICAÇÃO
    UsuarioId           INT IDENTITY(1,1)  NOT NULL,
    
    -- DADOS DE ACESSO
    Login               NVARCHAR(100)      NOT NULL,
    Senha               NVARCHAR(255)      NOT NULL,
    
    -- DADOS PESSOAIS
    NomeCompleto        NVARCHAR(120)      NOT NULL,
    Email               NVARCHAR(254)      NULL,
    
    -- CONTROLE LÓGICO
    Ativo               BIT                NOT NULL CONSTRAINT DF_Usuarios_Ativo DEFAULT (1),
    
    -- AUDITORIA
    DataCriacao         DATETIME2(0)       NOT NULL CONSTRAINT DF_Usuarios_DataCriacao DEFAULT (SYSDATETIME()),
    DataAtualizacao     DATETIME2(0)       NOT NULL CONSTRAINT DF_Usuarios_DataAtualizacao DEFAULT (SYSDATETIME()),

    -- CONSTRAINTS
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (UsuarioId),
    CONSTRAINT UQ_Usuarios_Login UNIQUE (Login),
    CONSTRAINT CK_Usuarios_Email_Formato CHECK (Email IS NULL OR Email LIKE '%_@_%._%')
);
GO

-- ÍNDICES
CREATE NONCLUSTERED INDEX IX_Usuarios_Login
    ON dbo.Usuarios (Login)
    WHERE Ativo = 1;
GO

CREATE NONCLUSTERED INDEX IX_Usuarios_Ativo
    ON dbo.Usuarios (Ativo)
    INCLUDE (UsuarioId, Login, NomeCompleto);
GO

-- TRIGGER
CREATE TRIGGER dbo.TR_Usuarios_SetDataAtualizacao
ON dbo.Usuarios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u SET DataAtualizacao = SYSDATETIME()
    FROM dbo.Usuarios u
    INNER JOIN inserted i ON i.UsuarioId = u.UsuarioId;
END;
GO

PRINT '✅ Tabela dbo.Usuarios criada com sucesso!';
GO
```

```sql
-- Veiculos.sql

-- =========================================
-- BANCO: SoftwareProduct
-- TABELA: dbo.Veiculos
-- VERSÃO: 1.0 - AC2
-- DATA: 2026-02-20
-- AUTOR: Buselli Rogerio
-- =========================================

USE SoftwareProduct;
GO

-- =========================================
-- LIMPEZA — remove objetos existentes
-- =========================================
IF OBJECT_ID('dbo.TR_Veiculos_SetDataAtualizacao', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Veiculos_SetDataAtualizacao;
GO

IF OBJECT_ID('dbo.Veiculos', 'U') IS NOT NULL
    DROP TABLE dbo.Veiculos;
GO

-- =========================================
-- CRIAÇÃO DA TABELA
-- =========================================
CREATE TABLE dbo.Veiculos
(
    -- IDENTIFICAÇÃO
    VeiculoId           INT IDENTITY(1,1)  NOT NULL,

    -- PROPRIETÁRIO — FK para dbo.Clientes (nullable = sem proprietário)
    -- NULL = veículo inativo sem vínculo
    ClienteId           INT                NULL,

    -- DADOS DO VEÍCULO — armazenados em maiúsculo
    Marca               NVARCHAR(50)       NOT NULL,
    Modelo              NVARCHAR(80)       NOT NULL,
    Motorizacao         NVARCHAR(20)       NULL,

    -- ANO — formato AAAA/AAAA ex: 2023/2024
    AnoModelo           NVARCHAR(9)        NULL,

    -- PLACA — aceita formato antigo (ABC-1234) e Mercosul (ABC1D23)
    -- nullable = veículo sem emplacamento
    Placa               NVARCHAR(8)        NULL,

    -- QUILOMETRAGEM — atualizada a cada serviço
    Km                  INT                NULL
        CONSTRAINT CK_Veiculos_Km CHECK (Km IS NULL OR Km >= 0),

    -- CONTROLE LÓGICO (soft delete)
    -- 0 = inativo (ClienteId também será NULL ao inativar)
    Ativo               BIT                NOT NULL
        CONSTRAINT DF_Veiculos_Ativo DEFAULT (1),

    -- AUDITORIA
    DataCriacao         DATETIME2(0)       NOT NULL
        CONSTRAINT DF_Veiculos_DataCriacao DEFAULT (SYSDATETIME()),
    DataAtualizacao     DATETIME2(0)       NOT NULL
        CONSTRAINT DF_Veiculos_DataAtualizacao DEFAULT (SYSDATETIME()),

    -- CONSTRAINTS
    CONSTRAINT PK_Veiculos
        PRIMARY KEY CLUSTERED (VeiculoId),

    -- FK — ClienteId referencia dbo.Clientes
    -- ON DELETE SET NULL: se cliente for deletado, veículo perde o vínculo
    CONSTRAINT FK_Veiculos_ClienteId
        FOREIGN KEY (ClienteId)
        REFERENCES dbo.Clientes (ClienteId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
GO

-- =========================================
-- ÍNDICES — otimizam buscas frequentes
-- =========================================

-- Busca por placa (principal busca operacional)
CREATE NONCLUSTERED INDEX IX_Veiculos_Placa
    ON dbo.Veiculos (Placa)
    WHERE Ativo = 1;
GO

-- Busca por proprietário (JOIN com Clientes)
CREATE NONCLUSTERED INDEX IX_Veiculos_ClienteId
    ON dbo.Veiculos (ClienteId)
    WHERE Ativo = 1;
GO

-- Busca por marca/modelo
CREATE NONCLUSTERED INDEX IX_Veiculos_Marca_Modelo
    ON dbo.Veiculos (Marca, Modelo)
    WHERE Ativo = 1;
GO

-- Controle de status (listagem geral)
CREATE NONCLUSTERED INDEX IX_Veiculos_Ativo
    ON dbo.Veiculos (Ativo)
    INCLUDE (VeiculoId, Marca, Modelo, Placa, ClienteId);
GO

-- =========================================
-- TRIGGER — atualiza DataAtualizacao automaticamente
-- =========================================
CREATE TRIGGER dbo.TR_Veiculos_SetDataAtualizacao
ON dbo.Veiculos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE v
        SET DataAtualizacao = SYSDATETIME()
    FROM dbo.Veiculos v
    INNER JOIN inserted i ON i.VeiculoId = v.VeiculoId;
END;
GO

PRINT '✅ Tabela dbo.Veiculos criada com sucesso!';
GO
```

```jsx
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

```

```jsx
// clienteController.js |data: 03/03/2026

const clienteRepository = require('../repositories/clienteRepository');

class ClienteController {
  /* ===========================
    LISTAR TODOS
  =========================== */
  async listarTodos(req, res) {
    try {
      const clientes = await clienteRepository.listarTodos();
      res.json(clientes);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR POR ID
  =========================== */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }
      const cliente = await clienteRepository.buscarPorId(id);
      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }
      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR
    Rota: GET /api/clientes/buscar?tipo=nome&valor=joao
    tipos aceitos: nome | cpfcnpj | telefone
  =========================== */
  async buscar(req, res) {
    try {
      const { tipo, valor } = req.query;

      if (!tipo || !valor) {
        return res
          .status(400)
          .json({ erro: 'Parâmetros tipo e valor são obrigatórios' });
      }

      if (valor.trim().length < 2) {
        return res
          .status(400)
          .json({ erro: 'Digite ao menos 2 caracteres para buscar' });
      }

      let resultado = [];

      if (tipo === 'nome') {
        resultado = await clienteRepository.buscarPorNome(valor.trim());
      } else if (tipo === 'cpfcnpj') {
        resultado = await clienteRepository.buscarPorCpfCnpj(valor.trim());
      } else if (tipo === 'telefone') {
        resultado = await clienteRepository.buscarPorTelefone(valor.trim());
      } else {
        return res.status(400).json({
          erro: 'Tipo de busca inválido. Use: nome, cpfcnpj ou telefone',
        });
      }

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    CRIAR
    Converte campos de texto
    para maiúsculo antes de enviar
    ao repository
  =========================== */
  async criar(req, res) {
    try {
      const {
        tipo,
        cpfCnpj,
        nomeCompleto,
        dataNascimento,
        genero,
        telefone,
        telefoneWhatsApp,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      } = req.body;

      // Validações obrigatórias
      if (!tipo || !cpfCnpj || !nomeCompleto) {
        return res
          .status(400)
          .json({ erro: 'Tipo, CPF/CNPJ e Nome Completo são obrigatórios' });
      }

      // Valida tipo PF/PJ
      if (!['PF', 'PJ'].includes(tipo.toUpperCase())) {
        return res.status(400).json({ erro: 'Tipo deve ser PF ou PJ' });
      }

      // Remove formatação do CPF/CNPJ
      const cpfCnpjLimpo = cpfCnpj.replace(/[.\-\/]/g, '').trim();

      // Valida tamanho CPF (11) ou CNPJ (14)
      if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
        return res
          .status(400)
          .json({ erro: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' });
      }

      // Valida gênero se informado
      if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
        return res.status(400).json({ erro: 'Gênero deve ser M, F ou O' });
      }

      // Valida email se informado
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ erro: 'Formato de email inválido' });
        }
      }

      // Monta objeto com campos em maiúsculo
      const dadosLimpos = {
        tipo: tipo.toUpperCase(),
        cpfCnpj: cpfCnpjLimpo,
        nomeCompleto: nomeCompleto.trim().toUpperCase(),
        dataNascimento: dataNascimento || null,
        genero: genero ? genero.toUpperCase() : null,
        telefone: telefone ? telefone.trim() : null,
        telefoneWhatsApp: telefoneWhatsApp ? true : false,
        email: email ? email.trim().toUpperCase() : null,
        cep: cep ? cep.replace(/\D/g, '') : null,
        logradouro: logradouro ? logradouro.trim().toUpperCase() : null,
        numero: numero ? numero.trim() : null,
        complemento: complemento ? complemento.trim().toUpperCase() : null,
        bairro: bairro ? bairro.trim().toUpperCase() : null,
        cidade: cidade ? cidade.trim().toUpperCase() : null,
        estado: estado ? estado.trim().toUpperCase() : null,
      };

      const cliente = await clienteRepository.criar(dadosLimpos);
      res.status(201).json(cliente);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'CPF/CNPJ já cadastrado' });
      }
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    ATUALIZAR
  =========================== */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const {
        nomeCompleto,
        dataNascimento,
        genero,
        telefone,
        telefoneWhatsApp,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      } = req.body;

      // Nome é obrigatório na atualização
      if (!nomeCompleto) {
        return res.status(400).json({ erro: 'Nome Completo é obrigatório' });
      }

      // Valida gênero se informado
      if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
        return res.status(400).json({ erro: 'Gênero deve ser M, F ou O' });
      }

      // Valida email se informado
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ erro: 'Formato de email inválido' });
        }
      }

      const dadosLimpos = {
        nomeCompleto: nomeCompleto.trim().toUpperCase(),
        dataNascimento: dataNascimento || null,
        genero: genero ? genero.toUpperCase() : null,
        telefone: telefone ? telefone.trim() : null,
        telefoneWhatsApp: telefoneWhatsApp ? true : false,
        email: email ? email.trim().toUpperCase() : null,
        cep: cep ? cep.replace(/\D/g, '') : null,
        logradouro: logradouro ? logradouro.trim().toUpperCase() : null,
        numero: numero ? numero.trim() : null,
        complemento: complemento ? complemento.trim().toUpperCase() : null,
        bairro: bairro ? bairro.trim().toUpperCase() : null,
        cidade: cidade ? cidade.trim().toUpperCase() : null,
        estado: estado ? estado.trim().toUpperCase() : null,
      };

      const resultado = await clienteRepository.atualizar(id, dadosLimpos);
      if (resultado === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      res.json({ mensagem: 'Cliente atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    DELETAR (soft delete)
  =========================== */
  async deletar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const resultado = await clienteRepository.deletar(id);
      if (resultado === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      res.json({ mensagem: 'Cliente excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new ClienteController();

```

```jsx
// usuarioController.js | data: 03/03/2026

const usuarioRepository = require('../repositories/usuarioRepository');

class UsuarioController {
  // Autentica usuário e retorna dados básicos
  // Remove informações sensíveis da resposta
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validação de campos obrigatórios
      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      const usuario = await usuarioRepository.login(email.trim(), senha);

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      // Remove dados sensíveis da resposta
      const { Senha, ...usuarioSemSenha } = usuario;
      res.json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Reset de senha via email
  // Valida formato do email antes de processar
  async resetSenha(req, res) {
    try {
      const { email } = req.body;

      // Validação de campo obrigatório
      if (!email) {
        return res.status(400).json({ erro: 'Email é obrigatório' });
      }

      // Validação básica de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const resultado = await usuarioRepository.resetSenha(email.trim());

      if (!resultado) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({
        mensagem: 'Solicitação de reset realizada com sucesso',
        protocolo: resultado.protocolo,
      });
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Lista todos usuários ativos
  // Dados sensíveis já removidos no repository
  async listarTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.listarTodos();
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Cria novo usuário
  // Valida campos obrigatórios e formatos
  async criar(req, res) {
    try {
      const { login, senha, nomeCompleto, email } = req.body;

      // Validação de campos obrigatórios
      if (!login || !senha || !nomeCompleto || !email) {
        return res.status(400).json({
          erro: 'Login, senha, nome completo e email são obrigatórios',
        });
      }

      // Validação de tamanhos mínimos
      if (senha.length < 6) {
        return res
          .status(400)
          .json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      // Sanitiza dados de entrada
      const dadosLimpos = {
        login: login.trim(),
        senha,
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
      };

      const usuario = await usuarioRepository.criar(dadosLimpos);
      res.status(201).json(usuario);
    } catch (error) {
      // Trata erro de duplicação de login/email
      if (error.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'Login ou email já existem' });
      }
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Atualiza dados do usuário
  // Valida campos e formatos antes de atualizar
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nomeCompleto, email, senha } = req.body;

      // Validação de ID
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      // Validação de campos obrigatórios
      if (!nomeCompleto || !email || !senha) {
        return res.status(400).json({
          erro: 'Nome completo, email e senha são obrigatórios',
        });
      }

      // Validação de senha mínima
      if (senha.length < 6) {
        return res
          .status(400)
          .json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      // Sanitiza dados
      const dadosLimpos = {
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
        senha,
      };

      const resultado = await usuarioRepository.atualizar(id, dadosLimpos);

      if (resultado === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Soft delete do usuário
  // Valida ID antes de processar
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Validação de ID
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const resultado = await usuarioRepository.deletar(id);

      if (resultado === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UsuarioController();

```

```jsx
// veiculoController.js | data: 03/03/2026

// Camada intermediária — validações e respostas HTTP
// VERSÃO: 1.0 - AC2
// =========================================

const veiculoRepository = require('../repositories/veiculoRepository');

class VeiculoController {
  /* ===========================
    LISTAR TODOS
    Query opcional: ?ordem=ASC ou ?ordem=DESC
  =========================== */
  async listarTodos(req, res) {
    try {
      const ordem = req.query.ordem || 'ASC';
      const veiculos = await veiculoRepository.listarTodos(ordem);
      res.json(veiculos);
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR (unificada)
    Query: ?tipo=placa&valor=ABC1D23
    Query: ?tipo=proprietario&valor=98765432100
  =========================== */
  async buscar(req, res) {
    try {
      const { tipo, valor } = req.query;

      if (!tipo || !valor) {
        return res
          .status(400)
          .json({ erro: 'Parâmetros tipo e valor são obrigatórios' });
      }

      let resultado;

      if (tipo === 'placa') {
        resultado = await veiculoRepository.buscarPorPlaca(valor);
      } else if (tipo === 'proprietario') {
        resultado = await veiculoRepository.buscarPorProprietario(valor);
      } else {
        return res
          .status(400)
          .json({ erro: 'Tipo de busca inválido. Use: placa ou proprietario' });
      }

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR POR ID
  =========================== */
  async buscarPorId(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const veiculo = await veiculoRepository.buscarPorId(id);

      if (!veiculo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      res.json(veiculo);
    } catch (error) {
      console.error('Erro ao buscar veículo por ID:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR CLIENTE POR CPF/CNPJ
    Usado no formulário para confirmar proprietário
    antes de cadastrar o veículo
    GET /api/veiculos/cliente?cpfCnpj=98765432100
  =========================== */
  async buscarCliente(req, res) {
    try {
      const { cpfCnpj } = req.query;

      if (!cpfCnpj) {
        return res.status(400).json({ erro: 'CPF/CNPJ é obrigatório' });
      }

      // Remove formatação
      const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

      // Valida comprimento
      if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
        return res
          .status(400)
          .json({ erro: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' });
      }

      const cliente =
        await veiculoRepository.buscarClientePorCpfCnpj(cpfCnpjLimpo);

      if (!cliente) {
        return res
          .status(404)
          .json({ erro: 'Cliente não encontrado ou inativo' });
      }

      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF/CNPJ:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    CRIAR VEÍCULO
    Campos obrigatórios: clienteId, marca, modelo, placa
  =========================== */
  async criar(req, res) {
    try {
      const { clienteId, marca, modelo, motorizacao, anoModelo, placa, km } =
        req.body;

      // Validações obrigatórias
      if (!clienteId) {
        return res.status(400).json({ erro: 'Proprietário é obrigatório' });
      }
      if (!marca || marca.trim() === '') {
        return res.status(400).json({ erro: 'Marca é obrigatória' });
      }
      if (!modelo || modelo.trim() === '') {
        return res.status(400).json({ erro: 'Modelo é obrigatório' });
      }
      if (!placa || placa.trim() === '') {
        return res.status(400).json({ erro: 'Placa é obrigatória' });
      }

      // Valida formato de placa — antigo (ABC-1234) ou Mercosul (ABC1D23)
      const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();
      const placaAntigaRegex = /^[A-Z]{3}[0-9]{4}$/;
      const placaMercosulRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

      if (
        !placaAntigaRegex.test(placaLimpa) &&
        !placaMercosulRegex.test(placaLimpa)
      ) {
        return res
          .status(400)
          .json({ erro: 'Placa inválida. Use formato ABC1234 ou ABC1D23' });
      }

      // Valida Km — apenas números positivos
      if (km !== undefined && km !== null && km !== '') {
        const kmNumero = parseInt(km);
        if (isNaN(kmNumero) || kmNumero < 0) {
          return res
            .status(400)
            .json({ erro: 'Km deve ser um número positivo' });
        }
      }

      const veiculo = await veiculoRepository.criar({
        clienteId: parseInt(clienteId),
        marca: marca.trim(),
        modelo: modelo.trim(),
        motorizacao: motorizacao ? motorizacao.trim() : null,
        anoModelo: anoModelo ? anoModelo.trim() : null,
        placa: placaLimpa,
        km: km ? parseInt(km) : null,
      });

      res.status(201).json(veiculo);
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    ATUALIZAR VEÍCULO
    Permite atualizar todos os campos incluindo Km
  =========================== */
  async atualizar(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const { clienteId, marca, modelo, motorizacao, anoModelo, placa, km } =
        req.body;

      // Validações obrigatórias
      if (!marca || marca.trim() === '') {
        return res.status(400).json({ erro: 'Marca é obrigatória' });
      }
      if (!modelo || modelo.trim() === '') {
        return res.status(400).json({ erro: 'Modelo é obrigatório' });
      }

      // Valida placa se informada
      if (placa && placa.trim() !== '') {
        const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();
        const placaAntigaRegex = /^[A-Z]{3}[0-9]{4}$/;
        const placaMercosulRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

        if (
          !placaAntigaRegex.test(placaLimpa) &&
          !placaMercosulRegex.test(placaLimpa)
        ) {
          return res
            .status(400)
            .json({ erro: 'Placa inválida. Use formato ABC1234 ou ABC1D23' });
        }
      }

      // Valida Km
      if (km !== undefined && km !== null && km !== '') {
        const kmNumero = parseInt(km);
        if (isNaN(kmNumero) || kmNumero < 0) {
          return res
            .status(400)
            .json({ erro: 'Km deve ser um número positivo' });
        }
      }

      // Verifica se veículo existe
      const veiculoExistente = await veiculoRepository.buscarPorId(id);
      if (!veiculoExistente) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      const placaFormatada = placa
        ? placa.replace(/[-\s]/g, '').toUpperCase()
        : null;

      const veiculo = await veiculoRepository.atualizar(id, {
        clienteId: clienteId ? parseInt(clienteId) : null,
        marca: marca.trim(),
        modelo: modelo.trim(),
        motorizacao: motorizacao ? motorizacao.trim() : null,
        anoModelo: anoModelo ? anoModelo.trim() : null,
        placa: placaFormatada,
        km: km ? parseInt(km) : null,
      });

      res.json(veiculo);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    INATIVAR VEÍCULO (soft delete)
    Ativo = 0 + ClienteId = NULL
  =========================== */
  async inativar(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      // Verifica se veículo existe e está ativo
      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }
      if (veiculo.Ativo === false || veiculo.Ativo === 0) {
        return res.status(400).json({ erro: 'Veículo já está inativo' });
      }

      await veiculoRepository.inativar(id);

      res.json({ mensagem: 'Veículo inativado com sucesso' });
    } catch (error) {
      console.error('Erro ao inativar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    REATIVAR VEÍCULO
    Ativo = 1 + vincula novo ClienteId
  =========================== */
  async reativar(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const { clienteId } = req.body;

      if (!clienteId) {
        return res
          .status(400)
          .json({ erro: 'Proprietário é obrigatório para reativar' });
      }

      // Verifica se veículo existe
      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      const veiculoReativado = await veiculoRepository.reativar(
        id,
        parseInt(clienteId),
      );

      res.json(veiculoReativado);
    } catch (error) {
      console.error('Erro ao reativar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new VeiculoController();

```

```jsx
// usuarioRepository.js | data: 03/03/2026

const { getPool, sql } = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioRepository {
  // Autentica usuário por email e senha
  // Busca por email e compara senha com hash do banco
  async login(email, senha) {
    const pool = await getPool();
    const result = await pool.request().input('email', sql.NVarChar, email)
      .query(`
        SELECT * 
        FROM dbo.Usuarios
        WHERE (Email = @email OR Login = @email) AND Ativo = 1
      `);

    const usuario = result.recordset[0];
    if (!usuario) return null;

    // Compara senha digitada com hash armazenado
    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    return senhaValida ? usuario : null;
  }

  // Lista todos usuários ativos
  // Não retorna senhas por segurança
  async listarTodos() {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        'SELECT UsuarioId, Login, NomeCompleto, Email, Ativo, DataCriacao FROM dbo.Usuarios WHERE Ativo = 1',
      );
    return result.recordset;
  }

  // Cria novo usuário
  // Faz hash da senha antes de salvar no banco
  async criar(dados) {
    const pool = await getPool();
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool
      .request()
      .input('login', sql.NVarChar, dados.login)
      .input('senha', sql.NVarChar, senhaHash)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email).query(`
        INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
        OUTPUT INSERTED.UsuarioId, INSERTED.Login, INSERTED.NomeCompleto, INSERTED.Email, INSERTED.Ativo, INSERTED.DataCriacao
        VALUES (@login, @senha, @nomeCompleto, @email, 1)
      `);

    return result.recordset[0];
  }

  // Atualiza dados do usuário
  // Nova senha é criptografada antes da atualização
  async atualizar(id, dados) {
    const pool = await getPool();
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email)
      .input('senha', sql.NVarChar, senhaHash).query(`
        UPDATE dbo.Usuarios
        SET NomeCompleto = @nomeCompleto,
            Email = @email,
            Senha = @senha
        WHERE UsuarioId = @id
      `);

    return result.rowsAffected[0];
  }

  // Soft delete - marca usuário como inativo
  // Não remove fisicamente do banco
  async deletar(id) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE dbo.Usuarios SET Ativo = 0 WHERE UsuarioId = @id');

    return result.rowsAffected[0];
  }

  // Reset de senha por email
  // Gera nova senha aleatória e atualiza no banco
  async resetSenha(email) {
    const pool = await getPool();

    // Valida se usuário existe e está ativo
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(
        'SELECT UsuarioId FROM dbo.Usuarios WHERE Email = @email AND Ativo = 1',
      );

    if (!user.recordset[0]) return null;

    // Gera nova senha temporária
    const novaSenha = Math.random().toString(36).slice(-8);
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza senha no banco
    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('senha', sql.NVarChar, senhaHash)
      .query('UPDATE dbo.Usuarios SET Senha = @senha WHERE Email = @email');

    // Gera protocolo para controle
    const ano = new Date().getFullYear();
    const protocolo = `TI-${ano}-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(
      'RESET SENHA => Email:',
      email,
      '| NovaSenha:',
      novaSenha,
      '| Protocolo:',
      protocolo,
    );

    return { protocolo };
  }
}

module.exports = new UsuarioRepository();

```

```jsx
// clienteRepository.js | data: 03/03/2026

const { getPool, sql } = require('../config/database');

class ClienteRepository {
  /* ===========================
    LISTAR TODOS
    Retorna apenas clientes ativos
    ordenados por nome
  =========================== */
  async listarTodos() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
          ClienteId, Tipo, CpfCnpj, NomeCompleto, DataNascimento,
          Genero, Telefone, TelefoneWhatsApp, Email,
          Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado, DataCriacao
        FROM dbo.Clientes
        WHERE Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  /* ===========================
    BUSCAR POR ID
  =========================== */
  async buscarPorId(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT *
        FROM dbo.Clientes
        WHERE ClienteId = @id
      `);
    return result.recordset[0] || null;
  }

  /* ===========================
    BUSCAR POR NOME
    Busca parcial — considera espaços
    Converte input para maiúsculo
  =========================== */
  async buscarPorNome(nome) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('nome', sql.NVarChar, '%' + nome.toUpperCase() + '%').query(`
        SELECT ClienteId, Tipo, CpfCnpj, NomeCompleto, Genero, Telefone, DataNascimento
        FROM dbo.Clientes
        WHERE NomeCompleto LIKE @nome AND Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  // BUSCAR POR CPF/CNPJ
  // Remove formatação antes de buscar

  async buscarPorCpfCnpj(cpfCnpj) {
    const pool = await getPool();
    const apenasNumeros = cpfCnpj.replace(/[.\-\/]/g, '');
    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, apenasNumeros).query(`
        SELECT ClienteId, Tipo, CpfCnpj, NomeCompleto, Genero, Telefone, DataNascimento, Ativo
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj
      `);
    return result.recordset;
  }

  // BUSCAR POR TELEFONE
  // Busca parcial

  async buscarPorTelefone(telefone) {
    const pool = await getPool();
    const apenasNumeros = telefone.replace(/[\s\-\(\)]/g, '');
    const result = await pool
      .request()
      .input('telefone', sql.NVarChar, '%' + apenasNumeros + '%').query(`
        SELECT ClienteId, Tipo, CpfCnpj, NomeCompleto, Genero, Telefone, DataNascimento
        FROM dbo.Clientes
        WHERE Telefone LIKE @telefone AND Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  /* ===========================
    CRIAR
    Se CPF/CNPJ já existe com Ativo = 0
    reativa e atualiza os dados (2 passos)
    Se não existe — INSERT normal
    ATENÇÃO: UPDATE sem OUTPUT direto
    pois a tabela tem trigger ativo
  =========================== */
  async criar(dados) {
    const pool = await getPool();

    // Verifica se já existe inativo com esse CPF/CNPJ
    const existente = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, dados.cpfCnpj).query(`
        SELECT ClienteId
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj AND Ativo = 0
      `);

    if (existente.recordset[0]) {
      // PASSO 1 — Reativa e atualiza dados (sem OUTPUT por causa do trigger)
      const id = existente.recordset[0].ClienteId;
      await pool
        .request()
        .input('id', sql.Int, id)
        .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
        .input('dataNascimento', sql.Date, dados.dataNascimento || null)
        .input('genero', sql.Char, dados.genero || null)
        .input('telefone', sql.NVarChar, dados.telefone || null)
        .input('telefoneWhatsApp', sql.Bit, dados.telefoneWhatsApp ? 1 : 0)
        .input('email', sql.NVarChar, dados.email || null)
        .input('cep', sql.Char, dados.cep || null)
        .input('logradouro', sql.NVarChar, dados.logradouro || null)
        .input('numero', sql.NVarChar, dados.numero || null)
        .input('complemento', sql.NVarChar, dados.complemento || null)
        .input('bairro', sql.NVarChar, dados.bairro || null)
        .input('cidade', sql.NVarChar, dados.cidade || null)
        .input('estado', sql.Char, dados.estado || null).query(`
          UPDATE dbo.Clientes
          SET
            Ativo            = 1,
            NomeCompleto     = @nomeCompleto,
            DataNascimento   = @dataNascimento,
            Genero           = @genero,
            Telefone         = @telefone,
            TelefoneWhatsApp = @telefoneWhatsApp,
            Email            = @email,
            Cep              = @cep,
            Logradouro       = @logradouro,
            Numero           = @numero,
            Complemento      = @complemento,
            Bairro           = @bairro,
            Cidade           = @cidade,
            Estado           = @estado
          WHERE ClienteId = @id
        `);

      // PASSO 2 — Busca o registro reativado para retornar
      const reativado = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`SELECT * FROM dbo.Clientes WHERE ClienteId = @id`);
      return reativado.recordset[0];
    }

    // INSERT NORMAL — CPF/CNPJ novo
    const result = await pool
      .request()
      .input('tipo', sql.Char, dados.tipo)
      .input('cpfCnpj', sql.NVarChar, dados.cpfCnpj)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('dataNascimento', sql.Date, dados.dataNascimento || null)
      .input('genero', sql.Char, dados.genero || null)
      .input('telefone', sql.NVarChar, dados.telefone || null)
      .input('telefoneWhatsApp', sql.Bit, dados.telefoneWhatsApp ? 1 : 0)
      .input('email', sql.NVarChar, dados.email || null)
      .input('cep', sql.Char, dados.cep || null)
      .input('logradouro', sql.NVarChar, dados.logradouro || null)
      .input('numero', sql.NVarChar, dados.numero || null)
      .input('complemento', sql.NVarChar, dados.complemento || null)
      .input('bairro', sql.NVarChar, dados.bairro || null)
      .input('cidade', sql.NVarChar, dados.cidade || null)
      .input('estado', sql.Char, dados.estado || null).query(`
        INSERT INTO dbo.Clientes
          (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
          Telefone, TelefoneWhatsApp, Email,
          Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado, Ativo)
        OUTPUT
          INSERTED.ClienteId, INSERTED.Tipo, INSERTED.CpfCnpj,
          INSERTED.NomeCompleto, INSERTED.DataNascimento, INSERTED.Genero,
          INSERTED.Telefone, INSERTED.TelefoneWhatsApp, INSERTED.Email,
          INSERTED.Cep, INSERTED.Logradouro, INSERTED.Numero,
          INSERTED.Complemento, INSERTED.Bairro, INSERTED.Cidade,
          INSERTED.Estado, INSERTED.Ativo, INSERTED.DataCriacao
        VALUES
          (@tipo, @cpfCnpj, @nomeCompleto, @dataNascimento, @genero,
          @telefone, @telefoneWhatsApp, @email,
          @cep, @logradouro, @numero, @complemento, @bairro, @cidade, @estado, 1)
      `);
    return result.recordset[0];
  }

  /* ===========================
    ATUALIZAR
  =========================== */
  async atualizar(id, dados) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('dataNascimento', sql.Date, dados.dataNascimento || null)
      .input('genero', sql.Char, dados.genero || null)
      .input('telefone', sql.NVarChar, dados.telefone || null)
      .input('telefoneWhatsApp', sql.Bit, dados.telefoneWhatsApp ? 1 : 0)
      .input('email', sql.NVarChar, dados.email || null)
      .input('cep', sql.Char, dados.cep || null)
      .input('logradouro', sql.NVarChar, dados.logradouro || null)
      .input('numero', sql.NVarChar, dados.numero || null)
      .input('complemento', sql.NVarChar, dados.complemento || null)
      .input('bairro', sql.NVarChar, dados.bairro || null)
      .input('cidade', sql.NVarChar, dados.cidade || null)
      .input('estado', sql.Char, dados.estado || null).query(`
        UPDATE dbo.Clientes
        SET
          NomeCompleto     = @nomeCompleto,
          DataNascimento   = @dataNascimento,
          Genero           = @genero,
          Telefone         = @telefone,
          TelefoneWhatsApp = @telefoneWhatsApp,
          Email            = @email,
          Cep              = @cep,
          Logradouro       = @logradouro,
          Numero           = @numero,
          Complemento      = @complemento,
          Bairro           = @bairro,
          Cidade           = @cidade,
          Estado           = @estado
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }

  /* ===========================
    DELETAR (soft delete)
    Ativo = 0 — registro permanece
  =========================== */
  async deletar(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Clientes
        SET Ativo = 0
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }
}

module.exports = new ClienteRepository();

```

```jsx
// veiculoRepository.js | data: 03/03/2026

// Camada de acesso ao banco — dbo.Veiculos
// Toda query SQL centralizada aqui
// VERSÃO: 1.0 - AC2
// =========================================

const { getPool, sql } = require('../config/database');

class VeiculoRepository {
  /* ===========================
    LISTAR TODOS
    Retorna apenas veículos ativos
    com JOIN em Clientes para trazer nome do proprietário
    Ordenação por Marca ASC por padrão
  =========================== */
  async listarTodos(ordem = 'ASC') {
    const pool = await getPool();

    // Valida ordem para evitar SQL injection
    const ordemValidada = ordem.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const result = await pool.request().query(`
      SELECT
        v.VeiculoId,
        v.ClienteId,
        v.Marca,
        v.Modelo,
        v.Motorizacao,
        v.AnoModelo,
        v.Placa,
        v.Km,
        v.Ativo,
        v.DataCriacao,
        v.DataAtualizacao,
        c.NomeCompleto  AS ProprietarioNome,
        c.CpfCnpj       AS ProprietarioCpfCnpj
      FROM dbo.Veiculos v
      LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
      WHERE v.Ativo = 1
      ORDER BY v.Marca ${ordemValidada}
    `);

    return result.recordset;
  }

  /* ===========================
    BUSCAR POR ID
    Retorna veículo ativo ou inativo
    Inclui dados do proprietário via JOIN
  =========================== */
  async buscarPorId(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Motorizacao,
          v.AnoModelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          v.DataAtualizacao,
          c.NomeCompleto  AS ProprietarioNome,
          c.CpfCnpj       AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);

    return result.recordset[0] || null;
  }

  /* ===========================
    BUSCAR POR PLACA
    Remove traço e espaços antes de buscar
    Busca em ativos E inativos
    (inativo pode ser reativado pelo frontend)
  =========================== */
  async buscarPorPlaca(placa) {
    const pool = await getPool();

    // Remove formatação — aceita ABC1234 ou ABC-1234
    const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();

    const result = await pool
      .request()
      .input('placa', sql.NVarChar, `%${placaLimpa}%`).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Motorizacao,
          v.AnoModelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          v.DataAtualizacao,
          c.NomeCompleto  AS ProprietarioNome,
          c.CpfCnpj       AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE REPLACE(v.Placa, '-', '') LIKE @placa
        ORDER BY v.Ativo DESC, v.Marca
      `);

    return result.recordset;
  }

  /* ===========================
    BUSCAR POR PROPRIETÁRIO (CPF/CNPJ)
    Remove formatação antes de buscar
    Retorna todos os veículos ativos do cliente
  =========================== */
  async buscarPorProprietario(cpfCnpj) {
    const pool = await getPool();

    // Remove pontos, traços, barras e espaços
    const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, cpfCnpjLimpo).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Motorizacao,
          v.AnoModelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          v.DataAtualizacao,
          c.NomeCompleto  AS ProprietarioNome,
          c.CpfCnpj       AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        INNER JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE c.CpfCnpj = @cpfCnpj
          AND v.Ativo = 1
        ORDER BY v.Marca
      `);

    return result.recordset;
  }

  /* ===========================
    BUSCAR CLIENTE POR CPF/CNPJ
    Usado no formulário de cadastro
    para confirmar o proprietário antes de salvar
    Retorna apenas ClienteId + NomeCompleto
  =========================== */
  async buscarClientePorCpfCnpj(cpfCnpj) {
    const pool = await getPool();

    const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, cpfCnpjLimpo).query(`
        SELECT ClienteId, NomeCompleto, CpfCnpj
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj
          AND Ativo = 1
      `);

    return result.recordset[0] || null;
  }

  /* ===========================
    CRIAR VEÍCULO
    Placa e ClienteId obrigatórios
    Trigger cuidará do DataAtualizacao
    OUTPUT bloqueado por trigger — usa SELECT após INSERT
  =========================== */
  async criar(dados) {
    const pool = await getPool();

    // Placa em maiúsculo
    const placaFormatada = dados.placa ? dados.placa.toUpperCase() : null;

    // INSERT sem OUTPUT (trigger ativo no SQL Server bloqueia OUTPUT)
    await pool
      .request()
      .input('clienteId', sql.Int, dados.clienteId)
      .input('marca', sql.NVarChar, dados.marca.toUpperCase())
      .input('modelo', sql.NVarChar, dados.modelo.toUpperCase())
      .input(
        'motorizacao',
        sql.NVarChar,
        dados.motorizacao ? dados.motorizacao.toUpperCase() : null,
      )
      .input('anoModelo', sql.NVarChar, dados.anoModelo || null)
      .input('placa', sql.NVarChar, placaFormatada)
      .input('km', sql.Int, dados.km || null).query(`
        INSERT INTO dbo.Veiculos
          (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
        VALUES
          (@clienteId, @marca, @modelo, @motorizacao, @anoModelo, @placa, @km, 1)
      `);

    // SELECT separado para retornar o registro criado
    const result = await pool
      .request()
      .input('placa', sql.NVarChar, placaFormatada).query(`
        SELECT TOP 1
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.Placa = @placa
        ORDER BY v.VeiculoId DESC
      `);

    return result.recordset[0];
  }

  /* ===========================
    ATUALIZAR VEÍCULO
    Atualiza dados + Km
    Trigger cuida do DataAtualizacao
  =========================== */
  async atualizar(id, dados) {
    const pool = await getPool();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('clienteId', sql.Int, dados.clienteId || null)
      .input('marca', sql.NVarChar, dados.marca.toUpperCase())
      .input('modelo', sql.NVarChar, dados.modelo.toUpperCase())
      .input(
        'motorizacao',
        sql.NVarChar,
        dados.motorizacao ? dados.motorizacao.toUpperCase() : null,
      )
      .input('anoModelo', sql.NVarChar, dados.anoModelo || null)
      .input(
        'placa',
        sql.NVarChar,
        dados.placa ? dados.placa.toUpperCase() : null,
      )
      .input('km', sql.Int, dados.km || null).query(`
        UPDATE dbo.Veiculos
        SET
          ClienteId   = @clienteId,
          Marca       = @marca,
          Modelo      = @modelo,
          Motorizacao = @motorizacao,
          AnoModelo   = @anoModelo,
          Placa       = @placa,
          Km          = @km
        WHERE VeiculoId = @id AND Ativo = 1
      `);

    // SELECT separado — trigger bloqueia OUTPUT
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);

    return result.recordset[0];
  }

  /* ===========================
    INATIVAR VEÍCULO (soft delete)
    Ativo = 0 + ClienteId = NULL
    Veículo sai da listagem mas permanece no banco
    Pode ser reativado futuramente
  =========================== */
  async inativar(id) {
    const pool = await getPool();

    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Veiculos
        SET
          Ativo     = 0,
          ClienteId = NULL
        WHERE VeiculoId = @id
      `);

    return result.rowsAffected[0];
  }

  /* ===========================
    REATIVAR VEÍCULO
    Ativo = 1 + vincula novo ClienteId
    Chamado quando frontend detecta veículo inativo
    e usuário confirma reativação
  =========================== */
  async reativar(id, clienteId) {
    const pool = await getPool();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('clienteId', sql.Int, clienteId).query(`
        UPDATE dbo.Veiculos
        SET
          Ativo     = 1,
          ClienteId = @clienteId
        WHERE VeiculoId = @id
      `);

    // SELECT separado para retornar registro reativado
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);

    return result.recordset[0];
  }
}

module.exports = new VeiculoRepository();

```

```jsx
// usuarioRoutes.js | data: 03/03/2026

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

```

```jsx
// clienteRoutes.js | data: 03/03/2026

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

```

```jsx
// veiculoRoutes.js | data: 03/03/2026

// Rotas da API — dbo.Veiculos
// VERSÃO: 1.0 - AC2
// =========================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');

/* ===========================
  RATE LIMITER
  100 requisições por 15 min
  Mesmo padrão do AC1
=========================== */
const veiculoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===========================
  VALIDAÇÃO DE BODY
  Rejeita POST/PUT sem body
  antes de chegar ao controller
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
  Rotas específicas (/buscar, /cliente)
  ANTES de /:id para evitar conflito de parâmetro
=========================== */

// GET /api/veiculos                   → lista todos (aceita ?ordem=ASC/DESC)
router.get('/', veiculoLimiter, veiculoController.listarTodos);

// GET /api/veiculos/buscar            → busca por placa ou proprietário
// ?tipo=placa&valor=ABC1D23
// ?tipo=proprietario&valor=98765432100
router.get('/buscar', veiculoLimiter, veiculoController.buscar);

// GET /api/veiculos/cliente           → busca cliente por CPF/CNPJ (formulário)
// ?cpfCnpj=98765432100
router.get('/cliente', veiculoLimiter, veiculoController.buscarCliente);

// GET /api/veiculos/:id               → busca veículo por ID
router.get('/:id', veiculoLimiter, veiculoController.buscarPorId);

// POST /api/veiculos                  → cria novo veículo
router.post('/', veiculoLimiter, validateJSON, veiculoController.criar);

// PUT /api/veiculos/:id               → atualiza veículo (incluindo Km)
router.put('/:id', veiculoLimiter, validateJSON, veiculoController.atualizar);

// PATCH /api/veiculos/:id/inativar    → inativa veículo (Ativo=0 + ClienteId=NULL)
router.patch('/:id/inativar', veiculoLimiter, veiculoController.inativar);

// PATCH /api/veiculos/:id/reativar    → reativa veículo + vincula proprietário
router.patch(
  '/:id/reativar',
  veiculoLimiter,
  validateJSON,
  veiculoController.reativar,
);

module.exports = router;

```

```jsx
// server.js | data: 03/03/2026

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

```

```json
// package.json | data: 03/03/2026

{
  "name": "software-product",
  "version": "1.0.0",
  "description": "Sistema de gerenciamento acadêmico - Faculdade Impacta",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/busellirogerio/software-product.git"
  },
  "keywords": [],
  "author": "Buselli Rogerio",
  "license": "ISC",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/busellirogerio/software-product/issues"
  },
  "homepage": "https://github.com/busellirogerio/software-product#readme",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "express-rate-limit": "^8.2.1",
    "mssql": "^12.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

```json
// package-lock.json | data: 03/03/2026

{
  "name": "software-product",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "software-product",
      "version": "1.0.0",
      "license": "ISC",
      "dependencies": {
        "bcrypt": "^6.0.0",
        "cors": "^2.8.6",
        "dotenv": "^17.3.1",
        "express": "^5.2.1",
        "express-rate-limit": "^8.2.1",
        "mssql": "^12.2.0"
      },
      "devDependencies": {
        "nodemon": "^3.1.11"
      }
    },
    "node_modules/@azure-rest/core-client": {
      "version": "2.5.1",
      "resolved": "https://registry.npmjs.org/@azure-rest/core-client/-/core-client-2.5.1.tgz",
      "integrity": "sha512-EHaOXW0RYDKS5CFffnixdyRPak5ytiCtU7uXDcP/uiY+A6jFRwNGzzJBiznkCzvi5EYpY+YWinieqHb0oY916A==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.1.2",
        "@azure/core-auth": "^1.10.0",
        "@azure/core-rest-pipeline": "^1.22.0",
        "@azure/core-tracing": "^1.3.0",
        "@typespec/ts-http-runtime": "^0.3.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/abort-controller": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/@azure/abort-controller/-/abort-controller-2.1.2.tgz",
      "integrity": "sha512-nBrLsEWm4J2u5LpAPjxADTlq3trDgVZZXHNKabeXZtpq3d3AbN/KGO82R87rdDz5/lYB024rtEf10/q0urNgsA==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@azure/core-auth": {
      "version": "1.10.1",
      "resolved": "https://registry.npmjs.org/@azure/core-auth/-/core-auth-1.10.1.tgz",
      "integrity": "sha512-ykRMW8PjVAn+RS6ww5cmK9U2CyH9p4Q88YJwvUslfuMmN98w/2rdGRLPqJYObapBCdzBVeDgYWdJnFPFb7qzpg==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.1.2",
        "@azure/core-util": "^1.13.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/core-client": {
      "version": "1.10.1",
      "resolved": "https://registry.npmjs.org/@azure/core-client/-/core-client-1.10.1.tgz",
      "integrity": "sha512-Nh5PhEOeY6PrnxNPsEHRr9eimxLwgLlpmguQaHKBinFYA/RU9+kOYVOQqOrTsCL+KSxrLLl1gD8Dk5BFW/7l/w==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@azure/abort-controller": "^2.1.2",
        "@azure/core-auth": "^1.10.0",
        "@azure/core-rest-pipeline": "^1.22.0",
        "@azure/core-tracing": "^1.3.0",
        "@azure/core-util": "^1.13.0",
        "@azure/logger": "^1.3.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/core-http-compat": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/@azure/core-http-compat/-/core-http-compat-2.3.2.tgz",
      "integrity": "sha512-Tf6ltdKzOJEgxZeWLCjMxrxbodB/ZeCbzzA1A2qHbhzAjzjHoBVSUeSl/baT/oHAxhc4qdqVaDKnc2+iE932gw==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.1.2"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "@azure/core-client": "^1.10.0",
        "@azure/core-rest-pipeline": "^1.22.0"
      }
    },
    "node_modules/@azure/core-lro": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/@azure/core-lro/-/core-lro-2.7.2.tgz",
      "integrity": "sha512-0YIpccoX8m/k00O7mDDMdJpbr6mf1yWo2dfmxt5A8XVZVVMz2SSKaEbMCeJRvgQ0IaSlqhjT47p4hVIRRy90xw==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.0.0",
        "@azure/core-util": "^1.2.0",
        "@azure/logger": "^1.0.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@azure/core-paging": {
      "version": "1.6.2",
      "resolved": "https://registry.npmjs.org/@azure/core-paging/-/core-paging-1.6.2.tgz",
      "integrity": "sha512-YKWi9YuCU04B55h25cnOYZHxXYtEvQEbKST5vqRga7hWY9ydd3FZHdeQF8pyh+acWZvppw13M/LMGx0LABUVMA==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@azure/core-rest-pipeline": {
      "version": "1.22.2",
      "resolved": "https://registry.npmjs.org/@azure/core-rest-pipeline/-/core-rest-pipeline-1.22.2.tgz",
      "integrity": "sha512-MzHym+wOi8CLUlKCQu12de0nwcq9k9Kuv43j4Wa++CsCpJwps2eeBQwD2Bu8snkxTtDKDx4GwjuR9E8yC8LNrg==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@azure/abort-controller": "^2.1.2",
        "@azure/core-auth": "^1.10.0",
        "@azure/core-tracing": "^1.3.0",
        "@azure/core-util": "^1.13.0",
        "@azure/logger": "^1.3.0",
        "@typespec/ts-http-runtime": "^0.3.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/core-tracing": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/@azure/core-tracing/-/core-tracing-1.3.1.tgz",
      "integrity": "sha512-9MWKevR7Hz8kNzzPLfX4EAtGM2b8mr50HPDBvio96bURP/9C+HjdH3sBlLSNNrvRAr5/k/svoH457gB5IKpmwQ==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/core-util": {
      "version": "1.13.1",
      "resolved": "https://registry.npmjs.org/@azure/core-util/-/core-util-1.13.1.tgz",
      "integrity": "sha512-XPArKLzsvl0Hf0CaGyKHUyVgF7oDnhKoP85Xv6M4StF/1AhfORhZudHtOyf2s+FcbuQ9dPRAjB8J2KvRRMUK2A==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.1.2",
        "@typespec/ts-http-runtime": "^0.3.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/identity": {
      "version": "4.13.0",
      "resolved": "https://registry.npmjs.org/@azure/identity/-/identity-4.13.0.tgz",
      "integrity": "sha512-uWC0fssc+hs1TGGVkkghiaFkkS7NkTxfnCH+Hdg+yTehTpMcehpok4PgUKKdyCH+9ldu6FhiHRv84Ntqj1vVcw==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.0.0",
        "@azure/core-auth": "^1.9.0",
        "@azure/core-client": "^1.9.2",
        "@azure/core-rest-pipeline": "^1.17.0",
        "@azure/core-tracing": "^1.0.0",
        "@azure/core-util": "^1.11.0",
        "@azure/logger": "^1.0.0",
        "@azure/msal-browser": "^4.2.0",
        "@azure/msal-node": "^3.5.0",
        "open": "^10.1.0",
        "tslib": "^2.2.0"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/keyvault-common": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@azure/keyvault-common/-/keyvault-common-2.0.0.tgz",
      "integrity": "sha512-wRLVaroQtOqfg60cxkzUkGKrKMsCP6uYXAOomOIysSMyt1/YM0eUn9LqieAWM8DLcU4+07Fio2YGpPeqUbpP9w==",
      "license": "MIT",
      "dependencies": {
        "@azure/abort-controller": "^2.0.0",
        "@azure/core-auth": "^1.3.0",
        "@azure/core-client": "^1.5.0",
        "@azure/core-rest-pipeline": "^1.8.0",
        "@azure/core-tracing": "^1.0.0",
        "@azure/core-util": "^1.10.0",
        "@azure/logger": "^1.1.4",
        "tslib": "^2.2.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@azure/keyvault-keys": {
      "version": "4.10.0",
      "resolved": "https://registry.npmjs.org/@azure/keyvault-keys/-/keyvault-keys-4.10.0.tgz",
      "integrity": "sha512-eDT7iXoBTRZ2n3fLiftuGJFD+yjkiB1GNqzU2KbY1TLYeXeSPVTVgn2eJ5vmRTZ11978jy2Kg2wI7xa9Tyr8ag==",
      "license": "MIT",
      "dependencies": {
        "@azure-rest/core-client": "^2.3.3",
        "@azure/abort-controller": "^2.1.2",
        "@azure/core-auth": "^1.9.0",
        "@azure/core-http-compat": "^2.2.0",
        "@azure/core-lro": "^2.7.2",
        "@azure/core-paging": "^1.6.2",
        "@azure/core-rest-pipeline": "^1.19.0",
        "@azure/core-tracing": "^1.2.0",
        "@azure/core-util": "^1.11.0",
        "@azure/keyvault-common": "^2.0.0",
        "@azure/logger": "^1.1.4",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@azure/logger": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/@azure/logger/-/logger-1.3.0.tgz",
      "integrity": "sha512-fCqPIfOcLE+CGqGPd66c8bZpwAji98tZ4JI9i/mlTNTlsIWslCfpg48s/ypyLxZTump5sypjrKn2/kY7q8oAbA==",
      "license": "MIT",
      "dependencies": {
        "@typespec/ts-http-runtime": "^0.3.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@azure/msal-browser": {
      "version": "4.28.2",
      "resolved": "https://registry.npmjs.org/@azure/msal-browser/-/msal-browser-4.28.2.tgz",
      "integrity": "sha512-6vYUMvs6kJxJgxaCmHn/F8VxjLHNh7i9wzfwPGf8kyBJ8Gg2yvBXx175Uev8LdrD1F5C4o7qHa2CC4IrhGE1XQ==",
      "license": "MIT",
      "dependencies": {
        "@azure/msal-common": "15.14.2"
      },
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/@azure/msal-common": {
      "version": "15.14.2",
      "resolved": "https://registry.npmjs.org/@azure/msal-common/-/msal-common-15.14.2.tgz",
      "integrity": "sha512-n8RBJEUmd5QotoqbZfd+eGBkzuFI1KX6jw2b3WcpSyGjwmzoeI/Jb99opIBPHpb8y312NB+B6+FGi2ZVSR8yfA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/@azure/msal-node": {
      "version": "3.8.7",
      "resolved": "https://registry.npmjs.org/@azure/msal-node/-/msal-node-3.8.7.tgz",
      "integrity": "sha512-a+Xnrae+uwLnlw68bplS1X4kuJ9F/7K6afuMFyRkNIskhjgDezl5Fhrx+1pmAlDmC0VaaAxjRQMp1OmcqVwkIg==",
      "license": "MIT",
      "dependencies": {
        "@azure/msal-common": "15.14.2",
        "jsonwebtoken": "^9.0.0",
        "uuid": "^8.3.0"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@js-joda/core": {
      "version": "5.7.0",
      "resolved": "https://registry.npmjs.org/@js-joda/core/-/core-5.7.0.tgz",
      "integrity": "sha512-WBu4ULVVxySLLzK1Ppq+OdfP+adRS4ntmDQT915rzDJ++i95gc2jZkM5B6LWEAwN3lGXpfie3yPABozdD3K3Vg==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@tediousjs/connection-string": {
      "version": "0.6.0",
      "resolved": "https://registry.npmjs.org/@tediousjs/connection-string/-/connection-string-0.6.0.tgz",
      "integrity": "sha512-GxlsW354Vi6QqbUgdPyQVcQjI7cZBdGV5vOYVYuCVDTylx2wl3WHR2HlhcxxHTrMigbelpXsdcZso+66uxPfow==",
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "25.2.3",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-25.2.3.tgz",
      "integrity": "sha512-m0jEgYlYz+mDJZ2+F4v8D1AyQb+QzsNqRuI7xg1VQX/KlKS0qT9r1Mo16yo5F/MtifXFgaofIFsdFMox2SxIbQ==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.16.0"
      }
    },
    "node_modules/@types/readable-stream": {
      "version": "4.0.23",
      "resolved": "https://registry.npmjs.org/@types/readable-stream/-/readable-stream-4.0.23.tgz",
      "integrity": "sha512-wwXrtQvbMHxCbBgjHaMGEmImFTQxxpfMOR/ZoQnXxB1woqkUbdLGFDgauo00Py9IudiaqSeiBiulSV9i6XIPig==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@typespec/ts-http-runtime": {
      "version": "0.3.3",
      "resolved": "https://registry.npmjs.org/@typespec/ts-http-runtime/-/ts-http-runtime-0.3.3.tgz",
      "integrity": "sha512-91fp6CAAJSRtH5ja95T1FHSKa8aPW9/Zw6cta81jlZTUw/+Vq8jM/AfF/14h2b71wwR84JUTW/3Y8QPhDAawFA==",
      "license": "MIT",
      "dependencies": {
        "http-proxy-agent": "^7.0.0",
        "https-proxy-agent": "^7.0.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/abort-controller": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz",
      "integrity": "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      "license": "MIT",
      "dependencies": {
        "event-target-shim": "^5.0.0"
      },
      "engines": {
        "node": ">=6.5"
      }
    },
    "node_modules/accepts": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-2.0.0.tgz",
      "integrity": "sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "^3.0.0",
        "negotiator": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/base64-js": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/bcrypt": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/bcrypt/-/bcrypt-6.0.0.tgz",
      "integrity": "sha512-cU8v/EGSrnH+HnxV2z0J7/blxH8gq7Xh2JFT6Aroax7UohdmiJJlxApMxtKfuI7z68NvvVcmR78k2LbT6efhRg==",
      "hasInstallScript": true,
      "license": "MIT",
      "dependencies": {
        "node-addon-api": "^8.3.0",
        "node-gyp-build": "^4.8.4"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/bl": {
      "version": "6.1.6",
      "resolved": "https://registry.npmjs.org/bl/-/bl-6.1.6.tgz",
      "integrity": "sha512-jLsPgN/YSvPUg9UX0Kd73CXpm2Psg9FxMeCSXnk3WBO3CMT10JMwijubhGfHCnFu6TPn1ei3b975dxv7K2pWVg==",
      "license": "MIT",
      "dependencies": {
        "@types/readable-stream": "^4.0.0",
        "buffer": "^6.0.3",
        "inherits": "^2.0.4",
        "readable-stream": "^4.2.0"
      }
    },
    "node_modules/body-parser": {
      "version": "2.2.2",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.2.2.tgz",
      "integrity": "sha512-oP5VkATKlNwcgvxi0vM0p/D3n2C3EReYVX+DNYs5TjZFn/oQt2j+4sVJtSMr18pdRr8wjTcBl6LoV+FUwzPmNA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "^3.1.2",
        "content-type": "^1.0.5",
        "debug": "^4.4.3",
        "http-errors": "^2.0.0",
        "iconv-lite": "^0.7.0",
        "on-finished": "^2.4.1",
        "qs": "^6.14.1",
        "raw-body": "^3.0.1",
        "type-is": "^2.0.1"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/brace-expansion": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.12.tgz",
      "integrity": "sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/buffer": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/buffer/-/buffer-6.0.3.tgz",
      "integrity": "sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "base64-js": "^1.3.1",
        "ieee754": "^1.2.1"
      }
    },
    "node_modules/buffer-equal-constant-time": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/buffer-equal-constant-time/-/buffer-equal-constant-time-1.0.1.tgz",
      "integrity": "sha512-zRpUiDwd/xk6ADqPMATG8vc9VPrkck7T07OIx0gnjmJAnHnTVXNQG3vfvWNuiZIkwu9KrKdA1iJKfsfTVxE6NA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/bundle-name": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/bundle-name/-/bundle-name-4.1.0.tgz",
      "integrity": "sha512-tjwM5exMg6BGRI+kNmTntNsvdZS1X8BFYS6tnJ2hdH0kVxM6/eVZ2xy+FqStSWvYmtfFMDLIxurorHwDKfDz5Q==",
      "license": "MIT",
      "dependencies": {
        "run-applescript": "^7.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/commander": {
      "version": "11.1.0",
      "resolved": "https://registry.npmjs.org/commander/-/commander-11.1.0.tgz",
      "integrity": "sha512-yPVavfyCcRhmorC7rWlkHn15b4wDVgVmBA7kV4QVBsF7kv/9TKJAbAXVTxvTnwP8HHKjRCJDClKbciiYS7p0DQ==",
      "license": "MIT",
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/content-disposition": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-1.0.1.tgz",
      "integrity": "sha512-oIXISMynqSqm241k6kcQ5UwttDILMK4BiurCfGEREw6+X9jkkpEe5T9FZaApyLGGOnFuyMWZpdolTXMtvEJ08Q==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/content-type": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.2.2.tgz",
      "integrity": "sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.6.0"
      }
    },
    "node_modules/cors": {
      "version": "2.8.6",
      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.6.tgz",
      "integrity": "sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==",
      "license": "MIT",
      "dependencies": {
        "object-assign": "^4",
        "vary": "^1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/default-browser": {
      "version": "5.5.0",
      "resolved": "https://registry.npmjs.org/default-browser/-/default-browser-5.5.0.tgz",
      "integrity": "sha512-H9LMLr5zwIbSxrmvikGuI/5KGhZ8E2zH3stkMgM5LpOWDutGM2JZaj460Udnf1a+946zc7YBgrqEWwbk7zHvGw==",
      "license": "MIT",
      "dependencies": {
        "bundle-name": "^4.1.0",
        "default-browser-id": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/default-browser-id": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/default-browser-id/-/default-browser-id-5.0.1.tgz",
      "integrity": "sha512-x1VCxdX4t+8wVfd1so/9w+vQ4vx7lKd2Qp5tDRutErwmR85OgmfX7RlLRMWafRMY7hbEiXIbudNrjOAPa/hL8Q==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/define-lazy-prop": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/define-lazy-prop/-/define-lazy-prop-3.0.0.tgz",
      "integrity": "sha512-N+MeXYoqr3pOgn8xfyRPREN7gHakLYjhsHhWGT3fWAiL4IkAt0iDw14QiiEm2bE30c5XX5q0FtAA3CK5f9/BUg==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/dotenv": {
      "version": "17.3.1",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-17.3.1.tgz",
      "integrity": "sha512-IO8C/dzEb6O3F9/twg6ZLXz164a2fhTnEWb95H23Dm4OuN+92NmEAlTrupP9VW6Jm3sO26tQlqyvyi4CsnY9GA==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ecdsa-sig-formatter": {
      "version": "1.0.11",
      "resolved": "https://registry.npmjs.org/ecdsa-sig-formatter/-/ecdsa-sig-formatter-1.0.11.tgz",
      "integrity": "sha512-nagl3RYrbNv6kQkeJIpt6NJZy8twLB/2vtz6yN9Z4vRKHN4/QZJIEbqohALSgwKdnksuY3k5Addp5lg8sVoVcQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/event-target-shim": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz",
      "integrity": "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/events": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/events/-/events-3.3.0.tgz",
      "integrity": "sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8.x"
      }
    },
    "node_modules/express": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/express/-/express-5.2.1.tgz",
      "integrity": "sha512-hIS4idWWai69NezIdRt2xFVofaF4j+6INOpJlVOLDO8zXGpUVEVzIYk12UUi2JzjEzWL3IOAxcTubgz9Po0yXw==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "accepts": "^2.0.0",
        "body-parser": "^2.2.1",
        "content-disposition": "^1.0.0",
        "content-type": "^1.0.5",
        "cookie": "^0.7.1",
        "cookie-signature": "^1.2.1",
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "finalhandler": "^2.1.0",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.0",
        "merge-descriptors": "^2.0.0",
        "mime-types": "^3.0.0",
        "on-finished": "^2.4.1",
        "once": "^1.4.0",
        "parseurl": "^1.3.3",
        "proxy-addr": "^2.0.7",
        "qs": "^6.14.0",
        "range-parser": "^1.2.1",
        "router": "^2.2.0",
        "send": "^1.1.0",
        "serve-static": "^2.2.0",
        "statuses": "^2.0.1",
        "type-is": "^2.0.1",
        "vary": "^1.1.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/express-rate-limit": {
      "version": "8.2.1",
      "resolved": "https://registry.npmjs.org/express-rate-limit/-/express-rate-limit-8.2.1.tgz",
      "integrity": "sha512-PCZEIEIxqwhzw4KF0n7QF4QqruVTcF73O5kFKUnGOyjbCCgizBBiFaYpd/fnBLUMPw/BWw9OsiN7GgrNYr7j6g==",
      "license": "MIT",
      "dependencies": {
        "ip-address": "10.0.1"
      },
      "engines": {
        "node": ">= 16"
      },
      "funding": {
        "url": "https://github.com/sponsors/express-rate-limit"
      },
      "peerDependencies": {
        "express": ">= 4.11"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/finalhandler": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-2.1.1.tgz",
      "integrity": "sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "on-finished": "^2.4.1",
        "parseurl": "^1.3.3",
        "statuses": "^2.0.1"
      },
      "engines": {
        "node": ">= 18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-2.0.0.tgz",
      "integrity": "sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-flag": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/http-proxy-agent": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/http-proxy-agent/-/http-proxy-agent-7.0.2.tgz",
      "integrity": "sha512-T1gkAiYYDWYx3V5Bmyu7HcfcvL7mUrTWiM6yOfa3PIphViJ/gFPbvidQ+veqSOHci/PxBcDabeUNCzpOODJZig==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.7.2.tgz",
      "integrity": "sha512-im9DjEDQ55s9fL4EYzOAv0yMqmMBSZp6G0VvFyTMPKWxiSBHUj9NW/qqLmXUwXrrM7AvqSlTCfvqRb0cM8yYqw==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/ieee754": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz",
      "integrity": "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/ignore-by-default": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/ignore-by-default/-/ignore-by-default-1.0.1.tgz",
      "integrity": "sha512-Ius2VYcGNk7T90CppJqcIkS5ooHUZyIQK+ClZfMfMNFEF9VSE73Fq+906u/CWu92x4gzZMWOwfFYckPObzdEbA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ip-address": {
      "version": "10.0.1",
      "resolved": "https://registry.npmjs.org/ip-address/-/ip-address-10.0.1.tgz",
      "integrity": "sha512-NWv9YLW4PoW2B7xtzaS3NCot75m6nK7Icdv0o3lfMceJVRfSoQwqD4wEH5rLwoKJwUiZ/rfpiVBhnaF0FK4HoA==",
      "license": "MIT",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-docker": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-docker/-/is-docker-3.0.0.tgz",
      "integrity": "sha512-eljcgEDlEns/7AXFosB5K/2nCM4P7FQPkGc/DWLy5rmFEWvZayGrik1d9/QIY5nJ4f9YsVvBkA6kJpHn9rISdQ==",
      "license": "MIT",
      "bin": {
        "is-docker": "cli.js"
      },
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-inside-container": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/is-inside-container/-/is-inside-container-1.0.0.tgz",
      "integrity": "sha512-KIYLCCJghfHZxqjYBE7rEy0OBuTd5xCHS7tHVgvCLkx7StIoaxwNW3hCALgEUjFfeRk+MG/Qxmp/vtETEF3tRA==",
      "license": "MIT",
      "dependencies": {
        "is-docker": "^3.0.0"
      },
      "bin": {
        "is-inside-container": "cli.js"
      },
      "engines": {
        "node": ">=14.16"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/is-promise": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/is-promise/-/is-promise-4.0.0.tgz",
      "integrity": "sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==",
      "license": "MIT"
    },
    "node_modules/is-wsl": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/is-wsl/-/is-wsl-3.1.1.tgz",
      "integrity": "sha512-e6rvdUCiQCAuumZslxRJWR/Doq4VpPR82kqclvcS0efgt430SlGIk05vdCN58+VrzgtIcfNODjozVielycD4Sw==",
      "license": "MIT",
      "dependencies": {
        "is-inside-container": "^1.0.0"
      },
      "engines": {
        "node": ">=16"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/js-md4": {
      "version": "0.3.2",
      "resolved": "https://registry.npmjs.org/js-md4/-/js-md4-0.3.2.tgz",
      "integrity": "sha512-/GDnfQYsltsjRswQhN9fhv3EMw2sCpUdrdxyWDOUK7eyD++r3gRhzgiQgc/x4MAv2i1iuQ4lxO5mvqM3vj4bwA==",
      "license": "MIT"
    },
    "node_modules/jsonwebtoken": {
      "version": "9.0.3",
      "resolved": "https://registry.npmjs.org/jsonwebtoken/-/jsonwebtoken-9.0.3.tgz",
      "integrity": "sha512-MT/xP0CrubFRNLNKvxJ2BYfy53Zkm++5bX9dtuPbqAeQpTVe0MQTFhao8+Cp//EmJp244xt6Drw/GVEGCUj40g==",
      "license": "MIT",
      "dependencies": {
        "jws": "^4.0.1",
        "lodash.includes": "^4.3.0",
        "lodash.isboolean": "^3.0.3",
        "lodash.isinteger": "^4.0.4",
        "lodash.isnumber": "^3.0.3",
        "lodash.isplainobject": "^4.0.6",
        "lodash.isstring": "^4.0.1",
        "lodash.once": "^4.0.0",
        "ms": "^2.1.1",
        "semver": "^7.5.4"
      },
      "engines": {
        "node": ">=12",
        "npm": ">=6"
      }
    },
    "node_modules/jwa": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/jwa/-/jwa-2.0.1.tgz",
      "integrity": "sha512-hRF04fqJIP8Abbkq5NKGN0Bbr3JxlQ+qhZufXVr0DvujKy93ZCbXZMHDL4EOtodSbCWxOqR8MS1tXA5hwqCXDg==",
      "license": "MIT",
      "dependencies": {
        "buffer-equal-constant-time": "^1.0.1",
        "ecdsa-sig-formatter": "1.0.11",
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/jws": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/jws/-/jws-4.0.1.tgz",
      "integrity": "sha512-EKI/M/yqPncGUUh44xz0PxSidXFr/+r0pA70+gIYhjv+et7yxM+s29Y+VGDkovRofQem0fs7Uvf4+YmAdyRduA==",
      "license": "MIT",
      "dependencies": {
        "jwa": "^2.0.1",
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/lodash.includes": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/lodash.includes/-/lodash.includes-4.3.0.tgz",
      "integrity": "sha512-W3Bx6mdkRTGtlJISOvVD/lbqjTlPPUDTMnlXZFnVwi9NKJ6tiAk6LVdlhZMm17VZisqhKcgzpO5Wz91PCt5b0w==",
      "license": "MIT"
    },
    "node_modules/lodash.isboolean": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/lodash.isboolean/-/lodash.isboolean-3.0.3.tgz",
      "integrity": "sha512-Bz5mupy2SVbPHURB98VAcw+aHh4vRV5IPNhILUCsOzRmsTmSQ17jIuqopAentWoehktxGd9e/hbIXq980/1QJg==",
      "license": "MIT"
    },
    "node_modules/lodash.isinteger": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/lodash.isinteger/-/lodash.isinteger-4.0.4.tgz",
      "integrity": "sha512-DBwtEWN2caHQ9/imiNeEA5ys1JoRtRfY3d7V9wkqtbycnAmTvRRmbHKDV4a0EYc678/dia0jrte4tjYwVBaZUA==",
      "license": "MIT"
    },
    "node_modules/lodash.isnumber": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/lodash.isnumber/-/lodash.isnumber-3.0.3.tgz",
      "integrity": "sha512-QYqzpfwO3/CWf3XP+Z+tkQsfaLL/EnUlXWVkIk5FUPc4sBdTehEqZONuyRt2P67PXAk+NXmTBcc97zw9t1FQrw==",
      "license": "MIT"
    },
    "node_modules/lodash.isplainobject": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/lodash.isplainobject/-/lodash.isplainobject-4.0.6.tgz",
      "integrity": "sha512-oSXzaWypCMHkPC3NvBEaPHf0KsA5mvPrOPgQWDsbg8n7orZ290M0BmC/jgRZ4vcJ6DTAhjrsSYgdsW/F+MFOBA==",
      "license": "MIT"
    },
    "node_modules/lodash.isstring": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/lodash.isstring/-/lodash.isstring-4.0.1.tgz",
      "integrity": "sha512-0wJxfxH1wgO3GrbuP+dTTk7op+6L41QCXbGINEmD+ny/G/eCqGzxyCsh7159S+mgDDcoarnBw6PC1PS5+wUGgw==",
      "license": "MIT"
    },
    "node_modules/lodash.once": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/lodash.once/-/lodash.once-4.1.1.tgz",
      "integrity": "sha512-Sb487aTOCr9drQVL8pIxOzVhafOjZN9UU54hiN8PU3uAiSV7lx1yYNpbNmex2PK6dSJoNTSJUUswT651yww3Mg==",
      "license": "MIT"
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-1.1.0.tgz",
      "integrity": "sha512-aisnrDP4GNe06UcKFnV5bfMNPBUw4jsLGaWwWfnH3v02GnBuXX2MCVn5RbrWo0j3pczUilYblq7fQ7Nw2t5XKw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-2.0.0.tgz",
      "integrity": "sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/mime-db": {
      "version": "1.54.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-3.0.2.tgz",
      "integrity": "sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "^1.54.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.2.tgz",
      "integrity": "sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/mssql": {
      "version": "12.2.0",
      "resolved": "https://registry.npmjs.org/mssql/-/mssql-12.2.0.tgz",
      "integrity": "sha512-lwwLHAqcWOz8okjboQpIEp5OghUFGJhuuQZS3+WF1ZXbaEaCEGKOfiQET3w/5Xz0tyZfDNCQVCm9wp5GwXut6g==",
      "license": "MIT",
      "dependencies": {
        "@tediousjs/connection-string": "^0.6.0",
        "commander": "^11.0.0",
        "debug": "^4.3.3",
        "tarn": "^3.0.2",
        "tedious": "^19.0.0"
      },
      "bin": {
        "mssql": "bin/mssql"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/native-duplexpair": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/native-duplexpair/-/native-duplexpair-1.0.0.tgz",
      "integrity": "sha512-E7QQoM+3jvNtlmyfqRZ0/U75VFgCls+fSkbml2MpgWkWyz3ox8Y58gNhfuziuQYGNNQAbFZJQck55LHCnCK6CA==",
      "license": "MIT"
    },
    "node_modules/negotiator": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-1.0.0.tgz",
      "integrity": "sha512-8Ofs/AUQh8MaEcrlq5xOX0CQ9ypTF5dl78mjlMNfOK08fzpgTHQRQPBxcPlEtIw0yRpws+Zo/3r+5WRby7u3Gg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/node-addon-api": {
      "version": "8.5.0",
      "resolved": "https://registry.npmjs.org/node-addon-api/-/node-addon-api-8.5.0.tgz",
      "integrity": "sha512-/bRZty2mXUIFY/xU5HLvveNHlswNJej+RnxBjOMkidWfwZzgTbPG1E3K5TOxRLOR+5hX7bSofy8yf1hZevMS8A==",
      "license": "MIT",
      "engines": {
        "node": "^18 || ^20 || >= 21"
      }
    },
    "node_modules/node-gyp-build": {
      "version": "4.8.4",
      "resolved": "https://registry.npmjs.org/node-gyp-build/-/node-gyp-build-4.8.4.tgz",
      "integrity": "sha512-LA4ZjwlnUblHVgq0oBF3Jl/6h/Nvs5fzBLwdEF4nuxnFdsfajde4WfxtJr3CaiH+F6ewcIB/q4jQ4UzPyid+CQ==",
      "license": "MIT",
      "bin": {
        "node-gyp-build": "bin.js",
        "node-gyp-build-optional": "optional.js",
        "node-gyp-build-test": "build-test.js"
      }
    },
    "node_modules/nodemon": {
      "version": "3.1.11",
      "resolved": "https://registry.npmjs.org/nodemon/-/nodemon-3.1.11.tgz",
      "integrity": "sha512-is96t8F/1//UHAjNPHpbsNY46ELPpftGUoSVNXwUfMk/qdjSylYrWSu1XavVTBOn526kFiOR733ATgNBCQyH0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "chokidar": "^3.5.2",
        "debug": "^4",
        "ignore-by-default": "^1.0.1",
        "minimatch": "^3.1.2",
        "pstree.remy": "^1.1.8",
        "semver": "^7.5.3",
        "simple-update-notifier": "^2.0.0",
        "supports-color": "^5.5.0",
        "touch": "^3.1.0",
        "undefsafe": "^2.0.5"
      },
      "bin": {
        "nodemon": "bin/nodemon.js"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/nodemon"
      }
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/open": {
      "version": "10.2.0",
      "resolved": "https://registry.npmjs.org/open/-/open-10.2.0.tgz",
      "integrity": "sha512-YgBpdJHPyQ2UE5x+hlSXcnejzAvD0b22U2OuAP+8OnlJT+PjWPxtgmGqKKc+RgTM63U9gN0YzrYc71R2WT/hTA==",
      "license": "MIT",
      "dependencies": {
        "default-browser": "^5.2.1",
        "define-lazy-prop": "^3.0.0",
        "is-inside-container": "^1.0.0",
        "wsl-utils": "^0.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-to-regexp": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-8.3.0.tgz",
      "integrity": "sha512-7jdwVIRtsP8MYpdXSwOS0YdD0Du+qOoF/AEPIt88PcCFrZCzx41oxku1jD88hZBwbNUIEfpqvuhjFaMAqMTWnA==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/process": {
      "version": "0.11.10",
      "resolved": "https://registry.npmjs.org/process/-/process-0.11.10.tgz",
      "integrity": "sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6.0"
      }
    },
    "node_modules/proxy-addr": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
      "integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/pstree.remy": {
      "version": "1.1.8",
      "resolved": "https://registry.npmjs.org/pstree.remy/-/pstree.remy-1.1.8.tgz",
      "integrity": "sha512-77DZwxQmxKnu3aR542U+X8FypNzbfJ+C5XQDk3uWjWxn6151aIMGthWYRXTqT1E5oJvg+ljaa2OJi+VfvCOQ8w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/qs": {
      "version": "6.15.0",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.15.0.tgz",
      "integrity": "sha512-mAZTtNCeetKMH+pSjrb76NAM8V9a05I9aBZOHztWy/UqcJdQYNsf59vrRKWnojAT9Y+GbIvoTBC++CPHqpDBhQ==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/range-parser": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
      "integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/raw-body": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-3.0.2.tgz",
      "integrity": "sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.7.0",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/readable-stream": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/readable-stream/-/readable-stream-4.7.0.tgz",
      "integrity": "sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==",
      "license": "MIT",
      "dependencies": {
        "abort-controller": "^3.0.0",
        "buffer": "^6.0.3",
        "events": "^3.3.0",
        "process": "^0.11.10",
        "string_decoder": "^1.3.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/router": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/router/-/router-2.2.0.tgz",
      "integrity": "sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "is-promise": "^4.0.0",
        "parseurl": "^1.3.3",
        "path-to-regexp": "^8.0.0"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/run-applescript": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/run-applescript/-/run-applescript-7.1.0.tgz",
      "integrity": "sha512-DPe5pVFaAsinSaV6QjQ6gdiedWDcRCbUuiQfQa2wmWV7+xC9bGulGI8+TdRmoFkAPaBXk8CrAbnlY2ISniJ47Q==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "7.7.4",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.4.tgz",
      "integrity": "sha512-vFKC2IEtQnVhpT78h1Yp8wzwrf8CM+MzKMHGJZfBtzhZNycRFnXsHk6E5TxIkkMsgNS7mdX3AGB7x2QM2di4lA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/send/-/send-1.2.1.tgz",
      "integrity": "sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.1",
        "mime-types": "^3.0.2",
        "ms": "^2.1.3",
        "on-finished": "^2.4.1",
        "range-parser": "^1.2.1",
        "statuses": "^2.0.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/serve-static": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-2.2.1.tgz",
      "integrity": "sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "parseurl": "^1.3.3",
        "send": "^1.2.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/side-channel": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.0.tgz",
      "integrity": "sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3",
        "side-channel-list": "^1.0.0",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.0.tgz",
      "integrity": "sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/simple-update-notifier": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/simple-update-notifier/-/simple-update-notifier-2.0.0.tgz",
      "integrity": "sha512-a2B9Y0KlNXl9u/vsW6sTIu9vGEpfKu2wRV6l1H3XEas/0gUIzGzBoP/IouTcUQbm9JWZLH3COxyn03TYlFax6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "semver": "^7.5.3"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/sprintf-js": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/sprintf-js/-/sprintf-js-1.1.3.tgz",
      "integrity": "sha512-Oo+0REFV59/rz3gfJNKQiBlwfHaSESl1pcGyABQsnnIfWOFt6JNj5gCog2U6MLZ//IGYD+nA8nI+mTShREReaA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/string_decoder": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz",
      "integrity": "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==",
      "license": "MIT",
      "dependencies": {
        "safe-buffer": "~5.2.0"
      }
    },
    "node_modules/supports-color": {
      "version": "5.5.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^3.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/tarn": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/tarn/-/tarn-3.0.2.tgz",
      "integrity": "sha512-51LAVKUSZSVfI05vjPESNc5vwqqZpbXCsU+/+wxlOrUjk2SnFTt97v9ZgQrD4YmxYW1Px6w2KjaDitCfkvgxMQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/tedious": {
      "version": "19.2.1",
      "resolved": "https://registry.npmjs.org/tedious/-/tedious-19.2.1.tgz",
      "integrity": "sha512-pk1Q16Yl62iocuQB+RWbg6rFUFkIyzqOFQ6NfysCltRvQqKwfurgj8v/f2X+CKvDhSL4IJ0cCOfCHDg9PWEEYA==",
      "license": "MIT",
      "dependencies": {
        "@azure/core-auth": "^1.7.2",
        "@azure/identity": "^4.2.1",
        "@azure/keyvault-keys": "^4.4.0",
        "@js-joda/core": "^5.6.5",
        "@types/node": ">=18",
        "bl": "^6.1.4",
        "iconv-lite": "^0.7.0",
        "js-md4": "^0.3.2",
        "native-duplexpair": "^1.0.0",
        "sprintf-js": "^1.1.3"
      },
      "engines": {
        "node": ">=18.17"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/touch": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/touch/-/touch-3.1.1.tgz",
      "integrity": "sha512-r0eojU4bI8MnHr8c5bNo7lJDdI2qXlWWJk6a9EAFG7vbhTjElYhBVS3/miuE0uOuoLdb8Mc/rVfsmm6eo5o9GA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "nodetouch": "bin/nodetouch.js"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/type-is": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-2.0.1.tgz",
      "integrity": "sha512-OZs6gsjF4vMp32qrCbiVSkrFmXtG/AZhY3t0iAMrMBiAZyV9oALtXO8hsrHbMXF9x6L3grlFuwW2oAz7cav+Gw==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^1.0.5",
        "media-typer": "^1.1.0",
        "mime-types": "^3.0.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/undefsafe": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/undefsafe/-/undefsafe-2.0.5.tgz",
      "integrity": "sha512-WxONCrssBM8TSPRqN5EmsjVrsv4A8X12J4ArBiiayv3DyyG3ZlIg6yysuuSYdZsVz3TKcTg2fd//Ujd4CHV1iA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/undici-types": {
      "version": "7.16.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.16.0.tgz",
      "integrity": "sha512-Zz+aZWSj8LE6zoxD+xrjh4VfkIG8Ya6LvYkZqtUQGJPZjYl53ypCaUwWqo7eI0x66KBGeRo+mlBEkMSeSZ38Nw==",
      "license": "MIT"
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/uuid": {
      "version": "8.3.2",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-8.3.2.tgz",
      "integrity": "sha512-+NYs2QeMWy+GWFOEm9xnn6HCDp0l7QBD7ml8zLUmJ+93Q5NF0NocErnwkTkXVFNiX3/fpC6afS8Dhb/gz7R7eg==",
      "license": "MIT",
      "bin": {
        "uuid": "dist/bin/uuid"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/wsl-utils": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/wsl-utils/-/wsl-utils-0.1.0.tgz",
      "integrity": "sha512-h3Fbisa2nKGPxCpm89Hk33lBLsnaGBvctQopaBSOW/uIs6FTe1ATyAnKFJrzVs9vpGdsTe73WF3V4lIsk4Gacw==",
      "license": "MIT",
      "dependencies": {
        "is-wsl": "^3.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    }
  }
}

```

```markdown
// .env | data: 03/03/2026

# CONFIGURAÇÕES DO SERVIDOR
PORT=3000

# CONFIGURAÇÕES DO BANCO DE DADOS (SQL Server)
DB_SERVER=127.0.0.1 #localhost
DB_DATABASE=SoftwareProduct
DB_USER=sa
DB_PASSWORD=SSBr@194
DB_PORT=1433
```

```markdown
// .gitignore | data: 03/03/2026

# Dependências
node_modules/

# Configurações sensíveis
.env
acs/Token GitHub.txt

# Logs
*.log
npm-debug.log*

# Sistema operacional
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo
```