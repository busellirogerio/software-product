USE SoftwareProduct;
GO

--------------------------------------------------
-- 1) ZERAR TABELA E CONTADOR (IDENTITY)
--------------------------------------------------
DELETE FROM dbo.Usuarios;
DBCC CHECKIDENT ('dbo.Usuarios', RESEED, 0);
GO

--------------------------------------------------
-- 2) LER (verificar se zerou)
--------------------------------------------------
SELECT * FROM dbo.Usuarios;
GO

--------------------------------------------------
-- 3) CRIAR (teste – mesmo que não use agora)
--------------------------------------------------
INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
VALUES ('admin', 'Senha@123', 'Teste01', 'teste01@email.com', 1);
GO

--------------------------------------------------
-- 4) ALTERAR (teste – mesmo que não use agora)
--------------------------------------------------
UPDATE dbo.Usuarios
SET NomeCompleto = 'Administrador Atualizado'
WHERE Login = 'admin';
GO

--------------------------------------------------
-- 5) DELETAR (soft delete – mesmo que não use agora)
--------------------------------------------------
UPDATE dbo.Usuarios
SET Ativo = 0
WHERE Login = 'admin';
GO
