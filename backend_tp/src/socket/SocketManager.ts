import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface CustomSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class SocketManager {
  private io: Server;
  private users: Map<string, string>;
  private conversations: Map<string, Set<string>>;
  private typingUsers: Map<string, Set<string>>;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3001',
        'https://pwa-indol-omega.vercel.app', // Coloca aqui o teu URL do Vercel manual para garantir
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
    });

    this.users = new Map();
    this.conversations = new Map();
    this.typingUsers = new Map();

    this.setupMiddleware();
    this.setupEvents();
  }

  private setupMiddleware(): void {
    this.io.use((socket: CustomSocket, next: any) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token não fornecido'));
      }

      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'pwa_secret_key');
        socket.userId = decoded._id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });
  }

  private setupEvents(): void {
    this.io.on('connection', (socket: CustomSocket) => {
      console.log(`Utilizador conectado: ${socket.userId}`);

      if (socket.userId) {
        this.users.set(socket.userId, socket.id);
      }

      socket.emit('connection-established', {
        message: 'Conectado ao servidor',
        userId: socket.userId,
      });

      socket.on('user-connected', () => {
        this.io.emit('user-status', {
          userId: socket.userId,
          status: 'online',
        });
      });

      socket.on('conversation:join', (data: any) => {
        const { conversationId } = data;
        socket.join(`conversation:${conversationId}`);
        console.log(`Utilizador ${socket.userId} entrou na conversa ${conversationId}`);
      });

      socket.on('conversation:leave', (data: any) => {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
        console.log(`Utilizador ${socket.userId} saiu da conversa ${conversationId}`);
      });

      socket.on('message:send', (data: any) => {
  const { conversationId, content, receiverId } = data;

  socket.to(`conversation:${conversationId}`).emit('message:new', {
    conversationId,
    content,
    senderId: socket.userId,
    timestamp: new Date(),
  });

        if (this.users.has(receiverId)) {
          const receiverSocketId = this.users.get(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('notification:new', {
              type: 'message',
              title: 'Nova Mensagem',
              message: 'Recebeu uma nova mensagem',
              timestamp: new Date(),
            });
          }
        }

        console.log(`Mensagem enviada de ${socket.userId} para ${conversationId}`);
      });

      socket.on('user:typing', (data: any) => {
        const { conversationId } = data;

        if (!this.typingUsers.has(conversationId)) {
          this.typingUsers.set(conversationId, new Set());
        }

        const typingSet = this.typingUsers.get(conversationId);
        if (typingSet) {
          typingSet.add(socket.userId || '');
        }

        this.io.to(`conversation:${conversationId}`).emit('user:typing', {
          conversationId,
          userId: socket.userId,
          username: socket.handshake.auth.username,
        });

        setTimeout(() => {
          const typingSet = this.typingUsers.get(conversationId);
          if (typingSet) {
            typingSet.delete(socket.userId || '');
            if (typingSet.size === 0) {
              this.typingUsers.delete(conversationId);
            }
          }
        }, 3000);
      });

      socket.on('message:read', (data: any) => {
        const { conversationId } = data;
        this.io.to(`conversation:${conversationId}`).emit('message:read', {
          conversationId,
          userId: socket.userId,
        });
      });

      socket.on('workout:completed', (data: any) => {
        const { clientName, planName, ptId } = data;

        if (this.users.has(ptId)) {
          const ptSocketId = this.users.get(ptId);
          if (ptSocketId) {
            this.io.to(ptSocketId).emit('workout:completed', {
              clientName,
              planName,
              timestamp: new Date(),
            });

            this.io.to(ptSocketId).emit('notification:new', {
              type: 'workout',
              title: 'Treino Concluído',
              message: `${clientName} completou o treino de ${planName}`,
              timestamp: new Date(),
            });
          }
        }

        console.log(`Treino concluído: ${clientName} - ${planName}`);
      });

      socket.on('disconnect', () => {
        console.log(`Utilizador desconectado: ${socket.userId}`);
        if (socket.userId) {
          this.users.delete(socket.userId);
        }

        this.io.emit('user-status', {
          userId: socket.userId,
          status: 'offline',
        });
      });

      socket.on('error', (error: any) => {
        console.error(`Erro socket: ${error}`);
      });
    });
  }

  public emitNotification(userId: string, notification: any): void {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification:new', notification);
    }
  }

  public emitToConversation(conversationId: string, event: string, data: any): void {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any): void {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public getUserSocket(userId: string): string | undefined {
    return this.users.get(userId);
  }

  public isUserOnline(userId: string): boolean {
    return this.users.has(userId);
  }
}

export default SocketManager;