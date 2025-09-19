import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Rota ${req.method} ${req.path} não encontrada`,
      code: 'ROUTE_NOT_FOUND'
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
};