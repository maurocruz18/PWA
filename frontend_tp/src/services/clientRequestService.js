import api from './api';

const clientRequestService = {
  requestClient: async (clientId) => {
    try {
      const response = await api.post('/users/request-client', { clientId });
      return response.data;
    } catch (error) {
      console.error('Erro ao pedir cliente:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyRequests: async () => {
    try {
      const response = await api.get('/users/my-client-requests');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar meus pedidos:', error.response?.data || error.message);
      throw error;
    }
  },

  getPendingRequests: async () => {
    try {
      const response = await api.get('/admin/client-requests');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos pendentes:', error.response?.data || error.message);
      return {
        success: false,
        total: 0,
        data: []
      };
    }
  },

  approveRequest: async (requestId) => {
    try {
      const response = await api.put(`/admin/client-requests/${requestId}`, {
        status: 'approved'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error.response?.data || error.message);
      throw error;
    }
  },

  rejectRequest: async (requestId, rejectionReason) => {
    try {
      const response = await api.put(`/admin/client-requests/${requestId}`, {
        status: 'rejected',
        rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default clientRequestService;