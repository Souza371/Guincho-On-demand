import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/auth';
import { generateTokens, createTokenPayload } from '../utils/jwt';
import { CustomError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'user' | 'provider' | 'admin';
}

export interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterProviderData extends RegisterUserData {
  cnh: string;
}

export class AuthService {
  async login(credentials: LoginCredentials) {
    const { email, password, userType } = credentials;
    
    let user: any = null;
    
    // Buscar usuário baseado no tipo
    switch (userType) {
      case 'user':
        user = await prisma.user.findUnique({ where: { email } });
        break;
      case 'provider':
        user = await prisma.provider.findUnique({ where: { email } });
        break;
      case 'admin':
        user = await prisma.admin.findUnique({ where: { email } });
        break;
    }

    if (!user) {
      const error: CustomError = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Verificar senha
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      const error: CustomError = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Verificar se o usuário está ativo
    if ('isActive' in user && !user.isActive) {
      const error: CustomError = new Error('Conta desativada');
      error.statusCode = 403;
      throw error;
    }

    // Verificar status do prestador
    if (userType === 'provider' && user.status !== 'ACTIVE') {
      let message = 'Conta não autorizada';
      if (user.status === 'PENDING_APPROVAL') {
        message = 'Conta aguardando aprovação';
      } else if (user.status === 'SUSPENDED') {
        message = 'Conta suspensa';
      }
      const error: CustomError = new Error(message);
      error.statusCode = 403;
      throw error;
    }

    // Gerar tokens
    const tokenPayload = createTokenPayload(user, userType);
    const tokens = generateTokens(tokenPayload);

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens
    };
  }

  async registerUser(userData: RegisterUserData) {
    const { name, email, phone, password } = userData;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error: CustomError = new Error('Email já está em uso');
      error.statusCode = 409;
      throw error;
    }

    // Verificar se telefone já existe
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      const error: CustomError = new Error('Telefone já está em uso');
      error.statusCode = 409;
      throw error;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    // Gerar tokens
    const tokenPayload = createTokenPayload({ ...user, password: hashedPassword }, 'user');
    const tokens = generateTokens(tokenPayload);

    return {
      user,
      ...tokens
    };
  }

  async registerProvider(providerData: RegisterProviderData) {
    const { name, email, phone, password, cnh } = providerData;

    // Verificar se email já existe
    const existingProvider = await prisma.provider.findUnique({ where: { email } });
    if (existingProvider) {
      const error: CustomError = new Error('Email já está em uso');
      error.statusCode = 409;
      throw error;
    }

    // Verificar se telefone já existe
    const existingPhone = await prisma.provider.findUnique({ where: { phone } });
    if (existingPhone) {
      const error: CustomError = new Error('Telefone já está em uso');
      error.statusCode = 409;
      throw error;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar prestador
    const provider = await prisma.provider.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        cnh,
        status: 'PENDING_APPROVAL' // Prestador precisa de aprovação
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cnh: true,
        status: true,
        createdAt: true
      }
    });

    return {
      provider,
      message: 'Cadastro realizado com sucesso. Aguarde a aprovação da sua conta.'
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verificar refresh token
      const decoded = require('../utils/jwt').verifyRefreshToken(refreshToken);
      
      // Buscar usuário atual para garantir que ainda existe e está ativo
      let user: any = null;
      
      switch (decoded.type) {
        case 'user':
          user = await prisma.user.findUnique({ where: { id: decoded.id } });
          break;
        case 'provider':
          user = await prisma.provider.findUnique({ where: { id: decoded.id } });
          break;
        case 'admin':
          user = await prisma.admin.findUnique({ where: { id: decoded.id } });
          break;
      }

      if (!user) {
        const error: CustomError = new Error('Usuário não encontrado');
        error.statusCode = 401;
        throw error;
      }

      if ('isActive' in user && !user.isActive) {
        const error: CustomError = new Error('Conta desativada');
        error.statusCode = 403;
        throw error;
      }

      // Gerar novos tokens
      const tokenPayload = createTokenPayload(user, decoded.type);
      const tokens = generateTokens(tokenPayload);

      return tokens;
    } catch (error) {
      const authError: CustomError = new Error('Refresh token inválido ou expirado');
      authError.statusCode = 401;
      throw authError;
    }
  }
}