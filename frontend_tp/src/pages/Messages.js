import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import { toast } from 'react-toastify';
import { formatTime } from '../utils/helpers';
import api from '../services/api';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const generateConversationId = useCallback((userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      const validConversations = (data || []).filter(
        (conv) => conv && conv.otherUser && conv.otherUser._id
      );
      setConversations(validConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      socketService.joinConversation(selectedConversation._id);
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    socketService.onNewMessage((messageData) => {
      if (messageData.conversationId === selectedConversation?._id) {
        setMessages(prev => [...prev, messageData]);
        socketService.emit('message:read', { conversationId: selectedConversation._id });
      }
      loadConversations();
    });

    socketService.onUserTyping((data) => {
      if (data.conversationId === selectedConversation?._id && data.userId !== user?._id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.username
        }));

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }, 3000);
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation, user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (conversationId) => {
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data || []);

      if (data && data.length > 0) {
        await messageService.markAsRead(conversationId);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Digite um email ou username');
      return;
    }

    setSearching(true);
    try {
      const response = await api.get('/users/search', {
        params: { query: searchEmail }
      });

      if (response.data && response.data._id) {
        setSearchedUser(response.data);
      } else {
        toast.error('Usuário não encontrado');
        setSearchedUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Usuário não encontrado');
      setSearchedUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async () => {
    if (!searchedUser || !searchedUser._id || !user?._id) {
      toast.error('Usuário inválido');
      return;
    }

    try {
      const response = await api.post('/messages/conversations', {
        userId: searchedUser._id
      });

      const conversationId = response.data._id;

      const newConversation = {
        _id: conversationId,
        otherUser: {
          _id: searchedUser._id,
          username: searchedUser.username,
          email: searchedUser.email,
          profileImage: searchedUser.profileImage,
          role: searchedUser.role
        },
        lastMessage: null,
        unreadCount: 0
      };

      const exists = conversations.find(c => c._id === conversationId);
      if (exists) {
        setSelectedConversation(exists);
        setShowNewChatModal(false);
        setSearchEmail('');
        setSearchedUser(null);
        toast.info('Conversa já existe');
        return;
      }

      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
      setMessages([]);
      setShowNewChatModal(false);
      setSearchEmail('');
      setSearchedUser(null);

      toast.success('Conversa iniciada!');
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      const conversationId = generateConversationId(user._id, searchedUser._id);

      const newConversation = {
        _id: conversationId,
        otherUser: {
          _id: searchedUser._id,
          username: searchedUser.username,
          email: searchedUser.email,
          profileImage: searchedUser.profileImage,
          role: searchedUser.role
        },
        lastMessage: null,
        unreadCount: 0
      };

      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
      setMessages([]);
      setShowNewChatModal(false);
      setSearchEmail('');
      setSearchedUser(null);

      toast.success('Conversa iniciada!');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;
    if (!selectedConversation?.otherUser?._id || !user?._id) {
      toast.error('Conversa inválida');
      return;
    }

    if (sendingMessage) return;

    const messageContent = newMessage.trim();
    const tempMessageId = `temp-${Date.now()}`;

    const tempMessage = {
      _id: tempMessageId,
      conversationId: selectedConversation._id,
      content: messageContent,
      senderId: {
        _id: user._id,
        username: user.username,
        name: user.name || user.username
      },
      receiverId: {
        _id: selectedConversation.otherUser._id,
        username: selectedConversation.otherUser.username
      },
      createdAt: new Date().toISOString(),
      read: false
    };

    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setNewMessage('');
    setSendingMessage(true);

    try {
      const sentMessage = await messageService.sendMessage({
        conversationId: selectedConversation._id,
        receiverId: selectedConversation.otherUser._id,
        content: messageContent,
      });

      socketService.emit('message:send', {
        conversationId: selectedConversation._id,
        content: messageContent,
        receiverId: selectedConversation.otherUser._id
      });

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === tempMessageId ? sentMessage : msg
        )
      );

      loadConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');

      setMessages(prevMessages =>
        prevMessages.filter(msg => msg._id !== tempMessageId)
      );

      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (selectedConversation) {
      socketService.setTyping(selectedConversation._id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mensagens
        </h1>
        <Button onClick={() => setShowNewChatModal(true)}>
          + Nova Conversa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conversas
          </h2>

          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Nenhuma conversa ainda
              </p>
              <Button size="sm" onClick={() => setShowNewChatModal(true)}>
                Iniciar Conversa
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => {
                if (!conv || !conv.otherUser || !conv.otherUser._id) {
                  return null;
                }

                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors
                      ${selectedConversation?._id === conv._id
                        ? 'bg-primary-100 dark:bg-primary-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={conv.otherUser.profileImage}
                        name={conv.otherUser.username || conv.otherUser.name || conv.otherUser.email || 'Usuário'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {conv.otherUser.username || conv.otherUser.name || conv.otherUser.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {conv.otherUser.role === 'PT' ? 'Personal Trainer' : 'Cliente'}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {(conv.unreadCount ?? 0) > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="md:col-span-2 h-[600px] flex flex-col">
          {selectedConversation && selectedConversation.otherUser ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b dark:border-gray-700">
                <Avatar
                  src={selectedConversation.otherUser.profileImage}
                  name={selectedConversation.otherUser.username || selectedConversation.otherUser.name || selectedConversation.otherUser.email || 'Usuário'}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.otherUser.username || selectedConversation.otherUser.name || selectedConversation.otherUser.email}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.otherUser.role === 'PT' ? 'Personal Trainer' : 'Cliente'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma mensagem ainda. Envie a primeira!
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    if (!msg || !msg.senderId) return null;

                    const isMyMessage = msg.senderId._id === user?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[70%] px-4 py-2 rounded-lg
                            ${isMyMessage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }
                          `}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {Object.keys(typingUsers).length > 0 && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    {Object.values(typingUsers)[0]} está digitando...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t dark:border-gray-700">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <Button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                  {sendingMessage ? 'Enviando...' : 'Enviar'}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Selecione uma conversa ou inicie uma nova
              </p>
              <Button onClick={() => setShowNewChatModal(true)}>
                + Nova Conversa
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showNewChatModal}
        onClose={() => {
          setShowNewChatModal(false);
          setSearchEmail('');
          setSearchedUser(null);
        }}
        title="Iniciar Nova Conversa"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email ou Username do usuário
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
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
              >
                Buscar
              </Button>
            </div>
          </div>

          {searchedUser && searchedUser._id && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Usuário encontrado:
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={searchedUser.profileImage}
                    name={searchedUser.username || searchedUser.name || searchedUser.email || 'Usuário'}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {searchedUser.username || searchedUser.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchedUser.role === 'PT' ? 'Personal Trainer' : 'Cliente'}
                    </p>
                  </div>
                </div>
                <Button onClick={handleStartConversation}>
                  Iniciar Conversa
                </Button>
              </div>
            </div>
          )}

          {searchEmail && !searchedUser && !searching && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Nenhum usuário encontrado. Verifique o email/username.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Messages;