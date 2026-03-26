// -----------------------------------------------
// veiculoRepository.js
// Tema: Repositório — queries SQL para dbo.Veiculos
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const { getPool, sql } = require('../config/database');

// #endregion


// #region REPOSITORY | rev.01 | 25/03/2026

class VeiculoRepository {

  // --- listar todos os veículos ativos com proprietário
  // JOIN em Clientes para trazer nome e CPF/CNPJ do proprietário
  async listarTodos(ordem = 'ASC') {
    const pool = await getPool();

    // --- valida ordem para evitar SQL injection
    const ordemValidada = ordem.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const result = await pool.request().query(`
      SELECT
        v.VeiculoId, v.ClienteId,
        v.Marca, v.Modelo, v.Motorizacao, v.AnoModelo, v.Placa, v.Km,
        v.Ativo, v.DataCriacao, v.DataAtualizacao,
        c.NomeCompleto AS ProprietarioNome,
        c.CpfCnpj      AS ProprietarioCpfCnpj
      FROM dbo.Veiculos v
      LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
      WHERE v.Ativo = 1 AND v.ClienteId IS NOT NULL
      ORDER BY v.Marca ${ordemValidada}
    `);

    return result.recordset;
  }


  // --- buscar por ID — retorna ativo ou inativo, com dados do proprietário
  async buscarPorId(id) {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          v.VeiculoId, v.ClienteId,
          v.Marca, v.Modelo, v.Motorizacao, v.AnoModelo, v.Placa, v.Km,
          v.Ativo, v.DataCriacao, v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome,
          c.CpfCnpj      AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);
    return result.recordset[0] || null;
  }


  // --- buscar por placa — aceita formato ABC1234 ou ABC-1234
  // busca em ativos E inativos (inativo pode ser reativado)
  async buscarPorPlaca(placa) {
    const pool       = await getPool();
    const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();

    const result = await pool.request()
      .input('placa', sql.NVarChar, `%${placaLimpa}%`)
      .query(`
        SELECT
          v.VeiculoId, v.ClienteId,
          v.Marca, v.Modelo, v.Motorizacao, v.AnoModelo, v.Placa, v.Km,
          v.Ativo, v.DataCriacao, v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome,
          c.CpfCnpj      AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE REPLACE(v.Placa, '-', '') LIKE @placa
        ORDER BY v.Ativo DESC, v.Marca
      `);
    return result.recordset;
  }


  // --- buscar por proprietário (CPF/CNPJ) — retorna veículos ativos do cliente
  async buscarPorProprietario(cpfCnpj) {
    const pool          = await getPool();
    const cpfCnpjLimpo  = cpfCnpj.replace(/[\.\-\/\s]/g, '');

    const result = await pool.request()
      .input('cpfCnpj', sql.NVarChar, cpfCnpjLimpo)
      .query(`
        SELECT
          v.VeiculoId, v.ClienteId,
          v.Marca, v.Modelo, v.Motorizacao, v.AnoModelo, v.Placa, v.Km,
          v.Ativo, v.DataCriacao, v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome,
          c.CpfCnpj      AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        INNER JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE c.CpfCnpj = @cpfCnpj AND v.Ativo = 1
        ORDER BY v.Marca
      `);
    return result.recordset;
  }


  // --- buscar cliente por CPF/CNPJ para confirmar proprietário no formulário
  async buscarClientePorCpfCnpj(cpfCnpj) {
    const pool         = await getPool();
    const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

    const result = await pool.request()
      .input('cpfCnpj', sql.NVarChar, cpfCnpjLimpo)
      .query(`
        SELECT ClienteId, NomeCompleto, CpfCnpj
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj AND Ativo = 1
      `);
    return result.recordset[0] || null;
  }


  // --- criar veículo
  // INSERT sem OUTPUT (trigger ativo bloqueia OUTPUT no SQL Server)
  // SELECT separado retorna o registro criado
  async criar(dados) {
    const pool          = await getPool();
    const placaFormatada = dados.placa ? dados.placa.toUpperCase() : null;

    await pool.request()
      .input('clienteId',  sql.Int,      dados.clienteId)
      .input('marca',      sql.NVarChar, dados.marca.toUpperCase())
      .input('modelo',     sql.NVarChar, dados.modelo.toUpperCase())
      .input('motorizacao',sql.NVarChar, dados.motorizacao ? dados.motorizacao.toUpperCase() : null)
      .input('anoModelo',  sql.NVarChar, dados.anoModelo || null)
      .input('placa',      sql.NVarChar, placaFormatada)
      .input('km',         sql.Int,      dados.km || null)
      .query(`
        INSERT INTO dbo.Veiculos
          (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
        VALUES
          (@clienteId, @marca, @modelo, @motorizacao, @anoModelo, @placa, @km, 1)
      `);

    const result = await pool.request()
      .input('placa', sql.NVarChar, placaFormatada)
      .query(`
        SELECT TOP 1
          v.VeiculoId, v.ClienteId,
          v.Marca, v.Modelo, v.Placa, v.Km, v.Ativo, v.DataCriacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.Placa = @placa
        ORDER BY v.VeiculoId DESC
      `);
    return result.recordset[0];
  }


  // --- atualizar veículo
  // SELECT separado — trigger bloqueia OUTPUT
  async atualizar(id, dados) {
    const pool = await getPool();

    await pool.request()
      .input('id',         sql.Int,      id)
      .input('clienteId',  sql.Int,      dados.clienteId || null)
      .input('marca',      sql.NVarChar, dados.marca.toUpperCase())
      .input('modelo',     sql.NVarChar, dados.modelo.toUpperCase())
      .input('motorizacao',sql.NVarChar, dados.motorizacao ? dados.motorizacao.toUpperCase() : null)
      .input('anoModelo',  sql.NVarChar, dados.anoModelo || null)
      .input('placa',      sql.NVarChar, dados.placa ? dados.placa.toUpperCase() : null)
      .input('km',         sql.Int,      dados.km || null)
      .query(`
        UPDATE dbo.Veiculos SET
          ClienteId   = @clienteId,
          Marca       = @marca,
          Modelo      = @modelo,
          Motorizacao = @motorizacao,
          AnoModelo   = @anoModelo,
          Placa       = @placa,
          Km          = @km
        WHERE VeiculoId = @id AND Ativo = 1
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          v.VeiculoId, v.ClienteId,
          v.Marca, v.Modelo, v.Placa, v.Km, v.Ativo, v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);
    return result.recordset[0];
  }


  // --- inativar (soft delete) — Ativo = 0 + ClienteId = NULL
  // veículo sai da listagem mas permanece no banco para reativação futura
  async inativar(id) {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE dbo.Veiculos SET Ativo = 0, ClienteId = NULL
        WHERE VeiculoId = @id
      `);
    return result.rowsAffected[0];
  }


  // --- reativar — Ativo = 1 + vincula novo ClienteId + atualiza Km
  async reativar(id, clienteId, km) {
    const pool = await getPool();

    await pool.request()
      .input('id',       sql.Int, id)
      .input('clienteId',sql.Int, clienteId)
      .input('km',       sql.Int, km)
      .query(`
        UPDATE dbo.Veiculos SET Ativo = 1, ClienteId = @clienteId, Km = @km
        WHERE VeiculoId = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          v.VeiculoId, v.ClienteId,
          v.Marca, v.Modelo, v.Placa, v.Km, v.Ativo, v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);
    return result.recordset[0];
  }

}

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = new VeiculoRepository();

// #endregion
