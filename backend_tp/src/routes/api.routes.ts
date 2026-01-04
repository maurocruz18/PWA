import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
// Auth Controllers - Import como named exports
import * as authController from '../controllers/auth.controller';
import { parseFormDataSingle } from '../middlewares/parseFormData';
import { qrLogin, generateQrToken } from '../controllers/auth.controller';

// Multer - importar com try/catch
let uploadSingle: any = (req: any, res: any, next: any) => next();
let uploadMultiple: any = (req: any, res: any, next: any) => next();

// Plan Controllers - Com fallback
let createPlan: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let getPlans: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let completeWorkout: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let getDashboardStats: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let getRecentCompletions: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let getClientHistory: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let checkExpiredPlans: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let getPlanById: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let updatePlan: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });
let deletePlan: any = (req: any, res: any) => res.status(500).json({ message: 'Plan controller não configurado' });

try {
  const planController = require('../controllers/plan.controller');
  createPlan = planController.createPlan;
  getPlans = planController.getPlans;
  completeWorkout = planController.completeWorkout;
  getDashboardStats = planController.getDashboardStats;
  getRecentCompletions = planController.getRecentCompletions;
  getClientHistory = planController.getClientHistory;
  checkExpiredPlans = planController.checkExpiredPlans;
  getPlanById = planController.getPlanById;
  updatePlan = planController.updatePlan;
  deletePlan = planController.deletePlan;
} catch (e) {
  console.log('Plan controller não configurado');
}

// User Controllers - Com fallback
let searchUser: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getAllUsers: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getPendingPTs: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let validateUser: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let deleteUser: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getMyClients: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let updateProfile: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let requestPT: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getAvailablePTs: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let addClientByPT: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let assignExistingClient: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let requestPTChange: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let respondToPTChangeRequest: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getPendingPTChangeRequests: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getPTChangeRequestsForMe: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let cancelPTChangeRequest: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getMyPTChangeHistory: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let requestClient: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let respondToClientRequest: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getPendingClientRequests: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });
let getMyClientRequests: any = (req: any, res: any) => res.status(500).json({ message: 'User controller não configurado' });

try {
  const userController = require('../controllers/User.controller');
  searchUser = userController.searchUser;
  getAllUsers = userController.getAllUsers;
  getPendingPTs = userController.getPendingPTs;
  validateUser = userController.validateUser;
  deleteUser = userController.deleteUser;
  getMyClients = userController.getMyClients;
  updateProfile = userController.updateProfile;
  requestPT = userController.requestPT;
  getAvailablePTs = userController.getAvailablePTs;
  addClientByPT = userController.addClientByPT;
  assignExistingClient = userController.assignExistingClient;
  requestPTChange = userController.requestPTChange;
  respondToPTChangeRequest = userController.respondToPTChangeRequest;
  getPendingPTChangeRequests = userController.getPendingPTChangeRequests;
  getPTChangeRequestsForMe = userController.getPTChangeRequestsForMe;
  cancelPTChangeRequest = userController.cancelPTChangeRequest;
  getMyPTChangeHistory = userController.getMyPTChangeHistory;
  requestClient = userController.requestClient;
  respondToClientRequest = userController.respondToClientRequest;
  getPendingClientRequests = userController.getPendingClientRequests;
  getMyClientRequests = userController.getMyClientRequests;
} catch (e) {
  console.log('User controller não configurado');
}

// Message Controllers - Com fallback
let sendMessage: any = (req: any, res: any) => res.status(500).json({ message: 'Message controller não configurado' });
let getMessages: any = (req: any, res: any) => res.status(500).json({ message: 'Message controller não configurado' });
let getConversations: any = (req: any, res: any) => res.status(500).json({ message: 'Message controller não configurado' });
let markAsRead: any = (req: any, res: any) => res.status(500).json({ message: 'Message controller não configurado' });
let createConversation: any = (req: any, res: any) => res.status(500).json({ message: 'Message controller não configurado' });

try {
  const messageController = require('../controllers/message.controller');
  sendMessage = messageController.sendMessage;
  getMessages = messageController.getMessages;
  getConversations = messageController.getConversations;
  markAsRead = messageController.markAsRead;
  createConversation = messageController.createConversation;
} catch (e) {
  console.log('Message controller não configurado');
}

