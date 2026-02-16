const usuarioRepository = require('../repositories/usuarioRepository');

class UsuarioController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await usuarioRepository.login(email, senha);

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }

  async listarTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.listarTodos();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }

  async criar(req, res) {
    try {
      const usuario = await usuarioRepository.criar(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      await usuarioRepository.atualizar(id, req.body);
      res.json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await usuarioRepository.deletar(id);
      res.json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }
}

module.exports = new UsuarioController();
