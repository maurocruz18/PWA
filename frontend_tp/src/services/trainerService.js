import api from './api';

// Serviço para operações relacionadas a Personal Trainers
const trainerService = {
  // Listar todos os personal trainers com filtros
  getAll: async (params = {}) => {
    const response = await api.get('/trainers', { params });
    return response.data;
  },

  // Obter detalhes de um personal trainer
  getById: async (id) => {
    const response = await api.get(`/trainers/${id}`);
    return response.data;
  },

  // Criar novo personal trainer (Admin)
  create: async (trainerData) => {
    const response = await api.post('/trainers', trainerData);
    return response.data;
  },

  // Atualizar personal trainer
  update: async (id, trainerData) => {
    const response = await api.put(`/trainers/${id}`, trainerData);
    return response.data;
  },

  // Deletar personal trainer (Admin)
  delete: async (id) => {
    const response = await api.delete(`/trainers/${id}`);
    return response.data;
  },

  // Obter clientes de um personal trainer
  getClients: async (trainerId) => {
    const response = await api.get(`/trainers/${trainerId}/clients`);
    return response.data;
  },

  // Validar personal trainer (Admin)
  validate: async (trainerId) => {
    const response = await api.put(`/trainers/${trainerId}/validate`);
    return response.data;
  },

  // Upload de imagem do personal trainer
  uploadImage: async (trainerId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/trainers/${trainerId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default trainerService;
