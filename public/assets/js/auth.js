// -----------------------------------------------
// auth.js
// Tema: Proteção de rotas e gerenciamento de sessão
// Última rev: 01 | Data: 25/03/2026
// -----------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // #region CONFIG | rev.01 | 25/03/2026

  const AUTH_CONFIG = {
    sessionKey:    'usuario',
    maxSessionTime: 24 * 60 * 60 * 1000, // 24 horas
    checkInterval:   5 * 60 * 1000,       // verifica sessão a cada 5 minutos
  };

  // #endregion


  // #region SESSÃO | rev.01 | 25/03/2026

  // --- obter usuário logado
  const getUsuarioLogado = () => {
    try {
      const usuarioJson = sessionStorage.getItem(AUTH_CONFIG.sessionKey);
      if (!usuarioJson) return null;

      const sessionData = JSON.parse(usuarioJson);

      // --- valida estrutura básica
      if (!sessionData.usuario || !sessionData.loginTime) {
        console.warn('⚠️ Sessão inválida detectada');
        clearSession();
        return null;
      }

      // --- verifica expiração
      const sessionAge = Date.now() - sessionData.loginTime;
      if (sessionAge > AUTH_CONFIG.maxSessionTime) {
        console.warn('⚠️ Sessão expirada');
        clearSession();
        showMessage('Sessão expirada. Faça login novamente.');
        return null;
      }

      return sessionData.usuario;
    } catch (error) {
      console.error('❌ Erro ao recuperar sessão:', error);
      clearSession();
      return null;
    }
  };


  // --- limpar sessão
  const clearSession = () => {
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
    localStorage.removeItem('usuarioLogado'); // remove legacy storage
  };

  // #endregion


  // #region UI | rev.01 | 25/03/2026

  // --- exibir mensagem flutuante
  const showMessage = (message, type = 'error') => {
    const existingAlert = document.querySelector('.auth-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = `auth-alert alert-${type}`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
      color: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 300px;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
  };

  // #endregion


  // #region AUTENTICAÇÃO | rev.01 | 25/03/2026

  // --- redirecionar para login
  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login.html')) {
      console.log('🔒 Redirecionando para login');
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };


  // --- verificar autenticação e atualizar nome no header
  const verificarAutenticacao = () => {
    const usuario = getUsuarioLogado();

    if (!usuario) {
      redirectToLogin();
      return false;
    }

    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) {
      nomeEl.textContent = usuario.NomeCompleto || usuario.Login || 'Usuário';
      nomeEl.title = `Logado como: ${usuario.Email || usuario.Login}`;
    }

    console.log('✅ Usuário autenticado:', usuario.Login);
    return true;
  };


  // --- logout
  const logout = () => {
    try {
      const usuario = getUsuarioLogado();
      if (usuario) console.log('👋 Logout realizado:', usuario.Login);

      clearSession();
      showMessage('Logout realizado com sucesso.', 'success');

      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/login.html';
      }, 1500);
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      clearSession();
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  // #endregion


  // #region INICIALIZAÇÃO | rev.01 | 25/03/2026

  const currentPath = window.location.pathname;
  const isProtectedPage =
    currentPath.includes('dashboard.html') ||
    currentPath.includes('admin.html') ||
    currentPath.includes('usuarios.html');

  // --- executa verificação em páginas protegidas
  if (isProtectedPage) {
    const isAuthenticated = verificarAutenticacao();

    if (isAuthenticated) {
      // --- verificação periódica da sessão
      setInterval(() => {
        const usuario = getUsuarioLogado();
        if (!usuario) {
          showMessage('Sessão perdida. Redirecionando...');
          setTimeout(redirectToLogin, 2000);
        }
      }, AUTH_CONFIG.checkInterval);
    }
  }


  // --- botão sair
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Deseja realmente sair do sistema?')) logout();
    });
  }


  // --- atualiza timestamp ao sair da página
  window.addEventListener('beforeunload', () => {
    if (isProtectedPage && getUsuarioLogado()) {
      const sessionData = JSON.parse(
        sessionStorage.getItem(AUTH_CONFIG.sessionKey),
      );
      sessionData.lastActivity = Date.now();
      sessionStorage.setItem(
        AUTH_CONFIG.sessionKey,
        JSON.stringify(sessionData),
      );
    }
  });


  // --- detecta encerramento em outra aba
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_CONFIG.sessionKey && !e.newValue && isProtectedPage) {
      showMessage('Sessão encerrada em outra aba.');
      setTimeout(redirectToLogin, 2000);
    }
  });

  // #endregion


  // #region EXPORTS GLOBAIS | rev.01 | 25/03/2026

  window.logout                = logout;
  window.getUsuarioLogado      = getUsuarioLogado;
  window.verificarAutenticacao = verificarAutenticacao;

  // #endregion

});
