import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { transporter, emailTemplates } from '../config/email';

// ============ TYPES & INTERFACES ============

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    email?: string;
    username?: string;

  };
  token?: string;
  decodedToken?: any;
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: 'CLIENT' | 'PT' | 'ADMIN';
  profileImage?: string;
}

export interface ResetPasswordRequestBody {
  token?: string;
  password: string;
  confirmPassword?: string;
}

export interface ForgotPasswordRequestBody {
  identifier: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: string;
}

// ============ CONSTANTS ============

const SECRET_KEY: string = process.env.JWT_SECRET || "pwa_secret_key";
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3001";

// ============ HELPER FUNCTIONS ============

const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { _id: userId, role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }
  return true;
};

const validatePassword = (password: string, confirmPassword?: string): boolean => {
  if (password.length < 6) {
    throw new Error('Senha deve ter no mínimo 6 caracteres');
  }
  if (confirmPassword && password !== confirmPassword) {
    throw new Error('Senhas não correspondem');
  }
  return true;
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const generateResetToken = (): { token: string; hashed: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashed };
};

const sanitizeUser = (user: any) => {
  const { password: _, ...userResponse } = user.toObject ? user.toObject() : user;
  return userResponse;
};

// ============ AUTH CONTROLLER ============

export const register = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const { username, email, password, confirmPassword, role, profileImage } = req.body as RegisterRequestBody;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email e senha são obrigatórios." });
    }

    validateEmail(email);
    validatePassword(password, confirmPassword);

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "O nome de utilizador já existe." });
    }

    const existingEmail = await User.findOne({ email: email.trim() });
    if (existingEmail) {
      return res.status(409).json({ message: "O email já está registado." });
    }

    let assignedPtId = undefined;
    let isValidated = false;
    let assignedRole = role || 'CLIENT';

    if (req.user && req.user.role === 'PT' && assignedRole === 'CLIENT') {
      assignedPtId = req.user._id;
      isValidated = true;
    } else {
      isValidated = assignedRole === 'PT' ? false : true;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username,
      email: email.trim(),
      password: hashedPassword,
      role: assignedRole,
      profileImage,
      ptId: assignedPtId,
      isValidated: isValidated,
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString(), newUser.role);
    const userResponse = sanitizeUser(newUser);

    return res.status(201).json({
      success: true,
      message: 'Utilizador registado com sucesso.',
      token,
      user: userResponse,
    });
  } catch (err: any) {
    console.error('Erro no registro:', err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erro ao registar utilizador.",
    });
  }
};

export const login = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const { username, password } = req.body as LoginRequestBody;

    if (!username || !password) {
      return res.status(400).json({ message: "Username e senha são obrigatórios." });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = generateToken(user._id.toString(), user.role);
    const userResponse = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso.',
      token,
      user: userResponse,
    });
  } catch (err: any) {
    console.error('Erro no login:', err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erro ao fazer login.",
    });
  }
};



export const forgotPassword = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const { identifier } = req.body as ForgotPasswordRequestBody;

    if (!identifier) {
      return res.status(400).json({ message: "Username ou email é obrigatório" });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier.trim() },
        { email: identifier.trim() }
      ]
    });

    if (!user || !user.email) {
      return res.status(200).json({
        message: "Se este utilizador existir, receberá um email com instruções para redefinir a senha."
      });
    }

    const { token, hashed } = generateResetToken();

    (user as any).resetPasswordToken = hashed;
    (user as any).resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
    const emailContent = emailTemplates.passwordReset(user.username, resetLink);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return res.status(200).json({
      message: "Se este utilizador existir, receberá um email com instruções para redefinir a senha."
    });

  } catch (err: any) {
    console.error('Erro no forgot password:', err);
    return res.status(500).json({ error: "Erro ao processar pedido." });
  }
};

export const validateResetToken = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token é obrigatório" });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      $or: [
        { resetPasswordToken: hashedToken },
      ]
    });

    if (!user || !(user as any).resetPasswordExpires || new Date() > (user as any).resetPasswordExpires) {
      return res.status(400).json({
        valid: false,
        message: "Token inválido ou expirado. Solicite uma nova recuperação de senha."
      });
    }

    return res.status(200).json({
      valid: true,
      username: user.username,
      email: user.email
    });

  } catch (err: any) {
    console.error('Erro ao validar token:', err);
    return res.status(500).json({ error: "Erro ao validar token." });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body as ResetPasswordRequestBody;

    if (!token) {
      return res.status(400).json({ message: "Token é obrigatório" });
    }

    if (!password) {
      return res.status(400).json({ message: "Nova senha é obrigatória" });
    }

    validatePassword(password, confirmPassword);

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      $or: [
        { resetPasswordToken: hashedToken },
      ]
    });

    if (!user || !(user as any).resetPasswordExpires || new Date() > (user as any).resetPasswordExpires) {
      return res.status(400).json({
        message: "Token inválido ou expirado. Solicite uma nova recuperação de senha."
      });
    }

    user.password = await hashPassword(password);
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpires = undefined;
    await user.save();

    if (user.email) {
      const emailContent = emailTemplates.passwordChanged(user.username);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso! Pode agora fazer login com a nova senha."
    });

  } catch (err: any) {
    console.error('Erro ao redefinir senha:', err);
    return res.status(500).json({ error: err.message || "Erro ao redefinir senha." });
  }
};

export const verifyToken = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    return res.status(200).json({
      success: true,
      valid: true,
      data: decoded
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Token inválido ou expirado'
    });
  }
};

export const logout = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao fazer logout'
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    const userResponse = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao obter utilizador'
    });
  }
};
export const generateQrToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    // Gerar token JWT que é válido por 5 minutos
    const qrToken = jwt.sign(
      { _id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '5m' }
    );

    console.log('✓ QR Token gerado para:', userId);

    res.json({
      success: true,
      qrToken
    });
  } catch (error: any) {
    console.error('Erro ao gerar QR token:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao gerar QR Code' 
    });
  }
};

export const qrLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ message: 'Token QR inválido' });
    }

    console.log('QR Login tentando com token:', qrToken.substring(0, 20) + '...');

    try {
      // Verificar o token JWT
      const decoded: any = jwt.verify(
        qrToken, 
        process.env.JWT_SECRET || 'your-secret-key'
      );
      
      console.log('Token decodificado para user:', decoded._id);

      // Buscar o utilizador
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(401).json({ message: 'Utilizador não encontrado' });
      }

      // Gerar novo token de sessão (24h)
      const newToken = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✓ Login QR bem-sucedido para:', user.username);

      res.json({
        success: true,
        token: newToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage || null,
          themePreference: user.themePreference || 'dark',
          isValidated: user.isValidated,
          ptId: user.ptId || null
        }
      });
    } catch (tokenError: any) {
      console.error('Erro ao verificar token QR:', tokenError.message);
      return res.status(401).json({ message: 'Token QR inválido ou expirado' });
    }
  } catch (error: any) {
    console.error('✗ Erro em qrLogin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao fazer login com QR Code',
      error: error.message 
    });
  }
};

export default {
  register,
  login,
  forgotPassword,
  validateResetToken,
  resetPassword,
  verifyToken,
  logout,
  getCurrentUser,
};