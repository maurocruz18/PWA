"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
// Auth Controllers - Import como named exports
const authController = __importStar(require("../controllers/auth.controller"));
const parseFormData_1 = require("../middlewares/parseFormData");
const auth_controller_1 = require("../controllers/auth.controller");
// Multer - importar com try/catch
let uploadSingle = (req, res, next) => next();
let uploadMultiple = (req, res, next) => next();
// Plan Controllers - Com fallback
let createPlan = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let getPlans = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let completeWorkout = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let getDashboardStats = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let getRecentCompletions = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let getClientHistory = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let checkExpiredPlans = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let getPlanById = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let updatePlan = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
let deletePlan = (req, res) => res.status(500).json({ message: 'Plan controller não configurado' });
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
}
catch (e) {
    console.log('Plan controller não configurado');
}
// User Controllers - Com fallback
let searchUser = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getAllUsers = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getPendingPTs = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let validateUser = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let deleteUser = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getMyClients = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let updateProfile = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let requestPT = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getAvailablePTs = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let addClientByPT = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let assignExistingClient = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let requestPTChange = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let respondToPTChangeRequest = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getPendingPTChangeRequests = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getPTChangeRequestsForMe = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let cancelPTChangeRequest = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getMyPTChangeHistory = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let requestClient = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let respondToClientRequest = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getPendingClientRequests = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
let getMyClientRequests = (req, res) => res.status(500).json({ message: 'User controller não configurado' });
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
}
catch (e) {
    console.log('User controller não configurado');
}
// Message Controllers - Com fallback
let sendMessage = (req, res) => res.status(500).json({ message: 'Message controller não configurado' });
let getMessages = (req, res) => res.status(500).json({ message: 'Message controller não configurado' });
let getConversations = (req, res) => res.status(500).json({ message: 'Message controller não configurado' });
let markAsRead = (req, res) => res.status(500).json({ message: 'Message controller não configurado' });
let createConversation = (req, res) => res.status(500).json({ message: 'Message controller não configurado' });
try {
    const messageController = require('../controllers/message.controller');
    sendMessage = messageController.sendMessage;
    getMessages = messageController.getMessages;
    getConversations = messageController.getConversations;
    markAsRead = messageController.markAsRead;
    createConversation = messageController.createConversation;
}
catch (e) {
    console.log('Message controller não configurado');
}
// Password Controllers - Com fallback
let changePassword = (req, res) => res.status(500).json({ message: 'Password controller não configurado' });
let requestPasswordReset = (req, res) => res.status(500).json({ message: 'Password controller não configurado' });
let resetPasswordHandler = (req, res) => res.status(500).json({ message: 'Password controller não configurado' });
try {
    const passwordController = require('../controllers/password.controller');
    changePassword = passwordController.changePassword;
    requestPasswordReset = passwordController.requestPasswordReset;
    resetPasswordHandler = passwordController.resetPassword;
}
catch (e) {
    console.log('Password controller não configurado');
}
// Upload Controllers - Com fallback
let uploadFile = (req, res) => res.status(500).json({ message: 'Upload não configurado' });
let uploadMultipleFiles = (req, res) => res.status(500).json({ message: 'Upload não configurado' });
let deleteFile = (req, res) => res.status(500).json({ message: 'Upload não configurado' });
let getFileInfo = (req, res) => res.status(500).json({ message: 'Upload não configurado' });
try {
    const uploadController = require('../controllers/upload.controller');
    uploadFile = uploadController.uploadFile;
    uploadMultipleFiles = uploadController.uploadMultipleFiles;
    deleteFile = uploadController.deleteFile;
    getFileInfo = uploadController.getFileInfo;
}
catch (e) {
    console.log('Upload controller não configurado');
}
// OAuth Controllers - Com fallback
let oauthGoogleCallback = (req, res) => res.status(500).json({ message: 'OAuth controller não configurado' });
let oauthFacebookCallback = (req, res) => res.status(500).json({ message: 'OAuth controller não configurado' });
let oauthLogout = (req, res) => res.status(500).json({ message: 'OAuth controller não configurado' });
try {
    const oauthController = require('../controllers/oauth.controller');
    oauthGoogleCallback = oauthController.googleCallback;
    oauthFacebookCallback = oauthController.facebookCallback;
    oauthLogout = oauthController.logout;
}
catch (e) {
    console.log('OAuth controller não configurado');
}
// Admin Controllers - Com fallback
let getAdminDashboard = (req, res) => res.status(500).json({ message: 'Admin controller não configurado' });
let getRecentActivity = (req, res) => res.status(500).json({ message: 'Admin controller não configurado' });
try {
    const adminController = require('../controllers/admin.controller');
    getAdminDashboard = adminController.getAdminDashboard;
    getRecentActivity = adminController.getRecentActivity;
}
catch (e) {
    console.log('Admin controller não configurado');
}
// Passport
let passport = null;
try {
    passport = require('passport');
}
catch (e) {
    console.log('Passport não instalado');
}
const router = (0, express_1.Router)();
// ============================================================================
// AUTH ROUTES
// ============================================================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.get('/auth/reset-password/:token', authController.validateResetToken);
router.post('/auth/reset-password/:token', authController.resetPassword);
router.post('/auth/change-password', auth_middleware_1.authenticate, changePassword);
router.post('/auth/request-reset', requestPasswordReset);
router.post('/auth/reset-password-handler', resetPasswordHandler);
router.get('/auth/verify-token', authController.verifyToken);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', auth_middleware_1.authenticate, authController.getCurrentUser);
// QR Code Login Routes
router.get('/auth/generate-qr-token', auth_middleware_1.authenticate, auth_controller_1.generateQrToken);
router.post('/auth/qr-login', auth_controller_1.qrLogin);
// OAuth Routes
// ============================================================================
// PLANS ROUTES
// ============================================================================
router.post('/plans', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), createPlan);
router.get('/plans', auth_middleware_1.authenticate, getPlans);
router.get('/plans/:id', auth_middleware_1.authenticate, getPlanById);
router.put('/plans/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), updatePlan);
router.delete('/plans/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), deletePlan);
router.post('/plans/:id/complete', auth_middleware_1.authenticate, parseFormData_1.parseFormDataSingle, completeWorkout);
router.get('/plans/stats', auth_middleware_1.authenticate, getDashboardStats);
router.get('/plans/recent-completions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), getRecentCompletions);
router.get('/plans/client-history/:clientId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), getClientHistory);
router.post('/plans/check-expired', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['CLIENT']), checkExpiredPlans);
// ============================================================================
// USERS ROUTES
// ============================================================================
router.get('/users/search', auth_middleware_1.authenticate, searchUser);
router.get('/users', auth_middleware_1.authenticate, getAllUsers);
router.get('/users/my-clients', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), getMyClients);
router.put('/users/profile', auth_middleware_1.authenticate, updateProfile);
router.get('/users/available-pts', auth_middleware_1.authenticate, getAvailablePTs);
router.post('/users/request-pt', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['CLIENT', 'PT']), requestPT);
router.post('/users/add-client', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), addClientByPT);
router.post('/users/assign-client', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), assignExistingClient);
// ============================================================================
// PT CHANGE REQUESTS ROUTES
// ============================================================================
router.post('/users/request-pt-change', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['CLIENT']), requestPTChange);
router.delete('/users/pt-change-requests/:requestId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['CLIENT']), cancelPTChangeRequest);
router.get('/users/pt-change-history', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['CLIENT']), getMyPTChangeHistory);
router.get('/pt/change-requests-to-me', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), getPTChangeRequestsForMe);
// PT pede cliente
router.post('/users/request-client', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), requestClient);
router.get('/users/my-client-requests', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PT']), getMyClientRequests);
// ADMIN gerencia pedidos
router.get('/admin/client-requests', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), getPendingClientRequests);
router.put('/admin/client-requests/:requestId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), respondToClientRequest);
// ============================================================================
// MESSAGES ROUTES
// ============================================================================
router.post('/messages/conversations', auth_middleware_1.authenticate, createConversation);
router.get('/messages/conversations', auth_middleware_1.authenticate, getConversations);
router.post('/messages', auth_middleware_1.authenticate, sendMessage);
router.get('/messages/conversation/:conversationId', auth_middleware_1.authenticate, getMessages);
router.put('/messages/conversation/:conversationId/read', auth_middleware_1.authenticate, markAsRead);
// ============================================================================
// UPLOAD ROUTES
// ============================================================================
router.post('/upload/single', auth_middleware_1.authenticate, uploadSingle, uploadFile);
router.post('/upload/multiple', auth_middleware_1.authenticate, uploadMultiple, uploadMultipleFiles);
router.delete('/upload/:filename', auth_middleware_1.authenticate, deleteFile);
router.get('/upload/:filename/info', auth_middleware_1.authenticate, getFileInfo);
// ============================================================================
// ADMIN ROUTES
// ============================================================================
router.get('/admin/dashboard', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), getAdminDashboard);
router.get('/admin/recent-activity', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), getRecentActivity);
router.get('/admin/pending-pts', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), getPendingPTs);
router.patch('/admin/users/:userId/validate', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), validateUser);
router.delete('/admin/users/:userId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), deleteUser);
router.get('/admin/users', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), getAllUsers);
// ============================================================================
// ADMIN PT CHANGE REQUESTS ROUTES
// ============================================================================
router.get('/admin/pt-change-requests', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), getPendingPTChangeRequests);
router.put('/admin/pt-change-requests/:requestId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), respondToPTChangeRequest);
exports.default = router;
