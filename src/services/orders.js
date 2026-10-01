import api from '../api/client'

export const ordersService = {
  checkoutSummary: (addressId) => api.get('/orders/checkout-summary', { params: { addressId } }),
  place: (payload) => api.post('/orders', payload),
  mine: (params) => api.get('/orders/my-orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id, payload) => api.post(`/orders/${id}/cancel`, payload),
  track: (id) => api.get(`/orders/${id}/track`),
}