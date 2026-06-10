import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PublicUser } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() me: PublicUser): Promise<PublicUser[]> {
    return this.users.list(me.id);
  }
}
