import type { IUserRepository, User } from './IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users: Map<string, User>;

  constructor(seed: User[]) {
    this.users = new Map(seed.map((user) => [user.id, user]));
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const normalizedName = username.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === normalizedName) {
        return user;
      }
    }
    return null;
  }
}
