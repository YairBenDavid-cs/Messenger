import type { RequestHandler } from 'express';
import type { ITokenRepository } from '../../auth/repositories/ITokenRepository';
import { unauthorized } from '../AppError';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function createAuthenticate(tokenRepo: ITokenRepository): RequestHandler {
  return async (req, _res, next) => {
    const header = req.headers.authorization;
    if (header === undefined || !header.startsWith('Bearer ')) {
      return next(unauthorized('Missing or invalid authorization header'));
    }

    const token = header.slice('Bearer '.length);
    const userId = await tokenRepo.getUserId(token);
    if (userId === null) {
      return next(unauthorized('Invalid or expired token'));
    }

    req.userId = userId;
    next();
  };
}
