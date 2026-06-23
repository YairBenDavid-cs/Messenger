import type { User } from '../domain/user.entity';
import type { PublicUser } from '../dto/public-user.dto';

export const UserPresenter = {
  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  },
};
