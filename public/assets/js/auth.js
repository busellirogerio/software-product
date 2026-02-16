function verificarAutenticacao() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));

  if (!usuario) {
    window.location.href = '../pages/login.html';
    return;
  }

  // Exibir nome do usuário no header
  const nomeUsuario = document.getElementById('nomeUsuario');
  if (nomeUsuario) {
    nomeUsuario.textContent = usuario.NomeCompleto;
  }
}

function logout() {
  sessionStorage.clear();
  window.location.href = '../pages/login.html';
}

// Verificar se está na página dashboard
if (window.location.pathname.includes('dashboard.html')) {
  verificarAutenticacao();
}

// Adicionar evento ao botão sair
document.addEventListener('DOMContentLoaded', () => {
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', logout);
  }
});
