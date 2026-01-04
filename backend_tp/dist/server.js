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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const api_routes_1 = __importDefault(require("./routes/api.routes"));
const createDefaultAdmin_1 = require("./utils/createDefaultAdmin");
const SocketManager_1 = __importDefault(require("./socket/SocketManager"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = [
    process.env.FRONTEND_URL, // O URL que definiste no Render
    'http://localhost:3000', // Frontend local
    'http://localhost:3001', // Frontend local alternativo
    'https://pwa-indol-omega.vercel.app', // O teu URL do Vercel (exemplo)
    // Adiciona aqui o URL do Vercel com 'www' se for o caso
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        //!origin permite pedidos sem origem (como Postman ou Apps Mobile nativas)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('Origem bloqueada pelo CORS:', origin); // Isto vai ajudar a ver no log do Render quem está a ser bloqueado
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
// IMPORTANTE: body parser ANTES das rotas
app.use(express_1.default.json({ limit: '150mb' }));
app.use(express_1.default.urlencoded({ limit: '150mb', extended: true }));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Servir ficheiros estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Rotas
app.use('/api', api_routes_1.default);
let socketManager = null;
try {
    socketManager = new SocketManager_1.default(httpServer);
    console.log('Socket.io configurado');
    app.locals.socketManager = socketManager;
}
catch (e) {
    console.error('Erro ao configurar Socket.io:', e);
}
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pt_platform';
const PORT = process.env.PORT || 3000;
mongoose_1.default.connect(MONGO_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('MongoDB conectado');
    yield (0, createDefaultAdmin_1.createDefaultAdmin)();
    httpServer.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}))
    .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
});
exports.default = app;
