-- -----------------------------------------------
-- TesteUsuarios.sql
-- Tema: Testes CRUD na tabela dbo.Usuarios
-- Última rev: 02 | Data: 25/03/2026
-- Banco: SoftwareProduct
-- -----------------------------------------------


USE SoftwareProduct;
GO


-- #region 1 ZERAR TABELA | rev.02 | 25/03/2026

DELETE FROM dbo.Usuarios;
DBCC CHECKIDENT ('dbo.Usuarios', RESEED, 0);
GO

-- #endregion


-- #region 2 LER | rev.02 | 25/03/2026

-- --- verificar se zerou
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

-- #endregion


-- #region 3 CRIAR | rev.02 | 25/03/2026

-- --- Senha: 123456 (já com hash bcrypt)
INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
VALUES (
  'userteste',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.wMVh7aYJbW.VFi/6y6',
  'USER TESTE 01',
  'user01@teste.com',
  1
);
GO

-- --- deletar o registro de teste
DELETE FROM dbo.Usuarios WHERE UsuarioId = 6;

-- #endregion


-- #region 4 ALTERAR | rev.02 | 25/03/2026

UPDATE dbo.Usuarios
SET NomeCompleto = 'Administrador Atualizado'
WHERE Login = 'admin';
GO

-- #endregion


-- #region 5 SOFT DELETE | rev.02 | 25/03/2026

UPDATE dbo.Usuarios
SET Ativo = 0
WHERE Login = 'turtle';
GO

-- #endregion
