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
exports.createDefaultAdmin = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createDefaultAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ptplatform.com';
        const existingAdmin = yield User_1.User.findOne({ username: adminUsername });
        if (existingAdmin) {
            if (existingAdmin.role !== 'ADMIN') {
                existingAdmin.role = 'ADMIN';
                existingAdmin.isValidated = true;
                yield existingAdmin.save();
                console.log('Utilizador promovido a ADMIN');
            }
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, salt);
        const admin = new User_1.User({
            username: adminUsername,
            password: hashedPassword,
            email: adminEmail,
            role: 'ADMIN',
            isValidated: true,
        });
        yield admin.save();
        console.log('Conta ADMIN criada');
    }
    catch (error) {
        console.error('Erro ao criar admin padrão:', error);
    }
});
exports.createDefaultAdmin = createDefaultAdmin;
