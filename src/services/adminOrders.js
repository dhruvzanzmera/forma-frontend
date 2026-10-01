import api from '../api/client'

export const adminOrdersService = {
  list: (params) => api.get('/admin/orders', { params }),
  updateStatus: (id, payload) => api.patch(`/admin/orders/${id}/status`, payload),
  updatePaymentStatus: (id, payload) => api.patch(`/admin/orders/${id}/payment-status`, payload),
}