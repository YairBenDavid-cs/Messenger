import type { PublicUser } from '../../../domains/users/dto/public-user.dto';

export interface AuthResult {
  token: string;
  user: PublicUser;
}
