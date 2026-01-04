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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const SECRET_KEY = process.env.JWT_SECRET || "pwa_secret_key";
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = yield User_1.User.findById(decoded._id);
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
    }
    catch (error) {
        console.error('Erro de autenticação:', error);
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
});
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acesso negado. Sem permissões suficientes.' });
        }
        next();
    };
};
exports.authorize = authorize;
