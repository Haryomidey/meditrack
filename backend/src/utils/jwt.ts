import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  pharmacyId: string;
  branchId?: string;
  role: 'Owner' | 'Pharmacist' | 'SalesStaff';
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtAccessSecret as Secret, { expiresIn: env.jwtAccessExpiresIn } as SignOptions);
};

export const signRefreshToken = (payload: Pick<JwtPayload, 'userId'>): string => {
  return jwt.sign(payload, env.jwtRefreshSecret as Secret, { expiresIn: env.jwtRefreshExpiresIn } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtAccessSecret as Secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.jwtRefreshSecret as Secret) as { userId: string };
};
