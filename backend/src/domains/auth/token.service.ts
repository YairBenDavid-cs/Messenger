import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(user: { id: string }): string {
    return this.jwt.sign({ userId: user.id });
  }
}
