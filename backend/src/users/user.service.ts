import type { IUserRepository, PublicUser, User } from './repositories/IUserRepository';

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findUserById(id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findUserByUsername(username);
  }

  toPublicUser(user: User): PublicUser {
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }
}
