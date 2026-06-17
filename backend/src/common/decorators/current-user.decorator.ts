import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../../domains/users/dto/public-user.dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as PublicUser;
  },
);
