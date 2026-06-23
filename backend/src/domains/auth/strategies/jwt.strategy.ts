import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { PublicUser } from '../../users/dto/public-user.dto';
import { UsersService } from '../../users/application/users.service';
import { UserPresenter } from '../../users/application/user.present-maper';

export interface JwtPayload {
  userId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    const user = await this.users.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return UserPresenter.toPublicUser(user);
  }
}
