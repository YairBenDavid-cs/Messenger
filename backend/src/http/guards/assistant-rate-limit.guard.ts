import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AssistantRateLimiter } from '../../common/rate-limit/assistant-rate-limiter';
import type { PublicUser } from '../../domains/users/dto/public-user.dto';

@Injectable()
export class AssistantRateLimitGuard implements CanActivate {
  constructor(private readonly limiter: AssistantRateLimiter) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as PublicUser;

    if (!this.limiter.tryConsume(user.id)) {
      throw new HttpException(
        { code: 'ASSISTANT_RATE_LIMITED', message: 'Too many assistant requests. Please slow down.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
