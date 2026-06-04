import { request } from '@/shared/api/httpClient';
import type { Message, MessagesPage } from '../types/message';

export function getMessages(conversationId: string, cursor?: string): Promise<MessagesPage> {
  const query = cursor !== undefined ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return request<MessagesPage>(`/conversations/${conversationId}/messages${query}`);
}

export function sendMessage(conversationId: string, text: string): Promise<Message> {
  return request<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { text },
  });
}
