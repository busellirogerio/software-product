-- -----------------------------------------------
-- CreateSoftwareProduct.sql
-- Tema: Criar banco de dados SoftwareProduct
-- Última rev: 02 | Data: 25/03/2026
-- -----------------------------------------------


-- #region REMOVER BANCO EXISTENTE | rev.02 | 25/03/2026

IF DB_ID('SoftwareProduct') IS NOT NULL
BEGIN
    ALTER DATABASE SoftwareProduct SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SoftwareProduct;
    PRINT '⚠️ Banco anterior removido!';
END
GO

-- #endregion


-- #region CRIAR BANCO | rev.02 | 25/03/2026

CREATE DATABASE SoftwareProduct
GO

USE SoftwareProduct;
GO

PRINT '✅ Banco SoftwareProduct criado com sucesso!';
PRINT '✅ Pronto para criar tabelas!';
GO

-- #endregion
