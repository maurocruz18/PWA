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
exports.respondToClientRequest = exports.getPendingClientRequests = exports.getMyClientRequests = exports.requestClient = exports.getMyPTChangeHistory = exports.cancelPTChangeRequest = exports.getPendingPTChangeRequests = exports.respondToPTChangeRequest = exports.getPTChangeRequestsForMe = exports.requestPTChange = exports.assignExistingClient = exports.addClientByPT = exports.getAvailablePTs = exports.requestPT = exports.updateProfile = exports.getMyClients = exports.adminChangePt = exports.deleteUser = exports.validateUser = exports.getPendingPTs = exports.getAllUsers = exports.searchUser = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
// Pesquisar utilizador por nome ou email
const searchUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Parâmetro de pesquisa obrigatório' });
        }
        const user = yield User_1.User.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${query}$`, 'i') } },
                { email: { $regex: new RegExp(`^${query}$`, 'i') } }
            ]
        }).select('-password');
        if (!user)
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.searchUser = searchUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find().select('-password');
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.getAllUsers = getAllUsers;
// ADMIN: Listar PTs pendentes de validação
const getPendingPTs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingPTs = yield User_1.User.find({ role: 'PT', isValidated: false }).select('-password');
        res.json(pendingPTs);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.getPendingPTs = getPendingPTs;
// ADMIN: Validar (Aprovar) um PT
const validateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const updatedUser = yield User_1.User.findByIdAndUpdate(userId, { isValidated: true }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        res.json(updatedUser);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.validateUser = validateUser;
// ADMIN: Remover um utilizador
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        yield User_1.User.findByIdAndDelete(userId);
        res.json({ message: "Utilizador removido com sucesso" });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.deleteUser = deleteUser;
// ADMIN: Alterar o PT de um cliente
const adminChangePt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, newPtId } = req.body;
        const newPt = yield User_1.User.findById(newPtId);
        if (!newPt || newPt.role !== 'PT') {
            return res.status(400).json({ message: "ID do novo Personal Trainer inválido." });
        }
        const user = yield User_1.User.findByIdAndUpdate(userId, { ptId: newPtId }, { new: true }).select('-password');
        res.json({ message: "Personal Trainer alterado com sucesso.", user });
    }
    catch (err) {
        res.status(500).json({ error: "Erro ao alterar PT." });
    }
});
exports.adminChangePt = adminChangePt;
// PT: Obter os seus clientes
const getMyClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const ptId = req.user._id;
        const clients = yield User_1.User.find({ ptId: ptId }).select('-password');
        res.json(clients);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar clientes associados.' });
    }
});
exports.getMyClients = getMyClients;
// GENÉRICO: Atualizar o próprio perfil
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const updates = req.body;
        const allowedUpdates = ['username', 'profileImage', 'themePreference'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
            obj[key] = updates[key];
            return obj;
        }, {});
        const user = yield User_1.User.findByIdAndUpdate(req.user._id, filteredUpdates, { new: true }).select('-password');
        res.json(user);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.updateProfile = updateProfile;
// Cliente solicita PT
const requestPT = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ptId } = req.body;
        if (!req.user || req.user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Apenas clientes podem solicitar PT' });
        }
        const pt = yield User_1.User.findById(ptId);
        if (!pt || pt.role !== 'PT') {
            return res.status(404).json({ message: 'PT não encontrado' });
        }
        if (!pt.isValidated) {
            return res.status(400).json({ message: 'Este PT ainda não foi validado' });
        }
        const client = yield User_1.User.findById(req.user._id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        // Se cliente tinha um PT anterior, decrementar (mas não deixar negativo)
        if (client.ptId && client.ptId.toString() !== '000000000000000000000000') {
            const oldPT = yield User_1.User.findById(client.ptId);
            const newCount = Math.max(0, ((oldPT === null || oldPT === void 0 ? void 0 : oldPT.clientCount) || 0) - 1);
            yield User_1.User.findByIdAndUpdate(client.ptId, { clientCount: newCount });
        }
        // Incrementar novo PT
        client.ptId = new mongoose_1.Types.ObjectId(ptId);
        const newPT = yield User_1.User.findById(ptId);
        const newClientCount = ((newPT === null || newPT === void 0 ? void 0 : newPT.clientCount) || 0) + 1;
        yield User_1.User.findByIdAndUpdate(ptId, { clientCount: newClientCount });
        yield client.save();
        res.json({ message: 'PT atribuído com sucesso', client });
    }
    catch (err) {
        console.error('Erro ao solicitar PT:', err);
        res.status(500).json({ error: 'Erro ao solicitar PT' });
    }
});
exports.requestPT = requestPT;
// Listar PTs validados disponíveis
const getAvailablePTs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pts = yield User_1.User.find({
            role: 'PT',
            isValidated: true
        }).select('username email profileImage clientCount');
        res.json(pts);
    }
    catch (err) {
        console.error('Erro ao buscar PTs:', err);
        res.status(500).json({ error: 'Erro ao buscar PTs' });
    }
});
exports.getAvailablePTs = getAvailablePTs;
// PT adiciona cliente manualmente (via registro)
const addClientByPT = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email } = req.body;
        if (!req.user || req.user.role !== 'PT') {
            return res.status(403).json({ message: 'Apenas PTs podem adicionar clientes' });
        }
        const existingUser = yield User_1.User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username já existe' });
        }
        if (email) {
            const existingEmail = yield User_1.User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email já está registado' });
            }
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const newClient = new User_1.User({
            username,
            password: hashedPassword,
            email,
            role: 'CLIENT',
            ptId: new mongoose_1.Types.ObjectId(req.user._id),
            isValidated: true,
        });
        yield newClient.save();
        // Incrementar clientCount do PT
        const pt = yield User_1.User.findById(req.user._id);
        const newClientCount = ((pt === null || pt === void 0 ? void 0 : pt.clientCount) || 0) + 1;
        yield User_1.User.findByIdAndUpdate(req.user._id, { clientCount: newClientCount });
        const _a = newClient.toObject(), { password: _ } = _a, clientResponse = __rest(_a, ["password"]);
        res.status(201).json(clientResponse);
    }
    catch (err) {
        console.error('Erro ao adicionar cliente:', err);
        res.status(500).json({ error: 'Erro ao adicionar cliente' });
    }
});
exports.addClientByPT = addClientByPT;
// PT atribui cliente existente a si mesmo
const assignExistingClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body; // Mudar de clientId para email é mais fácil para o PT encontrar
        if (!req.user || req.user.role !== 'PT') {
            return res.status(403).json({ message: 'Apenas PTs podem atribuir clientes' });
        }
        // Procura por email (mais seguro que ID vindo do front)
        const client = yield User_1.User.findOne({ email });
        if (!client) {
            return res.status(404).json({ message: 'Cliente não encontrado com esse email.' });
        }
        if (client.role !== 'CLIENT') {
            return res.status(400).json({ message: 'Este utilizador não é um cliente.' });
        }
        // Se já for meu cliente, ignora
        if (client.ptId && client.ptId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Utilizador já é seu cliente.' });
        }
        // Decrementa do PT antigo se existir
        if (client.ptId && client.ptId.toString() !== '000000000000000000000000') {
            const oldPT = yield User_1.User.findById(client.ptId);
            if (oldPT) {
                const newCount = Math.max(0, (oldPT.clientCount || 0) - 1);
                yield User_1.User.findByIdAndUpdate(client.ptId, { clientCount: newCount });
            }
        }
        // Atribui ao novo PT
        const newPTId = new mongoose_1.Types.ObjectId(req.user._id);
        client.ptId = newPTId;
        // Incrementa contador do PT atual
        const pt = yield User_1.User.findById(newPTId);
        const newClientCount = ((pt === null || pt === void 0 ? void 0 : pt.clientCount) || 0) + 1;
        yield User_1.User.findByIdAndUpdate(newPTId, { clientCount: newClientCount });
        yield client.save();
        const _a = client.toObject(), { password: _ } = _a, clientResponse = __rest(_a, ["password"]);
        res.json({ message: 'Cliente adicionado com sucesso', client: clientResponse });
    }
    catch (err) {
        console.error('Erro ao atribuir cliente:', err);
        res.status(500).json({ error: 'Erro ao atribuir cliente' });
    }
});
exports.assignExistingClient = assignExistingClient;
// ============================================================================
// CLIENTE SOLICITA MUDANÇA DE PT
// ============================================================================
const requestPTChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPtId } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const client = yield User_1.User.findById(req.user._id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        // newPtId pode ser undefined para "Nenhum PT"
        if (newPtId) {
            const newPt = yield User_1.User.findById(newPtId);
            if (!newPt || newPt.role !== 'PT') {
                return res.status(404).json({ message: 'PT não encontrado' });
            }
        }
        if (!client.ptChangeRequests) {
            client.ptChangeRequests = [];
        }
        const existingPending = client.ptChangeRequests.some((r) => r.status === 'pending');
        if (existingPending) {
            return res.status(400).json({
                message: 'Você já tem um pedido pendente de aprovação. Aguarde a resposta.',
            });
        }
        const fromPTId = client.ptId || new mongoose_1.Types.ObjectId('000000000000000000000000');
        // Se newPtId é undefined, usar um ObjectId especial para "Nenhum PT"
        const toPTId = newPtId
            ? new mongoose_1.Types.ObjectId(newPtId)
            : new mongoose_1.Types.ObjectId('000000000000000000000000');
        const ptChangeRequest = {
            _id: new mongoose_1.Types.ObjectId(),
            fromPT: fromPTId,
            toPT: toPTId,
            status: 'pending',
            requestedAt: new Date(),
        };
        client.ptChangeRequests.push(ptChangeRequest);
        yield client.save();
        console.log(`[PT CHANGE REQUEST] Cliente: ${client.username}, Novo PT: ${newPtId ? 'Outro PT' : 'Nenhum'}`);
        return res.status(201).json({
            message: 'Solicitação de mudança de PT enviada para aprovação',
            requestId: ptChangeRequest._id,
        });
    }
    catch (error) {
        console.error('Erro em requestPTChange:', error);
        res.status(500).json({ message: 'Erro ao solicitar mudança de PT', error });
    }
});
exports.requestPTChange = requestPTChange;
// ============================================================================
// PT VISUALIZA PEDIDOS FEITOS PARA ELE
// ============================================================================
const getPTChangeRequestsForMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'PT') {
            return res.status(403).json({ message: 'Apenas PTs podem acessar' });
        }
        const ptId = req.user._id;
        const clientsWithRequests = yield User_1.User.find({
            'ptChangeRequests.status': 'pending',
            'ptChangeRequests.toPT': new mongoose_1.Types.ObjectId(ptId),
        })
            .select('_id username email ptChangeRequests')
            .lean();
        const formattedRequests = [];
        for (const client of clientsWithRequests) {
            if (!client.ptChangeRequests)
                continue;
            const pendingReqs = client.ptChangeRequests.filter((r) => r.status === 'pending' && r.toPT.toString() === ptId.toString());
            for (const req of pendingReqs) {
                const oldPt = req.fromPT && req.fromPT.toString() !== '000000000000000000000000'
                    ? yield User_1.User.findById(req.fromPT).select('username').lean()
                    : null;
                formattedRequests.push({
                    _id: req._id,
                    clientId: client._id,
                    clientName: client.username,
                    clientEmail: client.email,
                    fromPT: (oldPt === null || oldPt === void 0 ? void 0 : oldPt.username) || 'Sem PT',
                    requestedAt: req.requestedAt,
                    status: req.status,
                });
            }
        }
        return res.json(formattedRequests);
    }
    catch (error) {
        console.error('Erro em getPTChangeRequestsForMe:', error);
        res.status(500).json({ message: 'Erro ao listar pedidos', error });
    }
});
exports.getPTChangeRequestsForMe = getPTChangeRequestsForMe;
// ============================================================================
// ADMIN APROVA OU REJEITA PEDIDO
// ============================================================================
const respondToPTChangeRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.params;
        const { action, reason } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const adminId = req.user._id;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Ação deve ser approve ou reject' });
        }
        const client = yield User_1.User.findOne({
            'ptChangeRequests._id': new mongoose_1.Types.ObjectId(requestId),
        });
        if (!client) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        if (!client.ptChangeRequests) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        const requestIndex = client.ptChangeRequests.findIndex((r) => { var _a; return ((_a = r._id) === null || _a === void 0 ? void 0 : _a.toString()) === requestId; });
        if (requestIndex === -1) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        const ptRequest = client.ptChangeRequests[requestIndex];
        if (ptRequest.status !== 'pending') {
            return res.status(400).json({
                message: 'Este pedido já foi respondido anteriormente',
            });
        }
        if (action === 'approve') {
            const oldPTId = client.ptId;
            // Se toPT é "000000000000000000000000", significa "Nenhum PT"
            const isRemovingPT = ptRequest.toPT.toString() === '000000000000000000000000';
            if (!isRemovingPT) {
                // Está a atribuir a um PT novo
                client.ptId = ptRequest.toPT;
                yield User_1.User.findByIdAndUpdate(ptRequest.toPT, {
                    $inc: { clientCount: 1 },
                });
            }
            else {
                // Está a remover o PT - usar undefined em vez de null
                client.ptId = undefined;
            }
            ptRequest.status = 'approved';
            // Decrementar PT anterior se existia
            if (oldPTId &&
                oldPTId.toString() !== '000000000000000000000000') {
                const oldPT = yield User_1.User.findById(oldPTId);
                const newCount = Math.max(0, ((oldPT === null || oldPT === void 0 ? void 0 : oldPT.clientCount) || 0) - 1);
                yield User_1.User.findByIdAndUpdate(oldPTId, {
                    clientCount: newCount,
                });
            }
            console.log(`[PT CHANGE APPROVED] Cliente: ${client.username}, Novo PT: ${isRemovingPT ? 'Nenhum' : ptRequest.toPT}`);
        }
        else if (action === 'reject') {
            ptRequest.status = 'rejected';
            console.log(`[PT CHANGE REJECTED] Cliente: ${client.username}, Razão: ${reason}`);
        }
        ptRequest.respondedAt = new Date();
        ptRequest.respondedBy = new mongoose_1.Types.ObjectId(adminId);
        if (reason) {
            ptRequest.reason = reason;
        }
        client.pendingPTChange = undefined;
        yield client.save();
        return res.json({
            message: `Pedido ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`,
            requestId: ptRequest._id,
            status: ptRequest.status,
        });
    }
    catch (error) {
        console.error('Erro em respondToPTChangeRequest:', error);
        res.status(500).json({ message: 'Erro ao responder pedido', error });
    }
});
exports.respondToPTChangeRequest = respondToPTChangeRequest;
// ============================================================================
// ADMIN LISTA TODOS OS PEDIDOS PENDENTES
// ============================================================================
const getPendingPTChangeRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientsWithRequests = yield User_1.User.find({
            'ptChangeRequests.status': 'pending',
        })
            .select('_id username email ptChangeRequests')
            .lean();
        const formattedRequests = [];
        for (const client of clientsWithRequests) {
            if (!client.ptChangeRequests)
                continue;
            const pendingReqs = client.ptChangeRequests.filter((r) => r.status === 'pending');
            for (const req of pendingReqs) {
                // Verificar se é "Nenhum PT"
                const isNoPT = req.toPT.toString() === '000000000000000000000000';
                let newPt = null;
                if (!isNoPT) {
                    newPt = yield User_1.User.findById(req.toPT).select('username').lean();
                }
                const oldPt = req.fromPT && req.fromPT.toString() !== '000000000000000000000000'
                    ? yield User_1.User.findById(req.fromPT).select('username').lean()
                    : null;
                formattedRequests.push({
                    _id: req._id,
                    clientId: client._id,
                    clientName: client.username,
                    clientEmail: client.email,
                    fromPT: (oldPt === null || oldPt === void 0 ? void 0 : oldPt.username) || 'Sem PT (Novo cliente)',
                    toPT: isNoPT ? 'Nenhum PT' : ((newPt === null || newPt === void 0 ? void 0 : newPt.username) || 'PT desconhecido'),
                    requestedAt: req.requestedAt,
                    status: req.status,
                });
            }
        }
        return res.json(formattedRequests);
    }
    catch (error) {
        console.error('Erro em getPendingPTChangeRequests:', error);
        res.status(500).json({ message: 'Erro ao listar pedidos', error });
    }
});
exports.getPendingPTChangeRequests = getPendingPTChangeRequests;
// ============================================================================
// CLIENTE CANCELA PEDIDO PENDENTE
// ============================================================================
const cancelPTChangeRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const clientId = req.user._id;
        const client = yield User_1.User.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        if (!client.ptChangeRequests) {
            return res.status(404).json({
                message: 'Nenhum pedido encontrado',
            });
        }
        const requestIndex = client.ptChangeRequests.findIndex((r) => { var _a; return ((_a = r._id) === null || _a === void 0 ? void 0 : _a.toString()) === requestId && r.status === 'pending'; });
        if (requestIndex === -1 || requestIndex === undefined) {
            return res.status(404).json({
                message: 'Pedido não encontrado ou já foi respondido',
            });
        }
        client.ptChangeRequests.splice(requestIndex, 1);
        client.pendingPTChange = undefined;
        yield client.save();
        console.log(`[PT CHANGE CANCELLED] Cliente: ${client.username}, RequestId: ${requestId}`);
        return res.json({ message: 'Solicitação de mudança cancelada' });
    }
    catch (error) {
        console.error('Erro em cancelPTChangeRequest:', error);
        res.status(500).json({ message: 'Erro ao cancelar pedido', error });
    }
});
exports.cancelPTChangeRequest = cancelPTChangeRequest;
// ============================================================================
// CLIENTE VISUALIZA SEU HISTÓRICO DE PEDIDOS
// ============================================================================
const getMyPTChangeHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const clientId = req.user._id;
        const client = yield User_1.User.findById(clientId).select('ptChangeRequests');
        if (!client) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        if (!client.ptChangeRequests) {
            return res.json([]);
        }
        const enrichedHistory = yield Promise.all(client.ptChangeRequests.map((req) => __awaiter(void 0, void 0, void 0, function* () {
            // Verificar se é "Nenhum PT"
            const isNoPT = req.toPT.toString() === '000000000000000000000000';
            let newPt = null;
            if (!isNoPT) {
                newPt = yield User_1.User.findById(req.toPT)
                    .select('username')
                    .lean();
            }
            const oldPt = req.fromPT && req.fromPT.toString() !== '000000000000000000000000'
                ? yield User_1.User.findById(req.fromPT).select('username').lean()
                : null;
            return {
                _id: req._id,
                fromPT: (oldPt === null || oldPt === void 0 ? void 0 : oldPt.username) || 'Sem PT',
                toPT: isNoPT ? 'Nenhum PT' : ((newPt === null || newPt === void 0 ? void 0 : newPt.username) || 'PT desconhecido'),
                status: req.status,
                requestedAt: req.requestedAt,
                respondedAt: req.respondedAt,
                reason: req.reason,
            };
        })));
        return res.json(enrichedHistory);
    }
    catch (error) {
        console.error('Erro em getMyPTChangeHistory:', error);
        res.status(500).json({ message: 'Erro ao buscar histórico', error });
    }
});
exports.getMyPTChangeHistory = getMyPTChangeHistory;
// ============================================================================
// REQUEST CLIENT (PT pede cliente existente - usando padrão clientRequestsFromPTs)
// ============================================================================
const requestClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { clientId } = req.body;
        console.log(`[requestClient] PT ${ptId} está pedindo cliente ${clientId}`);
        // Validação 1: PT autenticado
        if (!ptId) {
            return res.status(401).json({
                success: false,
                message: 'Não autenticado'
            });
        }
        // Validação 2: ClientId fornecido
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: 'ID do cliente é obrigatório'
            });
        }
        // Validação 3: Verificar se o cliente existe
        const client = yield User_1.User.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }
        // Validação 4: Verificar se é realmente um cliente
        if (client.role !== 'CLIENT') {
            return res.status(400).json({
                success: false,
                message: 'Este utilizador não é um cliente'
            });
        }
        console.log(`[requestClient] Cliente ${client.username} encontrado`);
        // Validação 5: PT não pode pedir a si mesmo
        if (client.ptId && client.ptId.toString() === ptId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Já é o treinador deste cliente'
            });
        }
        // Validação 6: Inicializar array se não existir
        if (!client.clientRequestsFromPTs) {
            client.clientRequestsFromPTs = [];
            console.log(`[requestClient] Array clientRequestsFromPTs inicializado para ${client.username}`);
        }
        // Validação 7: Verificar se já existe um pedido pendente deste PT
        const existingRequest = client.clientRequestsFromPTs.find((r) => r && r.ptId && r.ptId.toString() === ptId.toString() && r.status === 'pending');
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Já existe um pedido pendente para este cliente'
            });
        }
        console.log(`[requestClient] Criando novo pedido para ${client.username}`);
        // Criar novo pedido
        const clientRequest = {
            _id: new mongoose_1.Types.ObjectId(),
            ptId: new mongoose_1.Types.ObjectId(ptId),
            status: 'pending',
            requestedAt: new Date(),
        };
        // Adicionar o pedido ao array do cliente
        client.clientRequestsFromPTs.push(clientRequest);
        // Salvar o cliente com o novo pedido
        yield client.save();
        console.log(`[requestClient] ✓ Pedido criado com sucesso para ${client.username}`);
        res.status(201).json({
            success: true,
            message: 'Pedido enviado com sucesso. Aguardando confirmação do administrador.',
            data: clientRequest
        });
    }
    catch (error) {
        console.error('[requestClient] Erro ao pedir cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao enviar pedido',
            error: error.message
        });
    }
});
exports.requestClient = requestClient;
// ============================================================================
// GET MY CLIENT REQUESTS (PT vê seus pedidos)
// ============================================================================
const getMyClientRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ptId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        console.log(`[getMyClientRequests] PT ${ptId} consultando seus pedidos`);
        if (!ptId) {
            return res.json({
                success: true,
                stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
                data: []
            });
        }
        // Buscar todos os clientes que têm pedidos deste PT
        const clientsWithRequests = yield User_1.User.find({
            'clientRequestsFromPTs.ptId': new mongoose_1.Types.ObjectId(ptId)
        })
            .select('_id username email profileImage clientRequestsFromPTs')
            .lean();
        console.log(`[getMyClientRequests] Encontrados ${clientsWithRequests.length} clientes com pedidos deste PT`);
        const requests = [];
        for (const client of clientsWithRequests) {
            if (!client.clientRequestsFromPTs)
                continue;
            const myRequests = client.clientRequestsFromPTs.filter((r) => r && r.ptId && r.ptId.toString() === ptId.toString());
            for (const req of myRequests) {
                requests.push({
                    _id: req._id,
                    clientId: client._id,
                    clientName: client.username,
                    clientEmail: client.email,
                    clientImage: client.profileImage,
                    status: req.status,
                    requestedAt: req.requestedAt,
                    respondedAt: req.respondedAt
                });
            }
        }
        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length
        };
        console.log(`[getMyClientRequests] Stats:`, stats);
        return res.json({
            success: true,
            stats,
            data: requests
        });
    }
    catch (error) {
        console.error('[getMyClientRequests] Erro ao procurarr meus pedidos:', error);
        return res.json({
            success: true,
            stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
            data: []
        });
    }
});
exports.getMyClientRequests = getMyClientRequests;
// ============================================================================
// GET PENDING CLIENT REQUESTS (ADMIN vê todos os pedidos pendentes)
// ============================================================================
const getPendingClientRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[getPendingClientRequests] Iniciando busca...');
        // Buscar todos os clientes
        const allUsers = yield User_1.User.find({})
            .select('_id username email profileImage clientRequestsFromPTs')
            .lean();
        console.log(`[getPendingClientRequests] Total de utilizadores: ${allUsers.length}`);
        const requests = [];
        // Iterar através de cada utilizador
        for (const user of allUsers) {
            // Verificar se tem pedidos de cliente
            if (!user.clientRequestsFromPTs || user.clientRequestsFromPTs.length === 0) {
                continue;
            }
            console.log(`[getPendingClientRequests] Utilizador ${user.username} tem ${user.clientRequestsFromPTs.length} pedido(s)`);
            // Filtrar apenas os pendentes
            const pendingRequests = user.clientRequestsFromPTs.filter((req) => req && req.status === 'pending');
            if (pendingRequests.length === 0) {
                continue;
            }
            console.log(`[getPendingClientRequests] ${pendingRequests.length} pendente(s) para ${user.username}`);
            // Processar cada pedido pendente
            for (const clientRequest of pendingRequests) {
                try {
                    // Buscar o PT que fez o pedido
                    const pt = yield User_1.User.findById(clientRequest.ptId)
                        .select('username email profileImage')
                        .lean();
                    if (!pt) {
                        console.warn(`[getPendingClientRequests] PT ${clientRequest.ptId} não encontrado`);
                        continue;
                    }
                    // Construir objeto de resposta
                    const requestData = {
                        _id: clientRequest._id || new mongoose_1.Types.ObjectId(),
                        clientId: user._id,
                        clientName: user.username || 'Desconhecido',
                        clientEmail: user.email || '',
                        clientImage: user.profileImage || null,
                        ptId: clientRequest.ptId,
                        ptName: pt.username || 'PT Desconhecido',
                        ptEmail: pt.email || '',
                        ptImage: pt.profileImage || null,
                        requestedAt: clientRequest.requestedAt || new Date(),
                        status: clientRequest.status || 'pending'
                    };
                    requests.push(requestData);
                    console.log(`[getPendingClientRequests] ✓ Pedido adicionado: ${pt.username} → ${user.username}`);
                }
                catch (innerError) {
                    console.error(`[getPendingClientRequests] Erro ao processar pedido:`, innerError);
                    continue;
                }
            }
        }
        console.log(`[getPendingClientRequests] Total de pedidos processados: ${requests.length}`);
        return res.json({
            success: true,
            total: requests.length,
            data: requests
        });
    }
    catch (error) {
        console.error('[getPendingClientRequests] Erro fatal:', error);
        // Retornar erro com mais contexto
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar pedidos de cliente',
            error: error.message || 'Erro desconhecido',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getPendingClientRequests = getPendingClientRequests;
// ============================================================================
// RESPOND TO CLIENT REQUEST (ADMIN aprova ou rejeita)
// ============================================================================
const respondToClientRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.params;
        const { status, rejectionReason } = req.body;
        console.log(`[respondToClientRequest] Respondendo ao pedido ${requestId} com status ${status}`);
        // Validação 1: Status válido
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status inválido. Use: approved ou rejected'
            });
        }
        // Validação 2: Encontrar o cliente com este pedido
        const client = yield User_1.User.findOne({
            'clientRequestsFromPTs._id': new mongoose_1.Types.ObjectId(requestId)
        });
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }
        if (!client.clientRequestsFromPTs) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }
        console.log(`[respondToClientRequest] Cliente encontrado: ${client.username}`);
        // Encontrar o índice do pedido
        const requestIndex = client.clientRequestsFromPTs.findIndex((r) => r && r._id && r._id.toString() === requestId);
        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }
        const clientRequest = client.clientRequestsFromPTs[requestIndex];
        // Validação 3: Pedido já respondido?
        if (clientRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Este pedido já foi respondido anteriormente'
            });
        }
        // Buscar o PT que fez o pedido
        const pt = yield User_1.User.findById(clientRequest.ptId);
        if (!pt) {
            return res.status(404).json({
                success: false,
                message: 'PT do pedido não encontrado'
            });
        }
        console.log(`[respondToClientRequest] PT: ${pt.username}, Ação: ${status}`);
        // Processar a resposta
        if (status === 'approved') {
            const oldPtId = client.ptId;
            // Atualizar cliente para ter este PT
            client.ptId = new mongoose_1.Types.ObjectId(clientRequest.ptId);
            // Decrementar PT anterior se existia
            if (oldPtId && oldPtId.toString() !== '000000000000000000000000') {
                const oldPT = yield User_1.User.findById(oldPtId);
                const newCount = Math.max(0, ((oldPT === null || oldPT === void 0 ? void 0 : oldPT.clientCount) || 0) - 1);
                yield User_1.User.findByIdAndUpdate(oldPtId, { clientCount: newCount });
                console.log(`[respondToClientRequest] PT anterior decrmentado`);
            }
            // Incrementar novo PT
            const newClientCount = (pt.clientCount || 0) + 1;
            yield User_1.User.findByIdAndUpdate(clientRequest.ptId, { clientCount: newClientCount });
            console.log(`[respondToClientRequest] PT novo incrementado`);
            // Atualizar status do pedido
            clientRequest.status = 'approved';
            clientRequest.respondedAt = new Date();
            console.log(`[respondToClientRequest] ✓ Pedido aprovado! ${client.username} agora é cliente de ${pt.username}`);
        }
        else if (status === 'rejected') {
            // Rejeitar pedido
            clientRequest.status = 'rejected';
            clientRequest.respondedAt = new Date();
            if (rejectionReason) {
                clientRequest.rejectionReason = rejectionReason;
            }
            console.log(`[respondToClientRequest] ✓ Pedido rejeitado!`);
        }
        // Salvar o cliente
        yield client.save();
        res.json({
            success: true,
            message: status === 'approved'
                ? 'Pedido aprovado! Cliente atribuído ao PT.'
                : 'Pedido rejeitado com sucesso.',
            data: clientRequest
        });
    }
    catch (error) {
        console.error('[respondToClientRequest] Erro ao responder pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao responder pedido',
            error: error.message
        });
    }
});
exports.respondToClientRequest = respondToClientRequest;
