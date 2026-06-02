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
  },

  dashboard: {
    stats: () => request('/dashboard/stats'),
    salesTrend: () => request('/dashboard/sales-trend'),
    topProducts: () => request('/dashboard/top-products'),
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

  returns: {
    list: () => request('/returns'),
    create: (data) => request('/returns', { method: 'POST', body: JSON.stringify(data) }),
  },

  favorites: {
    list: () => request('/favorites'),
    add: (productId) => request('/favorites', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
    remove: (productId) => request(`/favorites/${productId}`, { method: 'DELETE' }),
  },
};
