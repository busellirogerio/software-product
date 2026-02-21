// =========================================
// src/controllers/veiculoController.js
// Camada intermediária — validações e respostas HTTP
// VERSÃO: 1.0 - AC2
// =========================================

const veiculoRepository = require('../repositories/veiculoRepository');

class VeiculoController {
  /* ===========================
    LISTAR TODOS
    Query opcional: ?ordem=ASC ou ?ordem=DESC
  =========================== */
  async listarTodos(req, res) {
    try {
      const ordem = req.query.ordem || 'ASC';
      const veiculos = await veiculoRepository.listarTodos(ordem);
      res.json(veiculos);
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR (unificada)
    Query: ?tipo=placa&valor=ABC1D23
    Query: ?tipo=proprietario&valor=98765432100
  =========================== */
  async buscar(req, res) {
    try {
      const { tipo, valor } = req.query;

      if (!tipo || !valor) {
        return res
          .status(400)
          .json({ erro: 'Parâmetros tipo e valor são obrigatórios' });
      }

      let resultado;

      if (tipo === 'placa') {
        resultado = await veiculoRepository.buscarPorPlaca(valor);
      } else if (tipo === 'proprietario') {
        resultado = await veiculoRepository.buscarPorProprietario(valor);
      } else {
        return res
          .status(400)
          .json({ erro: 'Tipo de busca inválido. Use: placa ou proprietario' });
      }

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR POR ID
  =========================== */
  async buscarPorId(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const veiculo = await veiculoRepository.buscarPorId(id);

      if (!veiculo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      res.json(veiculo);
    } catch (error) {
      console.error('Erro ao buscar veículo por ID:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR CLIENTE POR CPF/CNPJ
    Usado no formulário para confirmar proprietário
    antes de cadastrar o veículo
    GET /api/veiculos/cliente?cpfCnpj=98765432100
  =========================== */
  async buscarCliente(req, res) {
    try {
      const { cpfCnpj } = req.query;

      if (!cpfCnpj) {
        return res.status(400).json({ erro: 'CPF/CNPJ é obrigatório' });
      }

      // Remove formatação
      const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

      // Valida comprimento
      if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
        return res
          .status(400)
          .json({ erro: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' });
      }

      const cliente =
        await veiculoRepository.buscarClientePorCpfCnpj(cpfCnpjLimpo);

      if (!cliente) {
        return res
          .status(404)
          .json({ erro: 'Cliente não encontrado ou inativo' });
      }

      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF/CNPJ:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    CRIAR VEÍCULO
    Campos obrigatórios: clienteId, marca, modelo, placa
  =========================== */
  async criar(req, res) {
    try {
      const { clienteId, marca, modelo, motorizacao, anoModelo, placa, km } =
        req.body;

      // Validações obrigatórias
      if (!clienteId) {
        return res.status(400).json({ erro: 'Proprietário é obrigatório' });
      }
      if (!marca || marca.trim() === '') {
        return res.status(400).json({ erro: 'Marca é obrigatória' });
      }
      if (!modelo || modelo.trim() === '') {
        return res.status(400).json({ erro: 'Modelo é obrigatório' });
      }
      if (!placa || placa.trim() === '') {
        return res.status(400).json({ erro: 'Placa é obrigatória' });
      }

      // Valida formato de placa — antigo (ABC-1234) ou Mercosul (ABC1D23)
      const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();
      const placaAntigaRegex = /^[A-Z]{3}[0-9]{4}$/;
      const placaMercosulRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

      if (
        !placaAntigaRegex.test(placaLimpa) &&
        !placaMercosulRegex.test(placaLimpa)
      ) {
        return res
          .status(400)
          .json({ erro: 'Placa inválida. Use formato ABC1234 ou ABC1D23' });
      }

      // Valida Km — apenas números positivos
      if (km !== undefined && km !== null && km !== '') {
        const kmNumero = parseInt(km);
        if (isNaN(kmNumero) || kmNumero < 0) {
          return res
            .status(400)
            .json({ erro: 'Km deve ser um número positivo' });
        }
      }

      const veiculo = await veiculoRepository.criar({
        clienteId: parseInt(clienteId),
        marca: marca.trim(),
        modelo: modelo.trim(),
        motorizacao: motorizacao ? motorizacao.trim() : null,
        anoModelo: anoModelo ? anoModelo.trim() : null,
        placa: placaLimpa,
        km: km ? parseInt(km) : null,
      });

      res.status(201).json(veiculo);
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    ATUALIZAR VEÍCULO
    Permite atualizar todos os campos incluindo Km
  =========================== */
  async atualizar(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const { clienteId, marca, modelo, motorizacao, anoModelo, placa, km } =
        req.body;

      // Validações obrigatórias
      if (!marca || marca.trim() === '') {
        return res.status(400).json({ erro: 'Marca é obrigatória' });
      }
      if (!modelo || modelo.trim() === '') {
        return res.status(400).json({ erro: 'Modelo é obrigatório' });
      }

      // Valida placa se informada
      if (placa && placa.trim() !== '') {
        const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();
        const placaAntigaRegex = /^[A-Z]{3}[0-9]{4}$/;
        const placaMercosulRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

        if (
          !placaAntigaRegex.test(placaLimpa) &&
          !placaMercosulRegex.test(placaLimpa)
        ) {
          return res
            .status(400)
            .json({ erro: 'Placa inválida. Use formato ABC1234 ou ABC1D23' });
        }
      }

      // Valida Km
      if (km !== undefined && km !== null && km !== '') {
        const kmNumero = parseInt(km);
        if (isNaN(kmNumero) || kmNumero < 0) {
          return res
            .status(400)
            .json({ erro: 'Km deve ser um número positivo' });
        }
      }

      // Verifica se veículo existe
      const veiculoExistente = await veiculoRepository.buscarPorId(id);
      if (!veiculoExistente) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      const placaFormatada = placa
        ? placa.replace(/[-\s]/g, '').toUpperCase()
        : null;

      const veiculo = await veiculoRepository.atualizar(id, {
        clienteId: clienteId ? parseInt(clienteId) : null,
        marca: marca.trim(),
        modelo: modelo.trim(),
        motorizacao: motorizacao ? motorizacao.trim() : null,
        anoModelo: anoModelo ? anoModelo.trim() : null,
        placa: placaFormatada,
        km: km ? parseInt(km) : null,
      });

      res.json(veiculo);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    INATIVAR VEÍCULO (soft delete)
    Ativo = 0 + ClienteId = NULL
  =========================== */
  async inativar(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      // Verifica se veículo existe e está ativo
      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }
      if (veiculo.Ativo === false || veiculo.Ativo === 0) {
        return res.status(400).json({ erro: 'Veículo já está inativo' });
      }

      await veiculoRepository.inativar(id);

      res.json({ mensagem: 'Veículo inativado com sucesso' });
    } catch (error) {
      console.error('Erro ao inativar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    REATIVAR VEÍCULO
    Ativo = 1 + vincula novo ClienteId
  =========================== */
  async reativar(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const { clienteId } = req.body;

      if (!clienteId) {
        return res
          .status(400)
          .json({ erro: 'Proprietário é obrigatório para reativar' });
      }

      // Verifica se veículo existe
      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      const veiculoReativado = await veiculoRepository.reativar(
        id,
        parseInt(clienteId),
      );

      res.json(veiculoReativado);
    } catch (error) {
      console.error('Erro ao reativar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new VeiculoController();
