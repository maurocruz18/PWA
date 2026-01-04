import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import api from '../services/api';
import { toast } from 'react-toastify';

const PTRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    loadRequests();
    // Recarregar a cada 5 segundos
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      // Buscar todos os pedidos de mudança de PT onde o PT atual é este PT
      const response = await api.get('/admin/pt-change-requests');
      
      // Filtrar apenas os pedidos onde o PT atual é este PT
      const myRequests = response.data.filter(req => {
        // Se fromPT contém o username do PT atual, é um pedido para este PT
        return req.toPT.toLowerCase().includes(user?.username?.toLowerCase());
      });
      
      setRequests(myRequests);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      // Não mostrar erro se o PT não tiver permissão
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Novos Clientes Solicitando-te
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Clientes que solicitaram ser teus clientes
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum pedido pendente no momento
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="text-2xl">📝</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {req.clientName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {req.clientEmail}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PTRequests;