// Password Controllers - Com fallback
let changePassword: any = (req: any, res: any) => res.status(500).json({ message: 'Password controller não configurado' });
let requestPasswordReset: any = (req: any, res: any) => res.status(500).json({ message: 'Password controller não configurado' });
let resetPasswordHandler: any = (req: any, res: any) => res.status(500).json({ message: 'Password controller não configurado' });

try {
  const passwordController = require('../controllers/password.controller');
  changePassword = passwordController.changePassword;
  requestPasswordReset = passwordController.requestPasswordReset;
  resetPasswordHandler = passwordController.resetPassword;
} catch (e) {
  console.log('Password controller não configurado');
}

// Upload Controllers - Com fallback
let uploadFile: any = (req: any, res: any) => res.status(500).json({ message: 'Upload não configurado' });
let uploadMultipleFiles: any = (req: any, res: any) => res.status(500).json({ message: 'Upload não configurado' });
let deleteFile: any = (req: any, res: any) => res.status(500).json({ message: 'Upload não configurado' });
let getFileInfo: any = (req: any, res: any) => res.status(500).json({ message: 'Upload não configurado' });

try {
  const uploadController = require('../controllers/upload.controller');
  uploadFile = uploadController.uploadFile;
  uploadMultipleFiles = uploadController.uploadMultipleFiles;
  deleteFile = uploadController.deleteFile;
  getFileInfo = uploadController.getFileInfo;
} catch (e) {
  console.log('Upload controller não configurado');
}

// OAuth Controllers - Com fallback
let oauthGoogleCallback: any = (req: any, res: any) => res.status(500).json({ message: 'OAuth controller não configurado' });
let oauthFacebookCallback: any = (req: any, res: any) => res.status(500).json({ message: 'OAuth controller não configurado' });
let oauthLogout: any = (req: any, res: any) => res.status(500).json({ message: 'OAuth controller não configurado' });

try {
  const oauthController = require('../controllers/oauth.controller');
  oauthGoogleCallback = oauthController.googleCallback;
  oauthFacebookCallback = oauthController.facebookCallback;
  oauthLogout = oauthController.logout;
} catch (e) {
  console.log('OAuth controller não configurado');
}

// Admin Controllers - Com fallback
let getAdminDashboard: any = (req: any, res: any) => res.status(500).json({ message: 'Admin controller não configurado' });
let getRecentActivity: any = (req: any, res: any) => res.status(500).json({ message: 'Admin controller não configurado' });

try {
  const adminController = require('../controllers/admin.controller');
  getAdminDashboard = adminController.getAdminDashboard;
  getRecentActivity = adminController.getRecentActivity;
} catch (e) {
  console.log('Admin controller não configurado');
}

// Passport
let passport: any = null;
try {
  passport = require('passport');
} catch (e) {
  console.log('Passport não instalado');
}

const router = Router();

// ============================================================================
// AUTH ROUTES
// ============================================================================

router.post('/auth/register', authController.register as any);
router.post('/auth/login', authController.login as any);
router.post('/auth/forgot-password', authController.forgotPassword as any);
router.get('/auth/reset-password/:token', authController.validateResetToken as any);
router.post('/auth/reset-password/:token', authController.resetPassword as any);
router.post('/auth/change-password', authenticate as any, changePassword as any);
router.post('/auth/request-reset', requestPasswordReset as any);
router.post('/auth/reset-password-handler', resetPasswordHandler as any);
router.get('/auth/verify-token', authController.verifyToken as any);
router.post('/auth/logout', authController.logout as any);
router.get('/auth/me', authenticate as any, authController.getCurrentUser as any);

// QR Code Login Routes
router.get('/auth/generate-qr-token', authenticate as any, generateQrToken as any);
router.post('/auth/qr-login', qrLogin as any);

// OAuth Routes


// ============================================================================
// PLANS ROUTES
// ============================================================================

