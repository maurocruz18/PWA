import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Input from '../components/Input';
import api from '../services/api';
import { toast } from 'react-toastify';

const SelectPT = () => {
  const { user } = useAuth();
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAvailablePTs();
  }, []);

  const loadAvailablePTs = async () => {
    try {
      const response = await api.get('/users/available-pts');
      setPts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar PTs:', error);
      toast.error('Erro ao carregar Personal Trainers disponíveis');
      setLoading(false);
    }
  };

  const handleSelectPT = async (ptId) => {
    setRequesting(true);
    try {
      await api.post('/users/request-pt-change', { newPtId: ptId });
      toast.success(
        'Solicitação enviada ao administrador. Você será notificado quando aprovada.'
      );

      setTimeout(() => {
        loadAvailablePTs();
      }, 2000);
    } catch (error) {
      console.error('Erro ao solicitar mudança de PT:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao solicitar mudança de PT'
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleRemovePT = async () => {
    if (window.confirm('Tem certeza que deseja ficar sem PT?')) {
      setRequesting(true);
      try {
        // Enviar undefined para "Nenhum PT"
        await api.post('/users/request-pt-change', { newPtId: undefined });
        toast.success(
          'Solicitação enviada ao administrador. Você será notificado quando aprovada.'
        );

        setTimeout(() => {
          loadAvailablePTs();
        }, 2000);
      } catch (error) {
        console.error('Erro ao solicitar remoção de PT:', error);
        toast.error(
          error.response?.data?.message || 'Erro ao solicitar remoção de PT'
        );
      } finally {
        setRequesting(false);
      }
    }
  };

  const sortPTs = (ptsToSort) => {
    const sorted = [...ptsToSort];
    if (sortBy === 'name') {
      return sorted.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === 'clients') {
      return sorted.sort((a, b) => (b.clientCount || 0) - (a.clientCount || 0));
    }
    return sorted;
  };

  const filterPTs = (ptsToFilter) => {
    if (!searchQuery) return ptsToFilter;
    return ptsToFilter.filter((pt) =>
      pt.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredAndSortedPTs = sortPTs(filterPTs(pts));

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Escolher Personal Trainer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione um Personal Trainer para trabalhar com você ou solicite ficar sem PT
        </p>
      </div>

      {user?.ptId && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <p className="text-blue-800 dark:text-blue-200">
              Você já tem um Personal Trainer atribuído. Solicitar outro irá enviar um pedido para aprovação do administrador.
            </p>
            <Button 
              onClick={handleRemovePT}
              disabled={requesting}
              className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
            >
              Ficar sem PT
            </Button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Pesquisar PT por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">Ordenar por Nome</option>
            <option value="clients">Ordenar por Clientes</option>
          </select>
        </div>
      </Card>

      {filteredAndSortedPTs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum Personal Trainer disponível
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPTs.map((pt) => (
            <Card
              key={pt._id}
              className={`hover:shadow-lg transition-shadow ${
                user?.ptId?.toString() === pt._id.toString()
                  ? 'border-2 border-primary-500'
                  : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {pt.username}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {pt.email}
                </p>

                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clientes: <span className="font-bold text-gray-900 dark:text-white">{pt.clientCount || 0}</span>
                  </p>
                </div>

                <Button
                  onClick={() => handleSelectPT(pt._id)}
                  disabled={requesting || user?.ptId?.toString() === pt._id.toString()}
                  className={`w-full ${
                    user?.ptId?.toString() === pt._id.toString()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {user?.ptId?.toString() === pt._id.toString()
                    ? 'PT Atual'
                    : 'Solicitar este PT'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectPT;