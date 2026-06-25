import { ConflictException, Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isDuplicateKeyError } from '../../../../common/database/mongo-errors';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import type { CreateUserInput } from '../../dto/create-user.dto';
import type { PublicUser } from '../../dto/public-user.dto';
import { PasswordService } from '../password.service';
import { UserPresenter } from '../user.presenter';

export class CreateUserCommand extends Command<PublicUser> {
  constructor(public readonly input: CreateUserInput) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  extends LoggedHandler<CreateUserCommand, PublicUser>
  implements ICommandHandler<CreateUserCommand>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {
    super();
  }

  protected async handle(command: CreateUserCommand): Promise<PublicUser> {
    const { name, email, password } = command.input;
    const passwordHash = await this.passwords.hash(password);
    try {
      const user = await this.users.create({
        name,
        email,
        passwordHash,
        avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(email)}`,
      });
      return UserPresenter.toPublicUser(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}
