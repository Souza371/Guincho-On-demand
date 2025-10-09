import { Router } from 'express';
import { RideController } from '../controllers/rideController';
import { authenticateToken, requireUserType } from '../middleware/auth';

const router = Router();
const rideController = new RideController();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de corridas funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas para usuários
router.post('/', requireUserType('user'), rideController.createRide.bind(rideController));

// Rotas compartilhadas (usuário e prestador)
router.get('/:rideId', rideController.getRide.bind(rideController));
router.put('/:rideId/status', rideController.updateRideStatus.bind(rideController));
router.post('/:rideId/rating', rideController.rateRide.bind(rideController));

// Rotas para prestadores
router.post('/:rideId/proposals', requireUserType('provider'), rideController.createProposal.bind(rideController));

// Rotas para usuários (aceitar proposta)
router.put('/:rideId/proposals/:proposalId', requireUserType('user'), rideController.acceptProposal.bind(rideController));

export { router as rideRoutes };