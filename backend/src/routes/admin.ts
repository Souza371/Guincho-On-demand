import { Router } from 'express';

const router = Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de administração funcionando!',
    timestamp: new Date().toISOString()
  });
});

// TODO: Implementar rotas administrativas
// GET /api/admin/dashboard - Dashboard com estatísticas
// GET /api/admin/users - Listar usuários
// GET /api/admin/providers - Listar prestadores
// PUT /api/admin/providers/:id/approve - Aprovar prestador
// GET /api/admin/rides - Listar todas as corridas
// GET /api/admin/reports - Relatórios

export { router as adminRoutes };