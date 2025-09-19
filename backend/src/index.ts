import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { providerRoutes } from './routes/providers';
import { rideRoutes } from './routes/rides';
import { adminRoutes } from './routes/admin';
import { setupSocket } from './services/socketService';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limite de requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
  }
});

// Middlewares globais
app.use(helmet()); // Segurança
app.use(compression()); // Compressão
app.use(cors()); // CORS
app.use(limiter); // Rate limiting
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded
app.use(requestLogger); // Log de requests

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/admin', adminRoutes);

// Setup do WebSocket
setupSocket(io);

// Middleware de erro (deve ser o último)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API: http://localhost:${PORT}`);
  logger.info(`💾 Database: ${process.env.DATABASE_URL ? 'Conectado' : 'Não configurado'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor graciosamente...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor graciosamente...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

export { app, server, io };