import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const Admin = () => {
  const [pendingPTs, setPendingPTs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showChangePTModal, setShowChangePTModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newPtId, setNewPtId] = useState('');
  const [validatedPTs, setValidatedPTs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendingResponse, usersResponse] = await Promise.all([
        api.get('/admin/pending-pts'),
        api.get('/users')
      ]);
      
      setPendingPTs(pendingResponse.data);
      setAllUsers(usersResponse.data);
      
      // Filtrar PTs validados
      const validated = usersResponse.data.filter(u => u.role === 'PT' && u.isValidated);
      setValidatedPTs(validated);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePT = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/validate`);
      toast.success('Personal Trainer validado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao validar PT:', error);
      toast.error('Erro ao validar Personal Trainer');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja eliminar este utilizador?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('Utilizador eliminado');
        loadData();
      } catch (error) {
        console.error('Erro ao eliminar:', error);
        toast.error('Erro ao eliminar utilizador');
      }
    }
  };

  const handleOpenChangePT = (client) => {
    setSelectedClient(client);
    setNewPtId('');
    setShowChangePTModal(true);
  };

  const handleChangePT = async (e) => {
    e.preventDefault();
    
    if (!newPtId) {
      toast.error('Selecione um PT');
      return;
    }

    try {
      await api.patch('/admin/users/change-pt', {
        userId: selectedClient._id,
        newPtId: newPtId
      });
      toast.success('PT alterado com sucesso');
      setShowChangePTModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao alterar PT:', error);
      toast.error(error.response?.data?.message || 'Erro ao alterar PT');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Painel de Administração
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${activeTab === 'pending'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          PTs Pendentes
          {pendingPTs.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {pendingPTs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${activeTab === 'users'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          Todos os Utilizadores
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${activeTab === 'clients'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          Gestão de Clientes
        </button>
      </div>

      {/* Tab: PTs Pendentes */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingPTs.map(pt => (
            <Card key={pt._id}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {pt.username}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Pendente
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleValidatePT(pt._id)}
                >
                  Validar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteUser(pt._id)}
                >
                  Rejeitar
                </Button>
              </div>
            </Card>
          ))}
          
          {pendingPTs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum PT pendente de validação
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Todos os Utilizadores */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {allUsers.map(user => (
            <Card key={user._id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Função: {user.role}
                  </p>
                  {user.role === 'PT' && (
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${user.isValidated
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }
                    `}>
                      {user.isValidated ? 'Validado' : 'Pendente'}
                    </span>
                  )}
                  {user.role === 'CLIENT' && user.ptId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PT associado
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {user.role === 'PT' && !user.isValidated && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleValidatePT(user._id)}
                    >
                      Validar
                    </Button>
                  )}
                  {user.role !== 'ADMIN' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Gestão de Clientes */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {allUsers
            .filter(u => u.role === 'CLIENT')
            .map(client => {
              const clientPT = allUsers.find(u => u._id === client.ptId);
              return (
                <Card key={client._id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {client.username}
                      </h3>
                      {clientPT ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          PT Atual: <span className="font-medium">{clientPT.username}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Sem PT associado
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenChangePT(client)}
                    >
                      Alterar PT
                    </Button>
                  </div>
                </Card>
              );
            })}
          
          {allUsers.filter(u => u.role === 'CLIENT').length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum cliente registado
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Alterar PT */}
      <Modal
        isOpen={showChangePTModal}
        onClose={() => setShowChangePTModal(false)}
        title={`Alterar PT de ${selectedClient?.username}`}
      >
        <form onSubmit={handleChangePT} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecione o novo Personal Trainer
            </label>
            <select
              value={newPtId}
              onChange={(e) => setNewPtId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecione um PT</option>
              {validatedPTs.map(pt => (
                <option key={pt._id} value={pt._id}>
                  {pt.username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" fullWidth>
              Confirmar Alteração
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowChangePTModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Admin;