router.post('/plans', authenticate as any, authorize(['PT']) as any, createPlan as any);
router.get('/plans', authenticate as any, getPlans as any);
router.get('/plans/:id', authenticate as any, getPlanById as any);
router.put('/plans/:id', authenticate as any, authorize(['PT']) as any, updatePlan as any);
router.delete('/plans/:id', authenticate as any, authorize(['PT']) as any, deletePlan as any);
router.post('/plans/:id/complete', authenticate as any, parseFormDataSingle, completeWorkout as any);
router.get('/plans/stats', authenticate as any, getDashboardStats as any);
router.get('/plans/recent-completions', authenticate as any, authorize(['PT']) as any, getRecentCompletions as any);
router.get('/plans/client-history/:clientId', authenticate as any, authorize(['PT']) as any, getClientHistory as any);
router.post('/plans/check-expired', authenticate as any, authorize(['CLIENT']) as any, checkExpiredPlans as any);

// ============================================================================
// USERS ROUTES
// ============================================================================

router.get('/users/search', authenticate as any, searchUser as any);
router.get('/users', authenticate as any, getAllUsers as any);
router.get('/users/my-clients', authenticate as any, authorize(['PT']) as any, getMyClients as any);
router.put('/users/profile', authenticate as any, updateProfile as any);
router.get('/users/available-pts', authenticate as any, getAvailablePTs as any);
router.post('/users/request-pt', authenticate as any, authorize(['CLIENT', 'PT']) as any, requestPT as any);
router.post('/users/add-client', authenticate as any, authorize(['PT']) as any, addClientByPT as any);
router.post('/users/assign-client', authenticate as any, authorize(['PT']) as any, assignExistingClient as any);

// ============================================================================
// PT CHANGE REQUESTS ROUTES
// ============================================================================

router.post('/users/request-pt-change', authenticate as any, authorize(['CLIENT']) as any, requestPTChange as any);
router.delete('/users/pt-change-requests/:requestId', authenticate as any, authorize(['CLIENT']) as any, cancelPTChangeRequest as any);
router.get('/users/pt-change-history', authenticate as any, authorize(['CLIENT']) as any, getMyPTChangeHistory as any);
router.get('/pt/change-requests-to-me', authenticate as any, authorize(['PT']) as any, getPTChangeRequestsForMe as any);

// PT pede cliente
router.post('/users/request-client', authenticate as any, authorize(['PT']) as any, requestClient as any);
router.get('/users/my-client-requests', authenticate as any, authorize(['PT']) as any, getMyClientRequests as any);

// ADMIN gerencia pedidos
router.get('/admin/client-requests', authenticate as any, authorize(['ADMIN']) as any, getPendingClientRequests as any);
router.put('/admin/client-requests/:requestId', authenticate as any, authorize(['ADMIN']) as any, respondToClientRequest as any);

// ============================================================================
// MESSAGES ROUTES
// ============================================================================

router.post('/messages/conversations', authenticate as any, createConversation as any);
router.get('/messages/conversations', authenticate as any, getConversations as any);
router.post('/messages', authenticate as any, sendMessage as any);
router.get('/messages/conversation/:conversationId', authenticate as any, getMessages as any);
router.put('/messages/conversation/:conversationId/read', authenticate as any, markAsRead as any);

// ============================================================================
// UPLOAD ROUTES
// ============================================================================

router.post('/upload/single', authenticate as any, uploadSingle, uploadFile as any);
router.post('/upload/multiple', authenticate as any, uploadMultiple, uploadMultipleFiles as any);
router.delete('/upload/:filename', authenticate as any, deleteFile as any);
router.get('/upload/:filename/info', authenticate as any, getFileInfo as any);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.get('/admin/dashboard', authenticate as any, authorize(['ADMIN']) as any, getAdminDashboard as any);
router.get('/admin/recent-activity', authenticate as any, authorize(['ADMIN']) as any, getRecentActivity as any);
router.get('/admin/pending-pts', authenticate as any, authorize(['ADMIN']) as any, getPendingPTs as any);
router.patch('/admin/users/:userId/validate', authenticate as any, authorize(['ADMIN']) as any, validateUser as any);
router.delete('/admin/users/:userId', authenticate as any, authorize(['ADMIN']) as any, deleteUser as any);
router.get('/admin/users', authenticate as any, authorize(['ADMIN']) as any, getAllUsers as any);

// ============================================================================
// ADMIN PT CHANGE REQUESTS ROUTES
// ============================================================================

router.get('/admin/pt-change-requests', authenticate as any, authorize(['ADMIN']) as any, getPendingPTChangeRequests as any);
router.put('/admin/pt-change-requests/:requestId', authenticate as any, authorize(['ADMIN']) as any, respondToPTChangeRequest as any);

export default router;