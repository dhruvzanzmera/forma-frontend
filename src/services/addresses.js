import api from '../api/client'

export const addressesService = {
  list: () => api.get('/addresses'),
  get: (id) => api.get(`/addresses/${id}`),
  create: (payload) => api.post('/addresses', payload),
  update: (id, payload) => api.put(`/addresses/${id}`, payload),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
  remove: (id) => api.delete(`/addresses/${id}`),
}