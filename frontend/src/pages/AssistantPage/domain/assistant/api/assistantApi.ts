import { request } from '@/shared/api/httpClient';
import type { AssistantConversation, AssistantTurn } from '../types/assistant';

export function listAssistantConversations(): Promise<AssistantConversation[]> {
  return request<AssistantConversation[]>('/conversations?type=assistant');
}

export function createAssistantConversation(): Promise<AssistantConversation> {
  return request<AssistantConversation>('/conversations', {
    method: 'POST',
    body: { type: 'assistant' },
  });
}


export function listAssistantTurns(conversationId: string): Promise<AssistantTurn[]> {
  return request<AssistantTurn[]>(`/conversations/${conversationId}/messages`);
}

export function postAssistantMessage(conversationId: string, text: string): Promise<AssistantTurn> {
  return request<AssistantTurn>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { text },
  });
}
