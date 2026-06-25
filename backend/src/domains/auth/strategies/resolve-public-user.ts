import { UnauthorizedException } from '@nestjs/common';
import type { QueryBus } from '@nestjs/cqrs';
import { FindUserByIdQuery } from '../../users/application/queries/find-user-by-id.query';
import type { PublicUser } from '../../users/dto/public-user.dto';

export async function resolvePublicUser(queryBus: QueryBus, userId: string): Promise<PublicUser> {
  const user = await queryBus.execute<FindUserByIdQuery, PublicUser | null>(
    new FindUserByIdQuery(userId),
  );
  if (!user) {
    throw new UnauthorizedException('Invalid token');
  }
  return user;
}
