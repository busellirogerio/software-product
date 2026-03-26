-- -----------------------------------------------
-- Usuarios.sql
-- Tema: Criar tabela dbo.Usuarios + índices + trigger
-- Última rev: 02 | Data: 25/03/2026
-- Banco: SoftwareProduct
-- -----------------------------------------------


USE SoftwareProduct;
GO


-- #region LIMPEZA | rev.02 | 25/03/2026

-- --- remove trigger se existir
IF OBJECT_ID('dbo.TR_Usuarios_SetDataAtualizacao', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Usuarios_SetDataAtualizacao;
GO

-- --- remove tabela se existir
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL
    DROP TABLE dbo.Usuarios;
GO

-- #endregion


-- #region CRIAÇÃO DA TABELA | rev.02 | 25/03/2026

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

-- #endregion


-- #region ÍNDICES | rev.02 | 25/03/2026

-- --- busca por login (filtrado para ativos)
CREATE NONCLUSTERED INDEX IX_Usuarios_Login
    ON dbo.Usuarios (Login)
    WHERE Ativo = 1;
GO

-- --- listagem geral por status
CREATE NONCLUSTERED INDEX IX_Usuarios_Ativo
    ON dbo.Usuarios (Ativo)
    INCLUDE (UsuarioId, Login, NomeCompleto);
GO

-- #endregion


-- #region TRIGGER | rev.02 | 25/03/2026

-- --- atualiza DataAtualizacao automaticamente a cada UPDATE
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

-- #endregion


PRINT '✅ Tabela dbo.Usuarios criada com sucesso!';
GO
