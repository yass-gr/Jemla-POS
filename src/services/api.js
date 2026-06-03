const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  products: {
    list: () => request('/products'),
    get: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  customers: {
    list: () => request('/customers'),
    get: (id) => request(`/customers/${id}`),
    create: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
    addPayment: (id, data) => request(`/customers/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  },

  dashboard: {
    stats: () => request('/dashboard/stats'),
    salesTrend: (period) => request(`/dashboard/sales-trend?period=${period || 'week'}`),
    topProducts: (period) => request(`/dashboard/top-products?period=${period || 'all'}`),
    topCustomers: () => request('/dashboard/top-customers'),
    recentTransactions: () => request('/dashboard/recent-transactions'),
  },

  sales: {
    list: () => request('/sales'),
    stats: () => request('/sales/stats'),
    get: (id) => request(`/sales/${id}`),
    create: (data) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),
    recent: (limit) => request(`/sales/recent?limit=${limit || 5}`),
    hold: (data) => request('/sales/hold', { method: 'POST', body: JSON.stringify(data) }),
    held: () => request('/sales/held'),
    restore: (id) => request(`/sales/${id}/restore`, { method: 'PATCH' }),
  },

  suppliers: {
    list: () => request('/suppliers'),
    get: (id) => request(`/suppliers/${id}`),
    create: (data) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
  },

  purchases: {
    list: () => request('/purchases'),
    create: (data) => request('/purchases', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/purchases/${id}`, { method: 'DELETE' }),
  },

  inventory: {
    list: () => request('/inventory'),
    log: () => request('/inventory/log'),
    adjust: (data) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  },

  reports: {
    summary: (period) => request(`/reports/summary?period=${period || 'all'}`),
  },

  returns: {
    list: () => request('/returns'),
    create: (data) => request('/returns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/returns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/returns/${id}`, { method: 'DELETE' }),
  },

  favorites: {
    list: () => request('/favorites'),
    add: (productId) => request('/favorites', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
    remove: (productId) => request(`/favorites/${productId}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  users: {
    list: () => request('/users'),
    create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    changePassword: (id, newPassword) => request(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) }),
    changeMyPassword: (currentPassword, newPassword) => request('/users/password/me', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  },

  notifications: {
    list: () => request('/notifications'),
  },

  backup: {
    download: () => `${BASE}/backup`,
  },
};
