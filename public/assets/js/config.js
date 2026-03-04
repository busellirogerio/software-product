// config.js | data: 03/03/2026

const API_BASE_URL =
  window.location.port === '3000'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:3000/api';

const CONFIG = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  auth: {
    sessionKey: 'usuario',
    tokenExpiry: 24 * 60 * 60 * 1000,
  },
  validation: {
    minPasswordLength: 6,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  messages: {
    networkError: 'Erro de conexão. Verifique sua internet.',
    serverError: 'Erro interno do servidor. Tente novamente.',
    sessionExpired: 'Sessão expirada. Faça login novamente.',
    invalidCredentials: 'Email ou senha inválidos.',
  },
};

// ===============================
// apiRequest — suporta dois formatos:
// 1) apiRequest('/endpoint', { method: 'POST', body: payload })
// 2) apiRequest('/endpoint', 'POST', payload)
// ===============================
const apiRequest = async (endpoint, methodOrOptions = {}, bodyArg) => {
  const url = `${CONFIG.api.baseURL}${endpoint}`;

  let options = {};

  // Formato 2: apiRequest(url, 'METHOD', body)
  if (typeof methodOrOptions === 'string') {
    options.method = methodOrOptions;
    if (bodyArg !== undefined) {
      options.body = bodyArg;
    }
  } else {
    // Formato 1: apiRequest(url, { method, body })
    options = { ...methodOrOptions };
  }

  const finalOptions = {
    method: 'GET',
    headers: { ...CONFIG.api.headers },
    ...options,
  };

  // Serializa body se for objeto
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error(CONFIG.messages.networkError);
    }
    throw error;
  }
};

const isValidEmail = (email) => CONFIG.validation.emailRegex.test(email);

const isValidPassword = (password) =>
  password && password.length >= CONFIG.validation.minPasswordLength;

window.CONFIG = CONFIG;
window.apiRequest = apiRequest;
window.isValidEmail = isValidEmail;
window.isValidPassword = isValidPassword;
