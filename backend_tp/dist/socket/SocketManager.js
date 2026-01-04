"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SocketManager {
    constructor(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: [
                    process.env.FRONTEND_URL || 'http://localhost:3001',
                    'https://pt-platform-frontend.vercel.app', // Coloca aqui o teu URL do Vercel manual para garantir
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
    setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Token não fornecido'));
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'pwa_secret_key');
                socket.userId = decoded._id;
                socket.userRole = decoded.role;
                next();
            }
            catch (error) {
                next(new Error('Token inválido'));
            }
        });
    }
    setupEvents() {
        this.io.on('connection', (socket) => {
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
            socket.on('conversation:join', (data) => {
                const { conversationId } = data;
                socket.join(`conversation:${conversationId}`);
                console.log(`Utilizador ${socket.userId} entrou na conversa ${conversationId}`);
            });
            socket.on('conversation:leave', (data) => {
                const { conversationId } = data;
                socket.leave(`conversation:${conversationId}`);
                console.log(`Utilizador ${socket.userId} saiu da conversa ${conversationId}`);
            });
            socket.on('message:send', (data) => {
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
            socket.on('user:typing', (data) => {
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
            socket.on('message:read', (data) => {
                const { conversationId } = data;
                this.io.to(`conversation:${conversationId}`).emit('message:read', {
                    conversationId,
                    userId: socket.userId,
                });
            });
            socket.on('workout:completed', (data) => {
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
            socket.on('error', (error) => {
                console.error(`Erro socket: ${error}`);
            });
        });
    }
    emitNotification(userId, notification) {
        const socketId = this.users.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('notification:new', notification);
        }
    }
    emitToConversation(conversationId, event, data) {
        this.io.to(`conversation:${conversationId}`).emit(event, data);
    }
    emitToUser(userId, event, data) {
        const socketId = this.users.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }
    getUserSocket(userId) {
        return this.users.get(userId);
    }
    isUserOnline(userId) {
        return this.users.has(userId);
    }
}
exports.default = SocketManager;
