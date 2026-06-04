export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  password: string;
}

export type PublicUser = Omit<User, 'password'>;

export interface IUserRepository {
  
  findUserById(id: string): Promise<User | null>;

  findUserByUsername(username: string): Promise<User | null>;
}
