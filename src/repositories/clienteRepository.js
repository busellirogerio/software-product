// clienteRepository.js | última revisão data: 22/03/2026

// Regras de status:
//   Ativo=1, Bloqueado=0 → ATIVO    (aparece na lista, recebe comunicação)
//   Ativo=1, Bloqueado=1 → BLOQUEADO (aparece na lista, sem comunicação/eventos)
//   Ativo=0              → INATIVO  (não aparece em nada, só busca direta por CPF)

const { getPool, sql } = require('../config/database');

class ClienteRepository {

  // LISTAR TODOS — retorna ATIVO e BLOQUEADO (Ativo=1), ordenados por nome
  async listarTodos() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
          ClienteId, Tipo, CpfCnpj, NomeCompleto, DataNascimento,
          Genero, Telefone, TelefoneWhatsApp, Email,
          Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado,
          Ativo, Bloqueado, DataCriacao
        FROM dbo.Clientes
        WHERE Ativo = 1
        ORDER BY NomeCompleto
      `);
    return result.recordset;
  }

  // BUSCAR POR ID — retorna qualquer status
  async buscarPorId(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT *
        FROM dbo.Clientes
        WHERE ClienteId = @id
      `);
    return result.recordset[0] || null;
  }

  // BUSCAR POR CPF/CNPJ — retorna qualquer status (ATIVO, BLOQUEADO, INATIVO)
  async buscarPorCpfCnpj(cpfCnpj) {
    const pool = await getPool();
    const apenasNumeros = cpfCnpj.replace(/[.\-\/]/g, '');
    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, apenasNumeros).query(`
        SELECT ClienteId, Tipo, CpfCnpj, NomeCompleto, Genero, Telefone, DataNascimento, Ativo, Bloqueado
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj
      `);
    return result.recordset;
  }

  // CRIAR — se CPF/CNPJ já existe inativo (Ativo=0) reativa, senão INSERT normal
  async criar(dados) {
    const pool = await getPool();

    // Verifica se já existe inativo com esse CPF/CNPJ
    const existente = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, dados.cpfCnpj).query(`
        SELECT ClienteId
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj AND Ativo = 0
      `);

    if (existente.recordset[0]) {
      const id = existente.recordset[0].ClienteId;
      await pool
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
            Ativo            = 1,
            Bloqueado        = 0,
            NomeCompleto     = @nomeCompleto,
            DataNascimento   = @dataNascimento,
            Genero           = @genero,
            Telefone         = @telefone,
            TelefoneWhatsApp = @telefoneWhatsApp,
            Email            = @email,
            Cep              = @cep,
            Logradouro       = @logradouro,
            Numero           = @numero,
            Complemento      = @complemento,
            Bairro           = @bairro,
            Cidade           = @cidade,
            Estado           = @estado
          WHERE ClienteId = @id
        `);

      const reativado = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`SELECT * FROM dbo.Clientes WHERE ClienteId = @id`);
      return reativado.recordset[0];
    }

    // INSERT NORMAL — CPF/CNPJ novo
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
          Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
        OUTPUT
          INSERTED.ClienteId, INSERTED.Tipo, INSERTED.CpfCnpj,
          INSERTED.NomeCompleto, INSERTED.DataNascimento, INSERTED.Genero,
          INSERTED.Telefone, INSERTED.TelefoneWhatsApp, INSERTED.Email,
          INSERTED.Cep, INSERTED.Logradouro, INSERTED.Numero,
          INSERTED.Complemento, INSERTED.Bairro, INSERTED.Cidade,
          INSERTED.Estado, INSERTED.Ativo, INSERTED.Bloqueado, INSERTED.DataCriacao
        VALUES
          (@tipo, @cpfCnpj, @nomeCompleto, @dataNascimento, @genero,
          @telefone, @telefoneWhatsApp, @email,
          @cep, @logradouro, @numero, @complemento, @bairro, @cidade, @estado)
      `);
    return result.recordset[0];
  }

  // ATUALIZAR — não altera Ativo nem Bloqueado
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
          NomeCompleto     = @nomeCompleto,
          DataNascimento   = @dataNascimento,
          Genero           = @genero,
          Telefone         = @telefone,
          TelefoneWhatsApp = @telefoneWhatsApp,
          Email            = @email,
          Cep              = @cep,
          Logradouro       = @logradouro,
          Numero           = @numero,
          Complemento      = @complemento,
          Bairro           = @bairro,
          Cidade           = @cidade,
          Estado           = @estado
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }

  // INATIVAR (soft delete) — Ativo = 0
  async inativar(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Clientes
        SET Ativo = 0
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }

  // BLOQUEAR — Bloqueado = 1
  async bloquear(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Clientes
        SET Bloqueado = 1
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }

  // DESBLOQUEAR — Bloqueado = 0
  async desbloquear(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Clientes
        SET Bloqueado = 0
        WHERE ClienteId = @id
      `);
    return result.rowsAffected[0];
  }

  // REATIVAR — Ativo = 1, Bloqueado = 0 + atualiza dados
  async reativar(id, dados) {
    const pool = await getPool();

    await pool
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
          Ativo            = 1,
          Bloqueado        = 0,
          NomeCompleto     = @nomeCompleto,
          DataNascimento   = @dataNascimento,
          Genero           = @genero,
          Telefone         = @telefone,
          TelefoneWhatsApp = @telefoneWhatsApp,
          Email            = @email,
          Cep              = @cep,
          Logradouro       = @logradouro,
          Numero           = @numero,
          Complemento      = @complemento,
          Bairro           = @bairro,
          Cidade           = @cidade,
          Estado           = @estado
        WHERE ClienteId = @id
      `);

    const reativado = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM dbo.Clientes WHERE ClienteId = @id`);

    return reativado.recordset[0];
  }
}

module.exports = new ClienteRepository();
