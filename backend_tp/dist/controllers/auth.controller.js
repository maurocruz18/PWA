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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrLogin = exports.generateQrToken = exports.getCurrentUser = exports.logout = exports.verifyToken = exports.resetPassword = exports.validateResetToken = exports.forgotPassword = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const email_1 = require("../config/email");
// ============ CONSTANTS ============
const SECRET_KEY = process.env.JWT_SECRET || "pwa_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
// ============ HELPER FUNCTIONS ============
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ _id: userId, role }, SECRET_KEY, { expiresIn: '24h' });
};
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Email inválido');
    }
    return true;
};
const validatePassword = (password, confirmPassword) => {
    if (password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
    }
    if (confirmPassword && password !== confirmPassword) {
        throw new Error('Senhas não correspondem');
    }
    return true;
};
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
});
const comparePassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return bcryptjs_1.default.compare(password, hash);
});
const generateResetToken = () => {
    const token = node_crypto_1.default.randomBytes(32).toString('hex');
    const hashed = node_crypto_1.default.createHash('sha256').update(token).digest('hex');
    return { token, hashed };
};
const sanitizeUser = (user) => {
    const _a = user.toObject ? user.toObject() : user, { password: _ } = _a, userResponse = __rest(_a, ["password"]);
    return userResponse;
};
// ============ AUTH CONTROLLER ============
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, confirmPassword, role, profileImage } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email e senha são obrigatórios." });
        }
        validateEmail(email);
        validatePassword(password, confirmPassword);
        const existingUsername = yield User_1.User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: "O nome de utilizador já existe." });
        }
        const existingEmail = yield User_1.User.findOne({ email: email.trim() });
        if (existingEmail) {
            return res.status(409).json({ message: "O email já está registado." });
        }
        let assignedPtId = undefined;
        let isValidated = false;
        let assignedRole = role || 'CLIENT';
        if (req.user && req.user.role === 'PT' && assignedRole === 'CLIENT') {
            assignedPtId = req.user._id;
            isValidated = true;
        }
        else {
            isValidated = assignedRole === 'PT' ? false : true;
        }
        const hashedPassword = yield hashPassword(password);
        const newUser = new User_1.User({
            username,
            email: email.trim(),
            password: hashedPassword,
            role: assignedRole,
            profileImage,
            ptId: assignedPtId,
            isValidated: isValidated,
        });
        yield newUser.save();
        const token = generateToken(newUser._id.toString(), newUser.role);
        const userResponse = sanitizeUser(newUser);
        return res.status(201).json({
            success: true,
            message: 'Utilizador registado com sucesso.',
            token,
            user: userResponse,
        });
    }
    catch (err) {
        console.error('Erro no registro:', err);
        return res.status(500).json({
            success: false,
            error: err.message || "Erro ao registar utilizador.",
        });
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username e senha são obrigatórios." });
        }
        const user = yield User_1.User.findOne({
            $or: [{ username }, { email: username }]
        });
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }
        const isPasswordValid = yield comparePassword(password, user.password);
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
    }
    catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({
            success: false,
            error: err.message || "Erro ao fazer login.",
        });
    }
});
exports.login = login;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ message: "Username ou email é obrigatório" });
        }
        const user = yield User_1.User.findOne({
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
        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        yield user.save();
        const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
        const emailContent = email_1.emailTemplates.passwordReset(user.username, resetLink);
        yield email_1.transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        });
        return res.status(200).json({
            message: "Se este utilizador existir, receberá um email com instruções para redefinir a senha."
        });
    }
    catch (err) {
        console.error('Erro no forgot password:', err);
        return res.status(500).json({ error: "Erro ao processar pedido." });
    }
});
exports.forgotPassword = forgotPassword;
const validateResetToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: "Token é obrigatório" });
        }
        const hashedToken = node_crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = yield User_1.User.findOne({
            $or: [
                { resetPasswordToken: hashedToken },
            ]
        });
        if (!user || !user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
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
    }
    catch (err) {
        console.error('Erro ao validar token:', err);
        return res.status(500).json({ error: "Erro ao validar token." });
    }
});
exports.validateResetToken = validateResetToken;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token é obrigatório" });
        }
        if (!password) {
            return res.status(400).json({ message: "Nova senha é obrigatória" });
        }
        validatePassword(password, confirmPassword);
        const hashedToken = node_crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = yield User_1.User.findOne({
            $or: [
                { resetPasswordToken: hashedToken },
            ]
        });
        if (!user || !user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({
                message: "Token inválido ou expirado. Solicite uma nova recuperação de senha."
            });
        }
        user.password = yield hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        if (user.email) {
            const emailContent = email_1.emailTemplates.passwordChanged(user.username);
            yield email_1.transporter.sendMail({
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
    }
    catch (err) {
        console.error('Erro ao redefinir senha:', err);
        return res.status(500).json({ error: err.message || "Erro ao redefinir senha." });
    }
});
exports.resetPassword = resetPassword;
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        return res.status(200).json({
            success: true,
            valid: true,
            data: decoded
        });
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            valid: false,
            message: 'Token inválido ou expirado'
        });
    }
});
exports.verifyToken = verifyToken;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message || 'Erro ao fazer logout'
        });
    }
});
exports.logout = logout;
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const user = yield User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        const userResponse = sanitizeUser(user);
        return res.status(200).json({
            success: true,
            user: userResponse
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message || 'Erro ao obter utilizador'
        });
    }
});
exports.getCurrentUser = getCurrentUser;
const generateQrToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        // Gerar token JWT que é válido por 5 minutos
        const qrToken = jsonwebtoken_1.default.sign({ _id: userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '5m' });
        console.log('✓ QR Token gerado para:', userId);
        res.json({
            success: true,
            qrToken
        });
    }
    catch (error) {
        console.error('Erro ao gerar QR token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao gerar QR Code'
        });
    }
});
exports.generateQrToken = generateQrToken;
const qrLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qrToken } = req.body;
        if (!qrToken) {
            return res.status(400).json({ message: 'Token QR inválido' });
        }
        console.log('QR Login tentando com token:', qrToken.substring(0, 20) + '...');
        try {
            // Verificar o token JWT
            const decoded = jsonwebtoken_1.default.verify(qrToken, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Token decodificado para user:', decoded._id);
            // Buscar o utilizador
            const user = yield User_1.User.findById(decoded._id);
            if (!user) {
                return res.status(401).json({ message: 'Utilizador não encontrado' });
            }
            // Gerar novo token de sessão (24h)
            const newToken = jsonwebtoken_1.default.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
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
        }
        catch (tokenError) {
            console.error('Erro ao verificar token QR:', tokenError.message);
            return res.status(401).json({ message: 'Token QR inválido ou expirado' });
        }
    }
    catch (error) {
        console.error('✗ Erro em qrLogin:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao fazer login com QR Code',
            error: error.message
        });
    }
});
exports.qrLogin = qrLogin;
exports.default = {
    register: exports.register,
    login: exports.login,
    forgotPassword: exports.forgotPassword,
    validateResetToken: exports.validateResetToken,
    resetPassword: exports.resetPassword,
    verifyToken: exports.verifyToken,
    logout: exports.logout,
    getCurrentUser: exports.getCurrentUser,
};
