import { request } from '@/shared/api/httpClient';
import type { Conversation } from '../types/conversation';

export function listConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/conversations');
}
