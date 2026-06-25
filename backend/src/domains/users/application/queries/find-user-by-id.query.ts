import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import type { PublicUser } from '../../dto/public-user.dto';
import { UserPresenter } from '../user.presenter';

export class FindUserByIdQuery extends Query<PublicUser | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler
  extends LoggedHandler<FindUserByIdQuery, PublicUser | null>
  implements IQueryHandler<FindUserByIdQuery, PublicUser | null>
{
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {
    super();
  }

  protected async handle(query: FindUserByIdQuery): Promise<PublicUser | null> {
    const user = await this.users.findById(query.id);
    return user ? UserPresenter.toPublicUser(user) : null;
  }
}
