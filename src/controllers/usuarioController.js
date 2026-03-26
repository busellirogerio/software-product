// -----------------------------------------------
// usuarioController.js
// Tema: Controller — validações e respostas HTTP para Usuários
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

// #region IMPORTS | rev.01 | 25/03/2026

const usuarioRepository = require('../repositories/usuarioRepository');

// #endregion


// #region CONTROLLER | rev.01 | 25/03/2026

class UsuarioController {

  // --- login: autentica e retorna dados sem senha
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      const usuario = await usuarioRepository.login(email.trim(), senha);

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      // --- remove senha da resposta
      const { Senha, ...usuarioSemSenha } = usuario;
      res.json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- reset de senha via email
  async resetSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ erro: 'Email é obrigatório' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const resultado = await usuarioRepository.resetSenha(email.trim());

      if (!resultado) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Solicitação de reset realizada com sucesso', protocolo: resultado.protocolo });
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- listar todos os usuários ativos (sem senha)
  async listarTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.listarTodos();
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- criar novo usuário
  async criar(req, res) {
    try {
      const { login, senha, nomeCompleto, email } = req.body;

      if (!login || !senha || !nomeCompleto || !email) {
        return res.status(400).json({ erro: 'Login, senha, nome completo e email são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const dadosLimpos = {
        login:        login.trim(),
        senha,
        nomeCompleto: nomeCompleto.trim(),
        email:        email.trim().toLowerCase(),
      };

      const usuario = await usuarioRepository.criar(dadosLimpos);
      res.status(201).json(usuario);
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'Login ou email já existem' });
      }
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- atualizar dados do usuário
  async atualizar(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const { nomeCompleto, email, senha } = req.body;

      if (!nomeCompleto || !email || !senha) {
        return res.status(400).json({ erro: 'Nome completo, email e senha são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const dadosLimpos = {
        nomeCompleto: nomeCompleto.trim(),
        email:        email.trim().toLowerCase(),
        senha,
      };

      const resultado = await usuarioRepository.atualizar(id, dadosLimpos);

      if (resultado === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }


  // --- soft delete
  async deletar(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const resultado = await usuarioRepository.deletar(id);

      if (resultado === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

}

// #endregion


// #region EXPORTS | rev.01 | 25/03/2026

module.exports = new UsuarioController();

// #endregion
