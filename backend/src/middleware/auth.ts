import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { CustomError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const error: CustomError = new Error('Token de acesso requerido');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const authError: CustomError = new Error('Token inválido ou expirado');
    authError.statusCode = 401;
    next(authError);
  }
};

export const requireUserType = (...allowedTypes: ('user' | 'provider' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error: CustomError = new Error('Usuário não autenticado');
      error.statusCode = 401;
      return next(error);
    }

    if (!allowedTypes.includes(req.user.type)) {
      const error: CustomError = new Error('Acesso negado para este tipo de usuário');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

export const requireAdminRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.type !== 'admin') {
      const error: CustomError = new Error('Acesso negado: requer privilégios de administrador');
      error.statusCode = 403;
      return next(error);
    }

    if (allowedRoles.length > 0 && (!req.user.role || !allowedRoles.includes(req.user.role))) {
      const error: CustomError = new Error('Acesso negado: privilégios insuficientes');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};