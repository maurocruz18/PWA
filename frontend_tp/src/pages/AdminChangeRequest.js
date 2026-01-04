import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminPTChangeRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null); // ID do pedido sendo respondido

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pt-change-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos de mudança de PT');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, clientName, newPT) => {
    setResponding(requestId);
    try {
      await api.put(`/admin/pt-change-requests/${requestId}`, {
        action: 'approve',
      });
      toast.success(
        `Aprovado! ${clientName} agora está associado a ${newPT}`
      );
      loadRequests();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error(
        error.response?.data?.message ||
          'Erro ao aprovar pedido'
      );
    } finally {
      setResponding(null);
    }
  };

  const handleReject = async (requestId, clientName) => {
    setResponding(requestId);
    try {
      await api.put(`/admin/pt-change-requests/${requestId}`, {
        action: 'reject',
        reason: 'Rejeitado pelo administrador',
      });
      toast.success(`Rejeitado! ${clientName} foi notificado`);
      loadRequests();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error(
        error.response?.data?.message ||
          'Erro ao rejeitar pedido'
      );
    } finally {
      setResponding(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Acesso negado. Apenas administradores podem acessar esta página.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pedidos de Mudança de PT
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aprove ou rejeite os pedidos de mudança de Personal Trainer dos clientes
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum pedido pendente
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Todos os pedidos foram respondidos
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Badge com contagem */}
          <div className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-blue-900 dark:text-blue-100 font-semibold">
              Total de pedidos pendentes: <span className="text-2xl">{requests.length}</span>
            </p>
          </div>

          {/* Lista de pedidos */}
          {requests.map((req) => (
            <Card
              key={req._id}
              className="hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Informações do cliente */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {req.clientName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {req.clientEmail}
                      </p>
                    </div>

                    {/* Transição de PT */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                            PT Atual
                          </p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {req.fromPT}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            para
                          </span>
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                            Novo PT Solicitado
                          </p>
                          <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                            {req.toPT}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Data do pedido */}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Solicitado em{' '}
                      {new Date(req.requestedAt).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                    <Button
                      onClick={() =>
                        handleApprove(req._id, req.clientName, req.toPT)
                      }
                      disabled={responding === req._id}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {responding === req._id ? 'Processando...' : 'Aprovar'}
                    </Button>
                    <Button
                      onClick={() => handleReject(req._id, req.clientName)}
                      disabled={responding === req._id}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {responding === req._id ? 'Processando...' : 'Rejeitar'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPTChangeRequests;