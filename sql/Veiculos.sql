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