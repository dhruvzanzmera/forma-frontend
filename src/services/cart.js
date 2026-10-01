import api from '../api/client'

export const cartService = {
  get: () => api.get('/cart'),
  add: (payload) => api.post('/cart/items', payload),
  update: (productId, payload) => api.put(`/cart/items/${productId}`, payload),
  remove: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
}