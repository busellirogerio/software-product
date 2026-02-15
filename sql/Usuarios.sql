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