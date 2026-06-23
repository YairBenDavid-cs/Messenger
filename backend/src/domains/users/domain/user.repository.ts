import type { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;

  findByIds(ids: string[]): Promise<User[]>;

  findByEmail(email: string): Promise<User | null>;

  findAll(): Promise<User[]>;

  create(data: CreateUserData): Promise<User>;
}
