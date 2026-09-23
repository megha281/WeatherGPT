import api from './api';

export const userService = {
  profile: () => api.get('/user/profile').then((r) => r.data.user),
  updateProfile: (payload) => api.put('/user/profile', payload).then((r) => r.data),
  updatePreferences: (payload) => api.put('/user/preferences', payload).then((r) => r.data),
  locations: () => api.get('/user/locations').then((r) => r.data.locations),
  addLocation: (payload) => api.post('/user/locations', payload).then((r) => r.data),
  deleteLocation: (id) => api.delete(`/user/locations/${id}`).then((r) => r.data),
};

export default userService;
