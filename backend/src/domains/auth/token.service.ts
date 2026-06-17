import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../users/domain/user.entity';

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(user: User): string {
    return this.jwt.sign({ userId: user.id });
  }
}
