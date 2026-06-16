export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  createdAt?: Date;
}

export class User {
  readonly id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.avatarUrl = props.avatarUrl;
    this.createdAt = props.createdAt ?? new Date();
  }
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}
