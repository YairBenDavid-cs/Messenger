import type { User } from '@/shared/types/user';

// Hardcoded until the backend exposes GET /users. Ids must match the backend seed
// so POST /conversations resolves a real participant. Swap point: replace the body
// with `request<User[]>('/users')` and this module's consumers keep working.
const SEED_USERS: User[] = [
  { id: 'u-alice', username: 'Alice', avatarUrl: 'https://i.pravatar.cc/100?u=alice' },
  { id: 'u-bob', username: 'Bob', avatarUrl: 'https://i.pravatar.cc/100?u=bob' },
  { id: 'u-carol', username: 'Carol', avatarUrl: 'https://i.pravatar.cc/100?u=carol' },
];

export function listUsers(): Promise<User[]> {
  return Promise.resolve(SEED_USERS);
}
