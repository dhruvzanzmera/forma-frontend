import api from '../api/client'

export const usersService = {
  profile: () => api.get('/users/profile'),
  updateProfile: (payload) => api.put('/users/profile', payload),
}