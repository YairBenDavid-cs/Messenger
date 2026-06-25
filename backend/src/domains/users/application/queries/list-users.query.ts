import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import type { PublicUser } from '../../dto/public-user.dto';
import { UserPresenter } from '../user.presenter';

export class ListUsersQuery extends Query<PublicUser[]> {
  constructor(public readonly excludeUserId?: string) {
    super();
  }
}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler
  extends LoggedHandler<ListUsersQuery, PublicUser[]>
  implements IQueryHandler<ListUsersQuery, PublicUser[]>
{
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {
    super();
  }

  protected async handle(query: ListUsersQuery): Promise<PublicUser[]> {
    const users = await this.users.findAll();
    return users
      .filter((user) => user.id !== query.excludeUserId)
      .map((user) => UserPresenter.toPublicUser(user));
  }
}
