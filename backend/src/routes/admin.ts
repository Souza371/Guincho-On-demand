import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireUserType } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// Aplicar autenticação e autorização a todas as rotas
router.use(authenticateToken);
router.use(requireUserType('admin'));

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de administração funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Dashboard
router.get('/dashboard', adminController.getDashboard.bind(adminController));

// Gestão de usuários
router.get('/users', adminController.getUsers.bind(adminController));

// Gestão de prestadores
router.get('/providers', adminController.getProviders.bind(adminController));
router.put('/providers/:providerId/approve', adminController.approveProvider.bind(adminController));

// Gestão de corridas
router.get('/rides', adminController.getRides.bind(adminController));

// Relatórios
router.get('/reports', adminController.getReports.bind(adminController));

export { router as adminRoutes };