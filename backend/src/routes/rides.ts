import { Router } from 'express';

const router = Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de corridas funcionando!',
    timestamp: new Date().toISOString()
  });
});

// TODO: Implementar rotas de corridas
// POST /api/rides - Criar nova solicitação
// GET /api/rides/:id - Obter detalhes da corrida
// PUT /api/rides/:id/status - Atualizar status
// POST /api/rides/:id/proposals - Criar proposta (prestador)
// PUT /api/rides/:id/proposals/:proposalId - Aceitar proposta (usuário)
// POST /api/rides/:id/rating - Avaliar serviço

export { router as rideRoutes };