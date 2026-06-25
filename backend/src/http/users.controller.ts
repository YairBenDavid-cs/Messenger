import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../domains/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ListUsersQuery } from '../domains/users/application/queries/list-users.query';
import type { PublicUser } from '../domains/users/dto/public-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() me: PublicUser): Promise<PublicUser[]> {
    return this.queryBus.execute(new ListUsersQuery(me.id));
  }
}
