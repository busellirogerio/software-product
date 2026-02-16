const sql = require('mssql');
const config = require('../config/database');

class UsuarioRepository {
  async login(login, senha) {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('login', sql.NVarChar, login)
      .input('senha', sql.NVarChar, senha)
      .query(
        'SELECT * FROM dbo.Usuarios WHERE Login = @login AND Senha = @senha AND Ativo = 1',
      );
    return result.recordset[0];
  }

  async listarTodos() {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM dbo.Usuarios WHERE Ativo = 1');
    return result.recordset;
  }

  async criar(dados) {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('login', sql.NVarChar, dados.login)
      .input('senha', sql.NVarChar, dados.senha)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email).query(`
                INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email)
                OUTPUT INSERTED.*
                VALUES (@login, @senha, @nomeCompleto, @email)
            `);
    return result.recordset[0];
  }

  async atualizar(id, dados) {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email)
      .input('senha', sql.NVarChar, dados.senha).query(`
                UPDATE dbo.Usuarios
                SET NomeCompleto = @nomeCompleto,
                    Email = @email,
                    Senha = @senha
                WHERE UsuarioId = @id
            `);
    return result.rowsAffected[0];
  }

  async deletar(id) {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE dbo.Usuarios SET Ativo = 0 WHERE UsuarioId = @id');
    return result.rowsAffected[0];
  }
}

module.exports = new UsuarioRepository();
