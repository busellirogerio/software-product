// -----------------------------------------------
// clienteController.js
// Tema: Controller — validações e respostas HTTP para Clientes
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const clienteRepository = require('../repositories/clienteRepository');

// #endregion


// #region HELPERS | rev.01 | 25/03/2026

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- sanitiza e normaliza dados do cliente vindos do body
function sanitizar(body) {
  const {
    nomeCompleto, dataNascimento, genero,
    telefone, telefoneWhatsApp, email,
    cep, logradouro, numero, complemento,
    bairro, cidade, estado,
  } = body;

  return {
    nomeCompleto:     nomeCompleto.trim().toUpperCase(),
    dataNascimento:   dataNascimento || null,
    genero:           genero ? genero.toUpperCase() : null,
    telefone:         telefone ? telefone.trim() : null,
    telefoneWhatsApp: telefoneWhatsApp ? true : false,
    email:            email ? email.trim().toUpperCase() : null,
    cep:              cep ? cep.replace(/\D/g, '') : null,
    logradouro:       logradouro ? logradouro.trim().toUpperCase() : null,
    numero:           numero ? numero.trim() : null,
    complemento:      complemento ? complemento.trim().toUpperCase() : null,
    bairro:           bairro ? bairro.trim().toUpperCase() : null,
    cidade:           cidade ? cidade.trim().toUpperCase() : null,
    estado:           estado ? estado.trim().toUpperCase() : null,
  };
}

// --- valida campos comuns a criar/atualizar/reativar
function validarDadosComuns(body, res) {
  const { nomeCompleto, genero, email } = body;

  if (!nomeCompleto) {
    res.status(400).json({ erro: 'Nome Completo é obrigatório' });
    return false;
  }
  if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
    res.status(400).json({ erro: 'Gênero deve ser M, F ou O' });
    return false;
  }
  if (email && !emailRegex.test(email)) {
    res.status(400).json({ erro: 'Formato de email inválido' });
    return false;
  }
  return true;
}

// #endregion


// #region CONTROLLER | rev.01 | 25/03/2026

class ClienteController {

  // --- listar todos (ATIVO + BLOQUEADO)
  async listarTodos(req, res) {
    try {
      const clientes = await clienteRepository.listarTodos();
      res.json(clientes);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- buscar por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const cliente = await clienteRepository.buscarPorId(id);
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- buscar por CPF/CNPJ
  // GET /api/clientes/buscar?tipo=cpfcnpj&valor=12345678901
  async buscar(req, res) {
    try {
      const { tipo, valor } = req.query;

      if (!tipo || !valor) {
        return res.status(400).json({ erro: 'Parâmetros tipo e valor são obrigatórios' });
      }
      if (valor.trim().length < 2) {
        return res.status(400).json({ erro: 'Digite ao menos 2 caracteres para buscar' });
      }
      if (tipo !== 'cpfcnpj') {
        return res.status(400).json({ erro: 'Tipo de busca inválido. Use: cpfcnpj' });
      }

      const resultado = await clienteRepository.buscarPorCpfCnpj(valor.trim());
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- criar novo cliente
  async criar(req, res) {
    try {
      const { tipo, cpfCnpj } = req.body;

      if (!tipo || !cpfCnpj || !req.body.nomeCompleto) {
        return res.status(400).json({ erro: 'Tipo, CPF/CNPJ e Nome Completo são obrigatórios' });
      }
      if (!['PF', 'PJ'].includes(tipo.toUpperCase())) {
        return res.status(400).json({ erro: 'Tipo deve ser PF ou PJ' });
      }

      const cpfCnpjLimpo = cpfCnpj.replace(/[.\-\/]/g, '').trim();
      if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
        return res.status(400).json({ erro: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' });
      }

      if (!validarDadosComuns(req.body, res)) return;

      const dadosLimpos = {
        tipo: tipo.toUpperCase(),
        cpfCnpj: cpfCnpjLimpo,
        ...sanitizar(req.body),
      };

      const cliente = await clienteRepository.criar(dadosLimpos);
      res.status(201).json(cliente);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'CPF/CNPJ já cadastrado' });
      }
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- atualizar dados do cliente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      if (!validarDadosComuns(req.body, res)) return;

      const resultado = await clienteRepository.atualizar(id, sanitizar(req.body));
      if (resultado === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });

      res.json({ mensagem: 'Cliente atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- inativar (soft delete) — Ativo = 0
  async inativar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const resultado = await clienteRepository.inativar(id);
      if (resultado === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });

      res.json({ mensagem: 'Cliente inativado com sucesso' });
    } catch (error) {
      console.error('Erro ao inativar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- bloquear — Bloqueado = 1
  async bloquear(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const resultado = await clienteRepository.bloquear(id);
      if (resultado === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });

      res.json({ mensagem: 'Cliente bloqueado com sucesso' });
    } catch (error) {
      console.error('Erro ao bloquear cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- desbloquear — Bloqueado = 0
  async desbloquear(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      const resultado = await clienteRepository.desbloquear(id);
      if (resultado === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });

      res.json({ mensagem: 'Cliente desbloqueado com sucesso' });
    } catch (error) {
      console.error('Erro ao desbloquear cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- reativar — Ativo = 1, Bloqueado = 0 + atualiza dados
  async reativar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

      if (!validarDadosComuns(req.body, res)) return;

      const cliente = await clienteRepository.reativar(id, sanitizar(req.body));
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

      res.json({ mensagem: 'Cliente reativado com sucesso', cliente });
    } catch (error) {
      console.error('Erro ao reativar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

}

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = new ClienteController();

// #endregion
