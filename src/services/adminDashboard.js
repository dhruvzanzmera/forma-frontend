import api from '../api/client'

export const adminDashboardService = {
  get: () => api.get('/admin/dashboard'),
}