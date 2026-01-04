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
exports.checkExpiredPlans = exports.getClientHistory = exports.getRecentCompletions = exports.getDashboardStats = exports.completeWorkout = exports.completePlan = exports.deletePlan = exports.updatePlan = exports.getPlanById = exports.getPlans = exports.createPlan = void 0;
const TrainingPlan_1 = require("../models/TrainingPlan");
const User_1 = require("../models/User");
const mongodb_1 = require("mongodb");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ============================================================================
// CREATE PLAN
// ============================================================================
const createPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { dayOfWeek, exercises, clientId } = req.body;
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (dayOfWeek === undefined || !exercises || !clientId) {
            return res.status(400).json({ message: 'Dados obrigatórios em falta' });
        }
        const newPlan = new TrainingPlan_1.TrainingPlan({
            dayOfWeek,
            exercises,
            clientId,
            ptId,
            isCompleted: false,
            completions: [],
            weekAssigned: new Date(),
        });
        yield newPlan.save();
        res.status(201).json({
            success: true,
            message: 'Plano criado com sucesso',
            data: newPlan,
        });
    }
    catch (error) {
        console.error('Erro ao criar plano:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao criar plano',
        });
    }
});
exports.createPlan = createPlan;
// ============================================================================
// GET PLANS
// ============================================================================
const getPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        let query = {};
        if (userRole === 'PT') {
            query.ptId = userId;
        }
        else if (userRole === 'CLIENT') {
            query.clientId = userId;
        }
        const plans = yield TrainingPlan_1.TrainingPlan.find(query)
            .populate('clientId', 'username email')
            .populate('ptId', 'username email')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: plans,
        });
    }
    catch (error) {
        console.error('Erro ao buscar planos:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar planos',
        });
    }
});
exports.getPlans = getPlans;
// ============================================================================
// GET PLAN BY ID
// ============================================================================
const getPlanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const plan = yield TrainingPlan_1.TrainingPlan.findById(id)
            .populate('clientId', 'username email')
            .populate('ptId', 'username email');
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        res.json({
            success: true,
            data: plan,
        });
    }
    catch (error) {
        console.error('Erro ao buscar plano:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar plano',
        });
    }
});
exports.getPlanById = getPlanById;
// ============================================================================
// UPDATE PLAN
// ============================================================================
const updatePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { dayOfWeek, exercises } = req.body;
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const plan = yield TrainingPlan_1.TrainingPlan.findById(id);
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        if (plan.ptId.toString() !== ptId.toString()) {
            return res.status(403).json({ message: 'Sem permissão para atualizar este plano' });
        }
        if (dayOfWeek !== undefined)
            plan.dayOfWeek = dayOfWeek;
        if (exercises)
            plan.exercises = exercises;
        yield plan.save();
        res.json({
            success: true,
            message: 'Plano atualizado com sucesso',
            data: plan,
        });
    }
    catch (error) {
        console.error('Erro ao atualizar plano:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao atualizar plano',
        });
    }
});
exports.updatePlan = updatePlan;
// ============================================================================
// DELETE PLAN
// ============================================================================
const deletePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const plan = yield TrainingPlan_1.TrainingPlan.findById(id);
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        if (plan.ptId.toString() !== ptId.toString()) {
            return res.status(403).json({ message: 'Sem permissão para deletar este plano' });
        }
        yield TrainingPlan_1.TrainingPlan.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Plano deletado com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao deletar plano:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao deletar plano',
        });
    }
});
exports.deletePlan = deletePlan;
// ============================================================================
// COMPLETE PLAN (LEGACY)
// ============================================================================
const completePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { planId } = req.params;
        const { status, feedback } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!planId || !userId) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }
        const plan = yield TrainingPlan_1.TrainingPlan.findById(planId).populate('clientId').populate('ptId');
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        if (plan.clientId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Não autorizado' });
        }
        let proofImage = null;
        if (req.file) {
            const uploadsDir = path_1.default.join(__dirname, '../../uploads');
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = `${Date.now()}-${req.file.originalname}`;
            const filepath = path_1.default.join(uploadsDir, filename);
            fs_1.default.writeFileSync(filepath, req.file.buffer);
            proofImage = `/uploads/${filename}`;
        }
        const completion = {
            date: new Date(),
            status: status || 'completed',
            feedback: feedback || null,
            proofImage: proofImage || null,
        };
        plan.completions.push(completion);
        plan.isCompleted = true;
        yield plan.save();
        const socketManager = req.app.locals.socketManager;
        if (socketManager && plan.ptId) {
            socketManager.emitNotification(plan.ptId._id.toString(), {
                id: `workout-${Date.now()}`,
                type: 'workout',
                title: 'Treino Concluído',
                message: `${plan.clientId.username} completou um treino`,
                timestamp: new Date(),
                read: false,
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Treino registado com sucesso',
            data: plan,
        });
    }
    catch (error) {
        console.error('Erro ao completar treino:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao registar treino',
        });
    }
});
exports.completePlan = completePlan;
// ============================================================================
// COMPLETE WORKOUT
// ============================================================================
const completeWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const status = req.body.status;
        const feedback = req.body.feedback;
        const clientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        console.log('=== DEBUG completeWorkout ===');
        console.log('ID:', id);
        console.log('Status:', status);
        console.log('Feedback:', feedback);
        console.log('ClientId:', clientId);
        console.log('req.file:', req.file ? 'Ficheiro presente' : 'Sem ficheiro');
        console.log('req.body keys:', Object.keys(req.body));
        if (!status) {
            return res.status(400).json({
                message: 'Status é obrigatório',
                received: { status, feedback, bodyKeys: Object.keys(req.body) }
            });
        }
        const validStatuses = ['completed', 'late', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Status inválido. Use: completed, late ou failed',
                received: status
            });
        }
        const plan = yield TrainingPlan_1.TrainingPlan.findById(id).populate('ptId');
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        if (plan.clientId.toString() !== clientId.toString()) {
            return res.status(403).json({ message: 'Sem permissão para completar este plano' });
        }
        let proofImage = null;
        if (req.file) {
            const uploadsDir = path_1.default.join(__dirname, '../../uploads');
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = `${Date.now()}-${req.file.originalname}`;
            const filepath = path_1.default.join(uploadsDir, filename);
            fs_1.default.writeFileSync(filepath, req.file.buffer);
            proofImage = `/uploads/${filename}`;
        }
        const completion = {
            date: new Date(),
            status: status,
            feedback: feedback || null,
            proofImage: proofImage || null,
        };
        plan.completions.push(completion);
        if (status === 'completed') {
            plan.isCompleted = true;
        }
        yield plan.save();
        const socketManager = req.app.locals.socketManager;
        if (socketManager && plan.ptId) {
            const ptIdStr = (plan.ptId._id || plan.ptId).toString();
            socketManager.emitNotification(ptIdStr, {
                id: `workout-${Date.now()}`,
                type: 'workout',
                title: 'Treino Concluído',
                message: 'Cliente completou um treino',
                timestamp: new Date(),
                read: false,
            });
        }
        res.json({
            success: true,
            message: 'Treino marcado com sucesso',
            completion: completion,
        });
    }
    catch (error) {
        console.error('Erro em completeWorkout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar treino como concluído',
            error: error.message || 'Erro desconhecido'
        });
    }
});
exports.completeWorkout = completeWorkout;
// ============================================================================
// GET DASHBOARD STATS
// ============================================================================
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weekData = daysOfWeek.map(name => ({
            name,
            concluidos: 0,
            atrasados: 0,
            falhados: 0,
        }));
        let clientIds = [];
        let totalPlans = 0;
        let totalClients = 0;
        if (userRole === 'PT') {
            const clients = yield User_1.User.find({ ptId: new mongodb_1.ObjectId(userId) });
            clientIds = clients.map(c => c._id);
            totalClients = clients.length;
            totalPlans = yield TrainingPlan_1.TrainingPlan.countDocuments({ ptId: new mongodb_1.ObjectId(userId) });
        }
        else if (userRole === 'CLIENT') {
            clientIds = [new mongodb_1.ObjectId(userId)];
            totalPlans = yield TrainingPlan_1.TrainingPlan.countDocuments({ clientId: new mongodb_1.ObjectId(userId) });
        }
        let totalCompleted = 0;
        let totalLate = 0;
        let totalFailed = 0;
        if (clientIds.length > 0) {
            const plans = yield TrainingPlan_1.TrainingPlan.find({ clientId: { $in: clientIds } });
            plans.forEach((plan) => {
                if (plan.completions && Array.isArray(plan.completions)) {
                    plan.completions.forEach((completion) => {
                        const completedDate = new Date(completion.date);
                        if (completedDate >= weekStart && completedDate <= weekEnd) {
                            const dayIndex = completedDate.getDay();
                            if (completion.status === 'completed') {
                                weekData[dayIndex].concluidos++;
                                totalCompleted++;
                            }
                            else if (completion.status === 'late') {
                                weekData[dayIndex].atrasados++;
                                totalLate++;
                            }
                            else if (completion.status === 'failed') {
                                weekData[dayIndex].falhados++;
                                totalFailed++;
                            }
                        }
                    });
                }
            });
        }
        if (userRole === 'PT') {
            return res.json({
                weekData,
                totalClients,
                totalPlans,
                completedThisWeek: totalCompleted,
                lateThisWeek: totalLate,
                failedThisWeek: totalFailed,
            });
        }
        else {
            return res.json({
                weekData,
                totalPlans,
                completedThisWeek: totalCompleted,
                lateThisWeek: totalLate,
                failedThisWeek: totalFailed,
            });
        }
    }
    catch (error) {
        console.error('Erro em getDashboardStats:', error);
        res.status(500).json({
            message: 'Erro ao carregar estatísticas do dashboard',
            error: error.message || 'Erro desconhecido'
        });
    }
});
exports.getDashboardStats = getDashboardStats;
// ============================================================================
// GET RECENT COMPLETIONS
// ============================================================================
const getRecentCompletions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const limit = parseInt(req.query.limit) || 5;
        if (!ptId) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const plans = yield TrainingPlan_1.TrainingPlan.find({ ptId: new mongodb_1.ObjectId(ptId) })
            .populate('clientId', 'username email profileImage')
            .sort({ createdAt: -1 })
            .limit(limit);
        const recentCompletions = [];
        plans.forEach((plan) => {
            if (plan.completions && Array.isArray(plan.completions)) {
                plan.completions.forEach((completion) => {
                    recentCompletions.push({
                        _id: completion._id || `${plan._id}-${completion.date}`,
                        client: plan.clientId,
                        planName: `Dia ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][plan.dayOfWeek]}`,
                        planId: plan._id,
                        date: completion.date,
                        status: completion.status,
                        feedback: completion.feedback,
                        proofImage: completion.proofImage,
                    });
                });
            }
        });
        recentCompletions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const limited = recentCompletions.slice(0, limit);
        res.json(limited);
    }
    catch (error) {
        console.error('Erro em getRecentCompletions:', error);
        res.status(500).json({
            message: 'Erro ao carregar últimas completions',
            error: error.message || 'Erro desconhecido'
        });
    }
});
exports.getRecentCompletions = getRecentCompletions;
// ============================================================================
// GET CLIENT HISTORY
// ============================================================================
const getClientHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { clientId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        if (!ptId) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const plans = yield TrainingPlan_1.TrainingPlan.find({
            ptId: new mongodb_1.ObjectId(ptId),
            clientId: new mongodb_1.ObjectId(clientId),
        }).populate('clientId', 'username email profileImage');
        // Buscar dados do cliente
        const client = yield User_1.User.findById(clientId).select('username email profileImage');
        const history = [];
        plans.forEach((plan) => {
            if (plan.completions && Array.isArray(plan.completions)) {
                plan.completions.forEach((completion) => {
                    history.push({
                        _id: completion._id || `${plan._id}-${completion.date}`,
                        planName: `Dia ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][plan.dayOfWeek]}`,
                        planId: plan._id,
                        date: completion.date,
                        status: completion.status,
                        feedback: completion.feedback,
                        proofImage: completion.proofImage,
                    });
                });
            }
        });
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const limited = history.slice(0, limit);
        const stats = {
            totalCompletions: history.length,
            completed: history.filter(h => h.status === 'completed').length,
            late: history.filter(h => h.status === 'late').length,
            failed: history.filter(h => h.status === 'failed').length,
            completionRate: history.length > 0
                ? ((history.filter(h => h.status === 'completed').length / history.length) * 100).toFixed(2)
                : 0,
        };
        res.json({
            stats,
            history: limited,
            client: client ? {
                _id: client._id,
                username: client.username,
                email: client.email,
                profileImage: client.profileImage
            } : null
        });
    }
    catch (error) {
        console.error('Erro em getClientHistory:', error);
        res.status(500).json({
            message: 'Erro ao carregar histórico do cliente',
            error: error.message || 'Erro desconhecido'
        });
    }
});
exports.getClientHistory = getClientHistory;
// ============================================================================
// CHECK EXPIRED PLANS
// ============================================================================
const checkExpiredPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const clientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!clientId) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        res.json({
            message: 'Verificação de planos expirados concluída',
            updated: 0,
        });
    }
    catch (error) {
        console.error('Erro em checkExpiredPlans:', error);
        res.status(500).json({
            message: 'Erro ao verificar planos expirados',
            error: error.message || 'Erro desconhecido'
        });
    }
});
exports.checkExpiredPlans = checkExpiredPlans;
// ============================================================================
// EXPORTS COMMONJS
// ============================================================================
module.exports = {
    createPlan: exports.createPlan,
    getPlans: exports.getPlans,
    getPlanById: exports.getPlanById,
    updatePlan: exports.updatePlan,
    deletePlan: exports.deletePlan,
    completePlan: exports.completePlan,
    completeWorkout: exports.completeWorkout,
    getDashboardStats: exports.getDashboardStats,
    getRecentCompletions: exports.getRecentCompletions,
    getClientHistory: exports.getClientHistory,
    checkExpiredPlans: exports.checkExpiredPlans,
};
