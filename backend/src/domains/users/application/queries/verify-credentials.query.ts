import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import type { PublicUser } from '../../dto/public-user.dto';
import { PasswordService } from '../password.service';
import { UserPresenter } from '../user.presenter';

// Looks up the user and verifies the password inside the users module so the
// password hash never crosses the module boundary. Returns null on either
// failure (no distinction) so callers surface a single generic auth error.
export class VerifyCredentialsQuery extends Query<PublicUser | null> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

@QueryHandler(VerifyCredentialsQuery)
export class VerifyCredentialsHandler
  extends LoggedHandler<VerifyCredentialsQuery, PublicUser | null>
  implements IQueryHandler<VerifyCredentialsQuery, PublicUser | null>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {
    super();
  }

  protected async handle(query: VerifyCredentialsQuery): Promise<PublicUser | null> {
    const user = await this.users.findByEmail(query.email);
    if (user === null) {
      return null;
    }
    const matches = await this.passwords.verify(query.password, user.passwordHash);
    return matches ? UserPresenter.toPublicUser(user) : null;
  }
}
