"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getConversations = exports.getMessages = exports.sendMessage = exports.createConversation = void 0;
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'userId é obrigatório' });
        }
        const otherUser = yield User_1.User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        const sortedIds = [req.user._id, userId].sort();
        const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;
        res.json({
            _id: conversationId,
            otherUser: {
                _id: otherUser._id,
                username: otherUser.username,
                email: otherUser.email,
                profileImage: otherUser.profileImage,
                role: otherUser.role
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao criar conversa' });
    }
});
exports.createConversation = createConversation;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, receiverId, content } = req.body;
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        if (!conversationId || !receiverId || !content) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }
        const receiver = yield User_1.User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Destinatário não encontrado' });
        }
        const sender = yield User_1.User.findById(req.user._id);
        if (!sender) {
            return res.status(404).json({ message: 'Remetente não encontrado' });
        }
        const newMessage = new Message_1.Message({
            conversationId,
            senderId: req.user._id,
            receiverId,
            content,
            read: false,
        });
        yield newMessage.save();
        const populatedMessage = yield Message_1.Message.findById(newMessage._id)
            .populate('senderId', 'username email profileImage')
            .populate('receiverId', 'username email profileImage');
        res.status(201).json(populatedMessage);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        if (!conversationId) {
            return res.status(400).json({ message: 'conversationId é obrigatório' });
        }
        const messages = yield Message_1.Message.find({ conversationId })
            .populate('senderId', 'username email profileImage')
            .populate('receiverId', 'username email profileImage')
            .sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});
exports.getMessages = getMessages;
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const userId = req.user._id;
        const messages = yield Message_1.Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        })
            .populate('senderId', 'username email profileImage role')
            .populate('receiverId', 'username email profileImage role')
            .sort({ createdAt: -1 });
        const conversationsMap = new Map();
        messages.forEach((message) => {
            const conversationId = message.conversationId;
            if (!conversationsMap.has(conversationId)) {
                const otherUser = message.senderId._id.toString() === userId
                    ? message.receiverId
                    : message.senderId;
                const unreadCount = messages.filter((m) => m.conversationId === conversationId &&
                    m.receiverId._id.toString() === userId &&
                    !m.read).length;
                conversationsMap.set(conversationId, {
                    _id: conversationId,
                    otherUser,
                    lastMessage: {
                        content: message.content,
                        createdAt: message.createdAt,
                    },
                    unreadCount,
                    updatedAt: message.createdAt,
                });
            }
        });
        const conversations = Array.from(conversationsMap.values());
        conversations.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        res.json(conversations);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar conversas' });
    }
});
exports.getConversations = getConversations;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        if (!conversationId) {
            return res.status(400).json({ message: 'conversationId é obrigatório' });
        }
        const currentUserId = req.user._id;
        yield Message_1.Message.updateMany({
            conversationId,
            receiverId: currentUserId,
            read: false,
        }, { read: true });
        res.json({ message: 'Mensagens marcadas como lidas' });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao marcar mensagens como lidas' });
    }
});
exports.markAsRead = markAsRead;
