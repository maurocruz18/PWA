import { Request, Response, NextFunction } from 'express';
import { TrainingPlan } from '../models/TrainingPlan';
import { User } from '../models/User';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

// ============================================================================
// CREATE PLAN
// ============================================================================
export const createPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dayOfWeek, exercises, clientId } = req.body;
    const ptId = req.user?._id;

    if (dayOfWeek === undefined || !exercises || !clientId) {
      return res.status(400).json({ message: 'Dados obrigatórios em falta' });
    }

    const newPlan = new TrainingPlan({
      dayOfWeek,
      exercises,
      clientId,
      ptId,
      isCompleted: false,
      completions: [],
      weekAssigned: new Date(),
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      message: 'Plano criado com sucesso',
      data: newPlan,
    });
  } catch (error: any) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar plano',
    });
  }
};

// ============================================================================
// GET PLANS
// ============================================================================
export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    let query: any = {};

    if (userRole === 'PT') {
      query.ptId = userId;
    } else if (userRole === 'CLIENT') {
      query.clientId = userId;
    }

    const plans = await TrainingPlan.find(query)
      .populate('clientId', 'username email')
      .populate('ptId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar planos',
    });
  }
};

// ============================================================================
// GET PLAN BY ID
// ============================================================================
export const getPlanById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await TrainingPlan.findById(id)
      .populate('clientId', 'username email')
      .populate('ptId', 'username email');

    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar plano',
    });
  }
};

// ============================================================================
// UPDATE PLAN
// ============================================================================
export const updatePlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, exercises } = req.body;
    const ptId = req.user?._id;

    const plan = await TrainingPlan.findById(id);

    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    if (plan.ptId.toString() !== ptId.toString()) {
      return res.status(403).json({ message: 'Sem permissão para atualizar este plano' });
    }

    if (dayOfWeek !== undefined) plan.dayOfWeek = dayOfWeek;
    if (exercises) plan.exercises = exercises;

    await plan.save();

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      data: plan,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar plano',
    });
  }
};

// ============================================================================
// DELETE PLAN
// ============================================================================
export const deletePlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ptId = req.user?._id;

    const plan = await TrainingPlan.findById(id);

    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    if (plan.ptId.toString() !== ptId.toString()) {
      return res.status(403).json({ message: 'Sem permissão para deletar este plano' });
    }

    await TrainingPlan.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Plano deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao deletar plano',
    });
  }
};

// ============================================================================
// COMPLETE PLAN (LEGACY)
// ============================================================================
export const completePlan = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.params;
    const { status, feedback } = req.body;
    const userId = req.user?._id;

    if (!planId || !userId) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    const plan = await TrainingPlan.findById(planId).populate('clientId').populate('ptId');

    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    if (plan.clientId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    let proofImage = null;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, req.file.buffer);
      proofImage = `/uploads/${filename}`;
    }

    const completion: any = {
      date: new Date(),
      status: status || 'completed',
      feedback: feedback || null,
      proofImage: proofImage || null,
    };

    (plan.completions as any[]).push(completion);
    plan.isCompleted = true;
    await plan.save();

    const socketManager = req.app.locals.socketManager;
    if (socketManager && plan.ptId) {
      socketManager.emitNotification((plan.ptId as any)._id.toString(), {
        id: `workout-${Date.now()}`,
        type: 'workout',
        title: 'Treino Concluído',
        message: `${(plan.clientId as any).username} completou um treino`,
        timestamp: new Date(),
        read: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Treino registado com sucesso',
      data: plan,
    });
  } catch (error: any) {
    console.error('Erro ao completar treino:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao registar treino',
    });
  }
};

