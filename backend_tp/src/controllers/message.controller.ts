import { Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }

    const otherUser = await User.findById(userId);
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
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, receiverId, content } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!conversationId || !receiverId || !content) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Destinatário não encontrado' });
    }

    const sender = await User.findById(req.user._id);
    if (!sender) {
      return res.status(404).json({ message: 'Remetente não encontrado' });
    }

    const newMessage = new Message({
      conversationId,
      senderId: req.user._id,
      receiverId,
      content,
      read: false,
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'username email profileImage')
      .populate('receiverId', 'username email profileImage');

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId é obrigatório' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'username email profileImage')
      .populate('receiverId', 'username email profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'username email profileImage role')
      .populate('receiverId', 'username email profileImage role')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach((message: any) => {
      const conversationId = message.conversationId;

      if (!conversationsMap.has(conversationId)) {
        const otherUser =
          message.senderId._id.toString() === userId
            ? message.receiverId
            : message.senderId;

        const unreadCount = messages.filter(
          (m: any) =>
            m.conversationId === conversationId &&
            m.receiverId._id.toString() === userId &&
            !m.read
        ).length;

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
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId é obrigatório' });
    }

    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        conversationId,
        receiverId: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.json({ message: 'Mensagens marcadas como lidas' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar mensagens como lidas' });
  }
};