-- -----------------------------------------------
-- TesteClientes.sql
-- Tema: Testes CRUD na tabela dbo.Clientes
-- Última rev: 02 | Data: 25/03/2026
-- Banco: SoftwareProduct
-- -----------------------------------------------


USE SoftwareProduct;
GO


-- #region ZERAR E VERIFICAR | rev.02 | 25/03/2026

-- --- 1) zerar tabela e reiniciar contador
DELETE FROM dbo.Clientes;
DBCC CHECKIDENT ('dbo.Clientes', RESEED, 0);
GO

-- --- 2) verificar se zerou
SELECT * FROM dbo.Clientes;
GO

SELECT
    ClienteId,
    NomeCompleto,
    CpfCnpj,
    Telefone,
    Ativo
FROM
    dbo.Clientes;
GO

SELECT * FROM dbo.Clientes
WHERE ClienteId = 3;

-- #endregion


-- #region INSERIR CLIENTES | rev.02 | 25/03/2026

-- --- 3) inserir 6 clientes fictícios — todos ATIVOS (Ativo=1, Bloqueado=0)

INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
VALUES
    ('PF', '12345678901', 'JOAO DA SILVA', '1985-06-15', 'M',
     '11999990001', 1, 'JOAO@EMAIL.COM',
     '01310100', 'AVENIDA PAULISTA', '1000', 'APTO 42', 'BELA VISTA', 'SAO PAULO', 'SP');
GO

INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
VALUES
    ('PF', '98765432100', 'MARIA SANTOS', '1990-03-22', 'F',
     '11988880002', 1, 'MARIA@EMAIL.COM',
     '04538133', 'AVENIDA BRIGADEIRO FARIA LIMA', '2000', NULL, 'ITAIM BIBI', 'SAO PAULO', 'SP');
GO

INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
VALUES
    ('PF', '11122233344', 'CARLOS OLIVEIRA', '1978-11-30', 'M',
     '11977770003', 0, 'CARLOS@EMAIL.COM',
     '20040020', 'AVENIDA RIO BRANCO', '500', NULL, 'CENTRO', 'RIO DE JANEIRO', 'RJ');
GO

INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
VALUES
    ('PF', '55566677788', 'ANA LIMA', '1995-07-10', 'F',
     '11966660005', 1, 'ANA@EMAIL.COM',
     '30130010', 'AVENIDA AFONSO PENA', '300', NULL, 'CENTRO', 'BELO HORIZONTE', 'MG');
GO

INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
VALUES
    ('PJ', '12345678000195', 'EMPRESA MODELO LTDA', NULL, NULL,
     '1133330004', 0, 'CONTATO@EMPRESAMODELO.COM.BR',
     '04538133', 'AVENIDA BRIGADEIRO FARIA LIMA', '3900', 'SALA 1', 'ITAIM BIBI', 'SAO PAULO', 'SP');
GO

INSERT INTO dbo.Clientes
    (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
     Telefone, TelefoneWhatsApp, Email,
     Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
VALUES
    ('PJ', '98765432000188', 'TECH SOLUTIONS SA', NULL, NULL,
     '1122220006', 0, 'CONTATO@TECHSOLUTIONS.COM.BR',
     '01452000', 'AVENIDA PAULISTA', '750', 'ANDAR 5', 'PINHEIROS', 'SAO PAULO', 'SP');
GO

-- --- 4) verificar registros inseridos
SELECT * FROM dbo.Clientes;
GO

-- #endregion


-- #region TESTES CRUD | rev.02 | 25/03/2026

-- --- 5) atualizar: verifica se trigger DataAtualizacao dispara
UPDATE dbo.Clientes
SET Telefone = '11988880001'
WHERE CpfCnpj = '12345678901';
GO

-- --- 6) verificar se DataAtualizacao mudou
SELECT ClienteId, NomeCompleto, Telefone, DataCriacao, DataAtualizacao
FROM dbo.Clientes
WHERE CpfCnpj = '12345678901';
GO

-- --- 7) soft delete: Ativo = 0 (registro permanece no banco)
UPDATE dbo.Clientes
SET Ativo = 0
WHERE CpfCnpj = '12345678901';
GO

-- --- 8) verificar soft delete: Ativo = 0 mas registro existe
SELECT ClienteId, NomeCompleto, Ativo
FROM dbo.Clientes;
GO

-- #endregion


-- #region BUSCAS | rev.02 | 25/03/2026

-- --- 9) busca por nome (considera espaço)
SELECT ClienteId, NomeCompleto, CpfCnpj, Telefone
FROM dbo.Clientes
WHERE NomeCompleto LIKE '%JOAO%'
AND Ativo = 1;
GO

-- --- 10) busca por CPF/CNPJ
SELECT ClienteId, NomeCompleto, CpfCnpj, Tipo
FROM dbo.Clientes
WHERE CpfCnpj = '12345678000195'
AND Ativo = 1;
GO

-- --- 11) listar todos os clientes ativos (colunas da listagem AC1)
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

-- --- verificar FK
SELECT name FROM sys.foreign_keys WHERE name = 'FK_Veiculos_ClienteId';

-- #endregion


PRINT '✅ Testes dbo.Clientes concluídos com sucesso!';
GO