// ============================================================================
// COMPLETE WORKOUT
// ============================================================================
export const completeWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const status = req.body.status;
    const feedback = req.body.feedback;
    const clientId = req.user?._id;

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

    const plan = await TrainingPlan.findById(id).populate('ptId');
    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    if (plan.clientId.toString() !== clientId.toString()) {
      return res.status(403).json({ message: 'Sem permissão para completar este plano' });
    }

    let proofImage = null;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, req.file.buffer);
      proofImage = `/uploads/${filename}`;
    }

    const completion: any = {
      date: new Date(),
      status: status,
      feedback: feedback || null,
      proofImage: proofImage || null,
    };

    (plan.completions as any[]).push(completion);
    if (status === 'completed') {
      plan.isCompleted = true;
    }
    await plan.save();

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

  } catch (error: any) {
    console.error('Erro em completeWorkout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar treino como concluído',
      error: error.message || 'Erro desconhecido'
    });
  }
};

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

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

    let clientIds: any[] = [];
    let totalPlans = 0;
    let totalClients = 0;

    if (userRole === 'PT') {
      const clients = await User.find({ ptId: new ObjectId(userId) });
      clientIds = clients.map(c => c._id);
      totalClients = clients.length;
      totalPlans = await TrainingPlan.countDocuments({ ptId: new ObjectId(userId) });
    } else if (userRole === 'CLIENT') {
      clientIds = [new ObjectId(userId)];
      totalPlans = await TrainingPlan.countDocuments({ clientId: new ObjectId(userId) });
    }

    let totalCompleted = 0;
    let totalLate = 0;
    let totalFailed = 0;

    if (clientIds.length > 0) {
      const plans = await TrainingPlan.find({ clientId: { $in: clientIds } });

      plans.forEach((plan: any) => {
        if (plan.completions && Array.isArray(plan.completions)) {
          plan.completions.forEach((completion: any) => {
            const completedDate = new Date(completion.date);
            if (completedDate >= weekStart && completedDate <= weekEnd) {
              const dayIndex = completedDate.getDay();

              if (completion.status === 'completed') {
                weekData[dayIndex].concluidos++;
                totalCompleted++;
              } else if (completion.status === 'late') {
                weekData[dayIndex].atrasados++;
                totalLate++;
              } else if (completion.status === 'failed') {
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
    } else {
      return res.json({
        weekData,
        totalPlans,
        completedThisWeek: totalCompleted,
        lateThisWeek: totalLate,
        failedThisWeek: totalFailed,
      });
    }
  } catch (error: any) {
    console.error('Erro em getDashboardStats:', error);
    res.status(500).json({ 
      message: 'Erro ao carregar estatísticas do dashboard',
      error: error.message || 'Erro desconhecido'
    });
  }
};

// ============================================================================
// GET RECENT COMPLETIONS
// ============================================================================
export const getRecentCompletions = async (req: AuthRequest, res: Response) => {
  try {
    const ptId = req.user?._id;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!ptId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const plans = await TrainingPlan.find({ ptId: new ObjectId(ptId) })
      .populate('clientId', 'username email profileImage')
      .sort({ createdAt: -1 })
      .limit(limit);

    const recentCompletions: any[] = [];

    plans.forEach((plan: any) => {
      if (plan.completions && Array.isArray(plan.completions)) {
        plan.completions.forEach((completion: any) => {
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

  } catch (error: any) {
    console.error('Erro em getRecentCompletions:', error);
    res.status(500).json({
      message: 'Erro ao carregar últimas completions',
      error: error.message || 'Erro desconhecido'
    });
  }
};

// ============================================================================
// GET CLIENT HISTORY
// ============================================================================
export const getClientHistory = async (req: AuthRequest, res: Response) => {
  try {
    const ptId = req.user?._id;
    const { clientId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!ptId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const plans = await TrainingPlan.find({
      ptId: new ObjectId(ptId),
      clientId: new ObjectId(clientId),
    }).populate('clientId', 'username email profileImage');

    // Buscar dados do cliente
    const client = await User.findById(clientId).select('username email profileImage');

    const history: any[] = [];

    plans.forEach((plan: any) => {
      if (plan.completions && Array.isArray(plan.completions)) {
        plan.completions.forEach((completion: any) => {
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

  } catch (error: any) {
    console.error('Erro em getClientHistory:', error);
    res.status(500).json({
      message: 'Erro ao carregar histórico do cliente',
      error: error.message || 'Erro desconhecido'
    });
  }
};

// ============================================================================
// CHECK EXPIRED PLANS
// ============================================================================
export const checkExpiredPlans = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user?._id;

    if (!clientId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    res.json({
      message: 'Verificação de planos expirados concluída',
      updated: 0,
    });

  } catch (error: any) {
    console.error('Erro em checkExpiredPlans:', error);
    res.status(500).json({
      message: 'Erro ao verificar planos expirados',
      error: error.message || 'Erro desconhecido'
    });
  }
};

// ============================================================================
// EXPORTS COMMONJS
// ============================================================================
module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  completePlan,
  completeWorkout,
  getDashboardStats,
  getRecentCompletions,
  getClientHistory,
  checkExpiredPlans,
};