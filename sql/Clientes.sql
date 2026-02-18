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