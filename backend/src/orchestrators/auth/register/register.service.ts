import { ConflictException, Injectable } from '@nestjs/common';
import { TokenService } from '../../../domains/auth/token.service';
import type { SignupDto } from '../../../domains/auth/dto/signup.dto';
import { isDuplicateKeyError } from '../../../common/database/mongo-errors';
import { UsersService } from '../../../domains/users/application/users.service';
import { UserPresenter } from '../../../domains/users/application/user.presenter';
import type { AuthResult } from '../dto/auth-result.dto';

@Injectable()
export class RegisterService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: SignupDto): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    try {
      const user = await this.users.create(dto);
      return {
        token: this.tokens.sign(user),
        user: UserPresenter.toPublicUser(user),
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}
