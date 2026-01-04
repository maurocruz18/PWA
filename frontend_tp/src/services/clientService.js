import api from './api';

// Serviço para operações relacionadas a Clientes
const clientService = {
  // Listar todos os clientes com filtros
  getAll: async (params = {}) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Obter detalhes de um cliente
  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Criar novo cliente (Trainer)
  create: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Atualizar cliente
  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Deletar cliente
  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Associar cliente a um trainer
  assignTrainer: async (clientId, trainerId) => {
    const response = await api.put(`/clients/${clientId}/assign-trainer`, { trainerId });
    return response.data;
  },

  // Solicitar mudança de trainer
  requestTrainerChange: async (clientId, newTrainerId, reason) => {
    const response = await api.post(`/clients/${clientId}/request-trainer-change`, {
      newTrainerId,
      reason,
    });
    return response.data;
  },

  // Aprovar mudança de trainer (Admin)
  approveTrainerChange: async (requestId) => {
    const response = await api.put(`/clients/trainer-change-requests/${requestId}/approve`);
    return response.data;
  },

  // Rejeitar mudança de trainer (Admin)
  rejectTrainerChange: async (requestId, reason) => {
    const response = await api.put(`/clients/trainer-change-requests/${requestId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Obter pedidos de mudança de trainer
  getTrainerChangeRequests: async () => {
    const response = await api.get('/clients/trainer-change-requests');
    return response.data;
  },

  // Upload de imagem do cliente
  uploadImage: async (clientId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/clients/${clientId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default clientService;
