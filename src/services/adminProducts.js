import api from '../api/client'

export const adminProductsService = {
  list: (params) => api.get('/admin/products', { params }),
  get: (id) => api.get(`/admin/products/${id}`),
  create: (payload) => api.post('/admin/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, payload) => api.put(`/admin/products/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStock: (id, payload) => api.patch(`/admin/products/${id}/stock`, payload),
  remove: (id) => api.delete(`/admin/products/${id}`),
}