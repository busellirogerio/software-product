document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');
  const toggleSenha = document.getElementById('toggleSenha');
  const inputSenha = document.getElementById('senha');

  // Visualizar senha
  if (toggleSenha) {
    toggleSenha.addEventListener('click', () => {
      const tipo = inputSenha.type === 'password' ? 'text' : 'password';
      inputSenha.type = tipo;
      toggleSenha.textContent = tipo === 'password' ? '👁️' : '🙈';
    });
  }

  // Submit do formulário
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        throw new Error('Usuário ou senha inválidos');
      }

      const usuario = await response.json();
      sessionStorage.setItem('usuario', JSON.stringify(usuario));
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(error.message);
    }
  });
});
