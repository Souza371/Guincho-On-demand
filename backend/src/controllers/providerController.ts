import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class ProviderController {
  // Obter perfil do prestador logado
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.user?.id;
      
      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
          _count: {
            select: {
              rides: true,
              ratings: true
            }
          }
        }
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'Prestador não encontrado'
        });
      }

      // Calcular estatísticas
      const stats = await prisma.ride.aggregate({
        where: { providerId, status: 'COMPLETED' },
        _avg: { finalPrice: true },
        _sum: { finalPrice: true },
        _count: { id: true }
      });

      const response = {
        ...provider,
        stats: {
          totalEarnings: stats._sum.finalPrice || 0,
          averageRide: stats._avg.finalPrice || 0,
          totalRides: stats._count || 0
        }
      };

      res.json({
        success: true,
        data: response,
        message: 'Perfil obtido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar perfil do prestador
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.user?.id;
      const {
        name,
        phone,
        avatarUrl,
        description,
        serviceTypes,
        serviceRadius,
        vehicleType,
        vehiclePlate,
        vehicleModel,
        vehicleYear,
        vehicleColor
      } = req.body;

      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      const updatedProvider = await prisma.provider.update({
        where: { id: providerId },
        data: {
          name,
          phone,
          avatarUrl,
          description,
          serviceTypes,
          serviceRadius: serviceRadius ? parseFloat(serviceRadius) : undefined,
          vehicleType,
          vehiclePlate,
          vehicleModel,
          vehicleYear: vehicleYear ? parseInt(vehicleYear) : undefined,
          vehicleColor,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: updatedProvider,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar disponibilidade
  async updateAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.user?.id;
      const { isAvailable, currentLatitude, currentLongitude } = req.body;

      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      const updatedProvider = await prisma.provider.update({
        where: { id: providerId },
        data: {
          isAvailable: Boolean(isAvailable),
          currentLatitude: currentLatitude ? parseFloat(currentLatitude) : undefined,
          currentLongitude: currentLongitude ? parseFloat(currentLongitude) : undefined,
          lastSeen: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          isAvailable: true,
          currentLatitude: true,
          currentLongitude: true,
          lastSeen: true
        }
      });

      res.json({
        success: true,
        data: updatedProvider,
        message: 'Disponibilidade atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter histórico de corridas do prestador
  async getRides(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.user?.id;
      const { page = 1, limit = 10, status } = req.query;

      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { providerId };

      if (status) {
        where.status = status;
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
                avatarUrl: true,
                phone: true
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

  // Obter ganhos do prestador
  async getEarnings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.user?.id;
      const { startDate, endDate, period = 'month' } = req.query;

      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      let dateFilter: any = {
        status: 'COMPLETED',
        providerId,
        finalPrice: { not: null }
      };

      if (startDate && endDate) {
        dateFilter.completedAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      } else {
        // Período padrão baseado no parâmetro 'period'
        const now = new Date();
        let startOfPeriod: Date;

        switch (period) {
          case 'week':
            startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
          case 'month':
            startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startOfPeriod = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        dateFilter.completedAt = {
          gte: startOfPeriod,
          lte: now
        };
      }

      const [earnings, rides] = await Promise.all([
        prisma.ride.aggregate({
          where: dateFilter,
          _sum: { finalPrice: true },
          _avg: { finalPrice: true },
          _count: { id: true }
        }),
        prisma.ride.findMany({
          where: dateFilter,
          select: {
            id: true,
            finalPrice: true,
            completedAt: true,
            serviceType: true
          },
          orderBy: { completedAt: 'desc' }
        })
      ]);

      // Calcular ganhos por dia (últimos 7 dias para gráfico)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayEarnings = await prisma.ride.aggregate({
          where: {
            providerId,
            status: 'COMPLETED',
            completedAt: {
              gte: date,
              lt: nextDate
            }
          },
          _sum: { finalPrice: true },
          _count: { id: true }
        });

        last7Days.push({
          date: date.toISOString().split('T')[0],
          earnings: dayEarnings._sum.finalPrice || 0,
          rides: dayEarnings._count || 0
        });
      }

      res.json({
        success: true,
        data: {
          summary: {
            totalEarnings: earnings._sum.finalPrice || 0,
            averageRide: earnings._avg.finalPrice || 0,
            totalRides: earnings._count || 0
          },
          chartData: last7Days,
          rides
        },
        message: 'Ganhos obtidos com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter solicitações de corrida disponíveis
  async getAvailableRides(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.user?.id;
      const { latitude, longitude, radius = 10 } = req.query;

      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      // Verificar se o prestador está disponível
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { isAvailable: true, serviceTypes: true, isApproved: true }
      });

      if (!provider?.isApproved) {
        return res.status(403).json({
          success: false,
          error: 'Prestador não aprovado'
        });
      }

      if (!provider?.isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'Prestador não está disponível'
        });
      }

      let whereClause: any = {
        status: 'PENDING',
        providerId: null
      };

      // Filtrar por tipos de serviço que o prestador oferece
      if (provider.serviceTypes && provider.serviceTypes.length > 0) {
        whereClause.serviceType = {
          in: provider.serviceTypes
        };
      }

      // Se latitude e longitude fornecidas, buscar por proximidade
      // (implementação simples, em produção usar PostGIS ou similar)
      const availableRides = await prisma.ride.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 20
      });

      // Calcular distância aproximada (se coordenadas fornecidas)
      let ridesWithDistance = availableRides;
      if (latitude && longitude) {
        ridesWithDistance = availableRides.map(ride => {
          const distance = calculateDistance(
            parseFloat(latitude as string),
            parseFloat(longitude as string),
            ride.pickupLatitude || 0,
            ride.pickupLongitude || 0
          );
          return { ...ride, distance };
        }).filter(ride => ride.distance <= parseFloat(radius as string))
          .sort((a, b) => a.distance - b.distance);
      }

      res.json({
        success: true,
        data: ridesWithDistance,
        message: 'Corridas disponíveis obtidas com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

// Função auxiliar para calcular distância (Haversine formula simplificada)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}