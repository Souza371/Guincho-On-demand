import { Router } from 'express';

const router = Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de usuários funcionando!',
    timestamp: new Date().toISOString()
  });
});

// TODO: Implementar rotas de usuários
// GET /api/users/profile
// PUT /api/users/profile
// GET /api/users/rides
// POST /api/users/rides
// GET /api/users/addresses
// POST /api/users/addresses

export { router as userRoutes };