import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireUserType } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);
router.use(requireUserType('user'));

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de usuários funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas do perfil
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));

// Rotas das corridas
router.get('/rides', userController.getRides.bind(userController));

// Rotas dos endereços
router.get('/addresses', userController.getAddresses.bind(userController));
router.post('/addresses', userController.createAddress.bind(userController));
router.put('/addresses/:addressId', userController.updateAddress.bind(userController));
router.delete('/addresses/:addressId', userController.deleteAddress.bind(userController));

export { router as userRoutes };