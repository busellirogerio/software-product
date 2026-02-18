const usuarioRepository = require('../repositories/usuarioRepository');

class UsuarioController {
  // Autentica usuário e retorna dados básicos
  // Remove informações sensíveis da resposta
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validação de campos obrigatórios
      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      const usuario = await usuarioRepository.login(email.trim(), senha);

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      // Remove dados sensíveis da resposta
      const { Senha, ...usuarioSemSenha } = usuario;
      res.json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Reset de senha via email
  // Valida formato do email antes de processar
  async resetSenha(req, res) {
    try {
      const { email } = req.body;

      // Validação de campo obrigatório
      if (!email) {
        return res.status(400).json({ erro: 'Email é obrigatório' });
      }

      // Validação básica de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const resultado = await usuarioRepository.resetSenha(email.trim());

      if (!resultado) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({
        mensagem: 'Solicitação de reset realizada com sucesso',
        protocolo: resultado.protocolo,
      });
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Lista todos usuários ativos
  // Dados sensíveis já removidos no repository
  async listarTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.listarTodos();
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Cria novo usuário
  // Valida campos obrigatórios e formatos
  async criar(req, res) {
    try {
      const { login, senha, nomeCompleto, email } = req.body;

      // Validação de campos obrigatórios
      if (!login || !senha || !nomeCompleto || !email) {
        return res.status(400).json({
          erro: 'Login, senha, nome completo e email são obrigatórios',
        });
      }

      // Validação de tamanhos mínimos
      if (senha.length < 6) {
        return res
          .status(400)
          .json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      // Sanitiza dados de entrada
      const dadosLimpos = {
        login: login.trim(),
        senha,
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
      };

      const usuario = await usuarioRepository.criar(dadosLimpos);
      res.status(201).json(usuario);
    } catch (error) {
      // Trata erro de duplicação de login/email
      if (error.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'Login ou email já existem' });
      }
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // Atualiza dados do usuário
  // Valida campos e formatos antes de atualizar
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nomeCompleto, email, senha } = req.body;

      // Validação de ID
      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      // Validação de campos obrigatórios
      if (!nomeCompleto || !email || !senha) {
        return res.status(400).json({
          erro: 'Nome completo, email e senha são obrigatórios',
        });
      }

      // Validação de senha mínima
      if (senha.length < 6) {
        return res
          .status(400)
          .json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      // Sanitiza dados
      const dadosLimpos = {
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
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

  // Soft delete do usuário
  // Valida ID antes de processar
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Validação de ID
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

module.exports = new UsuarioController();
