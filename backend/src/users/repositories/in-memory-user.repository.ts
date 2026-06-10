import { Injectable } from '@nestjs/common';
import { SEED_USERS } from '../../seed/seedData';
import type { User } from '../entities/user.entity';
import type { UserRepository } from './user.repository.interface';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>(
    SEED_USERS.map((user) => [user.id, user]),
  );

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users.values()];
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
