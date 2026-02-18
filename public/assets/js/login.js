document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = sessionStorage.getItem('usuario');
  if (usuarioLogado) {
    window.location.href = 'http://127.0.0.1:3000/pages/dashboard.html';
    return;
  }

  const form = document.getElementById('formLogin');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const toggleSenha = document.getElementById('toggleSenha');
  const btnLogin = form.querySelector('button[type="submit"]');

  const eyeOpen = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const eyeClosed = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 4L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  inputSenha.type = 'password';
  toggleSenha.innerHTML = eyeClosed;

  toggleSenha.addEventListener('click', () => {
    const isPassword = inputSenha.type === 'password';
    inputSenha.type = isPassword ? 'text' : 'password';
    toggleSenha.innerHTML = isPassword ? eyeOpen : eyeClosed;
  });

  const showMessage = (message, type = 'error') => {
    const existingMessage = document.querySelector('.login-message');
    if (existingMessage) existingMessage.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `login-message ${type}`;
    messageEl.textContent = message;
    form.insertBefore(messageEl, btnLogin);
    setTimeout(() => messageEl.remove(), 5000);
  };

  const setLoadingState = (loading) => {
    btnLogin.disabled = loading;
    btnLogin.style.opacity = loading ? '0.6' : '1';
    btnLogin.textContent = loading ? 'Entrando...' : 'Entrar';
    inputEmail.disabled = loading;
    inputSenha.disabled = loading;
  };

  const saveUserSession = (usuario) => {
    const sessionData = {
      usuario: usuario,
      loginTime: Date.now(),
      lastActivity: Date.now(),
    };
    sessionStorage.setItem('usuario', JSON.stringify(sessionData));
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
      showMessage('Usuário e senha são obrigatórios', 'error');
      return;
    }

    setLoadingState(true);

    try {
      const usuario = await apiRequest('/usuarios/login', {
        method: 'POST',
        body: { email, senha },
      });

      showMessage('Login realizado com sucesso!', 'success');
      saveUserSession(usuario);
      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/dashboard.html';
      }, 1000);
    } catch (error) {
      if (
        error.message.includes('401') ||
        error.message.includes('inválidos')
      ) {
        showMessage('Usuário ou senha incorretos', 'error');
      } else if (error.message.includes('429')) {
        showMessage('Muitas tentativas. Aguarde alguns minutos.', 'error');
      } else if (
        error.message.includes('rede') ||
        error.message.includes('conexão')
      ) {
        showMessage('Erro de conexão. Verifique sua internet.', 'error');
      } else {
        showMessage('Erro interno. Tente novamente.', 'error');
      }
    } finally {
      setLoadingState(false);
    }
  });

  setTimeout(() => inputEmail.focus(), 300);
});
