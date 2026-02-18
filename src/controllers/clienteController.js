// src/controllers/clienteController.js

const clienteRepository = require('../repositories/clienteRepository');

class ClienteController {
  /* ===========================
    LISTAR TODOS
  =========================== */
  async listarTodos(req, res) {
    try {
      const clientes = await clienteRepository.listarTodos();
      res.json(clientes);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR POR ID
  =========================== */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }
      const cliente = await clienteRepository.buscarPorId(id);
      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }
      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    BUSCAR
    Rota: GET /api/clientes/buscar?tipo=nome&valor=joao
    tipos aceitos: nome | cpfcnpj | telefone
  =========================== */
  async buscar(req, res) {
    try {
      const { tipo, valor } = req.query;

      if (!tipo || !valor) {
        return res
          .status(400)
          .json({ erro: 'Parâmetros tipo e valor são obrigatórios' });
      }

      if (valor.trim().length < 2) {
        return res
          .status(400)
          .json({ erro: 'Digite ao menos 2 caracteres para buscar' });
      }

      let resultado = [];

      if (tipo === 'nome') {
        resultado = await clienteRepository.buscarPorNome(valor.trim());
      } else if (tipo === 'cpfcnpj') {
        resultado = await clienteRepository.buscarPorCpfCnpj(valor.trim());
      } else if (tipo === 'telefone') {
        resultado = await clienteRepository.buscarPorTelefone(valor.trim());
      } else {
        return res
          .status(400)
          .json({
            erro: 'Tipo de busca inválido. Use: nome, cpfcnpj ou telefone',
          });
      }

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    CRIAR
    Converte campos de texto
    para maiúsculo antes de enviar
    ao repository
  =========================== */
  async criar(req, res) {
    try {
      const {
        tipo,
        cpfCnpj,
        nomeCompleto,
        dataNascimento,
        genero,
        telefone,
        telefoneWhatsApp,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      } = req.body;

      // Validações obrigatórias
      if (!tipo || !cpfCnpj || !nomeCompleto) {
        return res
          .status(400)
          .json({ erro: 'Tipo, CPF/CNPJ e Nome Completo são obrigatórios' });
      }

      // Valida tipo PF/PJ
      if (!['PF', 'PJ'].includes(tipo.toUpperCase())) {
        return res.status(400).json({ erro: 'Tipo deve ser PF ou PJ' });
      }

      // Remove formatação do CPF/CNPJ
      const cpfCnpjLimpo = cpfCnpj.replace(/[.\-\/]/g, '').trim();

      // Valida tamanho CPF (11) ou CNPJ (14)
      if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
        return res
          .status(400)
          .json({ erro: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' });
      }

      // Valida gênero se informado
      if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
        return res.status(400).json({ erro: 'Gênero deve ser M, F ou O' });
      }

      // Valida email se informado
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ erro: 'Formato de email inválido' });
        }
      }

      // Monta objeto com campos em maiúsculo
      const dadosLimpos = {
        tipo: tipo.toUpperCase(),
        cpfCnpj: cpfCnpjLimpo,
        nomeCompleto: nomeCompleto.trim().toUpperCase(),
        dataNascimento: dataNascimento || null,
        genero: genero ? genero.toUpperCase() : null,
        telefone: telefone ? telefone.trim() : null,
        telefoneWhatsApp: telefoneWhatsApp ? true : false,
        email: email ? email.trim().toUpperCase() : null,
        cep: cep ? cep.replace(/\D/g, '') : null,
        logradouro: logradouro ? logradouro.trim().toUpperCase() : null,
        numero: numero ? numero.trim() : null,
        complemento: complemento ? complemento.trim().toUpperCase() : null,
        bairro: bairro ? bairro.trim().toUpperCase() : null,
        cidade: cidade ? cidade.trim().toUpperCase() : null,
        estado: estado ? estado.trim().toUpperCase() : null,
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

  /* ===========================
    ATUALIZAR
  =========================== */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const {
        nomeCompleto,
        dataNascimento,
        genero,
        telefone,
        telefoneWhatsApp,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      } = req.body;

      // Nome é obrigatório na atualização
      if (!nomeCompleto) {
        return res.status(400).json({ erro: 'Nome Completo é obrigatório' });
      }

      // Valida gênero se informado
      if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
        return res.status(400).json({ erro: 'Gênero deve ser M, F ou O' });
      }

      // Valida email se informado
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ erro: 'Formato de email inválido' });
        }
      }

      const dadosLimpos = {
        nomeCompleto: nomeCompleto.trim().toUpperCase(),
        dataNascimento: dataNascimento || null,
        genero: genero ? genero.toUpperCase() : null,
        telefone: telefone ? telefone.trim() : null,
        telefoneWhatsApp: telefoneWhatsApp ? true : false,
        email: email ? email.trim().toUpperCase() : null,
        cep: cep ? cep.replace(/\D/g, '') : null,
        logradouro: logradouro ? logradouro.trim().toUpperCase() : null,
        numero: numero ? numero.trim() : null,
        complemento: complemento ? complemento.trim().toUpperCase() : null,
        bairro: bairro ? bairro.trim().toUpperCase() : null,
        cidade: cidade ? cidade.trim().toUpperCase() : null,
        estado: estado ? estado.trim().toUpperCase() : null,
      };

      const resultado = await clienteRepository.atualizar(id, dadosLimpos);
      if (resultado === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      res.json({ mensagem: 'Cliente atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
    DELETAR (soft delete)
  =========================== */
  async deletar(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const resultado = await clienteRepository.deletar(id);
      if (resultado === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      res.json({ mensagem: 'Cliente excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new ClienteController();
