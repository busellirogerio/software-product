-- -----------------------------------------------
-- TesteVeiculos.sql
-- Tema: Testes CRUD na tabela dbo.Veiculos
-- Última rev: 02 | Data: 25/03/2026
-- Banco: SoftwareProduct
-- Instruções:
--   Execute cada bloco separado pelo GO individualmente no SSMS
--   Verifique o resultado esperado em cada passo
--   O bloco ZERAR é opcional — use apenas para resetar o ambiente de testes
-- -----------------------------------------------


USE SoftwareProduct;
GO


-- #region ZERAR TABELA (opcional) | rev.02 | 25/03/2026

-- --- remove todos os registros e reinicia o IDENTITY
-- DELETE FROM dbo.Veiculos;
-- DBCC CHECKIDENT ('dbo.Veiculos', RESEED, 0);
-- GO

-- #endregion


-- #region VERIFICAR ESTADO INICIAL | rev.02 | 25/03/2026

-- --- passo 1: esperado: tabela vazia ou com registros anteriores
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

-- #endregion


-- #region CRIAR VEÍCULOS | rev.02 | 25/03/2026

-- --- passo 2: criar veículo com proprietário
-- Requer ao menos 1 cliente ativo em dbo.Clientes — ajuste o ClienteId conforme o banco
-- Esperado: 1 registro inserido
INSERT INTO dbo.Veiculos
    (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
VALUES
    (1, 'TOYOTA', 'COROLLA', '2.0', '2022/2023', 'ABC1D23', 45000, 1);
GO

-- --- passo 3: criar segundo veículo (placa formato antigo)
-- Esperado: 2 registros na tabela
INSERT INTO dbo.Veiculos
    (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
VALUES
    (1, 'HONDA', 'CIVIC', '1.5 TURBO', '2021/2021', 'XYZ-9876', 62000, 1);
GO

-- --- passo 4: verificar inserções
-- Esperado: 2 veículos ativos com ClienteId = 1
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

-- #endregion


-- #region EDITAR E TRIGGER | rev.02 | 25/03/2026

-- --- passo 5: editar quilometragem após serviço
-- Esperado: Km atualizado + DataAtualizacao alterada pelo trigger
UPDATE dbo.Veiculos
SET Km = 46500
WHERE Placa = 'ABC1D23';
GO

-- --- passo 6: verificar trigger de auditoria
-- Esperado: DataAtualizacao diferente de DataCriacao para a placa ABC1D23
SELECT
    VeiculoId,
    Placa,
    Km,
    DataCriacao,
    DataAtualizacao
FROM dbo.Veiculos
WHERE Placa = 'ABC1D23';
GO

-- #endregion


-- #region BUSCAS | rev.02 | 25/03/2026

-- --- passo 7: buscar veículo por placa
-- Esperado: retorna 1 registro com dados completos
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

-- --- passo 8: buscar veículos por proprietário (CPF/CNPJ)
-- Esperado: retorna todos os veículos ativos do cliente
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
WHERE c.CpfCnpj = '12345678901'   -- JOAO DA SILVA — ClienteId = 1
AND v.Ativo = 1;
GO

-- #endregion


-- #region INATIVAR E REATIVAR | rev.02 | 25/03/2026

-- --- passo 9: inativar veículo (soft delete)
-- Seta Ativo = 0 e ClienteId = NULL (desvincula proprietário)
-- Esperado: registro permanece na tabela com Ativo = 0 e ClienteId = NULL
UPDATE dbo.Veiculos
SET
    Ativo     = 0,
    ClienteId = NULL
WHERE Placa = 'ABC1D23';
GO

-- --- passo 10: verificar inativação
-- Esperado: ABC1D23 com Ativo = 0 e ClienteId = NULL | XYZ-9876 com Ativo = 1
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

-- --- passo 11: listar somente ativos (ordem crescente por marca)
-- Esperado: apenas veículos com Ativo = 1
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

-- --- passo 12: reativar veículo inativo e vincular novo proprietário
-- Esperado: Ativo = 1 com novo ClienteId vinculado
UPDATE dbo.Veiculos
SET
    Ativo     = 1,
    ClienteId = 1   -- ajuste o ClienteId conforme o banco
WHERE Placa = 'ABC1D23';
GO

-- --- passo 13: verificar reativação
-- Esperado: ABC1D23 com Ativo = 1 e ClienteId preenchido
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

-- #endregion


PRINT '✅ TesteVeiculos.sql — 13 passos executados com sucesso!';
