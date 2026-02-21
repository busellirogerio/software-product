-- =========================================
-- BANCO: SoftwareProduct
-- TESTE: dbo.Veiculos
-- VERSÃO: 1.0 - AC2
-- DATA: 2026-02-20
-- AUTOR: Buselli Rogerio
-- =========================================
-- INSTRUÇÕES:
-- Execute cada bloco separado pelo GO individualmente no SSMS
-- Verifique o resultado esperado em cada passo
-- O bloco de ZERAR é opcional — use apenas para resetar ambiente de testes
-- =========================================

USE SoftwareProduct;
GO

-- =========================================
-- [OPCIONAL] ZERAR TABELA — use apenas para resetar testes
-- Remove todos os registros e reinicia o IDENTITY
-- =========================================
-- DELETE FROM dbo.Veiculos;
-- DBCC CHECKIDENT ('dbo.Veiculos', RESEED, 0);
-- GO

-- =========================================
-- PASSO 1 — VERIFICAR ESTADO INICIAL
-- Esperado: tabela vazia ou com registros anteriores
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.Placa,
    v.Km,
    v.Ativo,
    v.ClienteId,
    c.NomeCompleto AS Proprietario
FROM dbo.Veiculos v
LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId;
GO

-- =========================================
-- PASSO 2 — CRIAR VEÍCULO COM PROPRIETÁRIO
-- Requer ao menos 1 cliente ativo na tabela dbo.Clientes
-- Ajuste o ClienteId conforme o banco
-- Esperado: 1 registro inserido
-- =========================================
INSERT INTO dbo.Veiculos
    (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
VALUES
    (1, 'TOYOTA', 'COROLLA', '2.0', '2022/2023', 'ABC1D23', 45000, 1);
GO

-- =========================================
-- PASSO 3 — CRIAR SEGUNDO VEÍCULO
-- Placa formato antigo
-- Esperado: 2 registros na tabela
-- =========================================
INSERT INTO dbo.Veiculos
    (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
VALUES
    (1, 'HONDA', 'CIVIC', '1.5 TURBO', '2021/2021', 'XYZ-9876', 62000, 1);
GO

-- =========================================
-- PASSO 4 — VERIFICAR INSERÇÕES
-- Esperado: 2 veículos ativos com ClienteId = 1
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.Motorizacao,
    v.AnoModelo,
    v.Placa,
    v.Km,
    v.Ativo,
    c.NomeCompleto AS Proprietario,
    v.DataCriacao,
    v.DataAtualizacao
FROM dbo.Veiculos v
LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
WHERE v.Ativo = 1
ORDER BY v.Marca;
GO

-- =========================================
-- PASSO 5 — EDITAR VEÍCULO (troca de KM)
-- Simula atualização de quilometragem após serviço
-- Esperado: Km atualizado + DataAtualizacao alterada pelo trigger
-- =========================================
UPDATE dbo.Veiculos
SET Km = 46500
WHERE Placa = 'ABC1D23';
GO

-- =========================================
-- PASSO 6 — VERIFICAR TRIGGER DE AUDITORIA
-- Esperado: DataAtualizacao diferente de DataCriacao para a placa ABC1D23
-- =========================================
SELECT
    VeiculoId,
    Placa,
    Km,
    DataCriacao,
    DataAtualizacao
FROM dbo.Veiculos
WHERE Placa = 'ABC1D23';
GO

-- =========================================
-- PASSO 7 — BUSCAR VEÍCULO POR PLACA
-- Esperado: retorna 1 registro com dados completos
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.Placa,
    v.Km,
    c.NomeCompleto AS Proprietario,
    c.CpfCnpj
FROM dbo.Veiculos v
LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
WHERE v.Placa = 'XYZ-9876' AND v.Ativo = 1;
GO

-- =========================================
-- PASSO 8 — BUSCAR VEÍCULOS POR PROPRIETÁRIO (CPF/CNPJ)
-- Esperado: retorna todos os veículos ativos do cliente
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.Placa,
    v.Km,
    c.NomeCompleto AS Proprietario,
    c.CpfCnpj
FROM dbo.Veiculos v
INNER JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
WHERE c.CpfCnpj = '98765432100'   -- ajuste o CPF/CNPJ conforme o banco
  AND v.Ativo = 1;
GO

-- =========================================
-- PASSO 9 — INATIVAR VEÍCULO (soft delete)
-- Seta Ativo = 0 e ClienteId = NULL (desvincula proprietário)
-- Esperado: registro permanece na tabela com Ativo = 0 e ClienteId = NULL
-- =========================================
UPDATE dbo.Veiculos
SET
    Ativo     = 0,
    ClienteId = NULL
WHERE Placa = 'ABC1D23';
GO

-- =========================================
-- PASSO 10 — VERIFICAR INATIVAÇÃO
-- Esperado: Placa ABC1D23 com Ativo = 0 e ClienteId = NULL
--           Placa XYZ-9876 ainda aparece com Ativo = 1
-- =========================================
SELECT
    VeiculoId,
    Marca,
    Modelo,
    Placa,
    Km,
    Ativo,
    ClienteId
FROM dbo.Veiculos
ORDER BY Ativo DESC, Marca;
GO

-- =========================================
-- PASSO 11 — LISTAR SOMENTE ATIVOS (ordem crescente por marca)
-- Esperado: apenas veículos com Ativo = 1
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.AnoModelo,
    v.Placa,
    v.Km,
    c.NomeCompleto AS Proprietario
FROM dbo.Veiculos v
LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
WHERE v.Ativo = 1
ORDER BY v.Marca ASC;
GO

-- =========================================
-- PASSO 12 — LISTAR SOMENTE ATIVOS (ordem decrescente por marca)
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.AnoModelo,
    v.Placa,
    v.Km,
    c.NomeCompleto AS Proprietario
FROM dbo.Veiculos v
LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
WHERE v.Ativo = 1
ORDER BY v.Marca DESC;
GO

-- =========================================
-- PASSO 13 — REATIVAR VEÍCULO INATIVO
-- Simula vinculação de novo proprietário ao reativar
-- Esperado: Ativo = 1 com novo ClienteId vinculado
-- =========================================
UPDATE dbo.Veiculos
SET
    Ativo     = 1,
    ClienteId = 1   -- ajuste o ClienteId conforme o banco
WHERE Placa = 'ABC1D23';
GO

-- =========================================
-- PASSO 14 — VERIFICAR REATIVAÇÃO
-- Esperado: Placa ABC1D23 com Ativo = 1 e ClienteId preenchido
-- =========================================
SELECT
    v.VeiculoId,
    v.Marca,
    v.Modelo,
    v.Placa,
    v.Km,
    v.Ativo,
    c.NomeCompleto AS Proprietario
FROM dbo.Veiculos v
LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
ORDER BY v.VeiculoId;
GO

PRINT '✅ TesteVeiculos.sql — 14 passos executados com sucesso!';
GO

DELETE FROM dbo.Veiculos;
DBCC CHECKIDENT ('dbo.Veiculos', RESEED, 0);
GO