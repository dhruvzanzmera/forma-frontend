import api from '../api/client'

export const productsService = {
  list: (params) => api.get('/products', { params }),
  featured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  get: (idOrSlug) => api.get(`/products/${idOrSlug}`),
}