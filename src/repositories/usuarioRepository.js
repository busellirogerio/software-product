const { getPool, sql } = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioRepository {
  // Autentica usuário por email e senha
  // Busca por email e compara senha com hash do banco
  async login(email, senha) {
    const pool = await getPool();
    const result = await pool.request().input('email', sql.NVarChar, email)
      .query(`
        SELECT * 
        FROM dbo.Usuarios
        WHERE (Email = @email OR Login = @email) AND Ativo = 1
      `);

    const usuario = result.recordset[0];
    if (!usuario) return null;

    // Compara senha digitada com hash armazenado
    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    return senhaValida ? usuario : null;
  }

  // Lista todos usuários ativos
  // Não retorna senhas por segurança
  async listarTodos() {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        'SELECT UsuarioId, Login, NomeCompleto, Email, Ativo, DataCriacao FROM dbo.Usuarios WHERE Ativo = 1',
      );
    return result.recordset;
  }

  // Cria novo usuário
  // Faz hash da senha antes de salvar no banco
  async criar(dados) {
    const pool = await getPool();
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool
      .request()
      .input('login', sql.NVarChar, dados.login)
      .input('senha', sql.NVarChar, senhaHash)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email).query(`
        INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
        OUTPUT INSERTED.UsuarioId, INSERTED.Login, INSERTED.NomeCompleto, INSERTED.Email, INSERTED.Ativo, INSERTED.DataCriacao
        VALUES (@login, @senha, @nomeCompleto, @email, 1)
      `);

    return result.recordset[0];
  }

  // Atualiza dados do usuário
  // Nova senha é criptografada antes da atualização
  async atualizar(id, dados) {
    const pool = await getPool();
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email)
      .input('senha', sql.NVarChar, senhaHash).query(`
        UPDATE dbo.Usuarios
        SET NomeCompleto = @nomeCompleto,
            Email = @email,
            Senha = @senha
        WHERE UsuarioId = @id
      `);

    return result.rowsAffected[0];
  }

  // Soft delete - marca usuário como inativo
  // Não remove fisicamente do banco
  async deletar(id) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE dbo.Usuarios SET Ativo = 0 WHERE UsuarioId = @id');

    return result.rowsAffected[0];
  }

  // Reset de senha por email
  // Gera nova senha aleatória e atualiza no banco
  async resetSenha(email) {
    const pool = await getPool();

    // Valida se usuário existe e está ativo
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(
        'SELECT UsuarioId FROM dbo.Usuarios WHERE Email = @email AND Ativo = 1',
      );

    if (!user.recordset[0]) return null;

    // Gera nova senha temporária
    const novaSenha = Math.random().toString(36).slice(-8);
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza senha no banco
    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('senha', sql.NVarChar, senhaHash)
      .query('UPDATE dbo.Usuarios SET Senha = @senha WHERE Email = @email');

    // Gera protocolo para controle
    const ano = new Date().getFullYear();
    const protocolo = `TI-${ano}-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(
      'RESET SENHA => Email:',
      email,
      '| NovaSenha:',
      novaSenha,
      '| Protocolo:',
      protocolo,
    );

    return { protocolo };
  }
}

module.exports = new UsuarioRepository();
