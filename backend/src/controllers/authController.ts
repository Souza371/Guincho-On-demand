import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { loginSchema, registerUserSchema, registerProviderSchema, refreshTokenSchema } from '../utils/validation';
import { CustomError } from '../middleware/errorHandler';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar dados de entrada
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        const validationError: CustomError = new Error(error.details[0].message);
        validationError.statusCode = 400;
        return next(validationError);
      }

      // Fazer login
      const result = await authService.login(value);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar dados de entrada
      const { error, value } = registerUserSchema.validate(req.body);
      if (error) {
        const validationError: CustomError = new Error(error.details[0].message);
        validationError.statusCode = 400;
        return next(validationError);
      }

      // Registrar usuário
      const result = await authService.registerUser(value);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async registerProvider(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar dados de entrada
      const { error, value } = registerProviderSchema.validate(req.body);
      if (error) {
        const validationError: CustomError = new Error(error.details[0].message);
        validationError.statusCode = 400;
        return next(validationError);
      }

      // Registrar prestador
      const result = await authService.registerProvider(value);

      res.status(201).json({
        success: true,
        message: result.message,
        data: { provider: result.provider }
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar dados de entrada
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        const validationError: CustomError = new Error(error.details[0].message);
        validationError.statusCode = 400;
        return next(validationError);
      }

      // Renovar tokens
      const tokens = await authService.refreshToken(value.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens renovados com sucesso',
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Em um sistema real, você poderia adicionar o token a uma blacklist
      // Por ora, apenas retornamos sucesso
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}