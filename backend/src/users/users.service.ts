import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { User, type CreateUserInput, type PublicUser } from './entities/user.entity';
import {
  USER_REPOSITORY,
  type UserRepository,
} from './repositories/user.repository.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.users.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email);
  }

  async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await this.hashPassword(input.password);
    const user = new User({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(input.email)}`,
      passwordHash,
    });
    return this.users.save(user);
  }

  async list(excludeUserId?: string): Promise<PublicUser[]> {
    const users = await this.users.findAll();
    return users
      .filter((user) => user.id !== excludeUserId)
      .map((user) => this.toPublicUser(user));
  }

  toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async verifyPassword(user: User, plain: string): Promise<boolean> {
    return bcrypt.compare(plain, user.passwordHash);
  }
}
