-- -----------------------------------------------
-- Chamados.sql
-- Tema: Criar tabela dbo.Chamados + índice
-- Última rev: 02 | Data: 25/03/2026
-- Banco: SoftwareProduct
-- Regras:
--   Resolvido=0 → pendente | 1 → resolvido (marcado pelo próprio usuário)
--   Qualidade=NULL → não avaliado | 1–5 → nota dada pelo usuário
-- -----------------------------------------------


USE SoftwareProduct;
GO


-- #region LIMPEZA | rev.02 | 25/03/2026

-- --- remove tabela se existir
IF OBJECT_ID('dbo.Chamados', 'U') IS NOT NULL
    DROP TABLE dbo.Chamados;
GO

-- #endregion


-- #region CRIAÇÃO DA TABELA | rev.02 | 25/03/2026

CREATE TABLE dbo.Chamados
(
    -- -------------------------------------------------------
    -- IDENTIFICAÇÃO
    -- -------------------------------------------------------

    ChamadoId       INT             IDENTITY(1,1)   NOT NULL,

    -- Protocolo único gerado no frontend: SUP-YYYYMMDD-XXXXX
    Protocolo       NVARCHAR(25)                    NOT NULL,

    -- -------------------------------------------------------
    -- USUÁRIO
    -- -------------------------------------------------------

    Usuario         NVARCHAR(100)                   NOT NULL,
    NomeCompleto    NVARCHAR(200)                   NOT NULL,

    -- -------------------------------------------------------
    -- DETALHES DO CHAMADO
    -- -------------------------------------------------------

    LocalProblema   NVARCHAR(100)                   NOT NULL,
    NivelProblema   NVARCHAR(50)                    NOT NULL,
    Descricao       NVARCHAR(MAX)                   NOT NULL,

    -- -------------------------------------------------------
    -- AVALIAÇÃO DO USUÁRIO
    -- -------------------------------------------------------

    -- 0 = pendente | 1 = resolvido (marcado pelo próprio usuário)
    Resolvido       BIT                             NOT NULL
        CONSTRAINT DF_Chamados_Resolvido DEFAULT (0),

    -- NULL = não avaliado | 1–5 = nota de qualidade do suporte
    Qualidade       TINYINT                         NULL
        CONSTRAINT CK_Chamados_Qualidade
            CHECK (Qualidade IS NULL OR (Qualidade BETWEEN 1 AND 5)),

    -- -------------------------------------------------------
    -- AUDITORIA
    -- -------------------------------------------------------

    DataEnvio       DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_Chamados_DataEnvio DEFAULT (SYSDATETIME()),

    -- -------------------------------------------------------
    -- CONSTRAINTS
    -- -------------------------------------------------------

    CONSTRAINT PK_Chamados
        PRIMARY KEY CLUSTERED (ChamadoId),

    CONSTRAINT UQ_Chamados_Protocolo
        UNIQUE (Protocolo)
);
GO

-- #endregion


-- #region ÍNDICE | rev.02 | 25/03/2026

-- --- busca por usuário: usado na listagem do histórico de chamados
CREATE NONCLUSTERED INDEX IX_Chamados_Usuario
    ON dbo.Chamados (Usuario)
    INCLUDE (ChamadoId, Protocolo, LocalProblema, NivelProblema, DataEnvio, Resolvido, Qualidade);
GO

-- #endregion


PRINT '✅ Tabela dbo.Chamados v1.0 criada com sucesso!';
GO
