// =========================================
// src/repositories/veiculoRepository.js
// Camada de acesso ao banco — dbo.Veiculos
// Toda query SQL centralizada aqui
// VERSÃO: 1.0 - AC2
// =========================================

const { getPool, sql } = require('../config/database');

class VeiculoRepository {
  /* ===========================
    LISTAR TODOS
    Retorna apenas veículos ativos
    com JOIN em Clientes para trazer nome do proprietário
    Ordenação por Marca ASC por padrão
  =========================== */
  async listarTodos(ordem = 'ASC') {
    const pool = await getPool();

    // Valida ordem para evitar SQL injection
    const ordemValidada = ordem.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const result = await pool.request().query(`
      SELECT
        v.VeiculoId,
        v.ClienteId,
        v.Marca,
        v.Modelo,
        v.Motorizacao,
        v.AnoModelo,
        v.Placa,
        v.Km,
        v.Ativo,
        v.DataCriacao,
        v.DataAtualizacao,
        c.NomeCompleto  AS ProprietarioNome,
        c.CpfCnpj       AS ProprietarioCpfCnpj
      FROM dbo.Veiculos v
      LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
      WHERE v.Ativo = 1
      ORDER BY v.Marca ${ordemValidada}
    `);

    return result.recordset;
  }

  /* ===========================
    BUSCAR POR ID
    Retorna veículo ativo ou inativo
    Inclui dados do proprietário via JOIN
  =========================== */
  async buscarPorId(id) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Motorizacao,
          v.AnoModelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          v.DataAtualizacao,
          c.NomeCompleto  AS ProprietarioNome,
          c.CpfCnpj       AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);

    return result.recordset[0] || null;
  }

  /* ===========================
    BUSCAR POR PLACA
    Remove traço e espaços antes de buscar
    Busca em ativos E inativos
    (inativo pode ser reativado pelo frontend)
  =========================== */
  async buscarPorPlaca(placa) {
    const pool = await getPool();

    // Remove formatação — aceita ABC1234 ou ABC-1234
    const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();

    const result = await pool
      .request()
      .input('placa', sql.NVarChar, `%${placaLimpa}%`).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Motorizacao,
          v.AnoModelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          v.DataAtualizacao,
          c.NomeCompleto  AS ProprietarioNome,
          c.CpfCnpj       AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE REPLACE(v.Placa, '-', '') LIKE @placa
        ORDER BY v.Ativo DESC, v.Marca
      `);

    return result.recordset;
  }

  /* ===========================
    BUSCAR POR PROPRIETÁRIO (CPF/CNPJ)
    Remove formatação antes de buscar
    Retorna todos os veículos ativos do cliente
  =========================== */
  async buscarPorProprietario(cpfCnpj) {
    const pool = await getPool();

    // Remove pontos, traços, barras e espaços
    const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, cpfCnpjLimpo).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Motorizacao,
          v.AnoModelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          v.DataAtualizacao,
          c.NomeCompleto  AS ProprietarioNome,
          c.CpfCnpj       AS ProprietarioCpfCnpj
        FROM dbo.Veiculos v
        INNER JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE c.CpfCnpj = @cpfCnpj
          AND v.Ativo = 1
        ORDER BY v.Marca
      `);

    return result.recordset;
  }

  /* ===========================
    BUSCAR CLIENTE POR CPF/CNPJ
    Usado no formulário de cadastro
    para confirmar o proprietário antes de salvar
    Retorna apenas ClienteId + NomeCompleto
  =========================== */
  async buscarClientePorCpfCnpj(cpfCnpj) {
    const pool = await getPool();

    const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

    const result = await pool
      .request()
      .input('cpfCnpj', sql.NVarChar, cpfCnpjLimpo).query(`
        SELECT ClienteId, NomeCompleto, CpfCnpj
        FROM dbo.Clientes
        WHERE CpfCnpj = @cpfCnpj
          AND Ativo = 1
      `);

    return result.recordset[0] || null;
  }

  /* ===========================
    CRIAR VEÍCULO
    Placa e ClienteId obrigatórios
    Trigger cuidará do DataAtualizacao
    OUTPUT bloqueado por trigger — usa SELECT após INSERT
  =========================== */
  async criar(dados) {
    const pool = await getPool();

    // Placa em maiúsculo
    const placaFormatada = dados.placa ? dados.placa.toUpperCase() : null;

    // INSERT sem OUTPUT (trigger ativo no SQL Server bloqueia OUTPUT)
    await pool
      .request()
      .input('clienteId', sql.Int, dados.clienteId)
      .input('marca', sql.NVarChar, dados.marca.toUpperCase())
      .input('modelo', sql.NVarChar, dados.modelo.toUpperCase())
      .input(
        'motorizacao',
        sql.NVarChar,
        dados.motorizacao ? dados.motorizacao.toUpperCase() : null,
      )
      .input('anoModelo', sql.NVarChar, dados.anoModelo || null)
      .input('placa', sql.NVarChar, placaFormatada)
      .input('km', sql.Int, dados.km || null).query(`
        INSERT INTO dbo.Veiculos
          (ClienteId, Marca, Modelo, Motorizacao, AnoModelo, Placa, Km, Ativo)
        VALUES
          (@clienteId, @marca, @modelo, @motorizacao, @anoModelo, @placa, @km, 1)
      `);

    // SELECT separado para retornar o registro criado
    const result = await pool
      .request()
      .input('placa', sql.NVarChar, placaFormatada).query(`
        SELECT TOP 1
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataCriacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.Placa = @placa
        ORDER BY v.VeiculoId DESC
      `);

    return result.recordset[0];
  }

  /* ===========================
    ATUALIZAR VEÍCULO
    Atualiza dados + Km
    Trigger cuida do DataAtualizacao
  =========================== */
  async atualizar(id, dados) {
    const pool = await getPool();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('clienteId', sql.Int, dados.clienteId || null)
      .input('marca', sql.NVarChar, dados.marca.toUpperCase())
      .input('modelo', sql.NVarChar, dados.modelo.toUpperCase())
      .input(
        'motorizacao',
        sql.NVarChar,
        dados.motorizacao ? dados.motorizacao.toUpperCase() : null,
      )
      .input('anoModelo', sql.NVarChar, dados.anoModelo || null)
      .input(
        'placa',
        sql.NVarChar,
        dados.placa ? dados.placa.toUpperCase() : null,
      )
      .input('km', sql.Int, dados.km || null).query(`
        UPDATE dbo.Veiculos
        SET
          ClienteId   = @clienteId,
          Marca       = @marca,
          Modelo      = @modelo,
          Motorizacao = @motorizacao,
          AnoModelo   = @anoModelo,
          Placa       = @placa,
          Km          = @km
        WHERE VeiculoId = @id AND Ativo = 1
      `);

    // SELECT separado — trigger bloqueia OUTPUT
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);

    return result.recordset[0];
  }

  /* ===========================
    INATIVAR VEÍCULO (soft delete)
    Ativo = 0 + ClienteId = NULL
    Veículo sai da listagem mas permanece no banco
    Pode ser reativado futuramente
  =========================== */
  async inativar(id) {
    const pool = await getPool();

    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE dbo.Veiculos
        SET
          Ativo     = 0,
          ClienteId = NULL
        WHERE VeiculoId = @id
      `);

    return result.rowsAffected[0];
  }

  /* ===========================
    REATIVAR VEÍCULO
    Ativo = 1 + vincula novo ClienteId
    Chamado quando frontend detecta veículo inativo
    e usuário confirma reativação
  =========================== */
  async reativar(id, clienteId) {
    const pool = await getPool();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('clienteId', sql.Int, clienteId).query(`
        UPDATE dbo.Veiculos
        SET
          Ativo     = 1,
          ClienteId = @clienteId
        WHERE VeiculoId = @id
      `);

    // SELECT separado para retornar registro reativado
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT
          v.VeiculoId,
          v.ClienteId,
          v.Marca,
          v.Modelo,
          v.Placa,
          v.Km,
          v.Ativo,
          v.DataAtualizacao,
          c.NomeCompleto AS ProprietarioNome
        FROM dbo.Veiculos v
        LEFT JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        WHERE v.VeiculoId = @id
      `);

    return result.recordset[0];
  }
}

module.exports = new VeiculoRepository();
