import jwt from 'jsonwebtoken';
import { User, Provider, Admin } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  type: 'user' | 'provider' | 'admin';
  role?: string; // para admin
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};

export const createTokenPayload = (
  entity: User | Provider | Admin,
  type: 'user' | 'provider' | 'admin'
): TokenPayload => {
  const payload: TokenPayload = {
    id: entity.id,
    email: entity.email,
    type
  };

  if (type === 'admin' && 'role' in entity) {
    payload.role = entity.role;
  }

  return payload;
};