import { Router } from 'express';

const router = Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de prestadores funcionando!',
    timestamp: new Date().toISOString()
  });
});

// TODO: Implementar rotas de prestadores
// GET /api/providers/profile
// PUT /api/providers/profile
// GET /api/providers/rides
// PUT /api/providers/availability
// GET /api/providers/earnings

export { router as providerRoutes };