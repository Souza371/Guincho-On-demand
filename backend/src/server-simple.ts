import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rota de teste simples
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚛 Guincho On-demand API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando perfeitamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Rota de teste para autenticação
app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de autenticação funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para listar usuários (mock)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'João Silva', email: 'joao@test.com' },
      { id: 2, name: 'Maria Santos', email: 'maria@test.com' }
    ],
    message: 'Usuários listados com sucesso'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor Guincho On-demand iniciado!');
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth Test: http://localhost:${PORT}/api/auth/test`);
  console.log('📊 Status: FUNCIONANDO');
});

export default app;