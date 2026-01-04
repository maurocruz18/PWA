import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado:', this.socket.id);
      this.emit('user-connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    this.socket.on('error', (error) => {
      console.error('Erro socket:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    this.socket.off(event, callback);
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  onNewMessage(callback) {
    this.on('message:new', callback);
  }

  onNotification(callback) {
    this.on('notification:new', callback);
  }

  onWorkoutCompleted(callback) {
    this.on('workout:completed', callback);
  }

  onUserTyping(callback) {
    this.on('user:typing', callback);
  }

  sendMessage(conversationId, content) {
    this.emit('message:send', { conversationId, content });
  }

  setTyping(conversationId) {
    this.emit('user:typing', { conversationId });
  }

  joinConversation(conversationId) {
    this.emit('conversation:join', { conversationId });
  }

  leaveConversation(conversationId) {
    this.emit('conversation:leave', { conversationId });
  }
}

export default new SocketService();