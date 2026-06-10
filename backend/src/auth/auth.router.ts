import { Router } from 'express';
import type { AuthService } from './auth.service';
import { createAuthController } from './auth.controller';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();
  const controller = createAuthController(authService);

  router.post('/login', controller.login);

  return router;
}
