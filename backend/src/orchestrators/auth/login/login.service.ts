import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../../domains/auth/token.service';
import type { LoginDto } from '../../../domains/auth/dto/login.dto';
import { UsersService } from '../../../domains/users/application/users.service';
import { UserPresenter } from '../../../domains/users/application/user.present-maper';
import type { AuthResult } from '../dto/auth-result.dto';

@Injectable()
export class AuthenticateService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const passwordMatches = await this.users.verifyPassword(user, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }
    return {
      token: this.tokens.sign(user),
      user: UserPresenter.toPublicUser(user),
    };
  }
}
