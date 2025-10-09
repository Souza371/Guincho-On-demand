import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class AdminController {
  // Dashboard com estatísticas gerais
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Admin não autenticado'
        });
      }

      // Buscar estatísticas em paralelo
      const [
        totalUsers,
        totalProviders,
        totalRides,
        activeRides,
        pendingApprovals,
        monthlyRevenue,
        dailyRides,
        topProviders
      ] = await Promise.all([
        // Total de usuários
        prisma.user.count(),
        
        // Total de prestadores
        prisma.provider.count(),
        
        // Total de corridas
        prisma.ride.count(),
        
        // Corridas ativas
        prisma.ride.count({
          where: {
            status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
          }
        }),
        
        // Prestadores pendentes de aprovação
        prisma.provider.count({
          where: { isApproved: false }
        }),
        
        // Receita do mês atual
        prisma.ride.aggregate({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { finalPrice: true }
        }),
        
        // Corridas dos últimos 7 dias para gráfico
        getDailyRideStats(),
        
        // Top 5 prestadores por rating
        prisma.provider.findMany({
          where: { isApproved: true },
          orderBy: { rating: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            rating: true,
            avatarUrl: true,
            _count: {
              select: { rides: true }
            }
          }
        })
      ]);

      const dashboardData = {
        stats: {
          totalUsers,
          totalProviders,
          totalRides,
          activeRides,
          pendingApprovals,
          monthlyRevenue: monthlyRevenue._sum.finalPrice || 0
        },
        charts: {
          dailyRides
        },
        topProviders
      };

      res.json({
        success: true,
        data: dashboardData,
        message: 'Dashboard obtido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar usuários
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            avatarUrl: true,
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            rating: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                rides: true,
                addresses: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        message: 'Usuários obtidos com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar prestadores
  async getProviders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search, status, approval } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      if (approval === 'approved') {
        where.isApproved = true;
      } else if (approval === 'pending') {
        where.isApproved = false;
      }

      const [providers, total] = await Promise.all([
        prisma.provider.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            avatarUrl: true,
            isActive: true,
            isApproved: true,
            isAvailable: true,
            rating: true,
            vehicleType: true,
            vehiclePlate: true,
            serviceTypes: true,
            documentsUrl: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                rides: true
              }
            }
          }
        }),
        prisma.provider.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          providers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        message: 'Prestadores obtidos com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Aprovar prestador
  async approveProvider(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { providerId } = req.params;
      const { approved, rejectionReason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Admin não autenticado'
        });
      }

      const provider = await prisma.provider.findUnique({
        where: { id: providerId }
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'Prestador não encontrado'
        });
      }

      const updatedProvider = await prisma.provider.update({
        where: { id: providerId },
        data: {
          isApproved: Boolean(approved),
          approvedAt: approved ? new Date() : null,
          approvedBy: approved ? adminId : null,
          rejectionReason: approved ? null : rejectionReason,
          updatedAt: new Date()
        }
      });

      // TODO: Enviar notificação para o prestador sobre aprovação/rejeição

      res.json({
        success: true,
        data: updatedProvider,
        message: approved ? 'Prestador aprovado com sucesso' : 'Prestador rejeitado'
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar todas as corridas
  async getRides(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        startDate, 
        endDate,
        userId,
        providerId 
      } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);

      let where: any = {};

      if (status) {
        where.status = status;
      }

      if (userId) {
        where.userId = userId;
      }

      if (providerId) {
        where.providerId = providerId;
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const [rides, total] = await Promise.all([
        prisma.ride.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                vehicleType: true,
                vehiclePlate: true
              }
            },
            rating: true
          }
        }),
        prisma.ride.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          rides,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        message: 'Corridas obtidas com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Relatórios
  async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { type = 'revenue', period = 'month' } = req.query;

      let reportData;

      switch (type) {
        case 'revenue':
          reportData = await getRevenueReport(period as string);
          break;
        case 'rides':
          reportData = await getRidesReport(period as string);
          break;
        case 'providers':
          reportData = await getProvidersReport();
          break;
        case 'users':
          reportData = await getUsersReport();
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Tipo de relatório inválido'
          });
      }

      res.json({
        success: true,
        data: reportData,
        message: 'Relatório gerado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

// Funções auxiliares para relatórios
async function getDailyRideStats() {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const rides = await prisma.ride.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    last7Days.push({
      date: date.toISOString().split('T')[0],
      rides
    });
  }
  return last7Days;
}

async function getRevenueReport(period: string) {
  // Implementar relatório de receita baseado no período
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const revenue = await prisma.ride.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: { gte: startDate }
    },
    _sum: { finalPrice: true },
    _count: { id: true }
  });

  return {
    period,
    totalRevenue: revenue._sum.finalPrice || 0,
    totalRides: revenue._count,
    startDate,
    endDate: now
  };
}

async function getRidesReport(period: string) {
  // Implementar relatório de corridas
  const statusCounts = await prisma.ride.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  const serviceTypeCounts = await prisma.ride.groupBy({
    by: ['serviceType'],
    _count: { id: true }
  });

  return {
    period,
    byStatus: statusCounts,
    byServiceType: serviceTypeCounts
  };
}

async function getProvidersReport() {
  const total = await prisma.provider.count();
  const approved = await prisma.provider.count({ where: { isApproved: true } });
  const active = await prisma.provider.count({ where: { isAvailable: true } });

  return {
    total,
    approved,
    pending: total - approved,
    active,
    inactive: approved - active
  };
}

async function getUsersReport() {
  const total = await prisma.user.count();
  const active = await prisma.user.count({ where: { isActive: true } });
  const verified = await prisma.user.count({ where: { isEmailVerified: true } });

  return {
    total,
    active,
    inactive: total - active,
    verified,
    unverified: total - verified
  };
}