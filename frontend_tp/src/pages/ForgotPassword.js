import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error('Digite seu username ou email');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { identifier });
      toast.success(response.data.message);
      setEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Email Enviado!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Se a conta existir, receberá um email com instruções para redefinir a sua senha.
              Verifique também a pasta de spam.
            </p>
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Recuperar Senha
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Digite seu username ou email para receber instruções de recuperação
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username ou Email"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Digite seu username ou email"
            required
          />

          <Button type="submit" fullWidth loading={loading}>
            Enviar Email de Recuperação
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            to="/login"
            className="block text-primary-600 dark:text-primary-400 hover:underline"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;