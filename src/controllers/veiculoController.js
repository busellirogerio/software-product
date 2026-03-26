// -----------------------------------------------
// veiculoController.js
// Tema: Controller — validações e respostas HTTP para Veículos
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const veiculoRepository = require('../repositories/veiculoRepository');

// #endregion


// #region HELPERS | rev.01 | 25/03/2026

const placaAntigaRegex    = /^[A-Z]{3}[0-9]{4}$/;
const placaMercosulRegex  = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

// --- valida formato de placa (antigo ou Mercosul)
function validarPlaca(placa) {
  const placaLimpa = placa.replace(/[-\s]/g, '').toUpperCase();
  return (placaAntigaRegex.test(placaLimpa) || placaMercosulRegex.test(placaLimpa))
    ? placaLimpa
    : null;
}

// --- valida Km (número positivo)
function validarKm(km) {
  if (km === undefined || km === null || km === '') return true;
  const n = parseInt(km);
  return !isNaN(n) && n >= 0;
}

// #endregion


// #region CONTROLLER | rev.01 | 25/03/2026

class VeiculoController {

  // --- listar todos os veículos ativos com proprietário
  // query opcional: ?ordem=ASC/DESC
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


  // --- buscar por placa ou proprietário (CPF/CNPJ)
  // ?tipo=placa&valor=ABC1D23
  // ?tipo=proprietario&valor=98765432100
  async buscar(req, res) {
    try {
      const { tipo, valor } = req.query;

      if (!tipo || !valor) {
        return res.status(400).json({ erro: 'Parâmetros tipo e valor são obrigatórios' });
      }

      let resultado;

      if (tipo === 'placa') {
        resultado = await veiculoRepository.buscarPorPlaca(valor);
      } else if (tipo === 'proprietario') {
        resultado = await veiculoRepository.buscarPorProprietario(valor);
      } else {
        return res.status(400).json({ erro: 'Tipo de busca inválido. Use: placa ou proprietario' });
      }

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- buscar por ID
  async buscarPorId(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });

      res.json(veiculo);
    } catch (error) {
      console.error('Erro ao buscar veículo por ID:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- buscar cliente por CPF/CNPJ para confirmar proprietário
  // GET /api/veiculos/cliente?cpfCnpj=98765432100
  async buscarCliente(req, res) {
    try {
      const { cpfCnpj } = req.query;

      if (!cpfCnpj) return res.status(400).json({ erro: 'CPF/CNPJ é obrigatório' });

      const cpfCnpjLimpo = cpfCnpj.replace(/[\.\-\/\s]/g, '');

      if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
        return res.status(400).json({ erro: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' });
      }

      const cliente = await veiculoRepository.buscarClientePorCpfCnpj(cpfCnpjLimpo);
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado ou inativo' });

      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF/CNPJ:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- criar novo veículo
  async criar(req, res) {
    try {
      const { clienteId, marca, modelo, motorizacao, anoModelo, placa, km } = req.body;

      if (!clienteId) return res.status(400).json({ erro: 'Proprietário é obrigatório' });
      if (!marca || marca.trim() === '')  return res.status(400).json({ erro: 'Marca é obrigatória' });
      if (!modelo || modelo.trim() === '') return res.status(400).json({ erro: 'Modelo é obrigatório' });
      if (!placa || placa.trim() === '')  return res.status(400).json({ erro: 'Placa é obrigatória' });

      const placaLimpa = validarPlaca(placa);
      if (!placaLimpa) {
        return res.status(400).json({ erro: 'Placa inválida. Use formato ABC1234 ou ABC1D23' });
      }

      if (!validarKm(km)) {
        return res.status(400).json({ erro: 'Km deve ser um número positivo' });
      }

      const veiculo = await veiculoRepository.criar({
        clienteId:   parseInt(clienteId),
        marca:       marca.trim(),
        modelo:      modelo.trim(),
        motorizacao: motorizacao ? motorizacao.trim() : null,
        anoModelo:   anoModelo ? anoModelo.trim() : null,
        placa:       placaLimpa,
        km:          km ? parseInt(km) : null,
      });

      res.status(201).json(veiculo);
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- atualizar veículo
  async atualizar(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const { clienteId, marca, modelo, motorizacao, anoModelo, placa, km } = req.body;

      if (!marca || marca.trim() === '')  return res.status(400).json({ erro: 'Marca é obrigatória' });
      if (!modelo || modelo.trim() === '') return res.status(400).json({ erro: 'Modelo é obrigatório' });

      let placaLimpa = null;
      if (placa && placa.trim() !== '') {
        placaLimpa = validarPlaca(placa);
        if (!placaLimpa) {
          return res.status(400).json({ erro: 'Placa inválida. Use formato ABC1234 ou ABC1D23' });
        }
      }

      if (!validarKm(km)) {
        return res.status(400).json({ erro: 'Km deve ser um número positivo' });
      }

      const veiculoExistente = await veiculoRepository.buscarPorId(id);
      if (!veiculoExistente) return res.status(404).json({ erro: 'Veículo não encontrado' });

      const veiculo = await veiculoRepository.atualizar(id, {
        clienteId:   clienteId ? parseInt(clienteId) : null,
        marca:       marca.trim(),
        modelo:      modelo.trim(),
        motorizacao: motorizacao ? motorizacao.trim() : null,
        anoModelo:   anoModelo ? anoModelo.trim() : null,
        placa:       placaLimpa,
        km:          km ? parseInt(km) : null,
      });

      res.json(veiculo);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- inativar (soft delete) — Ativo = 0 + ClienteId = NULL
  async inativar(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });
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


  // --- reativar — Ativo = 1 + vincula novo ClienteId + atualiza Km
  async reativar(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const { clienteId, km } = req.body;

      if (!clienteId) {
        return res.status(400).json({ erro: 'Proprietário é obrigatório para reativar' });
      }

      const veiculo = await veiculoRepository.buscarPorId(id);
      if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });

      const veiculoReativado = await veiculoRepository.reativar(
        id,
        parseInt(clienteId),
        km ? parseInt(km) : null,
      );

      res.json(veiculoReativado);
    } catch (error) {
      console.error('Erro ao reativar veículo:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

}

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = new VeiculoController();

// #endregion
