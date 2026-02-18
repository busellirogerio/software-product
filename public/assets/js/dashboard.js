document.addEventListener('DOMContentLoaded', async () => {
  // Carrega nome do usuário
  const sessionData = sessionStorage.getItem('usuario');
  if (sessionData) {
    const { usuario } = JSON.parse(sessionData);
    document.getElementById('nomeUsuario').textContent =
      usuario.NomeCompleto || usuario.Login || 'Usuário';
  }

  // Carrega estatísticas
  try {
    const usuarios = await apiRequest('/usuarios');
    document.getElementById('totalUsuarios').textContent = usuarios.length;
  } catch (error) {
    document.getElementById('totalUsuarios').textContent = '0';
    console.error('Erro ao carregar usuários:', error);
  }
});
