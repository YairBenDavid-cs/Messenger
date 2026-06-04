import { randomUUID } from 'crypto';
import type { PublicUser } from '../users/repositories/IUserRepository';
import type { UserService } from '../users/user.service';
import type { ITokenRepository } from './repositories/ITokenRepository';
import { notFound, unauthorized } from '../shared/AppError';

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenRepo: ITokenRepository,
  ) {}

  async login(username: string, password: string): Promise<LoginResult> {
    const user = await this.userService.findByUsername(username);
    if (user === null) {
      throw notFound('User not found');
    }
    if (user.password !== password) {
      throw unauthorized('Incorrect password');
    }

    const token = randomUUID();
    await this.tokenRepo.save(token, user.id);

    return { token, user: this.userService.toPublicUser(user) };
  }
}
