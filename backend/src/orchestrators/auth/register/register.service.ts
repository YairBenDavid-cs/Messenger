import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TokenService } from '../../../domains/auth/token.service';
import type { SignupDto } from '../../../domains/auth/dto/signup.dto';
import { CreateUserCommand } from '../../../domains/users/application/commands/create-user.command';
import type { AuthResult } from '../dto/auth-result.dto';

@Injectable()
export class RegisterService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: SignupDto): Promise<AuthResult> {
    const user = await this.commandBus.execute(new CreateUserCommand(dto));
    return {
      token: this.tokens.sign(user),
      user,
    };
  }
}
