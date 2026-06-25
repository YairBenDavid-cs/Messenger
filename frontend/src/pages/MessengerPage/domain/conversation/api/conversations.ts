import { request } from '@/shared/api/httpClient';
import type { Conversation } from '../types/conversation';

export function listConversations(): Promise<Conversation[]> {
  // Scope to direct conversations: the backend list endpoint now also returns
  // assistant conversations (Week 6), which the messenger does not render.
  return request<Conversation[]>('/conversations?type=direct');
}

export function createConversation(participantId: string): Promise<Conversation> {
  return request<Conversation>('/conversations', {
    method: 'POST',
    body: { participantIds: [participantId] },
  });
}
