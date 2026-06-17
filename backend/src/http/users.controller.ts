import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../domains/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../domains/users/application/users.service';
import type { PublicUser } from '../domains/users/dto/public-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() me: PublicUser): Promise<PublicUser[]> {
    return this.users.list(me.id);
  }
}
