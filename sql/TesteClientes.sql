-- =========================================
-- BANCO: SoftwareProduct
-- TESTE: dbo.Clientes
-- VERSÃO: 1.0 - AC1
-- DATA: 2026-02-18
-- AUTOR: Buselli Rogerio
-- =========================================

USE SoftwareProduct;
GO

-- =========================================
-- 1) ZERAR TABELA E REINICIAR CONTADOR
-- =========================================
DELETE FROM dbo.Clientes;
DBCC CHECKIDENT ('dbo.Clientes', RESEED, 0);
GO

-- =========================================
-- 2) VERIFICAR SE ZEROU
-- =========================================
SELECT * FROM dbo.Clientes;
GO

-- =========================================
-- 3) INSERIR CLIENTE PF
-- =========================================
INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado, Ativo)
VALUES
    ('PF', '12345678901', 'JOAO DA SILVA', '1985-06-15', 'M',
     '11999990001', 1, 'JOAO@EMAIL.COM',
     '01310100', 'AVENIDA PAULISTA', '1000', 'APTO 42', 'BELA VISTA', 'SAO PAULO', 'SP', 1);
GO

-- =========================================
-- 4) INSERIR CLIENTE PJ
-- =========================================
INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado, Ativo)
VALUES
    ('PJ', '12345678000195', 'EMPRESA MODELO LTDA', NULL, NULL,
     '1133330001', 0, 'CONTATO@EMPRESAMODELO.COM.BR',
     '04538133', 'AVENIDA BRIGADEIRO FARIA LIMA', '3900', 'SALA 1', 'ITAIM BIBI', 'SAO PAULO', 'SP', 1);
GO

-- =========================================
-- 5) VERIFICAR REGISTROS INSERIDOS
-- =========================================
SELECT * FROM dbo.Clientes;
GO

-- =========================================
-- 6) ATUALIZAR — verifica trigger DataAtualizacao
-- =========================================
UPDATE dbo.Clientes
SET Telefone = '11988880001'
WHERE CpfCnpj = '12345678901';
GO

-- =========================================
-- 7) VERIFICAR SE DataAtualizacao MUDOU
-- =========================================
SELECT ClienteId, NomeCompleto, Telefone, DataCriacao, DataAtualizacao
FROM dbo.Clientes
WHERE CpfCnpj = '12345678901';
GO

-- =========================================
-- 8) SOFT DELETE — Ativo = 0
--    Registro permanece no banco
-- =========================================
UPDATE dbo.Clientes
SET Ativo = 0
WHERE CpfCnpj = '12345678901';
GO

-- =========================================
-- 9) VERIFICAR SOFT DELETE
--    Ativo = 0 mas registro existe
-- =========================================
SELECT ClienteId, NomeCompleto, Ativo
FROM dbo.Clientes;
GO

-- =========================================
-- 10) BUSCA POR NOME (considera espaço)
-- =========================================
SELECT ClienteId, NomeCompleto, CpfCnpj, Telefone
FROM dbo.Clientes
WHERE NomeCompleto LIKE '%JOAO%'
  AND Ativo = 1;
GO

-- =========================================
-- 11) BUSCA POR CPF/CNPJ
-- =========================================
SELECT ClienteId, NomeCompleto, CpfCnpj, Tipo
FROM dbo.Clientes
WHERE CpfCnpj = '12345678000195'
  AND Ativo = 1;
GO

-- =========================================
-- 12) BUSCA POR TELEFONE
-- =========================================
SELECT ClienteId, NomeCompleto, Telefone, TelefoneWhatsApp
FROM dbo.Clientes
WHERE Telefone LIKE '%33330001%'
  AND Ativo = 1;
GO

-- =========================================
-- 13) LISTAR TODOS OS CLIENTES ATIVOS
--     Colunas da listagem conforme AC1
-- =========================================
SELECT
    ClienteId,
    NomeCompleto,
    CpfCnpj,
    Telefone,
    Genero,
    DataNascimento
FROM dbo.Clientes
WHERE Ativo = 1
ORDER BY NomeCompleto;
GO

PRINT '✅ Testes dbo.Clientes concluídos com sucesso!';
GO