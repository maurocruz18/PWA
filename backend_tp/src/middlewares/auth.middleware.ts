import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const SECRET_KEY = process.env.JWT_SECRET || "pwa_secret_key";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
  file?: Express.Multer.File;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, SECRET_KEY) as { _id: string; role: string };

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: 'Utilizador não encontrado' });
    }

    if (user.role === 'PT' && !user.isValidated) {
      return res.status(403).json({ message: 'Conta de PT ainda não validada' });
    }

    req.user = {
      _id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado. Sem permissões suficientes.' });
    }

    next();
  };
};