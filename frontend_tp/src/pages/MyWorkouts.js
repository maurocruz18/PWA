import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import workoutService from '../services/workoutService';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { formatDate } from '../utils/helpers';

const MyWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const workoutsList = Array.isArray(workouts) ? workouts : [];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [completionData, setCompletionData] = useState({
    status: 'completed',
    feedback: '',
    image: null,
  });

  const loadWorkouts = useCallback(async () => {
    try {
      const response = await workoutService.getByClient(user._id);
      const data = response.data || response || [];
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      setWorkouts([]);
      toast.error('Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleMarkWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowModal(true);
  };

  const handleSubmitCompletion = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append('status', completionData.status);
    
    if (completionData.feedback && completionData.feedback.trim()) {
      formData.append('feedback', completionData.feedback.trim());
    }
    
    if (completionData.image) {
      formData.append('image', completionData.image);
    }

    console.log('=== FRONTEND DEBUG ===');
    console.log('Status sendo enviado:', completionData.status);
    console.log('Feedback sendo enviado:', completionData.feedback);
    console.log('Imagem:', completionData.image ? 'Sim' : 'Não');

    const response = await workoutService.completeWorkout(selectedWorkout._id, formData);
    
    console.log('Response:', response);

    toast.success('Treino registado com sucesso');
    setShowModal(false);
    loadWorkouts();
    setCompletionData({ status: 'completed', feedback: '', image: null });
  } catch (error) {
    console.error('Erro ao registar treino:', error);
    const message = error.response?.data?.message || 'Erro ao registar treino';
    toast.error(message);
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompletionData({ ...completionData, image: file });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Meus Treinos
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Calendário
          </h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="w-full border-none"
          />
        </Card>

        <Card className="lg:col-span-2" title={`Treinos para ${formatDate(selectedDate)}`}>
          <div className="space-y-4">
            {workoutsList
              .filter(w => {
                const workoutDay = w.dayOfWeek;
                const selectedDay = selectedDate.getDay();
                return workoutDay === selectedDay;
              })
              .map(workout => (
                <div
                  key={workout._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Treino do Dia
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.exercises?.length || 0} exercícios
                      </p>
                    </div>
                    <span
                      className={`
                        px-3 py-1 text-xs rounded-full
                        ${workout.isCompleted
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }
                      `}
                    >
                      {workout.isCompleted ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    {workout.exercises?.map((exercise, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {exercise.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.sets}x{exercise.reps}
                        </span>
                        {exercise.videoLink && (
                          <a 
                            href={exercise.videoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Ver vídeo
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {!workout.isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkWorkout(workout)}
                    >
                      Registar Treino
                    </Button>
                  )}

                  {workout.feedback && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Feedback:</strong> {workout.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}

            {workoutsList.filter(w => w.dayOfWeek === selectedDate.getDay()).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum treino agendado para este dia
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCompletionData({ status: 'completed', feedback: '', image: null });
        }}
        title="Registar Treino"
      >
        <form onSubmit={handleSubmitCompletion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado do Treino
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={completionData.status === 'completed'}
                  onChange={() => setCompletionData({ ...completionData, status: 'completed' })}
                  className="mr-2"
                />
                Concluído
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={completionData.status === 'failed'}
                  onChange={() => setCompletionData({ ...completionData, status: 'failed' })}
                  className="mr-2"
                />
                Não Concluído
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback
            </label>
            <textarea
              value={completionData.feedback}
              onChange={(e) => setCompletionData({ ...completionData, feedback: e.target.value })}
              rows={3}
              placeholder="Como foi o treino? (opcional)"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {completionData.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto de Comprovação (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  dark:file:bg-gray-700 dark:file:text-primary-400"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" fullWidth>
              Confirmar
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowModal(false);
                setCompletionData({ status: 'completed', feedback: '', image: null });
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyWorkouts;