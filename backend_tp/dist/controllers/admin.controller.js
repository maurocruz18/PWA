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
exports.getRecentActivity = exports.getAdminDashboard = void 0;
const User_1 = require("../models/User");
const TrainingPlan_1 = require("../models/TrainingPlan");
// Dashboard do Admin - Estatísticas gerais
const getAdminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Apenas admins podem acessar' });
        }
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Contar utilizadores
        const totalUsers = yield User_1.User.countDocuments();
        const totalClients = yield User_1.User.countDocuments({ role: 'CLIENT' });
        const totalPTs = yield User_1.User.countDocuments({ role: 'PT', isValidated: true });
        const pendingPTs = yield User_1.User.countDocuments({ role: 'PT', isValidated: false });
        // Contar planos
        const totalPlans = yield TrainingPlan_1.TrainingPlan.countDocuments();
        // Buscar todos os planos para calcular completamentos
        const allPlans = yield TrainingPlan_1.TrainingPlan.find();
        let completedThisWeek = 0;
        let lateThisWeek = 0;
        let failedThisWeek = 0;
        let completedThisMonth = 0;
        allPlans.forEach(plan => {
            plan.completions.forEach(completion => {
                const completionDate = new Date(completion.date);
                if (completionDate >= startOfWeek) {
                    if (completion.status === 'completed')
                        completedThisWeek++;
                    else if (completion.status === 'late')
                        lateThisWeek++;
                    else if (completion.status === 'failed')
                        failedThisWeek++;
                }
                if (completionDate >= startOfMonth) {
                    if (completion.status === 'completed' || completion.status === 'late') {
                        completedThisMonth++;
                    }
                }
            });
        });
        // Top 5 PTs mais ativos (com mais treinos concluídos pelos clientes)
        const ptStats = yield TrainingPlan_1.TrainingPlan.aggregate([
            {
                $unwind: '$completions'
            },
            {
                $match: {
                    'completions.date': { $gte: startOfWeek },
                    'completions.status': { $in: ['completed', 'late'] }
                }
            },
            {
                $group: {
                    _id: '$ptId',
                    completions: { $sum: 1 }
                }
            },
            {
                $sort: { completions: -1 }
            },
            {
                $limit: 5
            }
        ]);
        const topPTs = yield Promise.all(ptStats.map((pt) => __awaiter(void 0, void 0, void 0, function* () {
            const ptUser = yield User_1.User.findById(pt._id).select('username email profileImage');
            return Object.assign(Object.assign({}, ptUser === null || ptUser === void 0 ? void 0 : ptUser.toObject()), { completions: pt.completions });
        })));
        // Top 5 Clientes mais ativos
        const clientStats = yield TrainingPlan_1.TrainingPlan.aggregate([
            {
                $unwind: '$completions'
            },
            {
                $match: {
                    'completions.date': { $gte: startOfWeek },
                    'completions.status': { $in: ['completed', 'late'] }
                }
            },
            {
                $group: {
                    _id: '$clientId',
                    completions: { $sum: 1 }
                }
            },
            {
                $sort: { completions: -1 }
            },
            {
                $limit: 5
            }
        ]);
        const topClients = yield Promise.all(clientStats.map((client) => __awaiter(void 0, void 0, void 0, function* () {
            const clientUser = yield User_1.User.findById(client._id).select('username email profileImage');
            return Object.assign(Object.assign({}, clientUser === null || clientUser === void 0 ? void 0 : clientUser.toObject()), { completions: client.completions });
        })));
        res.json({
            overview: {
                totalUsers,
                totalClients,
                totalPTs,
                pendingPTs,
                totalPlans,
            },
            thisWeek: {
                completed: completedThisWeek,
                late: lateThisWeek,
                failed: failedThisWeek,
                total: completedThisWeek + lateThisWeek + failedThisWeek
            },
            thisMonth: {
                completed: completedThisMonth
            },
            topPTs,
            topClients
        });
    }
    catch (err) {
        console.error('Erro ao buscar dashboard admin:', err);
        res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
});
exports.getAdminDashboard = getAdminDashboard;
// Listar atividade recente (últimos 20 completamentos)
const getRecentActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Apenas admins podem acessar' });
        }
        const limit = parseInt(req.query.limit) || 20;
        const plans = yield TrainingPlan_1.TrainingPlan.find()
            .populate('clientId', 'username email profileImage')
            .populate('ptId', 'username email profileImage')
            .sort({ updatedAt: -1 });
        const allCompletions = [];
        plans.forEach((plan) => {
            if (plan.completions && plan.completions.length > 0) {
                plan.completions.forEach((completion) => {
                    allCompletions.push({
                        _id: completion._id,
                        planId: plan._id,
                        client: plan.clientId,
                        pt: plan.ptId,
                        date: completion.date,
                        status: completion.status,
                        feedback: completion.feedback,
                        proofImage: completion.proofImage,
                    });
                });
            }
        });
        allCompletions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const recentActivity = allCompletions.slice(0, limit);
        res.json(recentActivity);
    }
    catch (err) {
        console.error('Erro ao buscar atividade recente:', err);
        res.status(500).json({ error: 'Erro ao buscar atividade' });
    }
});
exports.getRecentActivity = getRecentActivity;
