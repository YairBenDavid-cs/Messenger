import { request } from '@/shared/api/httpClient';
import type { User } from '@/shared/types/user';

export function listUsers(): Promise<User[]> {
  return request<User[]>('/users');
}
