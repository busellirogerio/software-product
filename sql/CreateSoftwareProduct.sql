-- =========================================
-- CRIAR BANCO: SoftwareProduct
-- VERSÃO: 1.0 - AC1
-- DATA: 2026-02-15
-- =========================================

-- Remove banco se existir
IF DB_ID('SoftwareProduct') IS NOT NULL
BEGIN
    ALTER DATABASE SoftwareProduct SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SoftwareProduct;
    PRINT '⚠️ Banco anterior removido!';
END
GO

-- Criar novo banco
CREATE DATABASE SoftwareProduct
GO

USE SoftwareProduct;
GO

PRINT '✅ Banco SoftwareProduct criado com sucesso!';
PRINT '✅ Pronto para criar tabelas!';
GO