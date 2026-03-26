-- -----------------------------------------------
-- Clientes.sql
-- Tema: Criar tabela dbo.Clientes + índices + trigger
-- Última rev: 02 | Data: 25/03/2026
-- Banco: SoftwareProduct
-- Regras:
--   Ativo=1, Bloqueado=0 → ATIVO    (aparece na lista, recebe comunicação)
--   Ativo=1, Bloqueado=1 → BLOQUEADO (aparece na lista, sem comunicação/eventos)
--   Ativo=0              → INATIVO  (não aparece em nada, só busca direta por CPF)
-- -----------------------------------------------


USE SoftwareProduct;
GO


-- #region LIMPEZA | rev.02 | 25/03/2026

-- --- remove FK de Veiculos que referencia Clientes
IF OBJECT_ID('dbo.FK_Veiculos_ClienteId', 'F') IS NOT NULL
    ALTER TABLE dbo.Veiculos DROP CONSTRAINT FK_Veiculos_ClienteId;
GO

-- --- remove trigger se existir
IF OBJECT_ID('dbo.TR_Clientes_SetDataAtualizacao', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Clientes_SetDataAtualizacao;
GO

-- --- remove tabela se existir
IF OBJECT_ID('dbo.Clientes', 'U') IS NOT NULL
    DROP TABLE dbo.Clientes;
GO

-- #endregion


-- #region CRIAÇÃO DA TABELA | rev.02 | 25/03/2026

CREATE TABLE dbo.Clientes
(
    -- -------------------------------------------------------
    -- IDENTIFICAÇÃO
    -- -------------------------------------------------------

    -- Chave primária autoincrementada
    ClienteId           INT             IDENTITY(1,1)   NOT NULL,

    -- PF = Pessoa Física | PJ = Pessoa Jurídica
    Tipo                CHAR(2)                         NOT NULL
        CONSTRAINT CK_Clientes_Tipo
            CHECK (Tipo IN ('PF', 'PJ')),

    -- CPF (11 dígitos) ou CNPJ (14 dígitos) — sem formatação, único
    CpfCnpj             NVARCHAR(14)                    NOT NULL,

    -- -------------------------------------------------------
    -- DADOS PESSOAIS — armazenados em MAIÚSCULO
    -- -------------------------------------------------------

    NomeCompleto        NVARCHAR(200)                   NOT NULL,
    DataNascimento      DATE                            NULL,

    -- M = Masculino | F = Feminino | O = Outro
    Genero              CHAR(1)                         NULL
        CONSTRAINT CK_Clientes_Genero
            CHECK (Genero IS NULL OR Genero IN ('M', 'F', 'O')),

    -- -------------------------------------------------------
    -- CONTATO
    -- -------------------------------------------------------

    Telefone            NVARCHAR(20)                    NULL,

    -- 1 = número tem WhatsApp | 0 = não tem
    TelefoneWhatsApp    BIT                             NOT NULL
        CONSTRAINT DF_Clientes_TelefoneWhatsApp DEFAULT (0),

    Email               NVARCHAR(254)                   NULL
        CONSTRAINT CK_Clientes_Email
            CHECK (Email IS NULL OR Email LIKE '%_@_%._%'),

    -- -------------------------------------------------------
    -- ENDEREÇO — armazenado em MAIÚSCULO
    -- -------------------------------------------------------

    Cep                 CHAR(8)                         NULL,
    Logradouro          NVARCHAR(200)                   NULL,
    Numero              NVARCHAR(10)                    NULL,
    Complemento         NVARCHAR(100)                   NULL,
    Bairro              NVARCHAR(100)                   NULL,
    Cidade              NVARCHAR(100)                   NULL,
    Estado              CHAR(2)                         NULL,

    -- -------------------------------------------------------
    -- CONTROLE DE STATUS
    -- -------------------------------------------------------

    -- Soft delete: 1 = existe | 0 = inativo (não aparece em lista nem busca normal)
    Ativo               BIT                             NOT NULL
        CONSTRAINT DF_Clientes_Ativo DEFAULT (1),

    -- Bloqueio: 0 = normal | 1 = bloqueado (aparece na lista, sem comunicação/eventos)
    Bloqueado           BIT                             NOT NULL
        CONSTRAINT DF_Clientes_Bloqueado DEFAULT (0),

    -- -------------------------------------------------------
    -- AUDITORIA
    -- -------------------------------------------------------

    -- Preenchido automaticamente na inserção
    DataCriacao         DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_Clientes_DataCriacao DEFAULT (SYSDATETIME()),

    -- Atualizado automaticamente pelo trigger a cada UPDATE
    DataAtualizacao     DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_Clientes_DataAtualizacao DEFAULT (SYSDATETIME()),

    -- -------------------------------------------------------
    -- CONSTRAINTS
    -- -------------------------------------------------------

    CONSTRAINT PK_Clientes
        PRIMARY KEY CLUSTERED (ClienteId),

    CONSTRAINT UQ_Clientes_CpfCnpj
        UNIQUE (CpfCnpj)
);
GO

-- #endregion


-- #region ÍNDICES | rev.02 | 25/03/2026

-- --- filtro por Ativo: usado na listagem geral
CREATE NONCLUSTERED INDEX IX_Clientes_Ativo
    ON dbo.Clientes (Ativo)
    INCLUDE (ClienteId, NomeCompleto, CpfCnpj, Telefone, Bloqueado);
GO

-- #endregion


-- #region TRIGGER | rev.02 | 25/03/2026

-- --- atualiza DataAtualizacao automaticamente a cada UPDATE
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

-- #endregion


-- #region FK VEÍCULOS | rev.02 | 25/03/2026

-- --- recria FK de Veiculos → Clientes (se tabela Veiculos já existir)
IF OBJECT_ID('dbo.Veiculos', 'U') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Veiculos
        ADD CONSTRAINT FK_Veiculos_ClienteId
            FOREIGN KEY (ClienteId)
            REFERENCES dbo.Clientes (ClienteId)
            ON DELETE SET NULL
            ON UPDATE CASCADE;
END;
GO

-- #endregion


PRINT '✅ Tabela dbo.Clientes v2.0 criada com sucesso!';
GO
