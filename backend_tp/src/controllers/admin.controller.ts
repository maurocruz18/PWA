import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/User';
import { TrainingPlan } from '../models/TrainingPlan';

// Dashboard do Admin - Estatísticas gerais
export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
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
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'CLIENT' });
    const totalPTs = await User.countDocuments({ role: 'PT', isValidated: true });
    const pendingPTs = await User.countDocuments({ role: 'PT', isValidated: false });

    // Contar planos
    const totalPlans = await TrainingPlan.countDocuments();

    // Buscar todos os planos para calcular completamentos
    const allPlans = await TrainingPlan.find();

    let completedThisWeek = 0;
    let lateThisWeek = 0;
    let failedThisWeek = 0;
    let completedThisMonth = 0;

    allPlans.forEach(plan => {
      plan.completions.forEach(completion => {
        const completionDate = new Date(completion.date);
        
        if (completionDate >= startOfWeek) {
          if (completion.status === 'completed') completedThisWeek++;
          else if (completion.status === 'late') lateThisWeek++;
          else if (completion.status === 'failed') failedThisWeek++;
        }

        if (completionDate >= startOfMonth) {
          if (completion.status === 'completed' || completion.status === 'late') {
            completedThisMonth++;
          }
        }
      });
    });

    // Top 5 PTs mais ativos (com mais treinos concluídos pelos clientes)
    const ptStats = await TrainingPlan.aggregate([
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

    const topPTs = await Promise.all(
      ptStats.map(async (pt) => {
        const ptUser = await User.findById(pt._id).select('username email profileImage');
        return {
          ...ptUser?.toObject(),
          completions: pt.completions
        };
      })
    );

    // Top 5 Clientes mais ativos
    const clientStats = await TrainingPlan.aggregate([
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

    const topClients = await Promise.all(
      clientStats.map(async (client) => {
        const clientUser = await User.findById(client._id).select('username email profileImage');
        return {
          ...clientUser?.toObject(),
          completions: client.completions
        };
      })
    );

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
  } catch (err) {
    console.error('Erro ao buscar dashboard admin:', err);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};

// Listar atividade recente (últimos 20 completamentos)
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Apenas admins podem acessar' });
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const plans = await TrainingPlan.find()
      .populate('clientId', 'username email profileImage')
      .populate('ptId', 'username email profileImage')
      .sort({ updatedAt: -1 });

    const allCompletions: any[] = [];

    plans.forEach((plan: any) => {
      if (plan.completions && plan.completions.length > 0) {
        plan.completions.forEach((completion: any) => {
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
  } catch (err) {
    console.error('Erro ao buscar atividade recente:', err);
    res.status(500).json({ error: 'Erro ao buscar atividade' });
  }
};