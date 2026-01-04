import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import clientRequestService from '../services/clientRequestService';
import { toast } from 'react-toastify';

const AdminClientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await clientRequestService.getPendingRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      await clientRequestService.approveRequest(requestId);
      toast.success('Pedido aprovado! Cliente atribuído ao PT.');
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error(error.response?.data?.message || 'Erro ao aprovar pedido');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      await clientRequestService.rejectRequest(selectedRequest._id, rejectionReason);
      toast.success('Pedido rejeitado!');
      setRequests(requests.filter(r => r._id !== selectedRequest._id));
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error(error.response?.data?.message || 'Erro ao rejeitar pedido');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pedidos de Cliente (PT)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aprove ou rejeite os pedidos de Personal Trainers para adicionar clientes
        </p>
      </div>

      {/* Badge com contagem */}
      {requests.length > 0 && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-900 dark:text-blue-100 font-semibold">
            Total de pedidos pendentes: <span className="text-2xl ml-2">{requests.length}</span>
          </p>
        </div>
      )}

      {/* Lista de Pedidos */}
      {requests.length === 0 ? (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
              Nenhum pedido pendente no momento
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request._id}
              className="hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-2">
                {/* Informações do Pedido */}
                <div className="flex-1">
                  {/* PT que está pedindo */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                      Personal Trainer Solicitando
                    </h3>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={request.ptImage}
                        name={request.ptName}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.ptName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.ptEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seta de transição */}
                  <div className="flex items-center gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-800 rounded my-3">
                    <div className="text-2xl">→</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      quer adicionar como cliente
                    </p>
                  </div>

                  {/* Cliente sendo solicitado */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                      Cliente
                    </h3>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={request.clientImage}
                        name={request.clientName}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.clientName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.clientEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data do pedido */}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    Solicitado em{' '}
                    {new Date(request.requestedAt).toLocaleString('pt-PT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:min-w-fit">
                  <Button
                    onClick={() => handleApprove(request._id)}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✓ Aprovar
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading}
                    variant="danger"
                    className="font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✕ Rejeitar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para Rejeição com Motivo */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
          setSelectedRequest(null);
        }}
        title="Rejeitar Pedido"
        size="md"
      >
        <div className="space-y-4">
          {/* Resumo do Pedido */}
          {selectedRequest && (
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>{selectedRequest.ptName}</strong> (PT) quer adicionar
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{selectedRequest.clientName}</strong> (Cliente)
              </p>
            </div>
          )}

          {/* Campo de Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo da Rejeição (opcional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Por que está rejeitando este pedido?"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="4"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="danger"
              fullWidth
              onClick={handleReject}
              disabled={actionLoading}
              loading={actionLoading}
            >
              Confirmar Rejeição
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedRequest(null);
              }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminClientRequests;