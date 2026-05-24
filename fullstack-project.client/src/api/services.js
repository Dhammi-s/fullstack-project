import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getWorkers: (params) => api.get('/users/workers', { params }),
  getAllUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const servicesApi = {
  getAll: (params) => api.get('/services', { params }),
  get: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const ordersApi = {
  getAll: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } }),
  assignWorker: (id, workerId) => api.put(`/orders/${id}/assign-worker`, { workerId }),
  getScheduled: () => api.get('/orders/scheduled'),
  cancel: (id) => api.delete(`/orders/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  update: (itemId, qty) => api.put(`/cart/update/${itemId}`, qty, { headers: { 'Content-Type': 'application/json' } }),
};

export const reviewsApi = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
};

export const paymentApi = {
  createIntent: (data) => api.post('/payment/create-payment-intent', data),
  createCheckout: (data) => api.post('/payment/create-checkout-session', data),
  confirm: (orderId, paymentIntentId) => api.post(`/payment/confirm/${orderId}`, JSON.stringify(paymentIntentId), { headers: { 'Content-Type': 'application/json' } }),
};

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (userId) => api.get(`/chat/${userId}`),
  sendMessage: (data) => api.post('/chat/send', data),
};

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  worker: () => api.get('/dashboard/worker'),
  customer: () => api.get('/dashboard/customer'),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  getPublic: () => api.get('/settings/public'),
  update: (data) => api.put('/settings', data),
};

