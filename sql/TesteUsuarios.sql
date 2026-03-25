USE SoftwareProduct;
GO


-- 1) ZERAR TABELA E CONTADOR (IDENTITY)
DELETE FROM dbo.Usuarios;
DBCC CHECKIDENT ('dbo.Usuarios', RESEED, 0);
GO


-- 2) LER (verificar se zerou)
SELECT * FROM dbo.Usuarios;
GO

SELECT 
	UsuarioId, 
	Login, 
	Senha, 
	Email, 
	Ativo 
FROM 
	dbo.Usuarios;
GO


-- 3) CRIAR (teste � mesmo que n�o use agora)
-- Senha: 123456 (j� com hash bcrypt)
INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
VALUES (
  'userteste',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.wMVh7aYJbW.VFi/6y6',
  'USER TESTE 01',
  'user01@teste.com',
  1
);
GO

-- DELETAR O TESTE
DELETE FROM dbo.Usuarios WHERE UsuarioId = 6;


-- 4) ALTERAR (teste � mesmo que n�o use agora)

UPDATE dbo.Usuarios
SET NomeCompleto = 'Administrador Atualizado'
WHERE Login = 'admin';
GO


-- 5) DELETAR (soft delete � mesmo que n�o use agora)
UPDATE dbo.Usuarios
SET Ativo = 0
WHERE Login = 'turtle';
GO

