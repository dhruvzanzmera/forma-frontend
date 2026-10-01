import api from '../api/client'

export const adminCustomersService = {
  list: (params) => api.get('/admin/customers', { params }),
  get: (id) => api.get(`/admin/customers/${id}`),
  setStatus: (id, payload) => api.patch(`/admin/customers/${id}/status`, payload),
  orders: (id, params) => api.get(`/admin/customers/${id}/orders`, { params }),
}