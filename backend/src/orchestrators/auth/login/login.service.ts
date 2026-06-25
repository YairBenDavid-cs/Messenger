import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { TokenService } from '../../../domains/auth/token.service';
import type { LoginDto } from '../../../domains/auth/dto/login.dto';
import { VerifyCredentialsQuery } from '../../../domains/users/application/queries/verify-credentials.query';
import type { AuthResult } from '../dto/auth-result.dto';

@Injectable()
export class AuthenticateService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.queryBus.execute(
      new VerifyCredentialsQuery(dto.email, dto.password),
    );
    if (user === null) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      token: this.tokens.sign(user),
      user,
    };
  }
}
