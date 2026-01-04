import api from './api';

// Serviço para operações relacionadas a Mensagens e Chat
const messageService = {
  // Obter conversas do usuário
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Obter mensagens de uma conversa
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/messages/conversation/${conversationId}`, { params });
    return response.data;
  },

  // Enviar mensagem
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  // Marcar mensagens como lidas
  markAsRead: async (conversationId) => {
    const response = await api.put(`/messages/conversation/${conversationId}/read`);
    return response.data;
  },

  // Obter mensagens não lidas
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },

  // Deletar mensagem
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
};

export default messageService;
