import { Router } from 'express';
import { ProviderController } from '../controllers/providerController';
import { authenticateToken, requireUserType } from '../middleware/auth';

const router = Router();
const providerController = new ProviderController();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);
router.use(requireUserType('provider'));

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de prestadores funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas do perfil
router.get('/profile', providerController.getProfile.bind(providerController));
router.put('/profile', providerController.updateProfile.bind(providerController));

// Rotas de disponibilidade
router.put('/availability', providerController.updateAvailability.bind(providerController));

// Rotas das corridas
router.get('/rides', providerController.getRides.bind(providerController));
router.get('/available-rides', providerController.getAvailableRides.bind(providerController));

// Rotas dos ganhos
router.get('/earnings', providerController.getEarnings.bind(providerController));

export { router as providerRoutes };