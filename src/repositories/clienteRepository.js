// src/repositories/clienteRepository.js

const { getPool, sql } = require('../config/database');

class ClienteRepository {
  /* ===========================
    LISTAR TODOS
    Retorna apenas clientes ativos
    ordenados por nome
  =========================== */
  async listarTodos() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
          ClienteId,
          Tipo,
          CpfCnpj,
          NomeCompleto,
          DataNascimento,
          Genero,
          Telefone,
          TelefoneWhatsApp,
          Email,
          Cep,
          Logradouro,
          Numero,
          Complemento,
          Bairro,
          Cidade,
          Estado,
          DataCriacao
        FROM dbo.Clientes
        WHERE Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  /* ===========================
    BUSCAR POR ID
  =========================== */
  async buscarPorId(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT *
        FROM dbo.Clientes
        WHERE ClienteId = @id
          AND Ativo = 1
      `);
    return result.recordset[0] || null;
  }

  /* ===========================
    BUSCAR POR NOME
    Busca parcial — considera espaços
    Converte input para maiúsculo
  =========================== */
  async buscarPorNome(nome) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('nome', sql.NVarChar, '%' + nome.toUpperCase() + '%').query(`
        SELECT
          ClienteId,
          Tipo,
          CpfCnpj,
          NomeCompleto,
          Genero,
          Telefone,
          DataNascimento
        FROM dbo.Clientes
        WHERE NomeCompleto LIKE @nome
          AND Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  /* ===========================
    BUSCAR POR CPF/CNPJ
    Remove formatação antes de buscar
  =========================== */
  async buscarPorCpfCnpj(cpfCnpj) {
    const pool = await getPool();
    // Remove pontos, traços e barras
    const apenasNumeros = cpfCnpj.replace(/[.\-\/]/g, '');
    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, apenasNumeros).query(`
        SELECT
          ClienteId,
          Tipo,
          CpfCnpj,
          NomeCompleto,
          Genero,
          Telefone,
          DataNascimento
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj
          AND Ativo = 1
      `);
    return result.recordset;
  }

  /* ===========================
    BUSCAR POR TELEFONE
    Busca parcial
  =========================== */
  async buscarPorTelefone(telefone) {
    const pool = await getPool();
    // Remove formatação
    const apenasNumeros = telefone.replace(/[\s\-\(\)]/g, '');
    const result = await pool
      .request()
      .input('telefone', sql.NVarChar, '%' + apenasNumeros + '%').query(`
        SELECT
          ClienteId,
          Tipo,
          CpfCnpj,
          NomeCompleto,
          Genero,
          Telefone,
          DataNascimento
        FROM dbo.Clientes
        WHERE Telefone LIKE @telefone
          AND Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  /* ===========================
    CRIAR
    Converte campos de texto
    para maiúsculo antes de gravar
  =========================== */
  async criar(dados) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('tipo', sql.Char, dados.tipo)
      .input('cpfCnpj', sql.NVarChar, dados.cpfCnpj)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('dataNascimento', sql.Date, dados.dataNascimento || null)
      .input('genero', sql.Char, dados.genero || null)
      .input('telefone', sql.NVarChar, dados.telefone || null)
      .input('telefoneWhatsApp', sql.Bit, dados.telefoneWhatsApp ? 1 : 0)
      .input('email', sql.NVarChar, dados.email || null)
      .input('cep', sql.Char, dados.cep || null)
      .input('logradouro', sql.NVarChar, dados.logradouro || null)
      .input('numero', sql.NVarChar, dados.numero || null)
      .input('complemento', sql.NVarChar, dados.complemento || null)
      .input('bairro', sql.NVarChar, dados.bairro || null)
      .input('cidade', sql.NVarChar, dados.cidade || null)
      .input('estado', sql.Char, dados.estado || null).query(`
        INSERT INTO dbo.Clientes
          (Tipo, CpfCnpj, NomeCompleto, DataNascimento, Genero,
          Telefone, TelefoneWhatsApp, Email,
          Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado, Ativo)
        OUTPUT
          INSERTED.ClienteId,
          INSERTED.Tipo,
          INSERTED.CpfCnpj,
          INSERTED.NomeCompleto,
          INSERTED.DataNascimento,
          INSERTED.Genero,
          INSERTED.Telefone,
          INSERTED.TelefoneWhatsApp,
          INSERTED.Email,
          INSERTED.Cep,
          INSERTED.Logradouro,
          INSERTED.Numero,
          INSERTED.Complemento,
          INSERTED.Bairro,
          INSERTED.Cidade,
          INSERTED.Estado,
          INSERTED.Ativo,
          INSERTED.DataCriacao
        VALUES
          (@tipo, @cpfCnpj, @nomeCompleto, @dataNascimento, @genero,
          @telefone, @telefoneWhatsApp, @email,
          @cep, @logradouro, @numero, @complemento, @bairro, @cidade, @estado, 1)
      `);
    return result.recordset[0];
  }

  /* ===========================
    ATUALIZAR
  =========================== */
  async atualizar(id, dados) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('dataNascimento', sql.Date, dados.dataNascimento || null)
      .input('genero', sql.Char, dados.genero || null)
      .input('telefone', sql.NVarChar, dados.telefone || null)
      .input('telefoneWhatsApp', sql.Bit, dados.telefoneWhatsApp ? 1 : 0)
      .input('email', sql.NVarChar, dados.email || null)
      .input('cep', sql.Char, dados.cep || null)
      .input('logradouro', sql.NVarChar, dados.logradouro || null)
      .input('numero', sql.NVarChar, dados.numero || null)
      .input('complemento', sql.NVarChar, dados.complemento || null)
      .input('bairro', sql.NVarChar, dados.bairro || null)
      .input('cidade', sql.NVarChar, dados.cidade || null)
      .input('estado', sql.Char, dados.estado || null).query(`
        UPDATE dbo.Clientes
        SET
          NomeCompleto      = @nomeCompleto,
          DataNascimento    = @dataNascimento,
          Genero            = @genero,
          Telefone          = @telefone,
          TelefoneWhatsApp  = @telefoneWhatsApp,
          Email             = @email,
          Cep               = @cep,
          Logradouro        = @logradouro,
          Numero            = @numero,
          Complemento       = @complemento,
          Bairro            = @bairro,
          Cidade            = @cidade,
          Estado            = @estado
        WHERE ClienteId = @id
          AND Ativo = 1
      `);
    return result.rowsAffected[0];
  }

  /* ===========================
    DELETAR (soft delete)
    Ativo = 0 — registro permanece
  =========================== */
  async deletar(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Clientes
        SET Ativo = 0
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }
}

module.exports = new ClienteRepository();
