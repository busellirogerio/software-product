// ===============================
// config.js - Configurações Globais
// ===============================

// Configuração base da API
// - Se o frontend estiver no Node (porta 3000): usa mesma origem
// - Se estiver no Live Server (porta 5500): aponta para o Node (3000)
const API_BASE_URL =
  window.location.port === '3000'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:3000/api';

// Configurações globais do frontend
const CONFIG = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 segundos
    headers: {
      'Content-Type': 'application/json',
    },
  },

  // Configurações de autenticação
  auth: {
    sessionKey: 'usuario',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas em ms
  },

  // Configurações de validação
  validation: {
    minPasswordLength: 6,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Mensagens padrão
  messages: {
    networkError: 'Erro de conexão. Verifique sua internet.',
    serverError: 'Erro interno do servidor. Tente novamente.',
    sessionExpired: 'Sessão expirada. Faça login novamente.',
    invalidCredentials: 'Email ou senha inválidos.',
  },
};

// Função para fazer requisições HTTP com configurações padrão
const apiRequest = async (endpoint, options = {}) => {
  const url = `${CONFIG.api.baseURL}${endpoint}`;

  const defaultOptions = {
    method: 'GET',
    headers: { ...CONFIG.api.headers },
    timeout: CONFIG.api.timeout,
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Adiciona body se for POST/PUT
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  try {
    const response = await fetch(url, finalOptions);

    // Trata erros HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Trata erros de rede
    if (error.name === 'TypeError') {
      throw new Error(CONFIG.messages.networkError);
    }
    throw error;
  }
};

// Função para validar email
const isValidEmail = (email) => {
  return CONFIG.validation.emailRegex.test(email);
};

// Função para validar senha
const isValidPassword = (password) => {
  return password && password.length >= CONFIG.validation.minPasswordLength;
};

// Exportar configurações globalmente
window.CONFIG = CONFIG;
window.apiRequest = apiRequest;
window.isValidEmail = isValidEmail;
window.isValidPassword = isValidPassword;
