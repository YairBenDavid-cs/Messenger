import { request } from '@/shared/api/httpClient';
import type { AuthSession } from '@/shared/auth/authSession';

export function login(email: string, password: string): Promise<AuthSession> {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
