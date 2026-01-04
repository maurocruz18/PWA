import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import QRCodeGenerator from '../components/QRCodeGenerator';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    themePreference: user?.themePreference || 'dark',
  });

  // Aplicar tema ao carregar e quando user muda
  React.useEffect(() => {
    const theme = user?.themePreference || 'dark';
    applyTheme(theme);
  }, [user?.themePreference]);

  const applyTheme = (theme) => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se mudou o tema, aplicar imediatamente
    if (name === 'themePreference') {
      applyTheme(value);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecione uma imagem');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 100MB)');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result;
          
          const response = await api.put('/users/profile', {
            profileImage: base64Image,
          });

          updateUser(response.data);
          toast.success('Foto atualizada com sucesso!');
          setUploading(false);
        } catch (error) {
          console.error('Erro ao enviar foto:', error);
          toast.error(error.response?.data?.message || 'Erro ao atualizar foto');
          setUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error('Erro ao ler a imagem');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar foto:', error);
      toast.error('Erro ao processar a imagem');
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', {
        username: formData.username,
        email: formData.email,
        themePreference: formData.themePreference,
      });

      updateUser(response.data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loading />;
  }

  const roleLabel = {
    ADMIN: 'Administrador',
    PT: 'Personal Trainer',
    CLIENT: 'Cliente'
  }[user.role] || user.role;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Seção de Avatar */}
      <Card className="mb-6">
        <div className="p-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-600"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-primary-600">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handlePhotoClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-full p-3 transition-colors shadow-lg"
                title="Alterar foto"
              >
                {uploading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.219A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.219A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
                aria-label="Carregar foto de perfil"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user.username}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {roleLabel}
            </p>

            {uploading && (
              <p className="text-sm text-primary-600 dark:text-primary-400">
                A carregar imagem...
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Seção de Informações */}
      <Card>
        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome de Utilizador
            </label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled
              className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Conta
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {roleLabel}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema
            </label>
            <select
              name="themePreference"
              value={formData.themePreference}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            >
              {loading ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Informações Adicionais */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações da Conta
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">ID da Conta</span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">
                {user._id?.substring(0, 8)}...
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conta Validada</span>
              <span className={`text-sm font-medium ${
                user.isValidated 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {user.isValidated ? '✓ Sim' : '⏳ Pendente'}
              </span>
            </div>

            {user.ptId && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">PT Atribuído</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Sim
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* QR Code Generator */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Gerar QR Code para Login
          </h3>
          <QRCodeGenerator />
        </div>
      </Card>
    </div>
  );
};

export default Profile;