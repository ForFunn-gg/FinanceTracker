const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('finflow_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authService = {
  register: (username, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request('/auth/me'),
};

export const txService = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/transactions${qs ? '?' + qs : ''}`);
  },

  getSummary: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/transactions/summary${qs ? '?' + qs : ''}`);
  },

  create: (data) =>
    request('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),
};