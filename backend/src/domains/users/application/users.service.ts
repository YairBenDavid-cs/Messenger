import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/user.entity';
import { USER_REPOSITORY, type UserRepository } from '../domain/user.repository';
import type { CreateUserInput } from '../dto/create-user.dto';
import type { PublicUser } from '../dto/public-user.dto';
import { UserPresenter } from './user.present-maper';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.users.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email);
  }

  async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await this.hashPassword(input.password);
    return this.users.create({
      name: input.name,
      email: input.email,
      avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(input.email)}`,
      passwordHash,
    });
  }

  async findByIds(ids: string[]): Promise<Map<string, User>> {
    const users = await this.users.findByIds(ids);
    return new Map(users.map((user) => [user.id, user]));
  }

  async list(excludeUserId?: string): Promise<PublicUser[]> {
    const users = await this.users.findAll();
    return users
      .filter((user) => user.id !== excludeUserId)
      .map((user) => UserPresenter.toPublicUser(user));
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async verifyPassword(user: User, plain: string): Promise<boolean> {
    return bcrypt.compare(plain, user.passwordHash);
  }
}
