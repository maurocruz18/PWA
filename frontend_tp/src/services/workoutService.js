import api from './api';

const workoutService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/plans', { params });
      const data = response.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      return null;
    }
  },

  create: async (workoutData) => {
    try {
      const response = await api.post('/plans', workoutData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  },

  update: async (id, workoutData) => {
    try {
      const response = await api.put(`/plans/${id}`, workoutData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      throw error;
    }
  },

  getByClient: async (clientId) => {
    try {
      const response = await api.get('/plans', { 
        params: { clientId } 
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      return [];
    }
  },

  completeWorkout: async (workoutId, formData) => {
    try {
      console.log('Enviando para:', `/plans/${workoutId}/complete`);
      console.log('FormData entries:');
      
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await api.post(`/plans/${workoutId}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao completar treino:', error);
      throw error;
    }
  },

  getStats: async (clientId) => {
    try {
      const params = clientId ? { clientId } : {};
      const response = await api.get('/plans/stats', { params });
      
      const weeklyData = response.data.map(item => ({
        day: item.date,
        workouts: item.totalCompleted
      }));
      
      const totalCompleted = weeklyData.reduce((sum, item) => sum + item.workouts, 0);
      
      return {
        completedWorkouts: totalCompleted,
        completionRate: 75,
        activeDays: weeklyData.filter(item => item.workouts > 0).length,
        weeklyData
      };
    } catch (error) {
      console.error('Erro ao calcular stats:', error);
      return {
        completedWorkouts: 0,
        completionRate: 0,
        activeDays: 0,
        weeklyData: []
      };
    }
  },
};

export default workoutService;