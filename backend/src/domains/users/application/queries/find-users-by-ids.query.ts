import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import type { PublicUser } from '../../dto/public-user.dto';
import { UserPresenter } from '../user.presenter';

export class FindUsersByIdsQuery extends Query<Map<string, PublicUser>> {
  constructor(public readonly ids: string[]) {
    super();
  }
}

@QueryHandler(FindUsersByIdsQuery)
export class FindUsersByIdsHandler
  extends LoggedHandler<FindUsersByIdsQuery, Map<string, PublicUser>>
  implements IQueryHandler<FindUsersByIdsQuery, Map<string, PublicUser>>
{
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {
    super();
  }

  protected async handle(query: FindUsersByIdsQuery): Promise<Map<string, PublicUser>> {
    const users = await this.users.findByIds(query.ids);
    return new Map(users.map((user) => [user.id, UserPresenter.toPublicUser(user)]));
  }
}
