import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { PublicUser } from '../../users/dto/public-user.dto';
import type { JwtPayload } from './jwt.strategy';
import { resolvePublicUser } from './resolve-public-user';

@Injectable()
export class JwtQueryStrategy extends PassportStrategy(Strategy, 'jwt-query') {
  constructor(
    config: ConfigService,
    private readonly queryBus: QueryBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('access_token'),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    return resolvePublicUser(this.queryBus, payload.userId);
  }
}
