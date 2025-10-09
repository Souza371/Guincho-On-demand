import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class RideController {
  // Criar nova solicitação de corrida (usuário)
  async createRide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        serviceType,
        description,
        pickupAddress,
        pickupLatitude,
        pickupLongitude,
        destinationAddress,
        destinationLatitude,
        destinationLongitude,
        urgency = 'NORMAL',
        vehicleInfo
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Verificar se o usuário tem uma corrida ativa
      const activeRide = await prisma.ride.findFirst({
        where: {
          userId,
          status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
        }
      });

      if (activeRide) {
        return res.status(400).json({
          success: false,
          error: 'Você já possui uma corrida ativa'
        });
      }

      const ride = await prisma.ride.create({
        data: {
          userId,
          serviceType,
          description,
          pickupAddress,
          pickupLatitude: pickupLatitude ? parseFloat(pickupLatitude) : null,
          pickupLongitude: pickupLongitude ? parseFloat(pickupLongitude) : null,
          destinationAddress,
          destinationLatitude: destinationLatitude ? parseFloat(destinationLatitude) : null,
          destinationLongitude: destinationLongitude ? parseFloat(destinationLongitude) : null,
          urgency,
          vehicleInfo,
          status: 'PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true
            }
          }
        }
      });

      // TODO: Notificar prestadores próximos via WebSocket
      
      res.status(201).json({
        success: true,
        data: ride,
        message: 'Solicitação criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter detalhes de uma corrida
  async getRide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { rideId } = req.params;
      const userId = req.user?.id;
      const userType = req.user?.type;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              rating: true,
              vehicleType: true,
              vehiclePlate: true,
              vehicleModel: true,
              vehicleColor: true
            }
          },
          proposals: {
            include: {
              provider: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  rating: true,
                  vehicleType: true
                }
              }
            },
            orderBy: { price: 'asc' }
          },
          rating: true
        }
      });

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: 'Corrida não encontrada'
        });
      }

      // Verificar se o usuário tem permissão para ver esta corrida
      if (userType === 'user' && ride.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      if (userType === 'provider' && ride.providerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.json({
        success: true,
        data: ride,
        message: 'Corrida obtida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar status da corrida
  async updateRideStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { rideId } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;
      const userType = req.user?.type;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const ride = await prisma.ride.findUnique({
        where: { id: rideId }
      });

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: 'Corrida não encontrada'
        });
      }

      // Verificar permissões baseadas no tipo de usuário e status
      const validTransitions = getValidStatusTransitions(ride.status, userType);
      
      if (!validTransitions.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Transição de status inválida'
        });
      }

      // Verificar se o usuário tem permissão para atualizar
      if (userType === 'user' && ride.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      if (userType === 'provider' && ride.providerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      const updateData: any = { 
        status,
        updatedAt: new Date()
      };

      // Adicionar timestamps baseados no status
      switch (status) {
        case 'ACCEPTED':
          updateData.acceptedAt = new Date();
          break;
        case 'IN_PROGRESS':
          updateData.startedAt = new Date();
          break;
        case 'COMPLETED':
          updateData.completedAt = new Date();
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          updateData.cancelledBy = userType;
          break;
      }

      const updatedRide = await prisma.ride.update({
        where: { id: rideId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicleType: true,
              vehiclePlate: true
            }
          }
        }
      });

      // TODO: Notificar via WebSocket sobre mudança de status

      res.json({
        success: true,
        data: updatedRide,
        message: 'Status atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Criar proposta de preço (prestador)
  async createProposal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { rideId } = req.params;
      const { price, estimatedTime, message } = req.body;
      const providerId = req.user?.id;

      if (!providerId) {
        return res.status(401).json({
          success: false,
          error: 'Prestador não autenticado'
        });
      }

      const ride = await prisma.ride.findUnique({
        where: { id: rideId }
      });

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: 'Corrida não encontrada'
        });
      }

      if (ride.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Esta corrida não está mais disponível'
        });
      }

      // Verificar se o prestador já fez uma proposta para esta corrida
      const existingProposal = await prisma.proposal.findFirst({
        where: {
          rideId,
          providerId
        }
      });

      if (existingProposal) {
        return res.status(400).json({
          success: false,
          error: 'Você já fez uma proposta para esta corrida'
        });
      }

      const proposal = await prisma.proposal.create({
        data: {
          rideId,
          providerId,
          price: parseFloat(price),
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
          message,
          status: 'PENDING'
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              rating: true,
              vehicleType: true,
              vehiclePlate: true
            }
          }
        }
      });

      // TODO: Notificar usuário via WebSocket sobre nova proposta

      res.status(201).json({
        success: true,
        data: proposal,
        message: 'Proposta criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Aceitar proposta (usuário)
  async acceptProposal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { rideId, proposalId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const [ride, proposal] = await Promise.all([
        prisma.ride.findUnique({ where: { id: rideId } }),
        prisma.proposal.findUnique({ 
          where: { id: proposalId },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
                isAvailable: true
              }
            }
          }
        })
      ]);

      if (!ride || !proposal) {
        return res.status(404).json({
          success: false,
          error: 'Corrida ou proposta não encontrada'
        });
      }

      if (ride.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      if (ride.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Esta corrida não está mais disponível'
        });
      }

      if (!proposal.provider.isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'Este prestador não está mais disponível'
        });
      }

      // Usar transação para garantir consistência
      const result = await prisma.$transaction(async (tx) => {
        // Atualizar a corrida com o prestador escolhido
        const updatedRide = await tx.ride.update({
          where: { id: rideId },
          data: {
            providerId: proposal.providerId,
            status: 'ACCEPTED',
            acceptedAt: new Date(),
            agreedPrice: proposal.price,
            estimatedTime: proposal.estimatedTime,
            updatedAt: new Date()
          }
        });

        // Aceitar a proposta selecionada
        await tx.proposal.update({
          where: { id: proposalId },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date()
          }
        });

        // Rejeitar todas as outras propostas
        await tx.proposal.updateMany({
          where: {
            rideId,
            id: { not: proposalId }
          },
          data: {
            status: 'REJECTED',
            rejectedAt: new Date()
          }
        });

        // Atualizar disponibilidade do prestador (fica indisponível)
        await tx.provider.update({
          where: { id: proposal.providerId },
          data: { isAvailable: false }
        });

        return updatedRide;
      });

      // TODO: Notificar prestador escolhido e outros prestadores via WebSocket

      res.json({
        success: true,
        data: result,
        message: 'Proposta aceita com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Avaliar serviço (após conclusão)
  async rateRide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { rideId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user?.id;
      const userType = req.user?.type;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const ride = await prisma.ride.findUnique({
        where: { id: rideId }
      });

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: 'Corrida não encontrada'
        });
      }

      if (ride.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: 'Só é possível avaliar corridas concluídas'
        });
      }

      // Verificar se o usuário participou da corrida
      if (userType === 'user' && ride.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      if (userType === 'provider' && ride.providerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se já foi avaliada
      const existingRating = await prisma.rating.findFirst({
        where: {
          rideId,
          fromUserId: userId
        }
      });

      if (existingRating) {
        return res.status(400).json({
          success: false,
          error: 'Esta corrida já foi avaliada'
        });
      }

      // Determinar quem está sendo avaliado
      const toUserId = userType === 'user' ? ride.providerId : ride.userId;
      const toUserType = userType === 'user' ? 'provider' : 'user';

      if (!toUserId) {
        return res.status(400).json({
          success: false,
          error: 'Usuário de destino não encontrado'
        });
      }

      const newRating = await prisma.rating.create({
        data: {
          rideId,
          fromUserId: userId,
          fromUserType: userType,
          toUserId,
          toUserType,
          rating: parseInt(rating),
          comment
        }
      });

      // Atualizar rating médio do usuário/prestador avaliado
      const avgRating = await prisma.rating.aggregate({
        where: { toUserId },
        _avg: { rating: true }
      });

      if (toUserType === 'provider') {
        await prisma.provider.update({
          where: { id: toUserId },
          data: { rating: avgRating._avg.rating || 0 }
        });
      } else {
        await prisma.user.update({
          where: { id: toUserId },
          data: { rating: avgRating._avg.rating || 0 }
        });
      }

      res.status(201).json({
        success: true,
        data: newRating,
        message: 'Avaliação criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

// Função auxiliar para validar transições de status
function getValidStatusTransitions(currentStatus: string, userType: string): string[] {
  const transitions: Record<string, Record<string, string[]>> = {
    PENDING: {
      user: ['CANCELLED'],
      provider: [], // Prestadores não podem alterar status de PENDING diretamente
      admin: ['CANCELLED']
    },
    ACCEPTED: {
      user: ['CANCELLED'],
      provider: ['IN_PROGRESS', 'CANCELLED'],
      admin: ['IN_PROGRESS', 'CANCELLED']
    },
    IN_PROGRESS: {
      user: ['CANCELLED'],
      provider: ['COMPLETED', 'CANCELLED'],
      admin: ['COMPLETED', 'CANCELLED']
    },
    COMPLETED: {
      user: [],
      provider: [],
      admin: []
    },
    CANCELLED: {
      user: [],
      provider: [],
      admin: []
    }
  };

  return transitions[currentStatus]?.[userType] || [];
}