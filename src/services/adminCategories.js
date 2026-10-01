import api from '../api/client'

export const adminCategoriesService = {
  list: () => api.get('/admin/categories'),
  create: (payload) => api.post('/admin/categories', payload),
  update: (id, payload) => api.put(`/admin/categories/${id}`, payload),
  remove: (id) => api.delete(`/admin/categories/${id}`),
}