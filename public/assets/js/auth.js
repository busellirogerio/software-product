// Proteção de rotas e gerenciamento de autenticação
document.addEventListener('DOMContentLoaded', () => {
  // Configurações de autenticação
  const AUTH_CONFIG = {
    sessionKey: 'usuario',
    maxSessionTime: 24 * 60 * 60 * 1000, // 24 horas
    checkInterval: 5 * 60 * 1000, // Verifica sessão a cada 5 minutos
  };

  // Função para obter usuário logado
  const getUsuarioLogado = () => {
    try {
      const usuarioJson = sessionStorage.getItem(AUTH_CONFIG.sessionKey);
      if (!usuarioJson) return null;

      const sessionData = JSON.parse(usuarioJson);

      // Valida estrutura básica da sessão
      if (!sessionData.usuario || !sessionData.loginTime) {
        console.warn('⚠️ Sessão inválida detectada');
        clearSession();
        return null;
      }

      // Verifica se sessão expirou
      const now = Date.now();
      const sessionAge = now - sessionData.loginTime;

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

  // Função para limpar sessão
  const clearSession = () => {
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
    localStorage.removeItem('usuarioLogado'); // Remove legacy storage
  };

  // Função para exibir mensagens
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

  // Função para redirecionar para login
  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login.html')) {
      console.log('🔒 Redirecionando para login');
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  // Função principal de verificação
  const verificarAutenticacao = () => {
    const usuario = getUsuarioLogado();

    if (!usuario) {
      redirectToLogin();
      return false;
    }

    // Atualizar nome do usuário no header
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) {
      const nomeDisplay = usuario.NomeCompleto || usuario.Login || 'Usuário';
      nomeEl.textContent = nomeDisplay;
      nomeEl.title = `Logado como: ${usuario.Email || usuario.Login}`;
    }

    // Log de atividade
    console.log('✅ Usuário autenticado:', usuario.Login);
    return true;
  };

  // Função de logout
  const logout = () => {
    try {
      const usuario = getUsuarioLogado();
      if (usuario) {
        console.log('👋 Logout realizado:', usuario.Login);
      }

      clearSession();
      showMessage('Logout realizado com sucesso.', 'success');

      // Pequeno delay para mostrar a mensagem
      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/login.html';
      }, 1500);
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      clearSession();
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  // Verificar se estamos em uma página protegida
  const currentPath = window.location.pathname;
  const isProtectedPage =
    currentPath.includes('dashboard.html') ||
    currentPath.includes('admin.html') ||
    currentPath.includes('usuarios.html');

  // Executar verificação se estiver em página protegida
  if (isProtectedPage) {
    const isAuthenticated = verificarAutenticacao();

    if (isAuthenticated) {
      // Configurar verificação periódica da sessão
      setInterval(() => {
        const usuario = getUsuarioLogado();
        if (!usuario) {
          showMessage('Sessão perdida. Redirecionando...');
          setTimeout(redirectToLogin, 2000);
        }
      }, AUTH_CONFIG.checkInterval);
    }
  }

  // Configurar botão de sair
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();

      // Confirmação opcional para logout
      if (confirm('Deseja realmente sair do sistema?')) {
        logout();
      }
    });
  }

  // Detectar tentativa de acesso direto a páginas protegidas
  window.addEventListener('beforeunload', () => {
    if (isProtectedPage && getUsuarioLogado()) {
      // Atualiza timestamp da sessão
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

  // Detectar mudanças na sessionStorage (múltiplas abas)
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_CONFIG.sessionKey && !e.newValue && isProtectedPage) {
      showMessage('Sessão encerrada em outra aba.');
      setTimeout(redirectToLogin, 2000);
    }
  });

  // Expor funções globais necessárias
  window.logout = logout;
  window.getUsuarioLogado = getUsuarioLogado;
  window.verificarAutenticacao = verificarAutenticacao;
});
