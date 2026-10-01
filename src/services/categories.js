import api from '../api/client'

export const categoriesService = {
  list: () => api.get('/categories'),
  get: (slug) => api.get(`/categories/${slug}`),
}