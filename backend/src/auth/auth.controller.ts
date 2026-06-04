import type { RequestHandler } from 'express';
import type { AuthService } from './auth.service';
import { badRequest } from '../shared/AppError';

export function createAuthController(authService: AuthService): { login: RequestHandler } {
  return {
    login: async (req, res, next) => {
      try {
        const { username, password } = (req.body ?? {}) as {
          username?: unknown;
          password?: unknown;
        };

        if (typeof username !== 'string' || typeof password !== 'string') {
          throw badRequest('username and password are required');
        }

        const result = await authService.login(username, password);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
