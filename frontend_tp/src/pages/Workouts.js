import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Input from '../components/Input';
import workoutService from '../services/workoutService';
import api from '../services/api';
import { toast } from 'react-toastify';

const Workouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    dayOfWeek: 1,
    exercises: [{ name: '', sets: 3, reps: 10, videoLink: '' }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsData, clientsData] = await Promise.all([
        workoutService.getAll(),
        api.get('/users/my-clients')
      ]);
      const workoutsArray = Array.isArray(workoutsData) ? workoutsData : workoutsData.data || [];
      setWorkouts(workoutsData);
      setClients(clientsData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = () => {
    setCurrentWorkout(null);
    setFormData({
      clientId: '',
      dayOfWeek: 1,
      exercises: [{ name: '', sets: 3, reps: 10, videoLink: '' }]
    });
    setShowModal(true);
  };

  const handleEditWorkout = (workout) => {
    setCurrentWorkout(workout);
    setFormData({
      clientId: workout.clientId,
      dayOfWeek: workout.dayOfWeek,
      exercises: workout.exercises || [{ name: '', sets: 3, reps: 10, videoLink: '' }]
    });
    setShowModal(true);
  };

  const handleDeleteWorkout = async (id) => {
    if (window.confirm('Tem certeza que deseja eliminar este plano?')) {
      try {
        await workoutService.delete(id);
        toast.success('Plano eliminado com sucesso');
        loadData();
      } catch (error) {
        toast.error('Erro ao eliminar plano');
      }
    }
  };

  const handleAddExercise = () => {
    if (formData.exercises.length >= 10) {
      toast.warning('Máximo de 10 exercícios por sessão');
      return;
    }
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: 3, reps: 10, videoLink: '' }]
    });
  };

  const handleRemoveExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index][field] = value;
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.exercises.length === 0) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }

    if (formData.exercises.some(ex => !ex.name)) {
      toast.error('Preencha o nome de todos os exercícios');
      return;
    }

    try {
      if (currentWorkout) {
        await workoutService.update(currentWorkout._id, formData);
        toast.success('Plano atualizado com sucesso');
      } else {
        await workoutService.create(formData);
        toast.success('Plano criado com sucesso');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar plano');
    }
  };

  const filteredWorkouts = workouts.filter(w => {
    const client = clients.find(c => c._id === w.clientId);
    const clientName = client?.username || '';
    return clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDayName = (day) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day];
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Planos de Treino
        </h1>
        <Button onClick={handleCreateWorkout}>
          + Novo Plano
        </Button>
      </div>

      {/* Pesquisa */}
      <div className="mb-6">
        <Input
          placeholder="Pesquisar por cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map(workout => {
          const client = clients.find(c => c._id === workout.clientId);
          return (
            <Card key={workout._id} hover>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {getDayName(workout.dayOfWeek)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
  Cliente: {client?.username || workout.clientId?.username || 'Desconhecido'}
</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                {workout.exercises?.length || 0} exercícios
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditWorkout(workout)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteWorkout(workout._id)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum plano de treino encontrado
          </p>
        </div>
      )}

      {/* Modal de criação/edição */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={currentWorkout ? 'Editar Plano de Treino' : 'Novo Plano de Treino'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dia da Semana
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={0}>Domingo</option>
              <option value={1}>Segunda</option>
              <option value={2}>Terça</option>
              <option value={3}>Quarta</option>
              <option value={4}>Quinta</option>
              <option value={5}>Sexta</option>
              <option value={6}>Sábado</option>
            </select>
          </div>

          {/* Exercícios */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exercícios
              </label>
              <Button
                type="button"
                size="sm"
                onClick={handleAddExercise}
                disabled={formData.exercises.length >= 10}
              >
                + Adicionar Exercício
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Exercício {index + 1}
                    </span>
                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <Input
                    placeholder="Nome do exercício"
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Séries"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Repetições"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  
                  <Input
                    placeholder="Link do vídeo (opcional)"
                    value={exercise.videoLink}
                    onChange={(e) => handleExerciseChange(index, 'videoLink', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" fullWidth>
              {currentWorkout ? 'Atualizar' : 'Criar'} Plano
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Workouts;