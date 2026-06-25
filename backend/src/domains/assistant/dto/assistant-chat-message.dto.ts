import type { AssistantChatMessageRole } from '../domain/assistant-chat-message.entity';

export interface AssistantChatMessageView {
  id: string;
  conversationId: string;
  role: AssistantChatMessageRole;
  text: string;
  createdAt: string;
}
