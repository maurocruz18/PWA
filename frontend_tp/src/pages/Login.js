import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const user = await login(formData.username, formData.password);
      
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar conforme o papel
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'PT') {
        navigate('/my-clients');
      } else {
        navigate('/my-workouts');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Seu username"
            required
          />

          <Input
            label="Senha"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Sua senha"
            required
          />

          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'A fazer login...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <div>
            <Link
              to="/forgot-password"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                ou
              </span>
            </div>
          </div>

          <Link
            to="/qr-login"
            className="block text-primary-600 dark:text-primary-400 hover:underline"
          >
            Use QR Code para entrar
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                ou
              </span>
            </div>
          </div>

          <Link
            to="/register"
            className="block text-primary-600 dark:text-primary-400 hover:underline"
          >
            Não tem conta? Registre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;