import api from './api';

export const chatService = {
  ask: (payload) => api.post('/chat', payload).then((r) => r.data.data),
  history: () => api.get('/chat/history').then((r) => r.data.chats),
  get: (id) => api.get(`/chat/${id}`).then((r) => r.data.chat),
  remove: (id) => api.delete(`/chat/${id}`).then((r) => r.data),
  clearAll: () => api.delete('/chat').then((r) => r.data),
};

export default chatService;
