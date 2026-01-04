import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';

import apiRoutes from './routes/api.routes';
import { createDefaultAdmin } from './utils/createDefaultAdmin';
import SocketManager from './socket/SocketManager';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';



const app = express();
const httpServer = createServer(app);

app.use(cors());

// IMPORTANTE: body parser ANTES das rotas
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Servir ficheiros estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api', apiRoutes);

let socketManager: any = null;
try {
  socketManager = new SocketManager(httpServer);
  console.log('Socket.io configurado');
  app.locals.socketManager = socketManager;
} catch (e) {
  console.error('Erro ao configurar Socket.io:', e);
}

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pt_platform';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB conectado');

    await createDefaultAdmin();

    httpServer.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

export default app;