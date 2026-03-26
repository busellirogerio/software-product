// -----------------------------------------------
// usuarioRepository.js
// Tema: Repositório — queries SQL para dbo.Usuarios
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const { getPool, sql } = require('../config/database');
const bcrypt = require('bcrypt');

// #endregion


// #region REPOSITORY | rev.01 | 25/03/2026

class UsuarioRepository {

  // --- login: busca por email/login e compara senha com hash
  async login(email, senha) {
    const pool   = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT *
        FROM dbo.Usuarios
        WHERE (Email = @email OR Login = @email) AND Ativo = 1
      `);

    const usuario = result.recordset[0];
    if (!usuario) return null;

    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    return senhaValida ? usuario : null;
  }


  // --- listar todos ativos (sem senha)
  async listarTodos() {
    const pool   = await getPool();
    const result = await pool.request().query(
      'SELECT UsuarioId, Login, NomeCompleto, Email, Ativo, DataCriacao FROM dbo.Usuarios WHERE Ativo = 1',
    );
    return result.recordset;
  }


  // --- criar novo usuário com senha hasheada
  async criar(dados) {
    const pool      = await getPool();
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool.request()
      .input('login',        sql.NVarChar, dados.login)
      .input('senha',        sql.NVarChar, senhaHash)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email',        sql.NVarChar, dados.email)
      .query(`
        INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
        OUTPUT INSERTED.UsuarioId, INSERTED.Login, INSERTED.NomeCompleto,
               INSERTED.Email, INSERTED.Ativo, INSERTED.DataCriacao
        VALUES (@login, @senha, @nomeCompleto, @email, 1)
      `);

    return result.recordset[0];
  }


  // --- atualizar dados com nova senha hasheada
  async atualizar(id, dados) {
    const pool      = await getPool();
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool.request()
      .input('id',           sql.Int,      id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email',        sql.NVarChar, dados.email)
      .input('senha',        sql.NVarChar, senhaHash)
      .query(`
        UPDATE dbo.Usuarios
        SET NomeCompleto = @nomeCompleto,
            Email        = @email,
            Senha        = @senha
        WHERE UsuarioId = @id
      `);

    return result.rowsAffected[0];
  }


  // --- soft delete — Ativo = 0
  async deletar(id) {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE dbo.Usuarios SET Ativo = 0 WHERE UsuarioId = @id');

    return result.rowsAffected[0];
  }


  // --- reset de senha: gera senha temporária e atualiza no banco
  async resetSenha(email) {
    const pool = await getPool();

    // --- verifica se usuário existe e está ativo
    const user = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UsuarioId FROM dbo.Usuarios WHERE Email = @email AND Ativo = 1');

    if (!user.recordset[0]) return null;

    // --- gera nova senha temporária e faz hash
    const novaSenha = Math.random().toString(36).slice(-8);
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('senha', sql.NVarChar, senhaHash)
      .query('UPDATE dbo.Usuarios SET Senha = @senha WHERE Email = @email');

    // --- gera protocolo de controle
    const ano       = new Date().getFullYear();
    const protocolo = `TI-${ano}-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log('RESET SENHA => Email:', email, '| NovaSenha:', novaSenha, '| Protocolo:', protocolo);

    return { protocolo };
  }

}

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = new UsuarioRepository();

// #endregion
