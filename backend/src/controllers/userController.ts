import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class UserController {
  // Obter perfil do usuário logado
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          birthDate: true,
          avatarUrl: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
          addresses: {
            select: {
              id: true,
              street: true,
              number: true,
              complement: true,
              district: true,
              city: true,
              state: true,
              zipCode: true,
              latitude: true,
              longitude: true,
              isDefault: true
            }
          },
          _count: {
            select: {
              rides: true,
              ratings: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'Perfil obtido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { name, phone, birthDate, avatarUrl } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          avatarUrl,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          birthDate: true,
          avatarUrl: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter histórico de corridas do usuário
  async getRides(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, status } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { userId };

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
            provider: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                rating: true,
                phone: true
              }
            },
            proposals: {
              include: {
                provider: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    rating: true
                  }
                }
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

  // Obter endereços do usuário
  async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      res.json({
        success: true,
        data: addresses,
        message: 'Endereços obtidos com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Adicionar novo endereço
  async createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        street,
        number,
        complement,
        district,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        isDefault = false
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Se este endereço for padrão, remover padrão dos outros
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      const address = await prisma.address.create({
        data: {
          userId,
          street,
          number,
          complement,
          district,
          city,
          state,
          zipCode,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          isDefault
        }
      });

      res.status(201).json({
        success: true,
        data: address,
        message: 'Endereço criado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar endereço
  async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      const {
        street,
        number,
        complement,
        district,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        isDefault
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Verificar se o endereço pertence ao usuário
      const existingAddress = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId
        }
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          error: 'Endereço não encontrado'
        });
      }

      // Se este endereço for padrão, remover padrão dos outros
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      const updatedAddress = await prisma.address.update({
        where: { id: addressId },
        data: {
          street,
          number,
          complement,
          district,
          city,
          state,
          zipCode,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          isDefault,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: updatedAddress,
        message: 'Endereço atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar endereço
  async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Verificar se o endereço pertence ao usuário
      const existingAddress = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId
        }
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          error: 'Endereço não encontrado'
        });
      }

      await prisma.address.delete({
        where: { id: addressId }
      });

      res.json({
        success: true,
        message: 'Endereço deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}