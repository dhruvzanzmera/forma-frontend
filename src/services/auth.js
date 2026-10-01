import api from '../api/client'

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  resendOtp: (payload) => api.post('/auth/resend-otp', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  logout: () => api.post('/auth/logout'),
}