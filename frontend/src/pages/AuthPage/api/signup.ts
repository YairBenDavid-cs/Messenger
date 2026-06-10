import { request } from '@/shared/api/httpClient';
import type { AuthSession } from '@/shared/auth/authSession';

export function signup(email: string, password: string, name: string): Promise<AuthSession> {
  return request<AuthSession>('/auth/signup', {
    method: 'POST',
    body: { email, password, name },
  });
}
