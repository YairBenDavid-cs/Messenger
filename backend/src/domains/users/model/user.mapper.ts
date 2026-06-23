import { User } from '../domain/user.entity';
import type { UserDocument } from './user.schema';

export const UserMapper = {
  toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      avatarUrl: doc.avatarUrl,
      createdAt: doc.createdAt,
    });
  },
};
