import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de autenticação funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação
router.post('/login', authController.login.bind(authController));
router.post('/register/user', authController.registerUser.bind(authController));
router.post('/register/provider', authController.registerProvider.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export { router as authRoutes };