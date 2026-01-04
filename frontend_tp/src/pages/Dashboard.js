import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import PTRequests from './PTRequests';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user, isTrainer, isClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCompletions, setRecentCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Se for cliente, verificar treinos expirados primeiro
      if (isClient) {
        await api.post('/plans/check-expired');
      }

      const statsResponse = await api.get('/plans/stats');
      setStats(statsResponse.data);

      if (isTrainer) {
        const completionsResponse = await api.get('/plans/recent-completions?limit=5');
        setRecentCompletions(completionsResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          ✓ Concluído
        </span>
      );
    }
    if (status === 'late') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          ⏰ Atrasado
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        ✗ Falhado
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    
    return date.toLocaleDateString('pt-PT');
  };

  if (loading) return <Loading />;

  const chartData = stats?.weekData || [
    { name: 'Dom', concluidos: 0, atrasados: 0, falhados: 0 },
    { name: 'Seg', concluidos: 0, atrasados: 0, falhados: 0 },
    { name: 'Ter', concluidos: 0, atrasados: 0, falhados: 0 },
    { name: 'Qua', concluidos: 0, atrasados: 0, falhados: 0 },
    { name: 'Qui', concluidos: 0, atrasados: 0, falhados: 0 },
    { name: 'Sex', concluidos: 0, atrasados: 0, falhados: 0 },
    { name: 'Sáb', concluidos: 0, atrasados: 0, falhados: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Olá, {user?.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isTrainer ? 'Aqui está o resumo da atividade dos seus clientes' : 'Aqui está o seu progresso'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {isTrainer && (
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalClients || 0}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg
                className="w-8 h-8 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isTrainer ? 'Planos Criados' : 'Meus Planos'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalPlans || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
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
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completedThisWeek || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Atrasados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.lateThisWeek || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* PT Requests - MOSTRAR PARA PT */}
      {isTrainer && (
        <div className="mb-8">
          <PTRequests />
        </div>
      )}

      {/* Notificações de treinos concluídos - APENAS PT */}
      {isTrainer && recentCompletions.length > 0 && (
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Treinos Recentes dos Clientes
            </h2>
            <Link
              to="/my-clients"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-4">
            {recentCompletions.map((completion) => (
              <div
                key={completion._id}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Avatar
                  src={completion.client?.profileImage}
                  name={completion.client?.username}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {completion.client?.username}
                    </p>
                    {getStatusBadge(completion.status)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(completion.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {completion.planName}
                  </p>
                  {completion.feedback && (
                    <div className="bg-white dark:bg-gray-900 rounded p-2 text-sm mb-2">
                      <p className="text-gray-700 dark:text-gray-300">
                        "{completion.feedback}"
                      </p>
                    </div>
                  )}
                  {completion.proofImage && (
                    <img
                      src={`http://localhost:3000${completion.proofImage}`}
                      alt="Prova"
                      className="mt-2 rounded-lg max-w-xs cursor-pointer hover:opacity-90"
                      onClick={() => window.open(`http://localhost:3000${completion.proofImage}`, '_blank')}
                    />
                  )}
                  <Link
                    to={`/client-history/${completion.client._id}`}
                    className="inline-block mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Ver histórico completo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumo rápido para Cliente */}
      {isClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumo da Semana
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Concluídos no Prazo</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.completedThisWeek || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Concluídos com Atraso</span>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats?.lateThisWeek || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Não Concluídos</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.failedThisWeek || 0}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Taxa de Sucesso</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.completedThisWeek && (stats?.completedThisWeek + stats?.lateThisWeek + stats?.failedThisWeek) > 0
                      ? Math.round(((stats.completedThisWeek + stats.lateThisWeek) / (stats.completedThisWeek + stats.lateThisWeek + stats.failedThisWeek)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <Link to="/my-workouts">
                <button className="w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
                   Ver Meus Treinos
                </button>
              </Link>
              {!user?.ptId && (
                <Link to="/select-pt">
                  <button className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                    👤 Escolher Personal Trainer
                  </button>
                </Link>
              )}
              <Link to="/messages">
                <button className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                   Mensagens
                </button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Gráfico */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Progresso Semanal
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="name" 
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="concluidos"
              stroke="#10b981"
              strokeWidth={2}
              name="Concluídos"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="atrasados"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Atrasados"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="falhados"
              stroke="#ef4444"
              strokeWidth={2}
              name="Falhados"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {chartData.every(d => d.concluidos === 0 && d.atrasados === 0 && d.falhados === 0) && (
          <div className="text-center mt-4 text-gray-500 dark:text-gray-400">
            <p>Nenhum treino registado esta semana</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;