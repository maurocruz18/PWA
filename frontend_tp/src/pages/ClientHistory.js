import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import api from '../services/api';
import { toast } from 'react-toastify';

const ClientHistory = () => {
  const { clientId } = useParams();
  const [data, setData] = useState({ stats: {}, history: [], client: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCompletion, setSelectedCompletion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClientHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const loadClientHistory = async () => {
    try {
      const response = await api.get(`/plans/client-history/${clientId}`);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico do cliente');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Concluído
        </span>
      );
    }
    if (status === 'late') {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Atrasado
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        Falhado
      </span>
    );
  };

  const filteredHistory = () => {
    if (!data?.history) return [];
    if (filter === 'all') return data.history;
    return data.history.filter(h => h.status === filter);
  };

  const handleViewDetails = (completion) => {
    setSelectedCompletion(completion);
    setShowModal(true);
  };

  if (loading) return <Loading />;

  if (!data || !data.history) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Erro ao carregar histórico
            </p>
            <Link to="/my-clients">
              <Button className="mt-4">Voltar aos Clientes</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          to="/my-clients"
          className="text-primary-600 dark:text-primary-400 hover:underline mb-4 inline-block"
        >
          ← Voltar aos Clientes
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <Avatar
            src={data.client?.profileImage}
            name={data.client?.username || 'Cliente'}
            size="lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.client?.username || 'Cliente Desconhecido'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {data.client?.email || ''}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.stats?.totalCompletions || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Concluídos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.stats?.completed || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Falhados</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {data.stats?.failed || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Atrasados</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {data.stats?.late || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Taxa</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.stats?.completionRate || 0}%
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Histórico de Treinos
          </h2>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Concluídos
            </Button>
            <Button
              variant={filter === 'failed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('failed')}
            >
              Falhados
            </Button>
          </div>
        </div>

        {filteredHistory().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum treino encontrado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory().map((completion) => (
              <div
                key={completion._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {completion.planName}
                      </h3>
                      {getStatusBadge(completion.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(completion.date).toLocaleString('pt-PT')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(completion)}
                  >
                    Ver Detalhes
                  </Button>
                </div>

                {completion.feedback && (
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Feedback:</strong> {completion.feedback}
                    </p>
                  </div>
                )}

                {completion.proofImage && (
                  <div className="mt-3">
                    <img
                      src={`http://localhost:3000${completion.proofImage}`}
                      alt="Prova"
                      className="rounded-lg max-w-xs cursor-pointer hover:opacity-90"
                      onClick={() => window.open(`http://localhost:3000${completion.proofImage}`, '_blank')}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedCompletion && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCompletion(null);
          }}
          title="Detalhes do Treino"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plano
              </p>
              <p className="text-gray-900 dark:text-white">
                {selectedCompletion.planName}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </p>
              <p className="text-gray-900 dark:text-white">
                {new Date(selectedCompletion.date).toLocaleString('pt-PT')}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </p>
              {getStatusBadge(selectedCompletion.status)}
            </div>

            {selectedCompletion.feedback && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Feedback
                </p>
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded">
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompletion.feedback}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exercícios
              </p>
              <div className="space-y-2">
                {selectedCompletion.exercises && selectedCompletion.exercises.map((exercise, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {exercise.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.sets} séries × {exercise.reps} repetições
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selectedCompletion.proofImage && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prova de Conclusão
                </p>
                <img
                  src={`http://localhost:3000${selectedCompletion.proofImage}`}
                  alt="Prova"
                  className="w-full rounded-lg cursor-pointer hover:opacity-90"
                  onClick={() => window.open(`http://localhost:3000${selectedCompletion.proofImage}`, '_blank')}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientHistory;