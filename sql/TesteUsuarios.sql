USE SoftwareProduct;
GO

-- 1. LISTAR USUÁRIOS
SELECT * FROM dbo.Usuarios WHERE Ativo = 1;
GO

-- 2. CRIAR USUÁRIO
INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email)
VALUES ('admin', '123456', 'Administrador Sistema', 'admin@softwareproduct.com');
GO

INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email)
VALUES ('buselli', 'senha123', 'Buselli Silva', 'buselli@impacta.edu.br');
GO

-- 3. EDITAR USUÁRIO
UPDATE dbo.Usuarios 
SET NomeCompleto = 'Buselli da Silva Santos', Email = 'buselli.santos@impacta.edu.br'
WHERE UsuarioId = 2;
GO

-- 4. EXCLUIR USUÁRIO (SOFT DELETE)
UPDATE dbo.Usuarios 
SET Ativo = 0
WHERE UsuarioId = 2;
GO

-- LISTAR NOVAMENTE
SELECT * FROM dbo.Usuarios;
GO