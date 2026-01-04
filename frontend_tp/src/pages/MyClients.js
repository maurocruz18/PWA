import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import Loading from '../components/Loading';
import api from '../services/api';
import { toast } from 'react-toastify';

const MyClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'add' ou 'request'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    loadClients();
    loadPendingRequests();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/users/my-clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
  try {
    const response = await api.get('/users/my-client-requests');
    const data = response.data?.data || [];
    setPendingRequests(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    setPendingRequests([]);
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setModalMode('create');
    setShowModal(true);
    resetForm();
  };

  const openRequestModal = () => {
    setModalMode('request');
    setShowModal(true);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setSearchQuery('');
    setSearchedUser(null);
  };

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um username ou email');
      return;
    }

    setSearching(true);
    try {
      const response = await api.get('/users/search', {
        params: { query: searchQuery }
      });

      if (response.data && response.data._id) {
        // Verificar se já é cliente deste PT
        const isAlreadyClient = clients.some(c => c._id === response.data._id);
        if (isAlreadyClient) {
          toast.error('Este utilizador já é seu cliente');
          setSearchedUser(null);
          return;
        }

        // Verificar se já tem um pedido pendente
        const hasPendingRequest = pendingRequests.some(r => r.clientId?._id === response.data._id);
        if (hasPendingRequest) {
          toast.error('Já tem um pedido pendente para este cliente');
          setSearchedUser(null);
          return;
        }

        setSearchedUser(response.data);
      } else {
        toast.error('Utilizador não encontrado');
        setSearchedUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar utilizador:', error);
      toast.error('Utilizador não encontrado');
      setSearchedUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleRequestClient = async () => {
    if (!searchedUser || !searchedUser._id) {
      toast.error('Selecione um utilizador válido');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users/request-client', { 
        clientId: searchedUser._id 
      });

      toast.success('Pedido enviado! Aguardando aprovação do administrador.');
      setShowModal(false);
      resetForm();
      loadPendingRequests();
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewClient = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Digite um email válido');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/users/add-client', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Cliente criado com sucesso!');
      setShowModal(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveClient = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja remover este cliente?')) {
      return;
    }

    try {
      await api.patch('/users/profile', { 
        userId: clientId,
        ptId: null 
      });
      
      toast.success('Cliente removido da sua lista');
      loadClients();
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meus Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Total: {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}
            {pendingRequests.length > 0 && (
              <span className="ml-4 text-orange-600 dark:text-orange-400">
                • {pendingRequests.length} pedido(s) pendente(s)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={openRequestModal} variant="secondary">
            📋 Pedir Cliente
          </Button>
          <Button onClick={openCreateModal}>
            ✨ Criar Novo
          </Button>
        </div>
      </div>

      {/* Mostrar pedidos pendentes */}
      {pendingRequests.length > 0 && (
        <div className="mb-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h2 className="font-semibold text-orange-900 dark:text-orange-200 mb-3">
            Pedidos Pendentes de Aprovação ({pendingRequests.length})
          </h2>
          <div className="space-y-2">
            {pendingRequests.map(req => (
              <div key={req._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={req.clientId?.profileImage} 
                    name={req.clientId?.username}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {req.clientId?.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Solicitado em {new Date(req.requestedAt).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200 text-sm rounded-full">
                  Aguardando Aprovação
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-3">
            ℹ️ Os pedidos são revistos e aprovados pelo administrador.
          </p>
        </div>
      )}

      {clients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum cliente
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comece adicionando ou criando seu primeiro cliente
            </p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Button onClick={openRequestModal} variant="secondary">
                Pedir Cliente
              </Button>
              <Button onClick={openCreateModal}>
                Criar Novo
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar
                    src={client.profileImage}
                    name={client.username}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {client.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {client.email || 'Sem email'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveClient(client._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remover cliente"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal - Criar, Adicionar ou Pedir Cliente */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={
          modalMode === 'create' 
            ? 'Criar Novo Cliente' 
            : 'Pedir Cliente (com Aprovação Admin)'
        }
      >
        {modalMode === 'create' ? (
          // Formulário de Criação
          <form onSubmit={handleCreateNewClient} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Crie uma nova conta de cliente. O cliente poderá fazer login com estas credenciais.
              </p>
            </div>

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username do cliente"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button type="submit" fullWidth loading={submitting}>
                {submitting ? 'Criando...' : 'Criar Cliente'}
              </Button>
            </div>
          </form>
        ) : (
          // Formulário de Pedir Cliente (COM aprovação admin)
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>ℹ️ Com Aprovação Admin:</strong> Procure por um cliente. Seu pedido será enviado ao administrador para aprovação.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username ou Email
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="exemplo@email.com ou username"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchUser();
                    }
                  }}
                />
                <Button 
                  onClick={handleSearchUser}
                  loading={searching}
                  disabled={!searchQuery.trim()}
                >
                  {searching ? 'Procurando...' : 'Procurar'}
                </Button>
              </div>
            </div>

            {searchedUser && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Utilizador encontrado:
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={searchedUser.profileImage} 
                      name={searchedUser.username}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {searchedUser.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {searchedUser.email || 'Sem email'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {searchedUser.role === 'PT' ? 'Personal Trainer' : 'Cliente'}
                      </p>
                    </div>
                  </div>
                </div>

                {searchedUser.role === 'PT' && (
                  <div className="mt-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Este utilizador é um Personal Trainer, não um cliente.
                    </p>
                  </div>
                )}

                {searchedUser.ptId && searchedUser.role === 'CLIENT' && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ Este cliente já tem outro PT. Se aprovado, você se tornará o novo PT dele.
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setSearchedUser(null)}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleRequestClient}
                    fullWidth
                    loading={submitting}
                    disabled={searchedUser.role === 'PT'}
                  >
                    {submitting ? 'Enviando Pedido...' : 'Enviar Pedido'}
                  </Button>
                </div>
              </div>
            )}

            {!searchedUser && (
              <div className="flex justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyClients;